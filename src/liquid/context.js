var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");

module.exports = class Context {
  constructor(
    engine,
    environments = {},
    outerScope = {},
    registers = {},
    rethrowErrors = false) {
    var ref;
    this.environments = Liquid.Helpers.flatten([environments]);
    this.scopes = [outerScope];
    this.registers = registers;
    this.errors = [];
    this.rethrowErrors = rethrowErrors;
    this.strainer = (ref = (typeof engine !== "undefined" && engine !== null ? new engine.Strainer(this) : void 0)) != null ? ref : {};
    this.squashInstanceAssignsWithEnvironments();
  }

  registerFilters(...filters) {
    for (var filter of filters) {
      for (var [k, v] of Object.entries(filter)) {
        if (v instanceof Function) {
          this.strainer[k] = v;
        }
      }
    }

    return;
  }

  handleError(e) {
    this.errors.push(e);

    if (this.rethrowErrors) {
      throw e;
    }

    if (e instanceof Liquid.SyntaxError) {
      return ("Liquid syntax error: " + (e.message));
    } else {
      return ("Liquid error: " + (e.message));
    }
  }

  invoke(methodName, ...args) {
    var available;
    var method = this.strainer[methodName];

    if (method instanceof Function) {
      return method.apply(this.strainer, args);
    } else {
      available = Object.keys(this.strainer);

      throw new Liquid.FilterNotFound(
        ("Unknown filter `" + (methodName) + "`, available: [" + (available.join(", ")) + "]")
      );
    }
  }

  push(newScope = {}) {
    this.scopes.unshift(newScope);

    if (this.scopes.length > 100) {
      throw new Error("Nesting too deep");
    }
  }

  merge(newScope = {}) {
    return (() => {
      for (var [k, v] of Object.entries(newScope)) {
        this.scopes[0][k] = v;
      }
    })();
  }

  pop() {
    if (this.scopes.length <= 1) {
      throw new Error("ContextError");
    }

    return this.scopes.shift();
  }

  lastScope() {
    return this.scopes[this.scopes.length - 1];
  }

  stack(newScope = {}, f) {
    var popLater = false;

    return (() => {
      var newScope;

      try {
        if (arguments.length < 2) {
          f = newScope;
          newScope = {};
        }

        this.push(newScope);
        var result = f();

        if (((result != null ? result.nodeify : void 0)) != null) {
          popLater = true;

          result.nodeify(() => {
            return this.pop();
          });
        }

        result;
      } finally {
        if (!popLater) {
          this.pop();
        }
      }
    })();
  }

  clearInstanceAssigns() {
    return this.scopes[0] = {};
  }

  set(key, value) {
    return this.scopes[0][key] = value;
  }

  get(key) {
    return this.resolve(key);
  }

  hasKey(key) {
    return Promise.resolve(this.resolve(key)).then(function(v) {
      return typeof v !== "undefined" && v !== null;
    });
  }

  static Literals = {
    "null": null,
    "nil": null,
    "": null,
    "true": true,
    "false": false
  };

  resolve(key) {
    var hi;
    var lo;
    var match;

    if (Liquid.Context.Literals.hasOwnProperty(key)) {
      return Liquid.Context.Literals[key];
    } else if (match = /^'(.*)'$/.exec(key)) {
      return match[1];
    } else if (match = /^"(.*)"$/.exec(key)) {
      return match[1];
    } else if (match = /^(\d+)$/.exec(key)) {
      return Number(match[1]);
    } else if (match = /^\((\S+)\.\.(\S+)\)$/.exec(key)) {
      lo = this.resolve(match[1]);
      hi = this.resolve(match[2]);

      return Promise.all([lo, hi]).then(function([lo, hi]) {
        lo = Number(lo);
        hi = Number(hi);

        if (isNaN(lo) || isNaN(hi)) {
          return [];
        }

        return new Liquid.Range(lo, hi + 1);
      });
    } else if (match = /^(\d[\d\.]+)$/.exec(key)) {
      return Number(match[1]);
    } else {
      return this.variable(key);
    }
  }

  findVariable(key) {
    var variableScope = undefined;
    var variable = undefined;

    this.scopes.some(function(scope) {
      if (scope.hasOwnProperty(key)) {
        variableScope = scope;
        return true;
      }
    });

    if (variableScope == null) {
      this.environments.some(env => {
        variable = this.lookupAndEvaluate(env, key);

        if (variable != null) {
          return variableScope = env;
        }
      });
    }

    if (variableScope == null) {
      if (this.environments.length > 0) {
        variableScope = this.environments[this.environments.length - 1];
      } else if (this.scopes.length > 0) {
        variableScope = this.scopes[this.scopes.length - 1];
      } else {
        throw new Error("No scopes to find variable in.");
      }
    }

    (variable != null ? variable : variable = this.lookupAndEvaluate(variableScope, key));

    return Promise.resolve(variable).then(v => {
      return this.liquify(v);
    });
  }

  variable(markup) {
    return Promise.resolve().then(() => {
      var match;
      var parts = Liquid.Helpers.scan(markup, Liquid.VariableParser);
      var squareBracketed = /^\[(.*)\]$/;
      var firstPart = parts.shift();

      if (match = squareBracketed.exec(firstPart)) {
        firstPart = match[1];
      }

      var object = this.findVariable(firstPart);

      if (parts.length === 0) {
        return object;
      }

      var mapper = (part, object) => {
        if (object == null) {
          return Promise.resolve(object);
        }

        return Promise.resolve(object).then(this.liquify.bind(this)).then(object => {
          if (object == null) {
            return object;
          }

          var bracketMatch = squareBracketed.exec(part);

          if (bracketMatch) {
            part = this.resolve(bracketMatch[1]);
          }

          return Promise.resolve(part).then(part => {
            var isArrayAccess = (Array.isArray(object) && isFinite(part));
            var isObjectAccess = (object instanceof Object && (((typeof object.hasKey === "function" ? object.hasKey(part) : void 0)) || part in object));
            var isSpecialAccess = (!bracketMatch && object && (Array.isArray(object) || Object.prototype.toString.call(object) === "[object String]") && ["size", "first", "last"].indexOf(part) >= 0);

            if (isArrayAccess || isObjectAccess) {
              return Promise.resolve(this.lookupAndEvaluate(object, part)).then(this.liquify.bind(this));
            } else if (isSpecialAccess) {
              switch (part) {
              case "size":
                return this.liquify(object.length);
              case "first":
                return this.liquify(object[0]);
              case "last":
                return this.liquify(object[object.length - 1]);
              default:
                throw new Error(("Unknown special accessor: " + (part)));
              }
            }
          });
        });
      };

      var iterator = function(object, index) {
        if (index < parts.length) {
          return mapper(parts[index], object).then(function(object) {
            return iterator(object, index + 1);
          });
        } else {
          return Promise.resolve(object);
        }
      };

      return iterator(object, 0).catch(function(err) {
        throw new Error(("Couldn't walk variable: " + (markup) + ": " + (err)));
      });
    });
  }

  lookupAndEvaluate(obj, key) {
    if (obj instanceof Liquid.Drop) {
      return obj.get(key);
    } else {
      return typeof obj !== "undefined" && obj !== null ? obj[key] : void 0;
    }
  }

  squashInstanceAssignsWithEnvironments() {
    var lastScope = this.lastScope();

    return Object.keys(lastScope).forEach(key => {
      return this.environments.some(env => {
        if (env.hasOwnProperty(key)) {
          lastScope[key] = this.lookupAndEvaluate(env, key);
          return true;
        }
      });
    });
  }

  liquify(object) {
    return Promise.resolve(object).then(object => {
      if (object == null) {
        return object;
      } else if (typeof object.toLiquid === "function") {
        object = object.toLiquid();
      } else if (typeof object === "object") {
        true;
      } else if (typeof object === "function") {
        object = "";
      } else {
        Object.prototype.toString.call(object);
      }

      if (object instanceof Liquid.Drop) {
        object.context = this;
      }

      return object;
    });
  }
};
