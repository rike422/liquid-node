var Liquid = requireLiquid();

describe("Drop", function() {
  beforeEach(function() {
    this.Droplet = class Droplet extends Liquid.Drop {
      b() {
        return 2;
      }
    };

    this.Droplet.prototype.a = 1;
    return this.drop = new this.Droplet();
  });

  it("is an instanceof Drop", function() {
    expect(this.drop).to.be.instanceof(this.Droplet);
    return expect(this.drop).to.be.instanceof(Liquid.Drop);
  });

  it("protects regular objects", function() {
    var notDrop = {
      a: 1,

      b: function() {
        return "foo";
      }
    };

    return renderTest("1", "{{ drop.a }}{{ drop.b }}", {
      drop: notDrop
    });
  });

  it("can be rendered", function() {
    return renderTest("12", "{{ drop.a }}{{ drop.b }}", {
      this: this
    });
  });

  it("checks if methods are invokable", function() {
    expect(this.Droplet.isInvokable("a")).to.be.ok;
    expect(this.Droplet.isInvokable("b")).to.be.ok;
    expect(this.Droplet.isInvokable("toLiquid")).to.be.ok;
    expect(this.Droplet.isInvokable("c")).to.be.not.ok;
    expect(this.Droplet.isInvokable("invokeDrop")).to.be.not.ok;
    expect(this.Droplet.isInvokable("beforeMethod")).to.be.not.ok;
    return expect(this.Droplet.isInvokable("hasKey")).to.be.not.ok;
  });

  it("renders", function() {
    return renderTest("[Liquid.Drop Droplet]", "{{ drop }}", {
      this: this
    });
  });

  return it("allows method-hooks", function() {
    this.drop.beforeMethod = function(m) {
      return (m === "c" ? 1 : 2);
    };

    return renderTest("12", "{{ drop.c }}{{ drop.d }}", {
      this: this
    });
  });
});