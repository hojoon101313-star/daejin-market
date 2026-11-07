require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// 로그인 토큰 발급
const createToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// DB 사용자 정보를 화면에 전달할 형태로 변환
const toUserInfo = (user) => ({
  name: user.name,
  studentId: user.student_id,
  department: user.department,
  year: user.grade,
  email: user.email,
  nickname: user.nickname,
  role: user.role || 'user',
});

// 로그인 확인
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      error: '로그인이 만료되었습니다. 다시 로그인해주세요.',
    });
  }
};

// 관리자 확인: DB의 최신 권한을 매번 확인
const requireAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows.length || rows[0].role !== 'admin') {
      return res.status(403).json({ error: '관리자만 접근할 수 있습니다.' });
    }

    next();
  } catch (error) {
    console.error('관리자 권한 확인 오류:', error);
    res.status(500).json({
      error: '관리자 권한을 확인하지 못했습니다.',
    });
  }
};

// 회원가입
app.post('/api/signup', async (req, res) => {
  const {
    name,
    studentId,
    department,
    year,
    email,
    password,
    nickname,
  } = req.body;

  if (
    !name ||
    !studentId ||
    !department ||
    !year ||
    !email ||
    !password ||
    !nickname
  ) {
    return res.status(400).json({
      error: '모든 회원가입 정보를 입력해주세요.',
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (email, password_hash, name, student_id, nickname, department, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hash, name, studentId, nickname, department, year]
    );

    const user = {
      id: result.insertId,
      name,
      student_id: studentId,
      department,
      grade: year,
      email,
      nickname,
      role: 'user',
    };

    res.json({
      ...toUserInfo(user),
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const message = error.message.includes('nickname')
        ? '이미 사용 중인 닉네임입니다.'
        : '이미 가입된 이메일입니다.';

      return res.status(409).json({ error: message });
    }

    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: '이메일 또는 비밀번호가 틀렸습니다.',
      });
    }

    res.json({
      ...toUserInfo(user),
      token: createToken(user),
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 내 정보
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json(toUserInfo(rows[0]));
  } catch (error) {
    console.error('내 정보 조회 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 상품 목록
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.price, p.category, p.location,
              p.item_condition, p.description, p.created_at,
              u.nickname AS seller
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 상품 등록
app.post('/api/products', requireAuth, async (req, res) => {
  const { title, price, category, condition, description } = req.body;

  if (!title || price === undefined || !category) {
    return res.status(400).json({
      error: '상품명, 가격, 카테고리를 입력해주세요.',
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products
       (seller_id, title, price, category, item_condition, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        price,
        category,
        condition || '',
        description || '상품 설명이 없습니다.',
      ]
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('상품 등록 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 관리자 대시보드
app.get('/api/admin/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [[userCount]] = await pool.query(
      'SELECT COUNT(*) AS total FROM users'
    );

    const [[productStats]] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(AVG(price), 0) AS averagePrice,
              COALESCE(MAX(price), 0) AS highestPrice
       FROM products`
    );

    const [categoryStats] = await pool.query(
      `SELECT COALESCE(category, '미분류') AS category,
              COUNT(*) AS count
       FROM products
       GROUP BY category
       ORDER BY count DESC`
    );

    const [monthlyProducts] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS count
       FROM products
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    const [recentUsers] = await pool.query(
      `SELECT id, nickname, email, department, grade, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 8`
    );

    const [recentProducts] = await pool.query(
      `SELECT p.id, p.title, p.price, p.category, p.created_at,
              u.nickname AS seller
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 8`
    );

    const [reports] = await pool.query(
      `SELECT id,
              product_id AS productId,
              product_title AS productTitle,
              reporter, reason, detail, status,
              created_at AS createdAt
       FROM reports
       ORDER BY created_at DESC`
    );

    res.json({
      summary: {
        users: Number(userCount.total),
        products: Number(productStats.total),
        averagePrice: Number(productStats.averagePrice),
        highestPrice: Number(productStats.highestPrice),
      },
      categories: categoryStats.map((row) => ({
        category: row.category,
        count: Number(row.count),
      })),
      monthlyProducts: monthlyProducts.map((row) => ({
        month: row.month,
        count: Number(row.count),
      })),
      recentUsers,
      recentProducts,
      reports,
      limitations: [
        '현재 프로젝트에서는 거래 완료 내역이 데이터베이스에 저장되지 않아 통계에 포함되지 않습니다.',
      ],
    });
  } catch (error) {
    console.error('관리자 대시보드 조회 오류:', error);
    res.status(500).json({
      error: '관리자 통계를 불러오지 못했습니다.',
    });
  }
});

// ==================== 신고 관련 API ====================

// 신고 접수
app.post('/api/reports', requireAuth, async (req, res) => {
  const { productId, productTitle, reason, detail } = req.body;

  if (!productId || !productTitle || !reason) {
    return res.status(400).json({
      error: '필수 신고 정보를 입력해주세요.',
    });
  }

  try {
    const [userRows] = await pool.query(
      'SELECT nickname FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    const reporterNickname = userRows[0].nickname;

    const [result] = await pool.query(
      `INSERT INTO reports
       (product_id, product_title, reporter, reason, detail, status)
       VALUES (?, ?, ?, ?, ?, '접수')`,
      [productId, productTitle, reporterNickname, reason, detail || '']
    );

    res.json({
      id: result.insertId,
      message: '신고가 성공적으로 접수되었습니다.',
    });
  } catch (error) {
    console.error('신고 접수 오류:', error);
    res.status(500).json({
      error: '서버 오류로 신고를 접수하지 못했습니다.',
    });
  }
});

// 전체 신고 내역 조회 (관리자)
app.get('/api/admin/reports', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id,
              product_id AS productId,
              product_title AS productTitle,
              reporter, reason, detail, status,
              created_at AS createdAt
       FROM reports
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error('신고 목록 조회 오류:', error);
    res.status(500).json({
      error: '신고 목록을 불러오지 못했습니다.',
    });
  }
});

// 신고 처리 완료 상태 변경 (관리자)
app.patch(
  '/api/admin/reports/:id/complete',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const reportId = req.params.id;

    try {
      const [result] = await pool.query(
        `UPDATE reports
         SET status = '처리 완료'
         WHERE id = ?`,
        [reportId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: '해당 신고를 찾을 수 없습니다.',
        });
      }

      res.json({
        message: '신고가 처리 완료 상태로 변경되었습니다.',
      });
    } catch (error) {
      console.error('신고 상태 변경 오류:', error);
      res.status(500).json({
        error: '신고 상태를 변경하지 못했습니다.',
      });
    }
  }
);

// ==================== 채팅 API ====================

// 사용자가 참여한 채팅방과 각 채팅방의 메시지 조회
async function fetchRooms(userId, roomId = null) {
  const where = roomId
    ? 'r.id = ? AND (r.buyer_id = ? OR r.seller_id = ?)'
    : '(r.buyer_id = ? OR r.seller_id = ?)';

  const params = roomId
    ? [roomId, userId, userId]
    : [userId, userId];

  const [rooms] = await pool.query(
    `SELECT r.id,
            r.product_id AS productId,
            p.title AS productTitle,
            bu.nickname AS buyerNickname,
            su.nickname AS sellerNickname
     FROM chat_rooms r
     JOIN products p ON p.id = r.product_id
     JOIN users bu ON bu.id = r.buyer_id
     JOIN users su ON su.id = r.seller_id
     WHERE ${where}
     ORDER BY r.id DESC`,
    params
  );

  if (rooms.length === 0) {
    return [];
  }

  const roomIds = rooms.map((room) => room.id);

  const [messages] = await pool.query(
    `SELECT m.id,
            m.room_id,
            u.nickname AS sender,
            m.text
     FROM chat_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.room_id IN (?)
     ORDER BY m.id ASC`,
    [roomIds]
  );

  return rooms.map((room) => ({
    ...room,
    messages: messages
      .filter((message) => Number(message.room_id) === Number(room.id))
      .map(({ id, sender, text }) => ({
        id,
        sender,
        text,
      })),
  }));
}

// 내 채팅방 목록
app.get('/api/chat-rooms', requireAuth, async (req, res) => {
  try {
    const rooms = await fetchRooms(req.user.id);
    res.json(rooms);
  } catch (error) {
    console.error('채팅방 목록 조회 오류:', error);
    res.status(500).json({
      error: '채팅방 목록을 불러오지 못했습니다.',
    });
  }
});

// 상품 판매자와 채팅방 만들기 (기존 방이 있으면 기존 방 반환)
app.post('/api/chat-rooms', requireAuth, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      error: '상품 정보가 필요합니다.',
    });
  }

  try {
    const [products] = await pool.query(
      'SELECT id, seller_id FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        error: '상품을 찾을 수 없습니다.',
      });
    }

    const sellerId = products[0].seller_id;

    if (Number(sellerId) === Number(req.user.id)) {
      return res.status(400).json({
        error: '본인이 등록한 상품입니다.',
      });
    }

    // 같은 상품과 구매자의 채팅방이 이미 있는지 먼저 확인
    let [found] = await pool.query(
      `SELECT id
       FROM chat_rooms
       WHERE product_id = ? AND buyer_id = ?
       LIMIT 1`,
      [productId, req.user.id]
    );

    // 기존 채팅방이 없을 때만 새로 생성
    if (found.length === 0) {
      try {
        await pool.query(
          `INSERT INTO chat_rooms (product_id, buyer_id, seller_id)
           VALUES (?, ?, ?)`,
          [productId, req.user.id, sellerId]
        );
      } catch (insertError) {
        // 동시에 같은 방을 만들었거나 중복 키가 발생한 경우를 처리
        if (insertError.code !== 'ER_DUP_ENTRY') {
          throw insertError;
        }
      }

      [found] = await pool.query(
        `SELECT id
         FROM chat_rooms
         WHERE product_id = ? AND buyer_id = ?
         LIMIT 1`,
        [productId, req.user.id]
      );
    }

    if (found.length === 0) {
      return res.status(500).json({
        error: '채팅방을 만들지 못했습니다.',
      });
    }

    const rooms = await fetchRooms(req.user.id, found[0].id);

    if (rooms.length === 0) {
      return res.status(500).json({
        error: '채팅방 정보를 불러오지 못했습니다.',
      });
    }

    res.json(rooms[0]);
  } catch (error) {
    console.error('채팅방 생성 오류:', error);
    res.status(500).json({
      error: '채팅방을 만들지 못했습니다.',
    });
  }
});

// 채팅 메시지 저장
app.post('/api/chat-rooms/:id/messages', requireAuth, async (req, res) => {
  const messageText =
    typeof req.body.text === 'string' ? req.body.text.trim() : '';

  if (!messageText) {
    return res.status(400).json({
      error: '메시지를 입력해주세요.',
    });
  }

  try {
    const [rooms] = await pool.query(
      `SELECT id
       FROM chat_rooms
       WHERE id = ? AND (buyer_id = ? OR seller_id = ?)`,
      [req.params.id, req.user.id, req.user.id]
    );

    if (rooms.length === 0) {
      return res.status(403).json({
        error: '참여하지 않은 채팅방입니다.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, text)
       VALUES (?, ?, ?)`,
      [req.params.id, req.user.id, messageText]
    );

    res.json({
      id: result.insertId,
      ok: true,
    });
  } catch (error) {
    console.error('메시지 저장 오류:', error);
    res.status(500).json({
      error: '메시지를 전송하지 못했습니다.',
    });
  }
});

// 서버 연결 확인
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'server on 4000' });
});

// 서버 실행
app.listen(4000, () => {
  console.log('server on 4000');
});
