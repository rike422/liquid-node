var Liquid = requireLiquid();
var Promise = require("native-or-bluebird");

var asyncResult = function(result, delay = 1) {
  return new Promise(function(resolve) {
    var onTimeout = function() {
      return resolve(result);
    };

    return setTimeout(onTimeout, delay);
  });
};

describe("Futures", function() {
  it("are supported as simple variables", function() {
    return renderTest("worked", "{{ test }}", {
      test: asyncResult("worked")
    });
  });

  it("are supported as complex variables", function() {
    return renderTest("worked", "{{ test.text }}", {
      test: asyncResult({
        text: "worked"
      })
    });
  });

  it("are supported as filter input", function() {
    return renderTest("WORKED", "{{ test | upcase }}", {
      test: asyncResult("worked")
    });
  });

  it("are supported as filter arguments", function() {
    return renderTest("1-2-3", "{{ array | join:minus }}", {
      minus: asyncResult("-"),
      array: [1, 2, 3]
    });
  });

  it("are supported as filter arguments", function() {
    return renderTest("1+2+3", "{{ array | join:minus | split:minus | join:plus }}", {
      minus: asyncResult("-"),
      plus: asyncResult("+"),
      array: [1, 2, 3]
    });
  });

  it("are supported in conditions", function() {
    return renderTest("YES", "{% if test %}YES{% else %}NO{% endif %}", {
      test: asyncResult(true)
    });
  });

  it("are supported in captures", function() {
    return renderTest(
      "Monkeys&Monkeys",
      "{% capture heading %}{{animal}}{% endcapture %}{{heading}}&{{heading}}",
      {
        animal: asyncResult("Monkeys")
      }
    );
  });

  it("are supported in assigns", function() {
    return renderTest(
      "YES",
      "{% assign test = var %}{% if test == 42 %}YES{% else %}NO{% endif %}",
      {
        var: asyncResult(42)
      }
    );
  });

  return context("in for-loops", function() {
    it("are supported as lists", function() {
      var products = ([1, 2, 2].map(i => {
        return {
          id: ("item" + (i))
        };
      }));

      var doc = "{% for product in products %}- {{ product.id }}\n{% endfor %}";

      return renderTest("- item1\n- item2\n- item2\n", doc, {
        products: asyncResult(products)
      });
    });

    it("are supported as lists (with ifchanged)", function() {
      var products = ([1, 2, 2].map(i => {
        return {
          id: ("item" + (i))
        };
      }));

      var doc = "{% for product in products %}{% ifchanged %}- {{ product.id }}\n{% endifchanged %}{% endfor %}";

      return renderTest("- item1\n- item2\n", doc, {
        products: asyncResult(products)
      });
    });

    return it("are supported as elements", function() {
      var doc = "{% for product in products %}- {{ product.id }}\n{% endfor %}";

      var products = ([1, 2, 3].map(i => {
        return {
          id: asyncResult(("item" + (i)))
        };
      }));

      return renderTest("- item1\n- item2\n- item3\n", doc, {
        products: products
      });
    });
  });
});