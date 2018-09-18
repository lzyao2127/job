// 用户模块
const mongoose = require('mongoose');
const config = require('./../../config');
const jwt = require('./jwt');

/**
 * 根据openID获取接口请求凭证，openID不存在则创建新的用户
 */
const register = async (ctx) => {
  const {util} = ctx.service;
  try {
    const {name, sex, IDCard, email, address, education, phone, headeImage, openID} = ctx.request.body;
    const User = mongoose.model('User');
    let user = await User.findOne({openID});
    if (!user) {
      user = await User.create({name, sex, IDCard, email, address, education, phone, headeImage, openID});
    }
    const token = await jwt.getToken(user);
    ctx.body = util.returnBody(config.status.SUCCESS, 'success', token);
  } catch (err) {
    console.log(err);
    ctx.body = util.returnBody(config.status.ERROR, 'error => ', err);
  }
};

// 申请成为KOL
const applyKOL = async (ctx) => {
  const {util} = ctx.service;
  try {
    const {openID} = ctx.req.user;
    const User = mongoose.model('User');
    const user = await User.findOne({openID});
    if (!user.name || !user.phone || !user.IDCard || !user.address || !user.education) {
      ctx.body = util.returnBody(config.status.PARAMS_ERR, '请完善个人信息');
      return;
    }
    await User.update({openID}, {$set: {role: 2, type: 'KOL'}});
    ctx.body = util.returnBody(config.status.SUCCESS, '变更成功');
  } catch (err) {
    console.log(err);
    ctx.body = util.returnBody(config.status.ERROR, 'error => ', err);
  }
};

// 报名
const workerSingUp = async (ctx) => {
  const {util} = ctx.service;
  try {
    const {user} = ctx.req;
    const {kol, wish, type} = ctx.request.body;
    const WorkerToUser = mongoose.model('WorkerToUser');
    const workerToUser = await WorkerToUser.find({worker: user._id, kol});
    if (workerToUser) {
      ctx.body = util.returnBody(config.status.PARAMS_ERR, '您已报名过');
      return;
    };
    await WorkerToUser.create({
      worker: user._id,
      kol: kol,
      date: new Date(),
      type: type,
      wish: wish
    });
    ctx.body = util.returnBody(config.status.SUCCESS, '报名成功');
  } catch (err) {
    console.log(err);
    ctx.body = util.returnBody(config.status.ERROR, 'error => ', err);
  }
};

// 查询已报名用户
const findUser = async (ctx) => {
  const {util} = ctx.service;
  try {
    const {user} = ctx.req;
    const {page} = ctx.request.query;
    const WorkerToUser = mongoose.model('WorkerToUser');
    const workers = await WorkerToUser.aggregate(
      {$match: {kol: user._id}},
      {$project: {
        date: {$dateToString: {format: '%Y-%m-%d', date: '$date'}}
      }},
      {$group: {_id: '$date', count: {$sum: 1}}},
      {$sort: {
        date: -1
      }},
      {$lookup: {
        from: 'user',
        localField: 'kol',
        foreignField: '_id',
        as: 'user'
      }},
      {$lookup: {
        from: 'user',
        localField: 'kol',
        foreignField: '_id',
        as: 'user'
      }},
      {$skip: (page - 1) * 10},
      {$limit: 10}
    );
    ctx.body = util.service(config.status.SUCCESS, '查询成功', workers);
  } catch (err) {
    console.log(err);
  }
};

module.exports.register = ({router, unauth}) => {
  unauth.post('/register', register);
  unauth.post('/find/user', findUser);
  router.get('/apply/kol', applyKOL);
  router.post('/sing/up', workerSingUp);
};