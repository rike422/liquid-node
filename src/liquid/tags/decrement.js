var Liquid = require("../../liquid");

module.exports = class Decrement extends Liquid.Tag {
  constructor(template, tagName, markup) {
    super(...arguments);
    this.variable = markup.trim();
  }

  render(context) {
    var value = context.environments[0][this.variable] || (context.environments[0][this.variable] = 0);
    value = value - 1;
    context.environments[0][this.variable] = value;
    return value.toString();
  }
};