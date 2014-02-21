define [
  'chai',
  'd3',
  'underscore',
  'src/chart_builder'
], (chai, d3, _, Chart) ->
  'use strict'

  expect  = chai.expect
  assert  = chai.assert
  objects =
    data : [1,2,3]

  describe 'Chart', ->
    before(() ->
      objects.containerNode = document.createElement 'div'
      objects.chart = new Chart objects.containerNode
      return objects
    )

    describe '#new', ->
      it 'should require a DOM node', ->
        expect(() -> chart = new Chart)
          .to.throw Error, 'Fakebook Chart requires a DOM node'


      it 'should produce an instance of Chart', ->
        expect(objects.chart).to.be.instanceof Chart


      it 'should set margins', ->
        chart = objects.chart
        expect(chart.margin.top).to.be.a 'number'
        expect(chart.margin.right).to.a 'number'
        expect(chart.margin.bottom).to.a 'number'
        expect(chart.margin.left).to.a 'number'


      it 'should call #createContainer()'#, ->
        # TODO: Need to get sinon working
        #chart = objects.chart
        #spy   = sinon.spy chart, 'createContainer'

        #expect(spy).to.be.called


      describe 'instance properties', ->
        it 'should assign the DOM node to the instance', ->
          node = objects.containerNode

          expect(objects.chart.el).to.equal node
          expect(objects.chart.$el).to.be.a 'array'
          expect(objects.chart.$el).to.deep.equal d3.select node


        it 'should store options on the instance', ->
          expect(objects.chart.opts).to.be.a 'object'


        it 'should set a title if one is provided', ->
          chart = new Chart objects.containerNode,
            title : 'Chart title'

          expect(chart.title).to.equal 'Chart title'


        it 'should set an indicator title if one is provided', ->
          chart = new Chart objects.containerNode,
            title          : 'Chart title'

          expect(chart.indicatorTitle).to.be.a 'undefined'

          chartWithIndicator = new Chart objects.containerNode,
            title          : 'Chart title'
            indicatorTitle : 'Indicator title'

          expect(chartWithIndicator.indicatorTitle).to.equal 'Indicator title'


        it 'should store data to the instance if provided', ->
          chart = new Chart objects.containerNode,
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
        num = chart.formatValues -0.00000234567 # bigger than this will be reduced to -0.02m
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

        chart = new Chart objects.containerNode,
          title : 'Chart title'
        expect(chart.getTitle()).to.be.a 'string'
        expect(chart.getTitle()).to.equal 'Chart title'

    describe '#createContainer', ->
      it 'should put an SVG in the node', ->
        chart = objects.chart
        chart.createContainer()
        svg = d3.select(chart.el).select('svg')
        expect(svg[0][0].tagName).to.equal 'svg'
