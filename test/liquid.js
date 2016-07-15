var Liquid = requireLiquid();

describe("Liquid", function() {
  beforeEach(function() {
    return this.engine = new Liquid.Engine();
  });

  context("parseAndRender", function() {
    return it("is supported", function() {
      return expect(this.engine.parseAndRender("{{ foo }}", {
        foo: 123
      })).to.be.fulfilled.then(function(output) {
        return expect(output).to.be.eq("123");
      });
    });
  });

  context("parser", function() {
    it("parses empty templates", function() {
      return expect(this.engine.parse("")).to.be.fulfilled.then(function(template) {
        return expect(template.root).to.be.instanceOf(Liquid.Document);
      });
    });

    it("parses plain text", function() {
      return expect(this.engine.parse("foo")).to.be.fulfilled.then(function(template) {
        return expect(template.root.nodelist).to.deep.equal(["foo"]);
      });
    });

    it("parses variables", function() {
      return expect(this.engine.parse("{{ foo }}")).to.be.fulfilled.then(function(template) {
        return expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.Variable);
      });
    });

    it("parses blocks", function() {
      return expect(this.engine.parse("{% for i in c %}{% endfor %}")).to.be.fulfilled.then(function(template) {
        return expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.Block);
      });
    });

    it("parses includes", function() {
      this.engine.registerFileSystem(new Liquid.LocalFileSystem("./"));

      return expect(this.engine.parse("{% include 'test/fixtures/include' %}")).to.be.fulfilled.then(function(template) {
        return expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.Include);
      });
    });

    it(
      "parses includes and renders the template with the correct context",
      function() {
        this.engine.registerFileSystem(new Liquid.LocalFileSystem("./test"));

        return expect(this.engine.parseAndRender("{% include 'fixtures/include' %}", {
          name: "Josh"
        })).to.be.fulfilled.then(function(output) {
          return expect(output).to.eq("Josh");
        });
      }
    );

    it(
      "parses nested-includes and renders the template with the correct context",
      function() {
        this.engine.registerFileSystem(new Liquid.LocalFileSystem("./test"));

        return expect(this.engine.parseAndRender("{% include 'fixtures/subinclude' %}", {
          name: "Josh"
        })).to.be.fulfilled.then(function(output) {
          return expect(output).to.eq("<h1>Josh</h1>");
        });
      }
    );

    it("parses complex documents", function() {
      return expect(this.engine.parse("{% for i in c %}foo{% endfor %}{{ var }}")).to.be.fulfilled.then(function(template) {
        expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.Block);
        expect(template.root.nodelist[0].nodelist).to.deep.equal(["foo"]);
        expect(template.root.nodelist[1]).to.be.instanceOf(Liquid.Variable);
        return expect(template.root.nodelist[1].name).to.be.eq("var");
      });
    });

    it("parses for-blocks", function() {
      return expect(this.engine.parse("{% for i in c %}{% endfor %}")).to.be.fulfilled.then(function(template) {
        return expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.For);
      });
    });

    return it("parses capture-blocks", function() {
      return expect(this.engine.parse("{% capture foo %}foo{% endcapture %}")).to.be.fulfilled.then(function(template) {
        expect(template.root.nodelist[0]).to.be.instanceOf(Liquid.Capture);
        return expect(template.root.nodelist[0].nodelist).to.deep.equal(["foo"]);
      });
    });
  });

  context("reports error locations", function() {
    it("at beginning of file", function() {
      return expect(this.engine.parse("{% illegal %}")).to.be.rejectedWith(
        Liquid.SyntaxError,
        "Unknown tag 'illegal'\n    at {% illegal %} (undefined:1:1)"
      );
    });

    it("at the beginning of a line", function() {
      return expect(this.engine.parse(" {% illegal %}")).to.be.rejectedWith(
        Liquid.SyntaxError,
        "Unknown tag 'illegal'\n    at {% illegal %} (undefined:1:2)"
      );
    });

    return it("in the middle of a line", function() {
      return expect(this.engine.parse("{{ okay }}\n\n   {% illegal %}")).to.be.rejectedWith(
        Liquid.SyntaxError,
        "Unknown tag 'illegal'\n    at {% illegal %} (undefined:3:4)"
      );
    });
  });

  return context("template", function() {
    return context(".render()", function() {
      it("fails unless parsed", function() {
        var template = new Liquid.Template();
        return expect(template.render()).to.be.rejectedWith(Error, /No document root/);
      });

      it("fails with illegal context", function() {
        return expect(this.engine.parse("foo")).to.be.fulfilled.then(function(template) {
          return expect(template.render(1)).to.be.rejectedWith(Error, /Expected Object or Liquid::Context as parameter/);
        });
      });

      return it("takes a context and options", function() {
        return expect(this.engine.parse("foo")).to.be.fulfilled.then(function(template) {
          var ctx = new Liquid.Context();

          return expect(template.render(ctx, {
            registers: {
              x: 3
            },

            filters: {}
          })).to.be.fulfilled;
        });
      });
    });
  });
});