const glob = require('glob');
const path = require('path');
const _ = require('lodash');

module.exports = (app) => {
  let defines = glob.sync('util/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../../', 'modules')
  });
  console.log('util===', defines);
  app.context.service = {};
  _.forEach(defines, $define => {
    const svc = require('../../modules/' + $define);
    if (svc.name) {
      app.context.services[svc.name] = svc;
      return;
    }
    const [name, service] = svc;
    app.context.service[name] = service;
  });
};
