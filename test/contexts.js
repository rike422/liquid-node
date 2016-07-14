var Liquid = requireLiquid();

describe("Context", function() {
  beforeEach(function() {
    return this.ctx = new Liquid.Context();
  });

  context(".handleError", function() {
    it("throws errors if enabled", function() {
      this.ctx.rethrowErrors = true;

      return expect(() => {
        return this.ctx.handleError(new Error("hello"));
      }).to.throw(/hello/);
    });

    it("prints errors", function() {
      return expect(this.ctx.handleError(new Error("hello"))).to.match(/Liquid error/);
    });

    return it("prints syntax errors", function() {
      return expect(this.ctx.handleError(new Liquid.SyntaxError("hello"))).to.match(/Liquid syntax error/);
    });
  });

  context(".push", function() {
    it("pushes scopes", function() {
      var scope = {};
      this.ctx.push(scope);
      return expect(this.ctx.pop()).to.equal(scope);
    });

    it("pushes an empty scope by default", function() {
      this.ctx.push();
      return expect(this.ctx.pop()).to.deep.equal({});
    });

    return it("limits levels", function() {
      return expect(() => {
        return (() => {
          for (var i of (function() {
              var results = [];

              for (i = 0; i <= 150; i++) {
                  results.push(i);
              }

              return results;
          }).apply(this)) {
            this.ctx.push();
          }
        })();
      }).to.throw(/Nesting too deep/);
    });
  });

  context(".pop", function() {
    return it("throws an exception if no scopes are left to pop", function() {
      return expect(() => {
        return this.ctx.pop();
      }).to.throw(/ContextError/);
    });
  });

  context(".stack", function() {
    return it("automatically pops scopes", function() {
      var mySpy = sinon.spy();
      this.ctx.stack(null, mySpy);
      expect(mySpy).to.have.been.calledOnce;
      return expect(this.ctx.scopes.length).to.equal(1);
    });
  });

  context(".merge", function() {
    it("merges scopes", function() {
      this.ctx.push({
        x: 1,
        y: 2
      });

      this.ctx.merge({
        y: 3,
        z: 4
      });

      return expect(this.ctx.pop()).to.deep.equal({
        x: 1,
        y: 3,
        z: 4
      });
    });

    return it("merges null-scopes", function() {
      this.ctx.push({
        x: 1
      });

      this.ctx.merge();

      return expect(this.ctx.pop()).to.deep.equal({
        x: 1
      });
    });
  });

  context(".resolve", function() {
    it("resolves strings", function() {
      expect(this.ctx.resolve("'42'")).to.equal("42");
      return expect(this.ctx.resolve("\"42\"")).to.equal("42");
    });

    it("resolves numbers", function() {
      expect(this.ctx.resolve("42")).to.equal(42);
      return expect(this.ctx.resolve("3.14")).to.equal(3.14);
    });

    return it("resolves illegal ranges", function() {
      return expect(this.ctx.resolve("(0..a)")).to.become([]);
    });
  });

  context(".clearInstanceAssigns", function() {
    return it("clears current scope", function() {
      var scope = {
        x: 1
      };

      this.ctx.push(scope);
      this.ctx.clearInstanceAssigns();
      return expect(this.ctx.pop()).to.deep.equal({});
    });
  });

  context(".hasKey", function() {
    return it("checks for variable", function() {
      this.ctx.push({
        a: 0
      });

      this.ctx.push({
        b: 1
      });

      this.ctx.push({
        c: true
      });

      expect(this.ctx.hasKey("a")).to.become.ok;
      expect(this.ctx.hasKey("b")).to.become.ok;
      expect(this.ctx.hasKey("c")).to.become.ok;
      return expect(this.ctx.hasKey("z")).not.to.become.ok;
    });
  });

  return context(".variable", function() {
    return it("supports special access", function() {
      this.ctx.push({
        a: [1, 99]
      });

      expect(this.ctx.variable("a.first")).to.become(1);
      expect(this.ctx.variable("a.size")).to.become(2);
      return expect(this.ctx.variable("a.last")).to.become(99);
    });
  });
});