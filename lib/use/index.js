'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (key, _ref) {
  var list = _ref.list,
      safe = _ref.safe;

  var spinner = (0, _ora2.default)(_config2.default.spinner);

  (0, _load2.default)({ key: key, safe: safe, spinner: spinner }).then(function (payload) {
    return _files2.default.delete(payload);
  }).then(function (payload) {
    return _files2.default.import(payload);
  }).then(function (payload) {
    return _files2.default.edit(payload);
  }).then(function (_ref2) {
    var template = _ref2.template;

    console.log(_logSymbols2.default.info, ' Done importing ' + template.name);
    console.log(_logSymbols2.default.info, ' Run "npm i" to complete installation');
    process.exit(0);
  }).catch(function (error) {
    console.error(_logSymbols2.default.error, error);
    process.exit(1);
  });
};

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _load = require('./load');

var _load2 = _interopRequireDefault(_load);

var _files = require('./files');

var _files2 = _interopRequireDefault(_files);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }