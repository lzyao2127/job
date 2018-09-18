/**
 * 公共util
 */
const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');

// 处理文件地址
async function handleFilePath(fileName, path) {
  let date = moment().format('YYYYMMDD');
  let target = [path, date];
  target = target.join('/');
  let now = Date.now();
  try {
    await fs.statSync(target);
  } catch (err) {
    if (err.code && err.code === 'ENOENT') {
      await mkdirp(target);
    } else {
      console.log(err);
    }
  };
  let filename = [target, now + '-' + fileName].join('/');
  let relative = [date, now + '-' + fileName].join('/');
  return [filename, relative];
};

const util = {
  /**
   * 接口返回数据格式
   */
  returnBody: (status, msg, data) => {
    return {
      status: status, // 状态码 1/0 成功或失败
      msg: msg, // 返回结果，data，或这
      data: data
    };
  },
  // 当图片参数为base64字符串时 处理base64为图片
  handleBase64: async (base64, name, path) => {
    const [filename, relative] = await handleFilePath(name, path);
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFileSync(filename, buffer);
    return relative;
  },
  // 当图片参数为图片格式的时候
  handleFile: async (file, name, path) => {
    const [filename, relative] = await handleFilePath(name, path);
    // 将文件写入指定目录
    await fs.writeFileSync(filename, file.buffer);
    return relative;
  }
};
module.exports = ['util', util];