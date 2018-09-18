const bcrypt = require('bcrypt');

module.exports.mongo = (Schema) => {
  const UserToWorkerSchema = new Schema({
    worker: Schema.ObjectId, // 报名者ID
    kol: Schema.ObjectId, // kolID
    type: { // 报名类型
      type: String
    },
    wish: Array, // 想去的工厂
    date: Date, // 时间
    delete: {
      type: Boolean,
      default: false
    }
  });
  return ['UserToWorker', UserToWorkerSchema];
};