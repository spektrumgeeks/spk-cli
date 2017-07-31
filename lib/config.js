'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = _path2.default.resolve(__dirname, '../');

exports.default = {
  root: root,
  description: '—— Command line tool for importing project templates and running tasks ——\n\n',
  repo: 'git@bitbucket.org:snippets/spektrummedia/G4XA4k/spk-templates.git',
  spinner: { interval: 120, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
};