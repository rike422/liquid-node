var expect;
var sinon;
var chai;

global.requireLiquid = function() {
  return require(("../" + ((process.env.LIQUID_NODE_COVERAGE ? "lib" : "src")) + "/index"));
};

var Liquid = requireLiquid();
global.chai = chai = require("chai");
chai.use(require("chai-as-promised"));
global.sinon = sinon = require("sinon");
chai.use(require("sinon-chai"));
global.expect = expect = chai.expect;
var Promise = require("native-or-bluebird");

var stringify = function(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (e) {
    return ("Couldn't stringify: " + (v));
  }
};

global.renderTest = function(expected, templateString, assigns, rethrowErrors = true) {
  var engine = new Liquid.Engine();
  var parser = engine.parse(templateString);

  var renderer = parser.then(function(template) {
    template.rethrowErrors = rethrowErrors;
    return template.render(assigns);
  });

  var test = renderer.then(function(output) {
    expect(output).to.be.a("string");

    if (expected instanceof RegExp) {
      return expect(output).to.match(expected);
    } else {
      return expect(output).to.eq(expected);
    }
  });

  return Promise.all([expect(parser).to.be.fulfilled, expect(renderer).to.be.fulfilled, test]);
};