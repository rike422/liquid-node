var Liquid = requireLiquid();

describe("Iterable", function() {
  describe(".cast", function() {
    it("doesn't cast iterables", function() {
      var iterable = new Liquid.Iterable();
      return expect(Liquid.Iterable.cast(iterable)).to.equal(iterable);
    });

    return it("casts null/undefined to an empty iterable", function() {
      return expect(Liquid.Iterable.cast(null).toArray()).to.become([]);
    });
  });

  describe(".slice", function() {
    return it("is abstract", function() {
      return expect(function() {
        return new Liquid.Iterable().slice();
      }).to.throw(/not implemented/);
    });
  });

  return describe(".last", function() {
    return it("is abstract", function() {
      return expect(function() {
        return new Liquid.Iterable().last();
      }).to.throw(/not implemented/);
    });
  });
});