const headers = require('./headers.js');
const errHandle = (res, code) => {
  let message;
  if (code === 404) {
    message = '找不到此路由';
  } else if (code === 400) {
    message = '欄位未填寫正確，或無此 id';
  }
  res.writeHead(code, headers);
  res.write(JSON.stringify({
    'status': 'false',
    'message': message,
  }));
  res.end();
}
module.exports = errHandle;