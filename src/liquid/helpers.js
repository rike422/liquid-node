module.exports = {
  flatten: function(array) {
    var output = [];

    var _flatten = function(array) {
      return array.forEach(function(item) {
        if (Array.isArray(item)) {
          return _flatten(item);
        } else {
          return output.push(item);
        }
      });
    };

    _flatten(array);
    return output;
  },

  toFlatString: function(array) {
    return this.flatten(array).join("");
  },

  scan: function(string, regexp, globalMatch = false) {
    var result = [];

    var _scan = function(s) {
      var l;
      var match = regexp.exec(s);

      if (match) {
        if (match.length === 1) {
          result.push(match[0]);
        } else {
          result.push(match.slice(1));
        }

        l = match[0].length;

        if (globalMatch) {
          l = 1;
        }

        if (match.index + l < s.length) {
          return _scan(s.substring(match.index + l));
        }
      }
    };

    _scan(string);
    return result;
  }
};
