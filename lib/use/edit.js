'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (template, success) {
  var edit = template.edit;

  if (!edit) return Promise.resolve(template);

  return new Promise(function (resolve, reject) {
    _fs2.default.readFile('./package.json', 'utf8', function (error, pkg) {
      if (error) return reject(error);

      try {
        pkg = JSON.parse(pkg);
      } catch (error) {
        return reject(error);
      }

      Object.keys(edit).forEach(function (key) {
        pkg[key] = parseKey(pkg[key], edit[key]);
      });

      _fs2.default.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', function (error) {
        if (error) return reject(error);
        success();
        return resolve(template);
      });
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function parseKey(pkg, edit) {
  var push = edit.push,
      merge = edit.merge,
      filter = edit.filter,
      concat = edit.concat,
      replace = edit.replace;
  // new prop

  if (!pkg) return push || merge || filter || concat || replace || edit;
  // replace value
  if (replace) return replace;
  // concat strings
  if (concat && typeof pkg === 'string') return pkg + concat.glue + concat.string;
  // merge objects
  if (merge && (typeof pkg === 'undefined' ? 'undefined' : _typeof(pkg)) === 'object') return _extends({}, pkg, merge);
  // push array
  if (push && Array.isArray(pkg)) return [].concat(_toConsumableArray(pkg), _toConsumableArray(push));
  // filter arrays
  if (filter && Array.isArray(pkg)) {
    var keys = {};
    return [].concat(_toConsumableArray(pkg), _toConsumableArray(filter)).filter(function (item) {
      var key = JSON.stringify(item);
      return keys[key] ? false : keys[key] = true;
    });
  }

  // fallback to src
  return pkg;
}