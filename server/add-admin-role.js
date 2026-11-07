
require('dotenv').config();
const mysql = require('mysql2/promise');

async function addAdminRole() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [columns] = await connection.query(
      'SHOW COLUMNS FROM users LIKE ?',
      ['role']
    );

    if (columns.length > 0) {
      console.log('role 항목이 이미 있어요. 변경하지 않았습니다.');
      return;
    }

    await connection.query(
      "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'"
    );

    console.log('관리자 권한 항목 추가 성공!');
  } catch (error) {
    console.log('오류:', error.code || error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addAdminRole();