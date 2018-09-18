const Koa = require('koa');
// 引入第三方库
const Router = require('koa-router'); // 路由模块
const responseTime = require('koa-response-time'); // 请求响应时间
const logger = require('koa-logger'); // 日志模块
const cors = require('koa-cors'); // 跨域模块
const convert = require('koa-convert'); // 兼容低版本的 generators
const bodyParser = require('koa-bodyparser'); // 解析请求体
// const bytes = require('bytes'); // 解析字节模块

// 导入初始化方法
const controllers = require('./common/controllers'); // 初始化controller
const mongo = require('./common/mongo');
const config = require('./modules/config');
const util = require('./common/util');
const app = new Koa();

const publicRouter = new Router({prefix: '/api'});
const unauthRouter = new Router({prefix: '/api'});

// 放在最前面
app.use(responseTime());
// 初始化日志模块
app.use(logger());
// 处理请求
app.use(convert(cors({
  origin: '*',
  credentials: true,
  headers: ['Content-Type', 'accept', 'X-CLOUD-TOKEN', 'token', 'Access-Control-Allow-Origin'],
  expose: ['Total', 'X-Response-Time', 'Content-Disposition']
})));
// 解析请求体
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
    text: ['text/xml']
  },
  multipart: true,
  textLimit: '100mb',
  jsonLimit: '100mb',
  formLimit: '100mb'
}));

util(app);
// 注册路由
controllers({
  unauth: unauthRouter,
  router: publicRouter
});
app.use(unauthRouter.routes());
app.use(publicRouter.routes());

// catch all exceptions  捕获所有异常
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) ctx.throw(404);
  } catch (err) {
    console.log(err);
    ctx.status = err.status || 500;
    ctx.body = {message: err.message, success: false};
  };
});

mongo().then(async () => {
  await app.listen(config.port);
  console.log('npm start :', config.port);
});