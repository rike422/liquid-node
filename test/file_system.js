Liquid = requireLiquid()
Path = require "path"

describe "Liquid.FileSystem", ->

  describe "Liquid.BlankFileSystem", ->
    it "should error", ->
      c = new Liquid.BlankFileSystem
      expect(c.readTemplateFile('index')).to.be.rejectedWith Liquid.FileSystemError, "This file system doesn't allow includes"

  describe "Liquid.LocalFileSystem", ->

    it "evaluates the correct path", ->
      c = new Liquid.LocalFileSystem './'
      expect(c.fullPath('index')).to.be.fulfilled.then (v) ->
        expect(v).to.equal Path.resolve('index.html')

    it "evaluates the correct path and extension", ->
      c = new Liquid.LocalFileSystem "./root/files", "html2"
      expect(c.fullPath('index')).to.be.fulfilled.then (v) ->
        expect(v).to.equal Path.resolve('root/files/index.html2')

    it "loads the file", ->
      c = new Liquid.LocalFileSystem "./test/fixtures", "test.html"
      expect(c.readTemplateFile("filesystem")).to.be.fulfilled.then (v) ->
        expect(v).to.equal "<html></html>"

    it "throws an error when the file isn't found", ->
      c = new Liquid.LocalFileSystem "./", "html"
      expect(c.readTemplateFile("notfound")).to.be.rejectedWith Liquid.FileSystemError, "Error loading template"

    it "errors if the filename isn't valid", ->
      c = new Liquid.LocalFileSystem "./", "html"
      expect(c.fullPath('invalid file')).to.be.rejectedWith Liquid.ArgumentError, "Illegal template name 'invalid file'"
