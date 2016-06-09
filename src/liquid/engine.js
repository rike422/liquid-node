var Liquid = require("../liquid");

Liquid.Engine = class Engine {
  constructor() {
    this.tags = {};

    this.Strainer = function(context) {
      this.context = context;
    };

    this.registerFilters(Liquid.StandardFilters);
    this.fileSystem = new Liquid.BlankFileSystem();

    var isSubclassOf = function(klass, ofKlass) {
      var ref;

      if (typeof klass !== "function") {
        return false;
      } else if (klass === ofKlass) {
        return true;
      } else {
        return isSubclassOf((ref = klass.__super__) != null ? ref.constructor : void 0, ofKlass);
      }
    };

    for (var [tagName, tag] of Object.entries(Liquid)) {
      if (!isSubclassOf(tag, Liquid.Tag)) {
        continue;
      }

      var isBlockOrTagBaseClass = [Liquid.Tag, Liquid.Block].indexOf(tag.constructor) >= 0;

      if (!isBlockOrTagBaseClass) {
        this.registerTag(tagName.toLowerCase(), tag);
      }
    }
  }

  registerTag(name, tag) {
    return this.tags[name] = tag;
  }

  registerFilters(...filters) {
    return filters.forEach(filter => {
      return (() => {
        for (var [k, v] of Object.entries(filter)) {
          if (v instanceof Function) {
            this.Strainer.prototype[k] = v;
          }
        }
      })();
    });
  }

  parse(source) {
    var template = new Liquid.Template();
    return template.parse(this, source);
  }

  parseAndRender(source, ...args) {
    return this.parse(source).then(function(template) {
      return template.render(...args);
    });
  }

  registerFileSystem(fileSystem) {
    if (!(fileSystem instanceof Liquid.BlankFileSystem)) {
      throw Liquid.ArgumentError("Must be subclass of Liquid.BlankFileSystem");
    }

    return this.fileSystem = fileSystem;
  }
};

module.exports = Liquid.Engine;
