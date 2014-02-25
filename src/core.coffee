'use strict'

window.D3Fakebook = {}

class D3Fakebook.Core
  constructor : (el, opts={}) ->
    # Must have an element to put the chart in; throw an error if it is missing.
    unless el
      error = new Error 'Fakebook Chart requires a node selector'
      error.name = 'ArgumentError'
      throw error

    @opts  = opts
    @opts.valueName or= 'value'
    @el    = d3.select(el)[0][0]
    @$el   = d3.select(@el)
    @title = opts.title

    # Show data points on lines by default
    if _.isUndefined @opts.showPoints
      @opts.showPoints = true

    @chartColors = @opts.colors or [
      # The category20 colors:
      # https://github.com/mbostock/d3/wiki/Ordinal-Scales#wiki-category20
      '#1f77b4',
      '#aec7e8',
      '#ff7f0e',
      '#ffbb78',
      '#2ca02c',
      '#98df8a',
      '#d62728',
      '#ff9896',
      '#9467bd',
      '#c5b0d5',
      '#8c564b',
      '#c49c94',
      '#e377c2',
      '#f7b6d2',
      '#7f7f7f',
      '#c7c7c7',
      '#bcbd22',
      '#dbdb8d',
      '#17becf',
      '#9edae5'
    ]

    if opts.data?
      @data = opts.data

    # Configure the various settings
    # --------------------------------------------------

    # Margin
    # ------
    _margin =
      top    : 80
      right  : 100
      bottom : 80
      left   : 100

    @margin = _.extend _margin, @opts.margin
    # remove this so it's not available in the opts collection
    delete @opts.margin

    # Dimensions
    # ----------
    _defaultDimensions =
      height : if window.innerHeight < 480 then 500 else @el.offsetHeight
      width  : if window.innerWidth < 480 then 900 else @el.offsetWidth
    @dimensions = _.extend _defaultDimensions, @opts.dimensions
    # remove this so it's not available in the opts collection
    delete @opts.dimensions

    # for drawing elements on the chart
    @innerWidth  = @dimensions.width - @margin.left - @margin.right
    @innerHeight = @dimensions.height - @margin.top - @margin.bottom

  render : ->
    @createContainer()
    @buildChart()

  # Private method to set the color scale for the chart. Will set up to two
  # scales (to support dual-y-axis charts). It will check for the presence of
  # this.color and create this.colorAlt if it finds it.
  _setColorScale : (colors, data) ->
    # Make a copy of the passed-in array of colors so we can safely perform
    # mutations on it
    chartColors = _.clone(colors)

    # Grab the keys from the data
    if data
      if _.isArray data
        values = d3.values data[0]

    # Special handling for interactive charts where a country in a certain
    # position should maintain the color it was rendered with
    if @opts.positions
      # Iterate through the positions Array
      _(@opts.positions.length).times (index) =>
        # If the index doesn't exist in the positions Array, remove that
        # color from the color scale
        unless _(@opts.positions).contains index
          chartColors.splice(index, 1)

    # set the scale
    colorScale = d3.scale.category20()

    # assign it to an instance variable
    if @color? # if a this.color value is present, create this.colorAlt
      @colorAlt = colorScale

    else # create new this.color value
      @color = colorScale

  setTickFormat : (axis) ->
    axis.tickFormat (d) => @formatValues d

  formatValues : (datum) ->
    number = d3.round datum, 5
    format = d3.format(',s')
    formatted = format(number)
    if formatted is '-0'
      formatted = '0'
    formatted

  displayNotice : (heading, message) ->
    @el.innerHTML = "<div class=\"chart-notice\">
    <h4 class=\"chart-notice-title\">#{heading}</h4>
    <p class=\"chart-notice-content\">#{message}</p></div>"

  createContainer : ->
    boxHeight = @dimensions.height + (if @title then 40 else 0)
    boxWidth  = @dimensions.width

    @svg = d3.select(@el)
            .append('svg')
            .attr('width', @dimensions.width)
            .attr('height', (@dimensions.height + (if @title then 40 else 0)))
            .attr('viewBox', "0 0 #{boxWidth} #{boxHeight}")
            .attr('perserveaspectratio', 'xMinYMid')
            .append('g')
            .attr('transform', "translate(#{@margin.left}, #{@margin.top})")

  getTitle : -> @title

  _getLegendVerticalOffset : (showLabels) ->
    height = @dimensions.height
    offset = @margin.top

    if @opts.legendOffset
      offset += @opts.legendOffset
    else
      if showLabels
        offset += 20
      else
        offset = offset

    offset += @smallScreenOffset if showLabels and not @isLargeScreen

    height - offset

  drawLegend : (labels) ->
    # the positioning of this is a bit of a hack, based on the premise that
    # the container will always be 400px wide, which isn't always going to be
    # true.
    unless @opts.showLegend is false
      if @opts.yLabel?
        primaryLabelText = @opts.yLabel.split(',')[0]
      else
        primaryLabelText = @opts.legendTitle

      if @opts.yLabelComparison?
        secondaryLabelText = _.str.strLeftBack @opts.yLabelComparison, ', '
      else
        secondaryLabelText = null

      primaryLabel     = primaryLabelText
      secondaryLabel   = secondaryLabelText

      top  = @_getLegendVerticalOffset secondaryLabel?
      left = if secondaryLabel then 20 else 0

      @svg.append('g')
        .attr('class', 'legend')
        .attr('transform', "translate(#{left}, #{top})")
        .style('font-size', '12px')
        .call(d3.legend)

      if secondaryLabel
        chartWidth = @dimensions.width
        chartInnerWidth = @dimensions.width - @margin.right - @margin.left

        @svg.selectAll('.legend-items').each ->
          self = d3.select this
          self.append('text')
            .text(primaryLabel)
            .attr('transform', 'translate(-30, -20)')
            .style('font-size', '10px')
            .style('font-weight', 'bold')

        @svg.selectAll('.legend-items-comparison').each ->
          self = d3.select this
          self.append('text')
            .text(secondaryLabel)
            .attr('transform', "translate(-30, -20)")
            .style('font-size', '10px')
            .style('font-weight', 'bold')

          outerWidth = parseInt $('.legend-items-comparison').outerWidth(), 10
          # add some left margin
          left       = chartInnerWidth - (chartInnerWidth / 2) + 20
          top        = 0

          self.attr('transform', "translate(#{left}, #{top})")

  drawTitle : ->
    @svg.append('text')
        .attr('x', (@dimensions.width - @margin.left - @margin.right) / 2)
        .attr('y', 0 - (@margin.top / 2))
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title')
        .text(=>
          title = @getTitle()
          if title then title else null
        )

  utils :
    round2 : (num) ->
      num = parseFloat(num, 10)
      +num.toFixed(2).replace /\.00$/, ''
      return num
