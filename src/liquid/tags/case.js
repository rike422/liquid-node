var Liquid = require("../../liquid");
var Promise = require("native-or-bluebird");
var PromiseReduce = require("../../promise_reduce");
var SyntaxHelp = "Syntax Error in tag 'case' - Valid syntax: case [expression]";
var Syntax = RegExp(("(" + (Liquid.QuotedFragment.source) + ")"));

var WhenSyntax = RegExp(
  ("(" + (Liquid.QuotedFragment.source) + ")(?:(?:\\s+or\\s+|\\s*\\,\\s*)(" + (Liquid.QuotedFragment.source) + "))?")
);

module.exports = class Case extends Liquid.Block {
  constructor(template, tagName, markup) {
    this.blocks = [];
    var match = Syntax.exec(markup);

    if (!match) {
      throw new Liquid.SyntaxError(SyntaxHelp);
    }

    this.markup = markup;
    super(...arguments);
  }

  unknownTag(tag, markup) {
    if (["when", "else"].includes(tag)) {
      return this.pushBlock(tag, markup);
    } else {
      return super.unknownTag(...arguments);
    }
  }

  render(context) {
    return context.stack(() => {
      return PromiseReduce(this.blocks, function(chosenBlock, block) {
        if (typeof chosenBlock !== "undefined" && chosenBlock !== null) {
          return chosenBlock;
        }

        return Promise.resolve().then(function() {
          return block.evaluate(context);
        }).then(function(ok) {
          if (ok) {
            return block;
          }
        });
      }, null).then(block => {
        if (typeof block !== "undefined" && block !== null) {
          return this.renderAll(block.attachment, context);
        } else {
          return "";
        }
      });
    });
  }

  pushBlock(tag, markup) {
    var nodelist;
    var expressions;
    var block;

    if (tag === "else") {
      block = new Liquid.ElseCondition();
      this.blocks.push(block);
      return this.nodelist = block.attach([]);
    } else {
      expressions = Liquid.Helpers.scan(markup, WhenSyntax);
      nodelist = [];

      return (() => {
        for (var value of expressions[0]) {
          if (value) {
            block = new Liquid.Condition(this.markup, "==", value);
            this.blocks.push(block);
            this.nodelist = block.attach(nodelist);
          }
        }
      })();
    }
  }
};