var Liquid = require("../../liquid");
var Syntax = /(\w+)/;
var SyntaxHelp = "Syntax Error in 'capture' - Valid syntax: capture [var]";

class Capture extends Liquid.Block {
  constructor(template, tagName, markup) {
    var match = Syntax.exec(markup);

    if (match) {
      this.to = match[1];
    } else {
      throw new Liquid.SyntaxError(SyntaxHelp);
    }

    super(...arguments);
  }

  render(context) {
    return super.render(...arguments).then(chunks => {
      var output = Liquid.Helpers.toFlatString(chunks);
      context.lastScope()[this.to] = output;
      return "";
    });
  }
}

module.exports = Capture;