module.exports = class Liquid {
  static FilterSeparator = /\|/;
  static ArgumentSeparator = /,/;
  static FilterArgumentSeparator = /\:/;
  static VariableAttributeSeparator = /\./;
  static TagStart = /\{\%/;
  static TagEnd = /\%\}/;
  static VariableSignature = /\(?[\w\-\.\[\]]\)?/;
  static VariableSegment = /[\w\-]/;
  static VariableStart = /\{\{/;
  static VariableEnd = /\}\}/;
  static VariableIncompleteEnd = /\}\}?/;
  static QuotedString = /"[^"]*"|'[^']*'/;

  static QuotedFragment = RegExp(
    ((this.QuotedString.source) + "|(?:[^\\s,\\|'\"]|" + (this.QuotedString.source) + ")+")
  );

  static StrictQuotedFragment = /"[^"]+"|'[^']+'|[^\s|:,]+/;

  static FirstFilterArgument = RegExp(
    ((this.FilterArgumentSeparator.source) + "(?:" + (this.StrictQuotedFragment.source) + ")")
  );

  static OtherFilterArgument = RegExp(
    ((this.ArgumentSeparator.source) + "(?:" + (this.StrictQuotedFragment.source) + ")")
  );

  static SpacelessFilter = RegExp(
    ("^(?:'[^']+'|\"[^\"]+\"|[^'\"])*" + (this.FilterSeparator.source) + "(?:" + (this.StrictQuotedFragment.source) + ")(?:" + (this.FirstFilterArgument.source) + "(?:" + (this.OtherFilterArgument.source) + ")*)?")
  );

  static Expression = RegExp(
    ("(?:" + (this.QuotedFragment.source) + "(?:" + (this.SpacelessFilter.source) + ")*)")
  );

  static TagAttributes = RegExp(("(\\w+)\\s*\\:\\s*(" + (this.QuotedFragment.source) + ")"));
  static AnyStartingTag = /\{\{|\{\%/;

  static PartialTemplateParser = RegExp(
    ((this.TagStart.source) + ".*?" + (this.TagEnd.source) + "|" + (this.VariableStart.source) + ".*?" + (this.VariableIncompleteEnd.source))
  );

  static TemplateParser = RegExp(
    ("(" + (this.PartialTemplateParser.source) + "|" + (this.AnyStartingTag.source) + ")")
  );

  static VariableParser = RegExp(("\\[[^\\]]+\\]|" + (this.VariableSegment.source) + "+\\??"));
};