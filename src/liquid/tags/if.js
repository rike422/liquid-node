var Liquid = require("../../liquid");
var Promise = require("native-or-bluebird");
var PromiseReduce = require("../../promise_reduce");
var SyntaxHelp = "Syntax Error in tag 'if' - Valid syntax: if [expression]";

var Syntax = RegExp(
  ("(" + (Liquid.QuotedFragment.source) + ")\\s*([=!<>a-z_]+)?\\s*(" + (Liquid.QuotedFragment.source) + ")?")
);

var ExpressionsAndOperators = RegExp(
  ("(?:\\b(?:\\s?and\\s?|\\s?or\\s?)\\b|(?:\\s*(?!\\b(?:\\s?and\\s?|\\s?or\\s?)\\b)(?:" + (Liquid.QuotedFragment.source) + "|\\S+)\\s*)+)")
);

module.exports = class If extends Liquid.Block {
  constructor(template, tagName, markup) {
    this.blocks = [];
    this.pushBlock("if", markup);
    super(...arguments);
  }

  unknownTag(tag, markup) {
    if (["elsif", "else"].includes(tag)) {
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
          if (block.negate) {
            ok = !ok;
          }

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
    var block = (() => {
      var condition;
      var match;
      var expressions;

      if (tag === "else") {
        return new Liquid.ElseCondition();
      } else {
        expressions = Liquid.Helpers.scan(markup, ExpressionsAndOperators);
        expressions = expressions.reverse();
        match = Syntax.exec(expressions.shift());

        if (!match) {
          throw new Liquid.SyntaxError(SyntaxHelp);
        }

        condition = new Liquid.Condition(...match.slice(1, 4));

        while (expressions.length > 0) {
          var operator = String(expressions.shift()).trim();
          match = Syntax.exec(expressions.shift());

          if (!match) {
            throw new SyntaxError(SyntaxHelp);
          }

          var newCondition = new Liquid.Condition(...match.slice(1, 4));
          newCondition[operator].call(newCondition, condition);
          condition = newCondition;
        }

        return condition;
      }
    })();

    this.blocks.push(block);
    return this.nodelist = block.attach([]);
  }
};