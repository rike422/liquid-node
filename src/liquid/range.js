export default class Range {
  constructor(start, end, step = 0) {
    this.start = start;
    this.end = end;
    this.step = step;

    if (this.step === 0) {
      if (this.end < this.start) {
        this.step = -1;
      } else {
        this.step = 1;
      }
    }

    Object.seal(this);
  }

  some(f) {
    var current = this.start;
    var end = this.end;
    var step = this.step;

    if (step > 0) {
      while (current < end) {
        if (f(current)) {
          return true;
        }

        current += step;
      }
    } else {
      while (current > end) {
        if (f(current)) {
          return true;
        }

        current += step;
      }
    }

    return false;
  }

  forEach(f) {
    return this.some(function(e) {
      f(e);
      return false;
    });
  }

  toArray() {
    var array = [];

    this.forEach(function(e) {
      return array.push(e);
    });

    return array;
  }
};

Object.defineProperty(Range.prototype, "length", {
  get: function() {
    return Math.floor((this.end - this.start) / this.step);
  }
});