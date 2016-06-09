var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");

Liquid.Template = class Template {
  constructor() {
    this.registers = {};
    this.assigns = {};
    this.instanceAssigns = {};
    this.tags = {};
    this.errors = [];
    this.rethrowErrors = true;
  }

  parse(engine, source = "") {
    this.engine = engine;

    return Promise.resolve().then(() => {
      var tokens = this._tokenize(source);
      this.tags = this.engine.tags;
      this.root = new Liquid.Document(this);

      return this.root.parseWithCallbacks(tokens).then(() => {
        return this;
      });
    });
  }

  render(...args) {
    return Promise.resolve().then(() => {
      return this._render(...args);
    });
  }

  _render(assigns, options) {
    if (this.root == null) {
      throw new Error("No document root. Did you parse the document yet?");
    }

    var context = (() => {
      if (assigns instanceof Liquid.Context) {
        return assigns;
      } else if (assigns instanceof Object) {
        assigns = [assigns, this.assigns];

        return new Liquid.Context(
          this.engine,
          assigns,
          this.instanceAssigns,
          this.registers,
          this.rethrowErrors
        );
      } else if (!(typeof assigns !== "undefined" && assigns !== null)) {
        return new Liquid.Context(
          this.engine,
          this.assigns,
          this.instanceAssigns,
          this.registers,
          this.rethrowErrors
        );
      } else {
        throw new Error(
          ("Expected Object or Liquid::Context as parameter, but was " + (typeof assigns) + ".")
        );
      }
    })();

    if (typeof options !== "undefined" && options !== null ? options.registers : void 0) {
      for (var [k, v] of Object.entries(options.registers)) {
        this.registers[k] = v;
      }
    }

    if (typeof options !== "undefined" && options !== null ? options.filters : void 0) {
      context.registerFilters(...options.filters);
    }

    var copyErrors = actualResult => {
      this.errors = context.errors;
      return actualResult;
    };

    return this.root.render(context).then(function(chunks) {
      return Liquid.Helpers.toFlatString(chunks);
    }).then(function(result) {
      this.errors = context.errors;
      return result;
    }, function(error) {
      this.errors = context.errors;
      throw error;
    });
  }

  _tokenize(source) {
    source = String(source);

    if (source.length === 0) {
      return [];
    }

    var tokens = source.split(Liquid.TemplateParser);
    var line = 1;
    var col = 1;

    return tokens.filter(function(token) {
      return token.length > 0;
    }).map(function(value) {
      var linebreaks;

      var result = {
        value: value,
        col: col,
        line: line
      };

      var lastIndex = value.lastIndexOf("\n");

      if (lastIndex < 0) {
        col += value.length;
      } else {
        linebreaks = value.split("\n").length - 1;
        line += linebreaks;
        col = value.length - lastIndex;
      }

      return result;
    });
  }
};

module.exports = Liquid.Template;
