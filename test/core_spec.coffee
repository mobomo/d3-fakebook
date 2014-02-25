define [
  'd3'
  'underscore',
  'core'
], (d3, _) ->
  'use strict'

  window.d3 = d3
  window._  = _

  expect  = chai.expect
  assert  = chai.assert
  objects =
    data : [1,2,3]

  describe 'Core', ->
    beforeEach(() ->
      domNode = document.createElement 'div'
      objects.containerNode = domNode
      objects.chart = new D3Fakebook.Core domNode
    )

    describe '#new', ->
      it 'should require a DOM node', ->
        expect(() -> chart = new D3Fakebook.Core)
          .to.throw Error, 'Fakebook Chart requires a node selector'


      it 'should produce an instance of D3Fakebook.Core', ->
        expect(objects.chart).to.be.instanceof D3Fakebook.Core


      it 'should set margins', ->
        chart = objects.chart
        expect(chart.margin.top).to.be.a 'number'
        expect(chart.margin.right).to.a 'number'
        expect(chart.margin.bottom).to.a 'number'
        expect(chart.margin.left).to.a 'number'


      describe 'instance properties', ->
        it 'should assign the DOM node to the instance', ->
          node = objects.containerNode

          expect(objects.chart.el).to.equal node
          expect(objects.chart.$el).to.be.a 'array'
          expect(objects.chart.$el).to.deep.equal d3.select node


        it 'should store options on the instance', ->
          expect(objects.chart.opts).to.be.a 'object'


        it 'should set a title if one is provided', ->
          chart = new D3Fakebook.Core objects.containerNode,
            title : 'Chart title'

          expect(chart.title).to.equal 'Chart title'


        it 'should store data to the instance if provided', ->
          chart = new D3Fakebook.Core objects.containerNode,
            data : objects.data

          expect(chart.data).to.be.a 'array'
          expect(chart.data).to.deep.equal objects.data


    describe '#formatValues', ->
      it 'should return a string', ->
        chart = objects.chart
        num = chart.formatValues 123
        expect(num).to.not.be.a 'number'
        expect(num).to.be.a 'string'


      it 'should not return -0 for really tiny negative values', ->
        chart = objects.chart
        # bigger than this will be reduced to -0.02m
        num = chart.formatValues -0.00000234567
        expect(num).to.equal '0'


      it 'should round big numbers down', ->
        chart = objects.chart

        num = chart.formatValues 5234
        expect(num).to.equal '5.234k'

        num = chart.formatValues 500000
        expect(num).to.equal '500k'

        num = chart.formatValues 52340000
        expect(num).to.equal '52.34M'

        num = chart.formatValues 500000000
        expect(num).to.equal '500M'

        num = chart.formatValues 500000000000
        expect(num).to.equal '500G'

        num = chart.formatValues 5234000000000
        expect(num).to.equal '5.234T'


    describe '#getTitle', ->
      it 'should return the title, if present', ->
        chartNoTitle = objects.chart
        expect(chartNoTitle.getTitle()).to.be.a 'undefined'

        chart = new D3Fakebook.Core objects.containerNode,
          title : 'Chart title'
        expect(chart.getTitle()).to.be.a 'string'
        expect(chart.getTitle()).to.equal 'Chart title'

    describe '#render', ->
      it 'should call createContainer'
      it 'should call buildChart'

    describe '#createContainer', ->
      it 'should put an SVG in the node', ->
        chart = objects.chart
        chart.createContainer()
        svg = d3.select(chart.el).select('svg')
        expect(svg[0][0].tagName).to.equal 'svg'
