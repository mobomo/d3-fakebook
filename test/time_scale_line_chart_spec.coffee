define [
  'd3',
  'underscore',
  'time_scale_line_chart'
], (d3, _) ->
  window.d3 = d3
  window._ = _

  'use strict'

  expect = chai.expect
  asset  = chai.assert

  describe 'TimeScaleLineChart', ->
    describe '#buildChart', ->
      it 'should build a chart'

    describe '#setCountries', ->
      it 'should set the countries'

    describe '#setDomain', ->
      it 'should set the chart\'s domain'

    describe '#createAxis', ->
      it 'should create an axis instance'

    describe '#findMin', ->
      it 'should return the smallest value from a data set'

    describe '#findMax', ->
      it 'should return the largest value from a data set'

    describe '#drawLines', ->
      it 'should draw lines on the chart, extracted from the code'

    describe '#drawChart', ->
      it 'should build up a chart'

    describe '#drawAxes', ->
      it 'should draw the axes on the chart'

    describe '#drawXAxis', ->
      it 'should draw an X axis'

    describe '#drawYAxis', ->
      it 'should draw a Y axis'

    describe '#buildData', ->
      it 'should build the data'
      #before(() ->
        #node = document.createElement 'div'
        #chart = new TimeScaleLineChart node,
          #data : [{
            #country : "United Arab Emirates"
            #data    : [{
                #country : "United Arab Emirates"
                #value   : 1.860001221
                #year    : 1990
              #}, {
                #country : "United Arab Emirates"
                #value   : 2.25
                #year    : 1991
              #}, {
                #country : "United Arab Emirates"
                #value   : 2.43
                #year    : 1992
              #}, {
                #country : "United Arab Emirates"
                #value   : 3.330002441
                #year    : 1993
              #}, {
                #country : "United Arab Emirates"
                #value   : 1.860001221
                #year    : 1994
              #}, {
                #country : "United Arab Emirates"
                #value   : 1.860001221
                #year    : 1995
              #}, {
              #}
            #]
          #},
          #{
          #}]
      #)
