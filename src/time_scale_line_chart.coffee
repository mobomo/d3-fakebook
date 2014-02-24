'use strict'

class D3Fakebook.TimeScaleLineChart extends D3Fakebook.LineChart
  buildChart: ->
    allData        = _.compact @buildData()
    data           = allData[0]
    dataComparison = allData[1] if allData[1] and allData[1].length

    # Don't do any of the data rendering if there's nothing to show
    hasData = data and !!data.length
    if dataComparison
      hasData = hasData and !!dataComparison.length

    unless hasData
      @displayNotice 'This dataset cannot be rendered.',
        'There is insufficient data for this chart.'
      return

    _(allData.length).times (i) =>
      colors = @countryColors
      if allData[i].length
        @_setColorScale colors, allData[i]

    @x = d3.time.scale()
      .range([0, @innerWidth])

    @y0 = d3.scale.linear()
      .range([@innerHeight, 0])

    @y1 = d3.scale.linear()
      .range([@innerHeight, 0])

    # Set the X and Y axes
    @xAxis = @createAxis 'x', @x, 'bottom'

    @yAxisLeft = @createAxis 'y0', @y0, 'left',
      size :
        major : 0 - @innerWidth
        minor : 0 - @innerWidth
        end   : 0 - @innerWidth

    @yAxisRight = @createAxis 'y1', @y1, 'right'

    # Set domains
    @x.domain [
      @findMin(data, 'date', false),
      @findMax(data, 'date', false)
    ]

    @setDomain @y0, @findMin(data), @findMax(data)
    if dataComparison
      @setDomain @y1, @findMin(dataComparison), @findMax(dataComparison)

    # NOTE: timer is necessary to ensure that the nodes are in the DOM when
    # this event listener is initialized
    setTimeout ->
      $('.data-point').popover
        container : 'body'
        html      : true
        trigger   : 'manual'
        placement : 'top'
      , 10

    @drawChart data, dataComparison

  findMin : (data, key='datum', shouldRound=true) ->
    min = d3.min data, (d) ->
      d3.min d.values, (v) ->
        v[key]

    min

  findMax : (data, key='datum', shouldRound=true) ->
    max = d3.max data, (d) ->
      d3.max d.values, (v) ->
        v[key]

    max

  drawLines : (dataset, x, y, color, isComparison) ->
    isComparison ||= false

    format = d3.format('n')

    line = d3.svg.line()
            .x((d) -> x d.date)
            .y((d) -> y d.datum)

    lines = @svg.selectAll('.countries')
                .data(dataset)

    country = lines.enter()
                  .append('g')
                  .attr('class', 'country')

    legendAttr      = 'data-legend'
    legendColorAttr = 'data-legend-color'

    legendAttr += '-comparison' if isComparison

    country.append('path')
          .attr('class', 'line')
          .attr('d', (d) -> line(d.values))
          .attr(legendAttr, (d) -> d.key)
          .attr(legendColorAttr, (d) -> color(d.key))
          .style('stroke', (d) -> color(d.key))
          .style('stroke-dasharray', if isComparison then ('5, 5') else null)

    # Data points
    pointRadius = 5.2
    transitionDuration = 1000
    pointOpacity = 0.4

    pointsGroup = @svg.append('g')
    points = country.selectAll('.data-point').data (d) ->
      filtered = _.filter(d.values, (v) -> not _.isNaN(v.datum))
      filtered

    points.enter()
          .append('circle')
          .attr('class', 'data-point')
          .style('opacity', pointOpacity)
          .attr('cx', (d) -> x d.date)
          .attr('cy', (d) -> y d.datum)
          .attr('r', () -> pointRadius)
          .attr('title', (d) ->
            d.country
          )
          .attr('data-toggle', 'popover')
          .attr('data-content',(d) ->
            "<strong style=\"color: #{color d.country}\">
            #{format parseFloat(d.datum, 10).round2()}
            #</strong> #{d.date.getFullYear()}"
          )
          .style('fill', (d,i) -> color d.country)
          .on('mouseover', (d) ->
            $node = $(this)
            $node.popover('show')

            d3.select(this)
              .transition()
              .duration(250)
              .style('opacity', 1)
          )
          .on('mouseout', (d) ->
            $node = $(this)
            $node.popover('hide')

            d3.select(this)
              .transition()
              .duration(250)
              .style('opacity', pointOpacity)
          )

    # no line labeling for dual axis charts
    if @opts.labelLines is true and not @opts.dualY
      translation = "translate(#{x(d.value.date)}, #{y(d.value.datum)})"
      country.append('text')
            .datum((d) ->
              {name : d.name, value : d.values[d.values.length - 1]}
            )
            .attr('transform', (d) -> translation)
            .attr('y', 5)
            .attr('x', 10)
            .text((d) -> d.name)

  _nestData : (data, isComparison, primaryData) ->
    isComparison or= false
    if primaryData
      minYear = @findMin primaryData, 'date'
      minYear = new Date(minYear).getFullYear()

      maxYear = @findMax primaryData, 'date'
      maxYear = new Date(maxYear).getFullYear()

    dataset = if isComparison then 'dataComparison' else 'data'
    datasets = _.chain(data)
                .pluck(dataset)
                .compact()
                .value()

    if datasets? and datasets.length
      datasets = _.chain(datasets)
        .flatten()
        .map (d) ->
          country : d.country
          datum   : +d.value
          date    : new Date d.year, 0, 1
        .value()

      datasets = _.reject datasets, (d) -> _.isNaN(d.datum)

      if maxYear? and minYear?
        datasets = _.reject datasets, (d) ->
          date = new Date(d.date).getFullYear()
          date < minYear or date > maxYear

      d3.nest().key((d) -> d.country).entries(datasets)
    else
      return null

  buildData : ->
    _.each @data, (data) ->
      _.map data.data, (d) ->
        d.country = data.country

    parsedData           = @_nestData(@data, false)
    parsedDataComparison = @_nestData(@data, true, parsedData) if @opts.dualY

    [parsedData, parsedDataComparison]
