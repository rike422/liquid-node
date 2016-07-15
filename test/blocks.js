var Liquid = requireLiquid();

describe("Blocks (in general)", function() {
  beforeEach(function() {
    return this.engine = new Liquid.Engine();
  });

  it("don't accept 'else'", function() {
    return expect(this.engine.parse("{% capture %}{% else %}{% endcapture %}")).to.be.rejectedWith(Liquid.SyntaxError, /tag does not expect else tag/);
  });

  it("don't accept plain 'end'", function() {
    return expect(this.engine.parse("{% capture %}{% end %}")).to.be.rejectedWith(Liquid.SyntaxError, /'end' is not a valid delimiter/);
  });

  it("fail if not terminated", function() {
    return expect(this.engine.parse("{% capture %}")).to.be.rejectedWith(Liquid.SyntaxError, /tag was never closed/);
  });

  it("fail on odd tags", function() {
    return expect(this.engine.parse("{% %}")).to.be.rejectedWith(Liquid.SyntaxError, /was not properly terminated/);
  });

  return it("fail on illegal variables", function() {
    return expect(this.engine.parse("{{ 2394 ")).to.be.rejectedWith(Liquid.SyntaxError, /Variable .* was not properly terminated/);
  });
});

describe("Assign", function() {
  it("assigns a variable", function() {
    return renderTest(".foo.", "{% assign foo = values %}.{{ foo[0] }}.", {
      values: ["foo", "bar", "baz"]
    });
  });

  it("assigns a variable", function() {
    return renderTest(".bar.", "{% assign foo = values %}.{{ foo[1] }}.", {
      values: ["foo", "bar", "baz"]
    });
  });

  return it("applies filters", function() {
    return renderTest(".BAR.", "{% assign foo = bar | upcase %}.{{ foo }}.", {
      bar: "bar"
    });
  });
});

describe("For", function() {
  it("loops", function() {
    return renderTest(" 1  2  3 ", "{%for item in array%} {{item}} {%endfor%}", {
      array: [1, 2, 3]
    });
  });

  it("loops", function() {
    return renderTest("123", "{%for item in array%}{{item}}{%endfor%}", {
      array: [1, 2, 3]
    });
  });

  it("loops", function() {
    return renderTest("abcd", "{%for item in array%}{{item}}{%endfor%}", {
      array: ["a", "b", "c", "d"]
    });
  });

  it("loops", function() {
    return renderTest("a b c", "{%for item in array%}{{item}}{%endfor%}", {
      array: ["a", " ", "b", " ", "c"]
    });
  });

  it("loops", function() {
    return renderTest("abc", "{%for item in array%}{{item}}{%endfor%}", {
      array: ["a", "", "b", "", "c"]
    });
  });

  it("loops over ranges", function() {
    return renderTest("1234", "{%for item in (1..4)%}{{item}}{%endfor%}");
  });

  it("loops over hashes/objects", function() {
    return renderTest(
      "A1B2",
      "{%for item in hash %}{{item[0] | upcase}}{{item[1]}}{%endfor%}",
      {
        hash: {
          a: 1,
          b: 2
        }
      }
    );
  });

  describe("else", function() {
    it("renders for undefined collections ", function() {
      return renderTest("none yet", "{% for i in c %}X{% else %}none yet{% endfor %}");
    });

    it("renders for empty collections", function() {
      return renderTest("none yet", "{% for i in c %}X{% else %}none yet{% endfor %}", {
        c: []
      });
    });

    return it("renders for empty hashes", function() {
      return renderTest("none yet", "{% for i in c %}X{% else %}none yet{% endfor %}", {
        c: {}
      });
    });
  });

  describe("with reverse", function() {
    return it("does not modify the source array", function() {
      var array = [1, 2, 3];

      return renderTest("321", "{% for item in array reversed %}{{ item }}{% endfor %}", {
        array: array
      }).then(function() {
        expect(array.length).to.eql(3);
        return expect(array[0]).to.eql(1);
      });
    });
  });

  return describe("with index", function() {
    it("renders correctly", function() {
      return renderTest("123", "{%for item in array%}{{forloop.index}}{%endfor%}", {
        array: [1, 2, 3]
      });
    });

    it("renders correctly", function() {
      return renderTest("321", "{%for item in array%}{{forloop.rindex}}{%endfor%}", {
        array: [1, 2, 3]
      });
    });

    it("renders correctly", function() {
      return renderTest("210", "{%for item in array%}{{forloop.rindex0}}{%endfor%}", {
        array: [1, 2, 3]
      });
    });

    it("renders correctly", function() {
      return renderTest("123", "{%for item in array%}{{forloop.index}}{%endfor%}", {
        array: ["a", "b", "c"]
      });
    });

    it("renders correctly", function() {
      return renderTest("123", "{%for item in array%}{{forloop.index}}{%endfor%}", {
        array: ["a", "b", "c"]
      });
    });

    it("renders correctly", function() {
      return renderTest("012", "{%for item in array%}{{forloop.index0}}{%endfor%}", {
        array: ["a", "b", "c"]
      });
    });

    it("renders correctly", function() {
      return renderTest("1234", "{%for item in array%}{{forloop.index}}{%endfor%}", {
        array: [{
          a: 1
        }, {
          b: 1
        }, {
          c: 1
        }, {
          d: 1
        }]
      });
    });

    it("renders correctly", function() {
      return renderTest("", "{%for item in array%}{{forloop.index}}{%endfor%}", {
        array: []
      });
    });

    it("renders correctly", function() {
      return renderTest(
        "first123",
        "{% for item in array %}{% if forloop.first%}first{% endif %}{{forloop.index}}{% endfor %}",
        {
          array: [1, 2, 3]
        }
      );
    });

    it("renders correctly", function() {
      return renderTest(
        "123last",
        "{% for item in array %}{{forloop.index}}{% if forloop.last%}last{% endif %}{% endfor %}",
        {
          array: [1, 2, 3]
        }
      );
    });

    it("renders correctly", function() {
      return renderTest("vw", "{%for item in array limit:2%}{{item}}{%endfor%}", {
        array: ["v", "w", "x", "y"]
      });
    });

    return it("renders correctly", function() {
      return renderTest("xy", "{%for item in array offset:2%}{{item}}{%endfor%}", {
        array: ["v", "w", "x", "y"]
      });
    });
  });
});

