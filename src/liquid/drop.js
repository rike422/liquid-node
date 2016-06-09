module.exports = class Drop {
  hasKey(key) {
    return true;
  }

  invokeDrop(methodOrKey) {
    var value;

    if (this.constructor.isInvokable(methodOrKey)) {
      value = this[methodOrKey];

      if (typeof value === "function") {
        return value.call(this);
      } else {
        return value;
      }
    } else {
      return this.beforeMethod(methodOrKey);
    }
  }

  beforeMethod(method) {}

  static isInvokable(method) {
    (this.invokableMethods != null ? this.invokableMethods : this.invokableMethods = (() => {
      var blacklist = Object.keys(Drop.prototype);
      var whitelist = ["toLiquid"];

      Object.keys(this.prototype).forEach(function(k) {
        if (!(blacklist.indexOf(k) >= 0)) {
          return whitelist.push(k);
        }
      });

      return whitelist;
    })());

    return this.invokableMethods.indexOf(method) >= 0;
  }

  get(methodOrKey) {
    return this.invokeDrop(methodOrKey);
  }

  toLiquid() {
    return this;
  }

  toString() {
    return ("[Liquid.Drop " + (this.constructor.name) + "]");
  }
};
