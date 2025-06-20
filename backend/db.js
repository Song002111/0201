const mysql = require('mysql');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'certificate'
});

// 尝试连接数据库
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log("Connected to MySQL database");
});

// 执行数据库查询的函数
const executeQuery = (sql, values, callback) => {
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// 导出执行查询的函数
module.exports = { executeQuery };