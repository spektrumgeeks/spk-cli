'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (key, success) {
  var template = !key ? { error: ' No template name provided' } : !templates[key] ? { error: ' No templates by the name "' + key + '"' } : templates[key];

  // TODO: list all templates
  if (template.error) return Promise.reject(template.error);

  success();
  return Promise.resolve(template);
};

var _templates = require('../../templates');

var templates = _interopRequireWildcard(_templates);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }