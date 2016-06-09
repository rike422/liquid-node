var Liquid = require("../../liquid");

module.exports = class Unless extends Liquid.If {
  parse() {
    return super.parse(...arguments).then(() => {
      return this.blocks[0].negate = true;
    });
  }
};