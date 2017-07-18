'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (key, _ref) {
  var list = _ref.list,
      skip = _ref.skip;

  var spinner = (0, _ora2.default)(_config2.default.spinner);
  spinner.start(' Load template');

  (0, _load2.default)(key, function () {
    spinner.succeed().start(' Import files');
  }).then(function (template) {
    return (0, _tree2.default)(template, skip, function () {
      spinner.succeed().start(' Update package.json');
    });
  }).then(function (template) {
    return (0, _edit2.default)(template, function () {
      spinner.succeed();
    });
  }).then(function (template) {
    console.log('[' + _chalk2.default.blue('spk') + '] Done importing ' + template.name);
    console.log('[' + _chalk2.default.blue('spk') + '] Run "npm i" to complete installation');
    process.exit(0);
  }).catch(function (error) {
    spinner.fail();
    console.error('[' + _chalk2.default.red('spk') + '] ' + error);
    process.exit(1);
  });
};

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _load = require('./load');

var _load2 = _interopRequireDefault(_load);

var _tree = require('./tree');

var _tree2 = _interopRequireDefault(_tree);

var _edit = require('./edit');

var _edit2 = _interopRequireDefault(_edit);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }