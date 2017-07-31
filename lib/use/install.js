'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var _this = this;

  var root = _path2.default.resolve(this.pwd, 'templates', this.key);
  this.template = require(_path2.default.resolve(root, 'spk-template.json'));
  this.spinner.start(' Load template');

  return new Promise(function (resolve, reject) {
    if (!_this.template.checkfile) {
      _this.spinner.succeed();
      return resolve();
    }

    _fs2.default.access(_this.template.checkfile, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (error) {
      if (error) return reject(' Missing checkfile, are you in the right directory?\n\n   ' + error);
      _this.spinner.succeed();
      resolve();
    });
  }).then(function () {
    _this.spinner.start(' Delete files');

    if (!_this.template.files || !_this.template.files.delete || _this.options.safe) {
      var msg = _this.options.safe ? ' [safe mode] Skipping file deletion' : ' No files to delete';
      _this.spinner.succeed(msg);
      return Promise.resolve();
    }

    try {
      return (0, _del2.default)(_this.template.files.delete);
    } catch (error) {
      return Promise.reject(error);
    }
  }).then(function () {
    var msg = _this.safe ? ' [safe mode] Copying files without overwriting' : ' Copying files';
    _this.spinner.succeed().start(msg);

    if (!template.files || !template.files.import) {
      _this.spinner.succeed(' No files to import');
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var filter = function filter(filename) {
        return !~['spk-template.json', '.git'].indexOf(filename);
      };
      _this.template.files.import.forEach(function (src) {
        (0, _ncp.ncp)(src, process.cwd(), { filter: filter, clobber: !safe }, function (err) {
          if (err) reject(err);
        });
      });

      _this.spinner.succeed();
      resolve();
    });
  }).then(function () {
    var edit = _this.template.edit;
    _this.spinner.start(' Edit package');

    if (!edit) {
      _this.spinner.succeed(' Nothing to edit');
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      _fs2.default.readFile('./package.json', 'utf8', function (error, pkg) {
        if (error) return reject(error);
        try {
          pkg = JSON.parse(pkg);
        } catch (error) {
          return reject(error);
        }

        Object.keys(edit).forEach(function (key) {
          pkg[key] = (0, _helpers.parseKey)(pkg[key], edit[key]);
        });

        _fs2.default.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', function (error) {
          if (error) return reject(error);
          _this.spinner.succeed();
          resolve(payload);
        });
      });
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ncp = require('ncp');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }