var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");

Liquid.BlankFileSystem = class BlankFileSystem {
  constructor() {}

  readTemplateFile(templatePath) {
    return Promise.reject(new Liquid.FileSystemError("This file system doesn't allow includes"));
  }
};

module.exports = Liquid.BlankFileSystem;
