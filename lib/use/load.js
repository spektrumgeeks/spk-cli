'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (payload) {
  var key = payload.key,
      spinner = payload.spinner;


  spinner.start(' Load template');
  payload.template = require('../../templates/' + templates[key].dir);

  if (!payload.template.checkfile) {
    spinner.succeed();
    return Promise.resolve(payload);
  }

  return new Promise(function (resolve, reject) {
    _fs2.default.access(payload.template.checkfile, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (error) {
      if (error) {
        spinner.fail();
        return reject(' Missing checkfile\n   ' + error);
      }

      spinner.succeed();
      resolve(payload);
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var templates = require('../../templates/spk-templates.json');