'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (payload) {
  var key = payload.key,
      spinner = payload.spinner;


  spinner.start(' Load template');
  payload.template = !key ? { error: ' No template name provided' } : !templates[key] ? { error: ' No templates by the name "' + key + '"' } : templates[key];

  if (payload.template.error) {
    spinner.fail();
    return Promise.reject(payload.template.error + '. Available templates:\n' + list);
  }

  if (!payload.template.checkfile) {
    spinner.succeed();
    spinner.warn(' No checkfile');
    return Promise.resolve(payload);
  }

  return new Promise(function (resolve, reject) {
    _fs2.default.access(payload.template.checkfile, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (error) {
      if (error) {
        spinner.fail();
        reject(error);
      }

      spinner.succeed();
      resolve(payload);
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _templates = require('../../templates');

var templates = _interopRequireWildcard(_templates);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var list = Object.keys(templates).filter(function (name) {
  return name !== 'default';
}).map(function (name) {
  return '\t' + name;
}).join('\n');