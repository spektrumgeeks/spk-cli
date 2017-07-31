'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ascii = require('./spk.json');

var s = ascii.s,
    p = ascii.p,
    k = ascii.k;


var spk = Array(8).fill(null).map(function (n, i) {
  return ['\t', s[i], p[i], _chalk2.default.blue(k[i])].join('');
}).join('\n');

exports.default = spk;