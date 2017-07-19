'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ncp = require('ncp');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // delete files specified in template's config.tree.delete
  delete: function _delete(payload) {
    var template = payload.template,
        spinner = payload.spinner,
        safe = payload.safe;

    spinner.start(' Delete files');

    if (!template.tree || !template.tree.delete || safe) {
      spinner.succeed(' ' + (safe ? '[safe mode] ' : '') + 'No files to delete');
      return Promise.resolve(payload);
    }

    try {
      return (0, _del2.default)(template.tree.delete).then(function () {
        spinner.succeed();
        return Promise.resolve(payload);
      });
    } catch (error) {
      spinner.fail();
      return Promise.reject(error);
    }
  },


  // import files from template's config.tree.import
  import: function _import(payload) {
    var template = payload.template,
        spinner = payload.spinner,
        safe = payload.safe;

    var fixtures = safe ? { pre: '[safe mode] ', post: ' without overwriting' } : {};
    spinner.start(' ' + (fixtures.pre || '') + 'Import files' + (fixtures.post || ''));

    if (!template.tree || !template.tree.import) {
      spinner.succeed(' ' + (fixtures.pre || '') + 'No files to import');
      return Promise.resolve(payload);
    }

    return new Promise(function (resolve, reject) {
      var src = __dirname.split(_path2.default.sep).slice(0, -2).join('/') + '/' + template.tree.import;
      (0, _ncp.ncp)(src, process.cwd(), { clobber: !safe }, function (error) {
        if (error) {
          spinner.fail();
          return reject(error);
        }

        spinner.succeed();
        resolve(payload);
      });
    });
  },


  // edit package.json using template's config.edit map
  edit: function edit(payload) {
    var template = payload.template,
        spinner = payload.spinner;
    var edit = template.edit;

    spinner.start(' Edit package.json');

    if (!edit) {
      spinner.succeed(' Nothing to edit');
      return Promise.resolve(payload);
    }

    return new Promise(function (resolve, reject) {
      _fs2.default.readFile('./package.json', 'utf8', function (error, pkg) {
        if (error) {
          spinner.fail();
          return reject(error);
        }

        try {
          pkg = JSON.parse(pkg);
        } catch (error) {
          spinner.fail();
          return reject(error);
        }

        Object.keys(edit).forEach(function (key) {
          pkg[key] = (0, _helpers.parseKey)(pkg[key], edit[key]);
        });

        _fs2.default.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', function (error) {
          if (error) {
            spinner.fail();
            return reject(error);
          }

          spinner.succeed();
          resolve(payload);
        });
      });
    });
  }
};