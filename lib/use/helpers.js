'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.listTemplates = listTemplates;
exports.parseKey = parseKey;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function listTemplates(templates) {
  return Object.keys(templates).filter(function (name) {
    return name !== 'default';
  }).map(function (name) {
    return '\t- ' + name;
  }).join('\n');
}

function parseKey(pkg, edit) {
  var push = edit.push,
      merge = edit.merge,
      filter = edit.filter,
      concat = edit.concat,
      replace = edit.replace;

  var value = push || merge || filter || concat || replace;

  // filter arrays
  if (filter && Array.isArray(pkg)) {
    var keys = {};
    return [].concat(_toConsumableArray(pkg), _toConsumableArray(filter)).filter(function (item) {
      var key = JSON.stringify(item);
      return keys[key] ? false : keys[key] = true;
    });
  }

  // concat strings
  if (concat && typeof pkg === 'string') return pkg + concat.glue + concat.string;
  // merge objects
  if (merge && (typeof pkg === 'undefined' ? 'undefined' : _typeof(pkg)) === 'object') return _extends({}, pkg, merge);
  // push array
  if (push && Array.isArray(pkg)) return [].concat(_toConsumableArray(pkg), _toConsumableArray(push));
  // replace value
  if (replace) return replace;
  // new prop
  if (!pkg) return value;
  // fallback to src
  return pkg;
}