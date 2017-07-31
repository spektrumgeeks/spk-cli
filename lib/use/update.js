'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var _this = this;

  var src = {
    templates: _path2.default.resolve(this.pwd, 'templates/'),
    gitstate: _path2.default.resolve(this.pwd, 'templates/.gitstate')
  };

  return new Promise(function (resolve, reject) {
    _this.spinner.start(' Update template maps');

    // update template maps
    (0, _simpleGit2.default)(src.templates).pull(function (err) {
      if (err) return reject(err);

      _this.spinner.succeed().start(' Update template');

      var maps = require(_path2.default.resolve(_this.pwd, 'templates/index.json'));
      var list = Object.keys(maps).filter(function (name) {
        return name !== 'default';
      }).map(function (name) {
        return '\t- ' + name;
      }).join('\n');

      // resolve template map
      var map = !_this.key ? { error: ' No template name provided' } : !maps[_this.key] ? { error: ' No templates by the name "' + _this.key + '"' } : maps[_this.key];

      var save = function save(state) {
        _fs2.default.writeFile(src.gitstate, JSON.stringify(state, null, 2), 'utf8', function (error) {
          if (error) return reject(error);
          _this.spinner.succeed();
          resolve();
        });
      };

      if (map.error) return reject(map.error + '. Available templates:\n' + list);

      if (_this.options.skipUpdate) {
        _this.spinner.warn(' Skipping update');
        return resolve();
      }

      // load and check repo state
      _fs2.default.readFile(src.gitstate, 'utf8', function (error, state) {
        if (error) return reject(error);

        try {
          state = JSON.parse(state);
        } catch (err) {
          reject(err);
        }

        if (!state[key]) {
          // git clone if template is not present
          (0, _simpleGit2.default)(src.templates).clone(map.repo, map.name, function (err) {
            if (err) return reject(err);
            state[key] = true;
            save(state);
          });
        } else {
          // git pull template repo
          (0, _simpleGit2.default)(_path2.default.resolve(src.templates, map.name)).pull(function (err) {
            if (err) return reject(err);
            save(state);
          });
        }
      });
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _simpleGit = require('simple-git');

var _simpleGit2 = _interopRequireDefault(_simpleGit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }