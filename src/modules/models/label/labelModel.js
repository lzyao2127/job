module.exports.mongo = (Schema) => {
  const LabelSchema = new Schema({
    name: String, // 标签名
    type: String // 标签类型
  });
  return ['Label', LabelSchema];
};