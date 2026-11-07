
require('dotenv').config();
const mysql = require('mysql2/promise');

// 아래 값을 본인이 로그인할 때 사용하는 닉네임으로 바꾸세요.
const ADMIN_NICKNAME = '대진이';

async function setAdmin() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [users] = await connection.execute(
      'SELECT id, nickname, role FROM users WHERE nickname = ?',
      [ADMIN_NICKNAME]
    );

    if (users.length !== 1) {
      console.log('해당 닉네임의 회원을 찾지 못했거나 중복되었습니다.');
      return;
    }

    const [result] = await connection.execute(
      "UPDATE users SET role = 'admin' WHERE id = ?",
      [users[0].id]
    );

    console.log('관리자 지정 완료:', users[0].nickname);
  } catch (error) {
    console.log('오류:', error.code || error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setAdmin();