var Liquid = require("../../liquid");
var Promise = require("native-or-bluebird");

module.exports = class Raw extends Liquid.Block {
  parse(tokens) {
    return Promise.resolve().then(() => {
      if (tokens.length === 0 || this.ended) {
        return Promise.resolve();
      }

      var token = tokens.shift();
      var match = Liquid.Block.FullToken.exec(token.value);

      if (((match != null ? match[1] : void 0)) === this.blockDelimiter()) {
        return this.endTag();
      }

      this.nodelist.push(token.value);
      return this.parse(tokens);
    });
  }
};