var Liquid = require("../../liquid");

module.exports = class Increment extends Liquid.Tag {
  constructor(template, tagName, markup) {
    this.variable = markup.trim();
    super(...arguments);
  }

  render(context) {
    var value = (context.environments[0][this.variable] != null ? context.environments[0][this.variable] : context.environments[0][this.variable] = 0);
    context.environments[0][this.variable] = value + 1;
    return String(value);
  }
};