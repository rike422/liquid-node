var Liquid = require("../liquid");
var Promise = require("native-or-bluebird");

var LITERALS = {
  empty: function (v) {
    return !(((typeof v !== "undefined" && v !== null ? v.length : void 0)) > 0);
  },

  blank: function (v) {
    return !v || v.toString().length === 0;
  }
};

module.exports = class Condition {
  static operators = {
    "==": function (cond, left, right) {
      return cond.equalVariables(left, right);
    },

    "is": function (cond, left, right) {
      return cond.equalVariables(left, right);
    },

    "!=": function (cond, left, right) {
      return !cond.equalVariables(left, right);
    },

    "<>": function (cond, left, right) {
      return !cond.equalVariables(left, right);
    },

    "isnt": function (cond, left, right) {
      return !cond.equalVariables(left, right);
    },

    "<": function (cond, left, right) {
      return left < right;
    },

    ">": function (cond, left, right) {
      return left > right;
    },

    "<=": function (cond, left, right) {
      return left <= right;
    },

    ">=": function (cond, left, right) {
      return left >= right;
    },

    "contains": function (cond, left, right) {
      return ((typeof left !== "undefined" && left !== null ? typeof left.indexOf === "function" ? left.indexOf(right) : void 0 :
          void 0)) >= 0;
    }
  };

  constructor(left, operator, right) {
    this.left = left;
    this.operator = operator;
    this.right = right;
    this.childRelation = null;
    this.childCondition = null;
  }

  evaluate(context) {
    (context != null ? context : context = new Liquid.Context());
    var result = this.interpretCondition(this.left, this.right, this.operator, context);

    switch (this.childRelation) {
      case "or":
        return Promise.resolve(result).then(result => {
          return result || this.childCondition.evaluate(context);
        });
      case "and":
        return Promise.resolve(result).then(result => {
          return result && this.childCondition.evaluate(context);
        });
      default:
        return result;
    }
  }

  or(childCondition) {
    this.childCondition = childCondition;
    return this.childRelation = "or";
  }

  and(childCondition) {
    this.childCondition = childCondition;
    return this.childRelation = "and";
  }

  attach(attachment) {
    return this.attachment = attachment;
  }

  equalVariables(left, right) {
    if (typeof left === "function") {
      return left(right);
    } else if (typeof right === "function") {
      return right(left);
    } else {
      return left === right;
    }
  }

  resolveVariable(v, context) {
    if (v in LITERALS) {
      return Promise.resolve(LITERALS[v]);
    } else {
      return context.get(v);
    }
  }

  interpretCondition(left, right, op, context) {
    if (typeof op === "undefined" || op === null) {
      return this.resolveVariable(left, context);
    }

    var operation = Condition.operators[op];

    if (operation == null) {
      throw new Error(("Unknown operator " + (op)));
    }

    left = this.resolveVariable(left, context);
    right = this.resolveVariable(right, context);

    return Promise.all([left, right]).then(([left, right]) => {
      return operation(this, left, right);
    });
  }
};