const glob = require('glob');
const path = require('path');
const _ = require('lodash');

module.exports = (routers) => {
  let defines = glob.sync('controllers/*/controller.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../../', 'modules')
  });
  console.log(defines);
  _.forEach(defines, $define => {
    const ctl = require('../../modules/' + $define);
    ctl.register(routers);
  });
};