const mongoose = require('mongoose');
const config = require('./../../config');

const addFactory = async ctx => {
  const {util} = ctx.service;
  try {
    const {name, address, images, number, starAge, lastAge, hourlyWage, sex, label, remark} = ctx.request.body;
    const {user} = ctx.req;
    const Factory = mongoose.model('Factory');
    let filePaths = [];
    // const thumbnail = ''; // 缩略图生成
    if (images) {
      for (let image of images) {
        const path = await util.handleBase64(image);
        filePaths.push(path);
      }
    }
    await Factory.create({user: user._id, name, address, images, number, starAge, lastAge, hourlyWage, sex, label, remark});
    ctx.body = util.returnBody(config.status.SUCCESS, '创建成功');
  } catch (err) {
    console.log(err);
    ctx.body = util.returnBody(config.status.ERROR, 'error => ', err);
  }
};

const findFactory = async ctx => {
  const {util} = ctx.service;
  try {
    const {limit = 10, page = 1} = ctx.request.query;
    const {user} = ctx.req;
    const Factory = mongoose.model('Factory');
    const factorys = await Factory.paginate({
      user: mongoose.Types.ObjectId(user._id)
    }, {
      sort: {
        _id: -1
      },
      limit: limit >> 0,
      page: page >> 0
    });
    ctx.body = util.returnBody(config.status.SUCCESS, '查询成功', factorys);
  } catch (err) {
    console.log(err);
    ctx.body = util.returnBody(config.status.ERROR, 'error => ', err);
  }
};

module.exports.register = ({router}) => {
  router.get('/find/factory', findFactory);
  router.post('/create/factory', addFactory);
};