var Liquid = require("../liquid");
var util = require("util");
var Promise = require("native-or-bluebird");

var Promise_each = function(promises, cb) {
  var iterator = function(index) {
    if (index >= promises.length) {
      return Promise.resolve();
    }

    var promise = promises[index];

    return Promise.resolve(promise).then(function(value) {
      return Promise.resolve(cb(value)).then(function() {
        return iterator(index + 1);
      });
    });
  };

  return iterator(0);
};

module.exports = class Block extends Liquid.Tag {
  static IsTag = RegExp(("^" + (Liquid.TagStart.source)));
  static IsVariable = RegExp(("^" + (Liquid.VariableStart.source)));

  static FullToken = RegExp(
    ("^" + (Liquid.TagStart.source) + "\\s*(\\w+)\\s*(.*)?" + (Liquid.TagEnd.source) + "$")
  );

  static ContentOfVariable = RegExp(
    ("^" + (Liquid.VariableStart.source) + "(.*)" + (Liquid.VariableEnd.source) + "$")
  );

  beforeParse() {
    (this.nodelist != null ? this.nodelist : this.nodelist = []);
    return this.nodelist.length = 0;
  }

  afterParse() {
    return this.assertMissingDelimitation();
  }

  parse(tokens) {
    if (tokens.length === 0 || this.ended) {
      return Promise.resolve();
    }

    var token = tokens.shift();

    return Promise.resolve().then(() => {
      return this.parseToken(token, tokens);
    }).catch(function(e) {
      e.message = ((e.message) + "\n    at " + (token.value) + " (" + (token.filename) + ":" + (token.line) + ":" + (token.col) + ")");

      (e.location != null ? e.location : e.location = {
        col: token.col,
        line: token.line,
        filename: token.filename
      });

      throw e;
    }).then(() => {
      return this.parse(tokens);
    });
  }

  parseToken(token, tokens) {
    var tag;
    var Tag;
    var match;

    if (Block.IsTag.test(token.value)) {
      match = Block.FullToken.exec(token.value);

      if (!match) {
        throw new Liquid.SyntaxError(
          ("Tag '" + (token.value) + "' was not properly terminated with regexp: " + (Liquid.TagEnd.inspect))
        );
      }

      if (this.blockDelimiter() === match[1]) {
        return this.endTag();
      }

      Tag = this.template.tags[match[1]];

      if (!Tag) {
        return this.unknownTag(match[1], match[2], tokens);
      }

      tag = new Tag(this.template, match[1], match[2]);
      this.nodelist.push(tag);
      return tag.parseWithCallbacks(tokens);
    } else if (Block.IsVariable.test(token.value)) {
      return this.nodelist.push(this.createVariable(token));
    } else if (token.value.length === 0)
      {} else {
      return this.nodelist.push(token.value);
    }
  }

  endTag() {
    return this.ended = true;
  }

  unknownTag(tag, params, tokens) {
    if (tag === "else") {
      throw new Liquid.SyntaxError(((this.blockName()) + " tag does not expect else tag"));
    } else if (tag === "end") {
      throw new Liquid.SyntaxError(
        ("'end' is not a valid delimiter for " + (this.blockName()) + " tags. use " + (this.blockDelimiter()))
      );
    } else {
      throw new Liquid.SyntaxError(("Unknown tag '" + (tag) + "'"));
    }
  }

  blockDelimiter() {
    return ("end" + (this.blockName()));
  }

  blockName() {
    return this.tagName;
  }

  createVariable(token) {
    var ref;
    var match = (ref = Liquid.Block.ContentOfVariable.exec(token.value)) != null ? ref[1] : void 0;

    if (match) {
      return new Liquid.Variable(match);
    }

    throw new Liquid.SyntaxError(
      ("Variable '" + (token.value) + "' was not properly terminated with regexp: " + (Liquid.VariableEnd.inspect))
    );
  }

  render(context) {
    return this.renderAll(this.nodelist, context);
  }

  assertMissingDelimitation() {
    if (!this.ended) {
      throw new Liquid.SyntaxError(((this.blockName()) + " tag was never closed"));
    }
  }

  renderAll(list, context) {
    var accumulator = [];

    return Promise_each(list, function(token) {
      if (typeof ((typeof token !== "undefined" && token !== null ? token.render : void 0)) !== "function") {
        accumulator.push(token);
        return;
      }

      return Promise.resolve().then(function() {
        return token.render(context);
      }).then(function(s) {
        return accumulator.push(s);
      }, function(e) {
        return accumulator.push(context.handleError(e));
      });
    }).then(function() {
      return accumulator;
    });
  }
};
