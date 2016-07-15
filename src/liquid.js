const _FilterSeparator = /\|/;
const _ArgumentSeparator = /,/;
const _FilterArgumentSeparator = /\:/;
const _VariableAttributeSeparator = /\./;
const _TagStart = /\{\%/;
const _TagEnd = /\%\}/;
const _VariableSignature = /\(?[\w\-\.\[\]]\)?/;
const _VariableSegment = /[\w\-]/;
const _VariableStart = /\{\{/;
const _VariableEnd = /\}\}/;
const _VariableIncompleteEnd = /\}\}?/;
const _QuotedString = /"[^"]*"|'[^']*'/;
const _StrictQuotedFragment = /"[^"]+"|'[^']+'|[^\s|:,]+/;
const _QuotedFragment = RegExp(
  `${_QuotedString.source}|(?:[^\\s,\\|'\"]|${_QuotedString.source})+`
);

const _FirstFilterArgument = RegExp(
  `${_FilterArgumentSeparator.source}(?:${_StrictQuotedFragment.source})`
);

const _OtherFilterArgument = RegExp(
  `${_ArgumentSeparator.source}(?:${_StrictQuotedFragment.source})`
);

const _SpacelessFilter = RegExp(
  `^(?:'[^']+'|\"[^\"]+\"|[^'\"])*${_FilterSeparator.source}(?:${_StrictQuotedFragment.source})(?:${_FirstFilterArgument.source}(?:${_OtherFilterArgument.source})*)?`
);

const _Expression = RegExp(
  `(?:${_QuotedFragment.source}(?:${_SpacelessFilter.source})*)`
);
const _TagAttributes = RegExp(`(\\w+)\\s*\\:\\s*(${_QuotedFragment.source})`);

const _AnyStartingTag = /\{\{|\{\%/;

const _PartialTemplateParser = RegExp(
  `${_TagStart.source}.*?${_TagEnd.source}|${_VariableStart.source}.*?${_VariableIncompleteEnd.source}`
);

const _TemplateParser = RegExp(`(${_PartialTemplateParser.source}|${_AnyStartingTag.source})`);

const _VariableParser = RegExp(`\\[[^\\]]+\\]|${_VariableSegment.source}+\\??`);

module.exports = class Liquid {

  static get FilterSeparator() {
    return _FilterSeparator;
  }

  static get ArgumentSeparator() {
    return _ArgumentSeparator;
  }

  static get FilterArgumentSeparator() {
    return _FilterArgumentSeparator;
  }

  static get VariableAttributeSeparator() {
    return _VariableAttributeSeparator;
  }

  static get TagStart() {
    return _TagStart;
  }

  static get TagEnd() {
    return _TagEnd;
  }

  static get VariableSignature() {
    return _VariableSignature;
  }

  static get VariableSegment() {
    return _VariableSegment;
  }

  static get VariableStart() {
    return _VariableStart;
  }

  static get VariableEnd() {
    return _VariableEnd;
  }

  static get VariableIncompleteEnd() {
    return _VariableIncompleteEnd;
  }

  static get QuotedString() {
    return _QuotedString;
  }

  static get QuotedFragment() {
    return _QuotedFragment;
  }

  static get StrictQuotedFragment() {
    return _StrictQuotedFragment;
  }

  static get FirstFilterArgument() {
    return _FirstFilterArgument
  };

  static get OtherFilterArgument() {
    return _OtherFilterArgument;
  }

  static get SpacelessFilter() {
    return _SpacelessFilter;
  }

  static get Expression() {
    return _Expression;
  }

  static get TagAttributes() {
    return _TagAttributes;
  }

  static get AnyStartingTag() {
    return _AnyStartingTag;
  }

  static get PartialTemplateParser() {

    return _PartialTemplateParser;
  }

  static get TemplateParser() {

    return _TemplateParser;
  }

  static VariableParser() {
    return _VariableParser;
  }
};