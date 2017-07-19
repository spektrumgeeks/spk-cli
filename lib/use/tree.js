'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ncp = require('ncp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  delete: function _delete(template, success) {
    if (!template.tree || !template.tree.remove) return Promise.resolve(template);

    try {
      return (0, _del2.default)(template.tree.remove).then(function () {
        success();
        return Promise.resolve(template);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  import: function _import(template, skip, success) {
    if (!template.tree || !template.tree.copy) return Promise.resolve(template);

    return new Promise(function (resolve, reject) {
      var src = __dirname.split(_path2.default.sep).slice(0, -2).join('/') + '/' + template.tree.copy;
      (0, _ncp.ncp)(src, process.cwd(), { clobber: !skip }, function (error) {
        if (error) return reject(error);

        success();
        resolve(template);
      });
    });
  }
};