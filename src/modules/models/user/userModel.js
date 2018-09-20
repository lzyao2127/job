const bcrypt = require('bcrypt');

module.exports.mongo = (Schema) => {
  const UserSchema = new Schema({
    username: String, // 微信名
    name: String, // 真实姓名
    sex: {
      type: String, // 性别
      enum: ['男', '女', '未知']
    },
    IDCard: String, // 身份证号
    email: String, // 邮箱
    address: String, // 地址
    education: String, // 学历
    phone: String, // 手机号
    headeImage: String, // 头像
    openID: String, // openID
    type: {
      type: String, // 用户类型
      enum: ['admin', 'KOL', 'worker'],
      default: 'worker'
    },
    role: {
      type: Number, // 权限级别
      enum: [1, 2, 3], // 1: 管理员， 2: KOL， 3: worker,
      default: 3
    },
    delete: {
      type: Boolean,
      default: false
    }
  });
  UserSchema.pre('save', (next) => {
    let user = this;
    if (!user.isModified('password')) return next();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
    next();
  });
  return ['User', UserSchema];
};