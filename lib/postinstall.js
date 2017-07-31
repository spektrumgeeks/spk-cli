'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _git = require('./git');

var _git2 = _interopRequireDefault(_git);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gitstate = _path2.default.resolve(_config2.default.root, 'templates/.gitstate');

_git2.default.clone({ repo: _config2.default.repo, dir: 'templates', dest: _config2.default.root }).then(function () {
  _fs2.default.writeFile(gitstate, JSON.stringify({}, null, 2), 'utf8', function (error) {
    if (error) {
      console.log('Could not create .gitstate file\n', error);
      process.exit(1);
    }

    process.exit(0);
  });
});