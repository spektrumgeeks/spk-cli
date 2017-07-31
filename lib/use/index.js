'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var key = _ref.key,
      options = _ref.options;

  var store = {
    key: key,
    options: options,
    spinner: spinner,
    pwd: _config2.default.root
  };

  _update2.default.call(store).then(function () {
    return _install2.default.call(store);
  }).then(function () {
    console.log(_logSymbols2.default.info, ' Done importing ' + store.template.name);
    console.log(_logSymbols2.default.info, ' Run "npm i" to complete installation');
    process.exit(0);
  }).catch(function (error) {
    spinner.fail();
    console.error(_logSymbols2.default.error, error);
    process.exit(1);
  });
};

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _install = require('./install');

var _install2 = _interopRequireDefault(_install);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spinner = (0, _ora2.default)({ color: 'blue', spinner: _config2.default.spinner });