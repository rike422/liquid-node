var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");
var Fs = require("fs");
var Path = require("path");

var readFile = function (fpath, encoding) {
  return new Promise(function (resolve, reject) {
    return Fs.readFile(fpath, encoding, function (err, content) {
      if ((err)) {
        return reject(err);
      } else {
        return resolve(content);
      }
    });
  });
};

var PathPattern = /^[^.\/][a-zA-Z0-9-_\/]+$/;

Liquid.LocalFileSystem = class LocalFileSystem extends Liquid.BlankFileSystem {
  constructor(root, extension = "html") {
    super(...arguments);
    this.root = root;
    this.fileExtension = extension;
  }

  readTemplateFile(templatePath) {
    return this.fullPath(templatePath).then(function (fullPath) {
      return readFile(fullPath, "utf8").catch(function (err) {
        throw new Liquid.FileSystemError(("Error loading template: " + (err.message)));
      });
    });
  }

  fullPath(templatePath) {
    if (PathPattern.test(templatePath)) {
      return Promise.resolve(
        Path.resolve(Path.join(this.root, templatePath + ("." + (this.fileExtension))))
      );
    } else {
      return Promise.reject(
        new Liquid.ArgumentError(("Illegal template name '" + (templatePath) + "'"))
      );
    }
  }
}

module.exports = Liquid.LocalFileSystem;
