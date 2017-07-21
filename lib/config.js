'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  root: __dirname.split(_path2.default.sep).slice(0, -1).join('/'),
  description: '—— Command line tool for importing project templates and running tasks ——\n\n',
  spinner: {
    color: 'blue',
    spinner: { interval: 100, frames: ['   [spk]', '   [ sp]', '   [  s]', '   [k  ]', '   [pk ]'] }
  }
};