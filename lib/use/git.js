'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clone = clone;
exports.pull = pull;

var _simpleGit = require('simple-git');

var _simpleGit2 = _interopRequireDefault(_simpleGit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function clone(key, dest, _ref) {
  var git = _ref.git,
      dir = _ref.dir;

  return new Promise(function (resolve, reject) {
    (0, _simpleGit2.default)(dest).clone(git, dir, function (err) {
      return err ? reject(err) : resolve();
    });
  });
}

function pull(dir) {
  return new Promise(function (resolve, reject) {
    (0, _simpleGit2.default)(dir).pull(function (err) {
      return err ? reject(err) : resolve();
    });
  });
}