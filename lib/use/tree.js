'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (template, skip, success) {
  if (!template.tree) return Promise.resolve(template);

  return new Promise(function (resolve, reject) {
    var src = __dirname.split(_path2.default.sep).slice(0, -2).join('/') + '/' + template.tree;

    (0, _ncp.ncp)(src, process.cwd(), { clobber: !skip }, function (error) {
      if (error) return reject(error);

      success();
      resolve(template);
    });
  });
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ncp = require('ncp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }