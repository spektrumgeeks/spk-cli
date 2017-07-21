'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (key, options) {
  var spinner = (0, _ora2.default)(_config2.default.spinner);

  (0, _update2.default)(_extends({ key: key, spinner: spinner }, options)).then(function (payload) {
    return (0, _load2.default)(payload);
  }).then(function (payload) {
    return _files2.default.delete(payload);
  }).then(function (payload) {
    return _files2.default.import(payload);
  }).then(function (payload) {
    return _files2.default.edit(payload);
  }).then(function (_ref) {
    var template = _ref.template;

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

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }