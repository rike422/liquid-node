var Liquid = requireLiquid();
var Promise = require("native-or-bluebird");

describe("Liquid.Condition", function() {
  it("evaluates without a context", function() {
    var c = new Liquid.Condition("1", "==", "1");

    return expect(c.evaluate()).to.be.fulfilled.then(function(v) {
      return expect(v).to.equal(true);
    });
  });

  it("fails on illegal operators", function() {
    return renderTest(
      "Liquid error: Unknown operator baz",
      "{% if foo baz bar %}X{% endif %}",
      {},
      false
    );
  });

  context("if", function() {
    it("renders on `true` variables", function() {
      return renderTest("X", "{% if var %}X{% endif %}", {
        var: true
      });
    });

    it("doesn't render on `false` variables", function() {
      return renderTest("", "{% if var %}X{% endif %}", {
        var: false
      });
    });

    it("renders on truthy variables", function() {
      return renderTest("X", "{% if var %}X{% endif %}", {
        var: "abc"
      });
    });

    it("doesn't render on falsy variables", function() {
      return renderTest("", "{% if var %}X{% endif %}", {
        var: null
      });
    });

    it("renders on truthy object properties", function() {
      return renderTest("X", "{% if foo.bar %}X{% endif %}", {
        foo: {
          bar: "abc"
        }
      });
    });

    it("doesn't render on falsy object properties", function() {
      return renderTest("", "{% if foo.bar %}X{% endif %}", {
        foo: {
          bar: null
        }
      });
    });

    it("doesn't render on non existing properties", function() {
      return renderTest("", "{% if foo.bar %}X{% endif %}", {
        foo: {}
      });
    });

    it("renders on truthy constants", function() {
      return renderTest("X", "{% if \"foo\" %}X{% endif %}");
    });

    it("doesn't render on falsy constants", function() {
      return renderTest("", "{% if null %}X{% endif %}", {
        null: 42
      });
    });

    context("with condition", function() {
      it("(true or true) renders", function() {
        return renderTest("X", "{% if a or b %}X{% endif %}", {
          a: true,
          b: true
        });
      });

      it("(true or false) renders", function() {
        return renderTest("X", "{% if a or b %}X{% endif %}", {
          a: true,
          b: false
        });
      });

      it("(false or true) renders", function() {
        return renderTest("X", "{% if a or b %}X{% endif %}", {
          a: false,
          b: true
        });
      });

      return it("(true or true) doesn't render", function() {
        return renderTest("", "{% if a or b %}X{% endif %}", {
          a: false,
          b: false
        });
      });
    });

    context("with operators", function() {
      it("that evaluate to true renders", function() {
        return Promise.all([renderTest("X", "{% if a == 42 %}X{% endif %}", {
          a: 42
        }), renderTest("X", "{% if a is 42 %}X{% endif %}", {
          a: 42
        }), renderTest("X", "{% if a != 42 %}X{% endif %}", {
          a: 41
        }), renderTest("X", "{% if a isnt 42 %}X{% endif %}", {
          a: 41
        }), renderTest("X", "{% if a <> 42 %}X{% endif %}", {
          a: 41
        }), renderTest("X", "{% if a > 42 %}X{% endif %}", {
          a: 43
        }), renderTest("X", "{% if a >= 42 %}X{% endif %}", {
          a: 43
        }), renderTest("X", "{% if a >= 42 %}X{% endif %}", {
          a: 42
        }), renderTest("X", "{% if a < 42 %}X{% endif %}", {
          a: 41
        }), renderTest("X", "{% if a <= 42 %}X{% endif %}", {
          a: 41
        }), renderTest("X", "{% if a <= 42 %}X{% endif %}", {
          a: 42
        }), renderTest("X", "{% if a contains 2 %}X{% endif %}", {
          a: [1, 2, 3]
        }), renderTest("X", "{% if a contains \"b\" %}X{% endif %}", {
          a: "abc"
        }), renderTest("X", "{% if a == empty %}X{% endif %}"), renderTest("X", "{% if empty == a %}X{% endif %}"), renderTest("X", "{% if a == empty %}X{% endif %}", {
          a: []
        }), renderTest("X", "{% if a == blank %}X{% endif %}"), renderTest("X", "{% if blank == a %}X{% endif %}"), renderTest("X", "{% if a != blank %}X{% endif %}", {
          a: "a"
        })]);
      });

      return it("that evaluate to false doesn't render", function() {
        return Promise.all([renderTest("", "{% if a != 42 %}X{% endif %}", {
          a: 42
        }), renderTest("", "{% if a contains 2 %}X{% endif %}"), renderTest("", "{% if a contains 2 %}X{% endif %}", {
          a: {
            indexOf: null
          }
        })]);
      });
    });

    context("with awful markup", function() {
      return it("renders correctly", function() {
        var awful_markup = "a == 'and' and b == 'or' and c == 'foo and bar' and d == 'bar or baz' and e == 'foo' and foo and bar";

        var assigns = {
          "a": "and",
          "b": "or",
          "c": "foo and bar",
          "d": "bar or baz",
          "e": "foo",
          "foo": true,
          "bar": true
        };

        return renderTest(" YES ", ("{% if " + (awful_markup) + " %} YES {% endif %}"), assigns);
      });
    });

    return context("with else-branch", function() {
      it("renders else-branch on falsy variables", function() {
        return renderTest("ELSE", "{% if var %}IF{% else %}ELSE{% endif %}", {
          var: false
        });
      });

      return it("renders if-branch on truthy variables", function() {
        return renderTest("IF", "{% if var %}IF{% else %}ELSE{% endif %}", {
          var: true
        });
      });
    });
  });

  describe("unless", function() {
    it("negates 'false'", function() {
      return renderTest(" TRUE ", "{% unless false %} TRUE {% endunless %}");
    });

    it("negates 'true'", function() {
      return renderTest("", "{% unless true %} FALSE {% endunless %}");
    });

    return it("supports else", function() {
      return renderTest(" TRUE ", "{% unless true %} FALSE {% else %} TRUE {% endunless %}");
    });
  });

  return describe("case", function() {
    it("outputs truthy when branches", function() {
      return renderTest(" 1 ", "{% case var %}{% when 1 %} 1 {% endcase %}", {
        var: 1
      });
    });

    it("doesn't output falsy when branches", function() {
      return renderTest("", "{% case var %}{% when 1 %} 1 {% endcase %}", {
        var: 2
      });
    });

    it("only prints one branch (duplicate when)", function() {
      return renderTest(" 1 ", "{% case var %}{% when 1 %} 1 {% when 1 %} 1 {% endcase %}", {
        var: 1
      });
    });

    it("does support `or`", function() {
      return renderTest(" 1/2 ", "{% case var %}{% when 1 or 2 %} 1/2 {% endcase %}", {
        var: 2
      });
    });

    return it("does support `else`", function() {
      return renderTest(" ELSE ", "{% case var %}{% when 1 %} 1 {% else %} ELSE {% endcase %}", {
        var: 2
      });
    });
  });
});