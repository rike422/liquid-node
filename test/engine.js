var Liquid = requireLiquid();

describe("Engine", function() {
  beforeEach(function() {
    return this.filters = Liquid.StandardFilters;
  });

  it("should create strainers", function() {
    var engine = new Liquid.Engine();
    var strainer = new engine.Strainer();
    return expect(strainer.size).to.exist;
  });

  return it("should create separate strainers", function() {
    var engine1 = new Liquid.Engine();

    engine1.registerFilters({
      foo1: function() {
        return "foo1";
      }
    });

    var strainer1 = new engine1.Strainer();
    expect(strainer1.size).to.exist;
    expect(strainer1.foo1).to.exist;
    var engine2 = new Liquid.Engine();

    engine2.registerFilters({
      foo2: function() {
        return "foo2";
      }
    });

    var strainer2 = new engine2.Strainer();
    expect(strainer2.size).to.exist;
    expect(strainer2.foo2).to.exist;
    expect(strainer1.foo2).not.to.exist;
    return expect(strainer2.foo1).not.to.exist;
  });
});