var Liquid = require("../../liquid");
var Promise = require("native-or-bluebird");

module.exports = class IfChanged extends Liquid.Block {
  render(context) {
    return context.stack(() => {
      var rendered = this.renderAll(this.nodelist, context);

      return Promise.resolve(rendered).then(function(output) {
        output = Liquid.Helpers.toFlatString(output);

        if (output !== context.registers.ifchanged) {
          return context.registers.ifchanged = output;
        } else {
          return "";
        }
      });
    });
  }
};