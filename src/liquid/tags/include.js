var Liquid = require("../../liquid");
var Syntax = /([a-z0-9\/\\_-]+)/i;
var SyntaxHelp = "Syntax Error in 'include' - Valid syntax: include [templateName]";

module.exports = class Include extends Liquid.Tag {
  constructor(template, tagName, markup, tokens) {
    super(...arguments);
    var match = Syntax.exec(markup);

    if (!match) {
      throw new Liquid.SyntaxError(SyntaxHelp);
    }

    this.filepath = match[1];

    this.subTemplate = template.engine.fileSystem.readTemplateFile(this.filepath).then(function(src) {
      return template.engine.parse(src);
    });
  }

  render(context) {
    return this.subTemplate.then(function(i) {
      return i.render(context);
    });
  }
};