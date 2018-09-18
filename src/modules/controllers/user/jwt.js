// 用户token加密解密方法
const jwt = require('jwt-simple');
const moment = require('moment');
const mongoose = require('mongoose');
const config = require('./../../config');

// 加密token
const getToken = async (user, project) => {
  const tokenString = `${config.app.token}${project}`;
  // 设置token有效期
  var expires = moment().add(30, 'd').valueOf();
  // 生成token
  var token = await jwt.encode(
    {
      iss: user._id,
      exp: expires
    }, tokenString
  );
  return {
    token: token,
    user: user.toJSON()
  };
};

// 解密token
const decryToken = async (ctx, next) => {
  const {util} = ctx.service;
  // Parse the URL, we might need this
  // 解析url地址
  const { query, body, headers } = ctx.request;
  const {project} = query || body || headers;
  const tokenString = `${config.app.token}${project}`;
  const User = mongoose.model('User');
  /**
   * Take the token from:
   *  - the POST value token
   *  - the GET parameter token
   *  - the access-token header
   *    ...in that order.
   */
  const token = (body && body.token) || query.token || headers['access-token'] || headers['token'];
  // 如果token存在
  if (token) {
    try {
      // 使用密钥解析token
      const decoded = jwt.decode(token, tokenString);
      // 判断token过期时间
      if (decoded.exp <= Date.now()) {
        ctx.body = util.returnBody(config.status.TOKEN_ERROR, 'token失效');
      } else {
        // 没有过期 根据解析出的内容 查询数据库是否存在
        await User.findOne({ '_id': decoded.iss }).then(async (user) => {
          if (user) {
            user.password = undefined;
            ctx.req.user = user; // 如果数据库存在，将查询到用户信息附加到请求上
            next();
          } else {
            ctx.body = util.returnBody(config.status.TOKEN_ERROR, 'token解析失败');
          }
        });
      }
    } catch (err) {
      ctx.status = 400;
      console.log(err);
      ctx.body = util.returnBody(config.status.TOKEN_ERROR, 'token解析失败');
    }
  } else {
    ctx.body = util.returnBody(config.status.TOKEN_ERROR, 'token不存在');
  }
};

module.exports.getToken = getToken;
module.exports.decryToken = decryToken;

module.exports.register = ({unauth}) => {
  unauth.post('/decry/token', decryToken);
};