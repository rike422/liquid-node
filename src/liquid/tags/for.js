var Liquid = require("../../liquid");
var Promise = require("native-or-bluebird");
var PromiseReduce = require("../../promise_reduce");
var Iterable = require("../iterable");
var SyntaxHelp = "Syntax Error in 'for loop' - Valid syntax: for [item] in [collection]";

var Syntax = RegExp(
  ("(\\w+)\\s+in\\s+((?:" + (Liquid.QuotedFragment.source) + ")+)\\s*(reversed)?")
);

module.exports = class For extends Liquid.Block {
  constructor(template, tagName, markup) {
    var match = Syntax.exec(markup);

    if (match) {
      this.variableName = match[1];
      this.collectionName = match[2];
      this.registerName = ((match[1]) + "=" + (match[2]));
      this.reversed = match[3];
      this.attributes = {};

      Liquid.Helpers.scan(markup, Liquid.TagAttributes).forEach(attr => {
        return this.attributes[attr[0]] = attr[1];
      });
    } else {
      throw new Liquid.SyntaxError(SyntaxHelp);
    }

    this.nodelist = this.forBlock = [];
    super(...arguments);
  }

  unknownTag(tag, markup) {
    if (tag !== "else") {
      return super.unknownTag(...arguments);
    }

    return this.nodelist = this.elseBlock = [];
  }

  render(context) {
    context.registers.for || (context.registers.for = {});

    return Promise.resolve(context.get(this.collectionName)).then(collection => {
      if (collection != null ? collection.forEach : void 0)
        {} else if (collection instanceof Object) {
        collection = (Object.entries(collection).map(([k, v]) => {
          return [k, v];
        }));
      } else {
        return this.renderElse(context);
      }

      var from = (() => {
        if (this.attributes.offset === "continue") {
          return Number(context.registers["for"][this.registerName]) || 0;
        } else {
          return Number(this.attributes.offset) || 0;
        }
      })();

      var limit = this.attributes.limit;

      var to = (() => {
        if (limit) {
          return Number(limit) + from;
        } else {
          return null;
        }
      })();

      return this.sliceCollection(collection, from, to).then(segment => {
        if (segment.length === 0) {
          return this.renderElse(context);
        }

        if (this.reversed) {
          segment.reverse();
        }

        var length = segment.length;
        context.registers["for"][this.registerName] = from + segment.length;

        return context.stack(() => {
          return PromiseReduce(segment, (output, item, index) => {
            context.set(this.variableName, item);

            context.set("forloop", {
              name: this.registerName,
              length: length,
              index: index + 1,
              index0: index,
              rindex: length - index,
              rindex0: length - index - 1,
              first: index === 0,
              last: index === length - 1
            });

            return Promise.resolve().then(() => {
              return this.renderAll(this.forBlock, context);
            }).then(function(rendered) {
              output.push(rendered);
              return output;
            }).catch(function(e) {
              output.push(context.handleError(e));
              return output;
            });
          }, []);
        });
      });
    });
  }

  sliceCollection(collection, from, to) {
    var args = [from];

    if (typeof to !== "undefined" && to !== null) {
      args.push(to);
    }

    return Iterable.cast(collection).slice(...args);
  }

  renderElse(context) {
    if (this.elseBlock) {
      return this.renderAll(this.elseBlock, context);
    } else {
      return "";
    }
  }
};