describe("IfChanged", function() {
  it("renders correctly", function() {
    return renderTest(
      "123",
      "{%for item in array%}{%ifchanged%}{{item}}{% endifchanged %}{%endfor%}",
      {
        array: [1, 1, 2, 2, 3, 3]
      }
    );
  });

  return it("renders correctly", function() {
    return renderTest(
      "1",
      "{%for item in array%}{%ifchanged%}{{item}}{% endifchanged %}{%endfor%}",
      {
        array: [1, 1, 1, 1]
      }
    );
  });
});

describe("Capture", function() {
  it("captures variables", function() {
    return renderTest(
      "X",
      "{% capture foo %}Foo{% endcapture %}{% if \"Foo\" == foo %}X{% endif %}"
    );
  });

  return it("captures and renders", function() {
    return renderTest("Foo", "{% capture foo %}Foo{% endcapture %}{{ foo }}");
  });
});

describe("Raw", function() {
  it("prints liquid-tags in body", function() {
    return renderTest(
      "{% if value %}{{ value }}{% endif %}",
      "{% raw %}{% if value %}{{ value }}{% endif %}{% endraw %}",
      {
        value: true
      }
    );
  });

  it("ignores liquid-tags in body", function() {
    return renderTest("{% woot %}", "{% raw %}{% woot %}{% endraw %}");
  });

  return it("ends on first endraw", function() {
    return renderTest("{% raw %}X", "{% raw %}{% raw %}X{% endraw %}");
  });
});

describe("Comment", function() {
  return it("it swallows it's body", function() {
    return renderTest("", "{% comment %}This is a comment{% endcomment %}");
  });
});

describe("Increment", function() {
  it("increments like i++", function() {
    return renderTest("1", "{% increment i %}", {
      i: 1
    });
  });

  return it("interprents non-existing variables as 0", function() {
    return renderTest("0", "{% increment i %}");
  });
});

describe("Decrements", function() {
  it("decrements like --i", function() {
    return renderTest("0", "{% decrement i %}", {
      i: 1
    });
  });

  return it("interprents non-existing variables as 0", function() {
    return renderTest("-1", "{% decrement i %}");
  });
});