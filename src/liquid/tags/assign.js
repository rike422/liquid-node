var Liquid = require("../../liquid");
var SyntaxHelp = "Syntax Error in 'assign' - Valid syntax: assign [var] = [source]";
var Syntax = RegExp(("((?:" + (Liquid.VariableSignature.source) + ")+)\\s*=\\s*(.*)\\s*"));

class Assign extends Liquid.Tag {
  constructor(template, tagName, markup) {
    var match;

    if (match = Syntax.exec(markup)) {
      this.to = match[1];
      this.from = new Liquid.Variable(match[2]);
    } else {
      throw new Liquid.SyntaxError(SyntaxHelp);
    }

    super(...arguments);
  }

  render(context) {
    context.lastScope()[this.to] = this.from.render(context);
    return super.render(context);
  }
}

module.exports = Assign;