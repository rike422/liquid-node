var Range = require("./range");
var Promise = require("native-or-bluebird");

var isString = function(input) {
  return Object.prototype.toString.call(input) === "[object String]";
};

module.exports = class Iterable {
  first() {
    return this.slice(0, 1).then(function(a) {
      return a[0];
    });
  }

  map() {
    var args = arguments;

    return this.toArray().then(function(a) {
      return Promise.all(a.map(...args));
    });
  }

  sort() {
    var args = arguments;

    return this.toArray().then(function(a) {
      return a.sort(...args);
    });
  }

  toArray() {
    return this.slice(0);
  }

  slice() {
    throw new Error(((this.constructor.name) + ".slice() not implemented"));
  }

  last() {
    throw new Error(((this.constructor.name) + ".last() not implemented"));
  }

  static cast(v) {
    if (v instanceof Iterable) {
      return v;
    } else if (v instanceof Range) {
      return new IterableForArray(v.toArray());
    } else if (Array.isArray(v) || isString(v)) {
      return new IterableForArray(v);
    } else if (typeof v !== "undefined" && v !== null) {
      return new IterableForArray([v]);
    } else {
      return new IterableForArray([]);
    }
  }
};

class IterableForArray extends Iterable {
  constructor(array) {
    super(...arguments);
    this.array = array;
  }

  slice() {
    return Promise.resolve(this.array.slice(...arguments));
  }

  last() {
    return Promise.resolve(this.array[this.array.length - 1]);
  }
}
