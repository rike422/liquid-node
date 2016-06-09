var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");
var PromiseReduce = require("../promise_reduce");
var VariableNameFragment = RegExp(("\\s*(" + (Liquid.QuotedFragment.source) + ")(.*)"));
var FilterListFragment = RegExp(((Liquid.FilterSeparator.source) + "\\s*(.*)"));

var FilterArgParser = RegExp(
  ("(?:" + (Liquid.FilterArgumentSeparator.source) + "|" + (Liquid.ArgumentSeparator.source) + ")\\s*(" + (Liquid.QuotedFragment.source) + ")")
);

module.exports = class Variable {
  static FilterParser = RegExp(
    ("(?:" + (Liquid.FilterSeparator.source) + "|(?:\\s*(?!(?:" + (Liquid.FilterSeparator.source) + "))(?:" + (Liquid.QuotedFragment.source) + "|\\S+)\\s*)+)")
  );

  constructor(markup) {
    this.markup = markup;
    this.name = null;
    this.filters = [];
    var match = VariableNameFragment.exec(this.markup);

    if (!match) {
      return;
    }

    this.name = match[1];
    match = FilterListFragment.exec(match[2]);

    if (!match) {
      return;
    }

    var filters = Liquid.Helpers.scan(match[1], Liquid.Variable.FilterParser);

    filters.forEach(filter => {
      match = /\s*(\w+)/.exec(filter);

      if (!match) {
        return;
      }

      var filterName = match[1];
      var filterArgs = Liquid.Helpers.scan(filter, FilterArgParser);
      filterArgs = Liquid.Helpers.flatten(filterArgs);
      return this.filters.push([filterName, filterArgs]);
    });
  }

  render(context) {
    var filtered;

    if (this.name == null) {
      return "";
    }

    var reducer = (input, filter) => {
      var filterArgs = filter[1].map(function(a) {
        return context.get(a);
      });

      return Promise.all([input, ...filterArgs]).then(results => {
        input = results.shift();

        return (() => {
          try {
            context.invoke(filter[0], input, ...results);
          } catch (e) {
            if (!(e instanceof Liquid.FilterNotFound)) {
              throw e;
            }

            throw new Liquid.FilterNotFound(
              ("Error - filter '" + (filter[0]) + "' in '" + (this.markup) + "' could not be found.")
            );
          }
        })();
      });
    };

    var value = Promise.resolve(context.get(this.name));

    switch (this.filters.length) {
      case 0:
        filtered = value;
        break;
      case 1:
        filtered = reducer(value, this.filters[0]);
        break;
      default:
        filtered = PromiseReduce(this.filters, reducer, value);
    }

    return filtered.then(function(f) {
      if (!(f instanceof Liquid.Drop)) {
        return f;
      }

      f.context = context;
      return f.toString();
    }).catch(function(e) {
      return context.handleError(e);
    });
  }
};
