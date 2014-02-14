#((name, definition) ->
  #if (typeof define == 'function') define(definition)
  #else if (typeof module != 'undefined') module.exports = definition()
  #else this[name] = definition()
#) "d3-fakebook", ->
  #console.log "testing"
  #return

class Catohp.Utils.ChartBuilder
  constructor : (opts) ->
    @opts  = opts
    @el    = opts.el
    @$el   = $(@el)
    @title = opts.title

    if opts.indicatorTitle
      @indicatorTitle = opts.indicatorTitle

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
      height : if $(window).width() < 480 then 500 else $(@el).height()
      width  : if $(window).width() < 480 then 900 else $(@el).width()
    @dimensions = _.extend _defaultDimensions, @opts.dimensions
    # remove this so it's not available in the opts collection
    delete @opts.dimensions

    # the threshold (in pixels) for what consitutes a screen size that can
    # handle a wider layout. NOTE: This should be removed when the charts are
    # made responsive.
    @largeScreen       = 1160
    @isLargeScreen     = @dimensions.width >= @largeScreen
    @smallScreenOffset = 40

    if not @isLargeScreen and @opts.yLabelComparison
    # add some extra room for the extra legend
      @margin.bottom = @margin.bottom + @smallScreenOffset

    # for drawing elements on the chart
    @innerWidth  = @dimensions.width - @margin.left - @margin.right
    @innerHeight = @dimensions.height - @margin.top - @margin.bottom

    @createContainer()

  # Array of colors to be used for the lines
  countryColors : [
    '#dd5c5c',
    '#e69545',
    '#5cb5dd',
    '#6272d3',
    '#5dc960',
    '#e645cd',
    '#a25cdd'
  ]

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

    if values
      unless _(values).contains 'World'
        chartColors.shift()

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
    colorScale = d3.scale.ordinal().range chartColors

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
    @$el.append "<div class=\"chart-notice\">
    <h4 class=\"chart-notice-title\">#{heading}</h4>
    <p class=\"chart-notice-content\">#{message}</p>
    </div>"

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

  buildTitle: ->
    if @title
      @title

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

      primaryLabel     = _.str.capitalize(primaryLabelText)
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
          title = @buildTitle()
          if title then title else null
        )
