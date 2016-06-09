var Promise = require("native-or-bluebird");

module.exports = class Tag {
  constructor(template, tagName, markup) {
    this.template = template;
    this.tagName = tagName;
    this.markup = markup;
  }

  parseWithCallbacks(...args) {
    var parse;

    if (this.afterParse) {
      parse = () => {
        return this.parse(...args).then(() => {
          return this.afterParse(...args);
        });
      };
    } else {
      parse = () => {
        return this.parse(...args);
      };
    }

    if (this.beforeParse) {
      return Promise.resolve(this.beforeParse(...args)).then(parse);
    } else {
      return parse();
    }
  }

  parse() {}

  name() {
    return this.constructor.name.toLowerCase();
  }

  render() {
    return "";
  }
};
