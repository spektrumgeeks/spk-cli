'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (payload) {
  var key = payload.key,
      spinner = payload.spinner,
      skipUpdate = payload.skipUpdate;

  var templatesRoot = _config2.default.root + '/templates';
  var template = void 0;

  spinner.start(' Update template');

  if (skipUpdate) {
    spinner.warn(' Skipping update');
    return Promise.resolve(payload);
  }

  template = !key ? { error: ' No template name provided' } : !templates[key] ? { error: ' No templates by the name "' + key + '"' } : templates[key];

  if (template.error) {
    spinner.fail();
    return Promise.reject(template.error + '. Available templates:\n' + (0, _helpers.listTemplates)(templates));
  }

  return new Promise(function (resolve, reject) {
    // load status data
    _fs2.default.readFile(templatesRoot + '/.gitstatus', 'utf8', function (error, status) {
      var gitOp = void 0;

      if (error) {
        spinner.fail();
        return reject(error);
      }

      try {
        status = JSON.parse(status);
      } catch (error) {
        spinner.fail();
        return reject(error);
      }

      if (!status[key]) {
        gitOp = (0, _git.clone)(template, templatesRoot, template);
        status[key] = true;
      } else {
        gitOp = (0, _git.pull)(templatesRoot + '/' + key);
      }

      Promise.all([gitOp]).then(function () {
        // write status data back to disk
        _fs2.default.writeFile(templatesRoot + '/.gitstatus', JSON.stringify(status, null, 2), 'utf8', function (error) {
          if (error) {
            spinner.fail();
            return reject(error);
          }

          // script success exit point
          spinner.succeed();
          resolve(payload);
        });
      })
      // catch clone/pull errors
      .catch(function (error) {
        spinner.fail();
        reject(' Could not process the repo\n' + error);
      });
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _git = require('./git');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var templates = require('../../templates/spk-templates.json');

// assess repo states and clone/pull