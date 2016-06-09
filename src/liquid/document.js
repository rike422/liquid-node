var Liquid = require("../liquid");

Liquid.Document = class Document extends Liquid.Block {
  constructor(template) {
    super(...arguments);
    this.template = template;
  }

  blockDelimiter() {
    return [];
  }

  assertMissingDelimitation() {
  }
}

module.exports = Liquid.Document;
