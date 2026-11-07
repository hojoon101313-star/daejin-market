
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('DB 연결 성공!');
    await connection.end();
  } catch (error) {
    console.log('DB 연결 실패:', error.code || error.message);
  }
}

checkDatabase();