var strftime = require("strftime");
var Promise = require("native-or-bluebird");
var Iterable = require("./iterable");

var {
  flatten
} = require("./helpers");

var toNumber = function(input) {
  return Number(input);
};

var toObjectString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var isString = function(input) {
  return toObjectString.call(input) === "[object String]";
};

var isArray = function(input) {
  return Array.isArray(input);
};

var isArguments = function(input) {
  return toObjectString(input) === "[object Arguments]";
};

var isNumber = function(input) {
  return !isArray(input) && (input - parseFloat(input)) >= 0;
};

var toString = function(input) {
  if (typeof input === "undefined" || input === null) {
    return "";
  } else if (isString(input)) {
    return input;
  } else if (typeof input.toString === "function") {
    return toString(input.toString());
  } else {
    return toObjectString.call(input);
  }
};

var toIterable = function(input) {
  return Iterable.cast(input);
};

var toDate = function(input) {
  if (typeof input === "undefined" || input === null) {
    return;
  }

  if (input instanceof Date) {
    return input;
  }

  if (input === "now") {
    return new Date();
  }

  if (isNumber(input)) {
    input = parseInt(input);
  } else {
    input = toString(input);

    if (input.length === 0) {
      return;
    }

    input = Date.parse(input);
  }

  if (input != null) {
    return new Date(input);
  }
};

var has = function(input, key) {
  return typeof input !== "undefined" && input !== null && hasOwnProperty.call(input, key);
};

var isEmpty = function(input) {
  if (typeof input === "undefined" || input === null) {
    return true;
  }

  if (isArray(input) || isString(input) || isArguments(input)) {
    return input.length === 0;
  }

  for (var key of Object.keys(input)) {
    (() => {
      if (has(key, input)) {
        return false;
      }
    })();
  }

  return true;
};

var isBlank = function(input) {
  return !(isNumber(input) || input === true) && isEmpty(input);
};

var HTML_ESCAPE = function(chr) {
  switch (chr) {
  case "&":
    return "&amp;";
  case ">":
    return "&gt;";
  case "<":
    return "&lt;";
  case "\"":
    return "&quot;";
  case "'":
    return "&#39;";
  }
};

var HTML_ESCAPE_ONCE_REGEXP = /["><']|&(?!([a-zA-Z]+|(#\d+));)/g;
var HTML_ESCAPE_REGEXP = /([&><"'])/g;

module.exports = {
  size: function(input) {
    var ref;
    return (ref = (typeof input !== "undefined" && input !== null ? input.length : void 0)) != null ? ref : 0;
  },

  downcase: function(input) {
    return toString(input).toLowerCase();
  },

  upcase: function(input) {
    return toString(input).toUpperCase();
  },

  append: function(input, suffix) {
    return toString(input) + toString(suffix);
  },

  prepend: function(input, prefix) {
    return toString(prefix) + toString(input);
  },

  empty: function(input) {
    return isEmpty(input);
  },

  capitalize: function(input) {
    return toString(input).replace(/^([a-z])/, function(m, chr) {
      return chr.toUpperCase();
    });
  },

  sort: function(input, property) {
    if (typeof property === "undefined" || property === null) {
      return toIterable(input).sort();
    }

    return toIterable(input).map(function(item) {
      return Promise.resolve(typeof item !== "undefined" && item !== null ? item[property] : void 0).then(function(key) {
        return {
          key: key,
          item: item
        };
      });
    }).then(function(array) {
      return array.sort(function(a, b) {
        var ref1;
        var ref;

        return (ref = a.key > b.key) != null ? ref : {
          1: ((ref1 = a.key === b.key) != null ? ref1 : {
            0: -1
          })
        };
      }).map(function(a) {
        return a.item;
      });
    });
  },

  map: function(input, property) {
    if (typeof property === "undefined" || property === null) {
      return input;
    }

    return toIterable(input).map(function(e) {
      return typeof e !== "undefined" && e !== null ? e[property] : void 0;
    });
  },

  escape: function(input) {
    return toString(input).replace(HTML_ESCAPE_REGEXP, HTML_ESCAPE);
  },

  escape_once: function(input) {
    return toString(input).replace(HTML_ESCAPE_ONCE_REGEXP, HTML_ESCAPE);
  },

  strip_html: function(input) {
    return toString(input).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]*?>/g, "");
  },

  strip_newlines: function(input) {
    return toString(input).replace(/\r?\n/g, "");
  },

  newline_to_br: function(input) {
    return toString(input).replace(/\n/g, "<br />\n");
  },

  replace: function(input, string, replacement = "") {
    return toString(input).replace(new RegExp(string, "g"), replacement);
  },

  replace_first: function(input, string, replacement = "") {
    return toString(input).replace(string, replacement);
  },

  remove: function(input, string) {
    return this.replace(input, string);
  },

  remove_first: function(input, string) {
    return this.replace_first(input, string);
  },

  truncate: function(input, length = 50, truncateString = "...") {
    input = toString(input);
    var truncateString = toString(truncateString);
    var length = toNumber(length);
    var l = length - truncateString.length;

    if (l < 0) {
      l = 0;
    }

    if (input.length > length) {
      return input.slice(0, l) + truncateString;
    } else {
      return input;
    }
  },

  truncatewords: function(input, words = 15, truncateString = "...") {
    input = toString(input);
    var wordlist = input.split(" ");
    var words = Math.max(1, toNumber(words));

    if (wordlist.length > words) {
      return wordlist.slice(0, words).join(" ") + truncateString;
    } else {
      return input;
    }
  },

  split: function(input, pattern) {
    input = toString(input);

    if (!input) {
      return;
    }

    return input.split(pattern);
  },

  flatten: function(input) {
    return toIterable(input).toArray().then(function(a) {
      return flatten(a);
    });
  },

  join: function(input, glue = " ") {
    return this.flatten(input).then(function(a) {
      return a.join(glue);
    });
  },

  first: function(input) {
    return toIterable(input).first();
  },

  last: function(input) {
    return toIterable(input).last();
  },

  plus: function(input, operand) {
    return toNumber(input) + toNumber(operand);
  },

  minus: function(input, operand) {
    return toNumber(input) - toNumber(operand);
  },

  times: function(input, operand) {
    return toNumber(input) * toNumber(operand);
  },

  dividedBy: function(input, operand) {
    return toNumber(input) / toNumber(operand);
  },

  divided_by: function(input, operand) {
    return this.dividedBy(input, operand);
  },

  round: function(input, operand) {
    return toNumber(input).toFixed(operand);
  },

  modulo: function(input, operand) {
    return toNumber(input) % toNumber(operand);
  },

  date: function(input, format) {
    input = toDate(input);

    if (input == null) {
      return "";
    } else if (toString(format).length === 0) {
      return input.toUTCString();
    } else {
      return strftime(format, input);
    }
  },

  default: function(input, defaultValue) {
    var ref;

    if (arguments.length < 2) {
      defaultValue = "";
    }

    var blank = (ref = (typeof input !== "undefined" && input !== null ? (typeof input.isBlank === "function" ? input.isBlank() : void 0) : void 0)) != null ? ref : isBlank(input);
    return (blank ? defaultValue : input);
  }
};
