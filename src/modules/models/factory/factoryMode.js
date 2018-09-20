module.exports.mongo = (Schema) => {
  const FactoryShema = new Schema({
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    name: String, // 工厂名称
    address: String, // 工厂地址
    images: Array, // 照片集合，最少一张。默认第一张作为封面图
    thumbnail: String,
    number: Number, // 人数
    starAge: Number, // 最小年龄
    lastAge: Number, // 最大年龄
    hourlyWage: Number, // 基础工资待遇
    sex: { // 性别限制
      type: String,
      enum: ['男', '女', '不限']
    },
    label: Array, // 工厂标签集合，--标签应该分类，住宿类，加班类，吃饭类，环境类，补贴类等每种标签选则一个，每种必选
    remark: String // 其他详细信息
  });
  return ['Factory', FactoryShema];
};