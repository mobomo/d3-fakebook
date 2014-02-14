(function() {
  var BarChartBuilder,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BarChartBuilder = (function(_super) {
    __extends(BarChartBuilder, _super);

    function BarChartBuilder() {
      return BarChartBuilder.__super__.constructor.apply(this, arguments);
    }

    BarChartBuilder.prototype.buildChart = function() {
      var categories, colors, countries, data, hasData, maxVal, minVal, _maxVal, _minVal;
      data = this.buildData();
      hasData = false;
      _(data).each(function(d) {
        if (d.values.length) {
          return hasData = true;
        }
      });
      if (!hasData) {
        this.displayNotice('This dataset cannot be rendered.', 'There is insufficient data for this chart.');
        return;
      }
      maxVal = this.findMax(data);
      minVal = this.findMin(data);
      if (maxVal < 0 && minVal < 0) {
        _maxVal = maxVal;
        _minVal = minVal;
        maxVal = _minVal;
        minVal = _maxVal;
      }
      colors = this.opts.colors || this.countryColors;
      this._setColorScale(colors, data);
      this.x0 = d3.scale.ordinal().rangeRoundBands([0, this.innerWidth], .1);
      this.x1 = d3.scale.ordinal();
      this.y = d3.scale.linear().range([this.innerHeight, 0]);
      this.xAxis = this.createAxis('x', this.x0, 'bottom');
      this.yAxis = this.createAxis('y', this.y, 'left', {
        size: {
          major: 0 - this.innerWidth,
          minor: 0 - this.innerWidth,
          end: 0 - this.innerWidth
        }
      });
      countries = this.setCountries(this.color, data);
      categories = d3.keys(data[0]).filter(function(key) {
        return key !== 'year' && key !== 'values';
      });
      this.x0.domain(data.map(function(d) {
        return d.year;
      }));
      this.x1.domain(categories).rangeRoundBands([0, this.x0.rangeBand()]);
      this.y.domain([minVal, maxVal]);
      setTimeout(function() {
        return $('.chart-bar').popover({
          container: 'body',
          html: true,
          trigger: 'manual',
          placement: 'top'
        }, 10);
      });
      return this.drawChart(data);
    };

    BarChartBuilder.prototype.findMin = function(data) {
      var min;
      min = d3.min(data, function(d) {
        return d3.min(d.values, function(d) {
          return d.value;
        });
      });
      return Math.min(0, min);
    };

    BarChartBuilder.prototype.findMax = function(data) {
      var max;
      max = d3.max(data, function(d) {
        return d3.max(d.values, function(d) {
          return d.value;
        });
      });
      return max;
    };

    BarChartBuilder.prototype.createAxis = function(plane, scale, position, ticks) {
      var axis, _ticks;
      _ticks = {
        count: 10,
        subdivide: false,
        padding: 10,
        size: {
          major: 0,
          minor: 0,
          end: 0
        }
      };
      ticks = _.extend(_ticks, ticks || {});
      axis = d3.svg.axis().scale(scale).orient(position);
      if (plane.match(/^y/)) {
        axis.ticks(ticks.count).tickSize(ticks.size.major, ticks.size.minor, ticks.size.end).tickPadding(ticks.padding);
        this.setTickFormat(axis);
      }
      return axis;
    };

    BarChartBuilder.prototype.setCountries = function(scale, data) {
      return scale.domain().map(function(name) {
        return {
          name: name,
          values: data[name]
        };
      });
    };

    BarChartBuilder.prototype.buildData = function() {
      var data, values, years;
      data = this.data;
      years = _.keys(data);
      values = _.values(data);
      _(years).each(function(year) {
        data[year].values = [];
        return _(data[year]).each(function(v, k) {
          var obj;
          if (!(k === 'year' || k === 'values' || _(v).isNaN())) {
            obj = {
              name: k,
              value: +v,
              year: +data[year].year
            };
            if (k === 'World') {
              return data[year].values.unshift(obj);
            } else {
              return data[year].values.push(obj);
            }
          }
        });
      });
      return data;
    };

    BarChartBuilder.prototype.drawChart = function(data) {
      this.drawAxes();
      this.drawBars(data);
      this.drawLegend();
      return this.drawTitle();
    };

    BarChartBuilder.prototype.drawBars = function(data) {
      var format, year;
      format = function(val) {
        var formatter, value;
        formatter = d3.format('n');
        value = formatter(val);
        if (value === '-0') {
          value = '0';
        }
        return value;
      };
      year = this.svg.selectAll('.year').data(data).enter().append('g').attr('class', 'g').attr('transform', (function(_this) {
        return function(d) {
          return 'translate(' + _this.x0(d.year) + ',0)';
        };
      })(this));
      return year.selectAll('rect').data(function(d) {
        return d.values;
      }).enter().append('rect').attr('class', 'chart-bar').attr('width', this.x1.rangeBand()).attr('x', (function(_this) {
        return function(d) {
          return _this.x1(d.name);
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d.value);
        };
      })(this)).attr('title', function(d) {
        return d.name;
      }).attr('height', (function(_this) {
        return function(d) {
          return _this.innerHeight - _this.y(d.value);
        };
      })(this)).style('fill', (function(_this) {
        return function(d) {
          return _this.color(d.name);
        };
      })(this)).attr('data-legend', function(d) {
        return d.name;
      }).attr('data-legend-color', (function(_this) {
        return function(d) {
          return _this.color(d.name);
        };
      })(this)).attr('data-toggle', 'popover').attr('data-content', (function(_this) {
        return function(d) {
          return "<strong style=\"color: " + (_this.color(d.name)) + ";\"> " + (format(parseFloat(d.value, 10).round2())) + " #</strong> " + d.year;
        };
      })(this)).on('mouseover', function(d) {
        return $(this).popover('show');
      }).on('mouseout', function(d) {
        return $(this).popover('hide');
      });
    };

    BarChartBuilder.prototype.drawAxes = function() {
      this.drawXAxis();
      return this.drawYAxis();
    };

    BarChartBuilder.prototype.drawXAxis = function() {
      return this.svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + this.innerHeight + ')').call(this.xAxis);
    };

    BarChartBuilder.prototype.drawYAxis = function() {
      var labelContent, yPosition;
      yPosition = 0 - this.opts.yLabelOffset || this.margin.left / 6;
      labelContent = this.svg.append('g').attr('class', 'y axis').call(this.yAxis).append('text').attr('transform', "rotate(-90)translate(" + 0 + ", " + yPosition + ")").style('text-anchor', 'middle').attr('class', 'chart-label chart-label-y-axis');
      labelContent.append('tspan').attr('x', '-160').attr('y', '-4.2em').text("" + (_.str.words(this.opts.yLabel, ", ")[0]));
      return labelContent.append('tspan').attr('x', '-160').attr('y', '-3.0em').text(_.str.words(this.opts.yLabel, ", ")[1]);
    };

    return BarChartBuilder;

  })(ChartBuilder);

}).call(this);

(function() {
  var ChartBuilder;

  ChartBuilder = (function() {
    function ChartBuilder(opts) {
      var _defaultDimensions, _margin;
      this.opts = opts;
      this.el = opts.el;
      this.$el = $(this.el);
      this.title = opts.title;
      if (opts.indicatorTitle) {
        this.indicatorTitle = opts.indicatorTitle;
      }
      if (opts.data != null) {
        this.data = opts.data;
      }
      _margin = {
        top: 80,
        right: 100,
        bottom: 80,
        left: 100
      };
      this.margin = _.extend(_margin, this.opts.margin);
      delete this.opts.margin;
      _defaultDimensions = {
        height: $(window).width() < 480 ? 500 : $(this.el).height(),
        width: $(window).width() < 480 ? 900 : $(this.el).width()
      };
      this.dimensions = _.extend(_defaultDimensions, this.opts.dimensions);
      delete this.opts.dimensions;
      this.largeScreen = 1160;
      this.isLargeScreen = this.dimensions.width >= this.largeScreen;
      this.smallScreenOffset = 40;
      if (!this.isLargeScreen && this.opts.yLabelComparison) {
        this.margin.bottom = this.margin.bottom + this.smallScreenOffset;
      }
      this.innerWidth = this.dimensions.width - this.margin.left - this.margin.right;
      this.innerHeight = this.dimensions.height - this.margin.top - this.margin.bottom;
      this.createContainer();
    }

    ChartBuilder.prototype.countryColors = ['#dd5c5c', '#e69545', '#5cb5dd', '#6272d3', '#5dc960', '#e645cd', '#a25cdd'];

    ChartBuilder.prototype._setColorScale = function(colors, data) {
      var chartColors, colorScale, values;
      chartColors = _.clone(colors);
      if (data) {
        if (_.isArray(data)) {
          values = d3.values(data[0]);
        }
      }
      if (values) {
        if (!_(values).contains('World')) {
          chartColors.shift();
        }
      }
      if (this.opts.positions) {
        _(this.opts.positions.length).times((function(_this) {
          return function(index) {
            if (!_(_this.opts.positions).contains(index)) {
              return chartColors.splice(index, 1);
            }
          };
        })(this));
      }
      colorScale = d3.scale.ordinal().range(chartColors);
      if (this.color != null) {
        return this.colorAlt = colorScale;
      } else {
        return this.color = colorScale;
      }
    };

    ChartBuilder.prototype.setTickFormat = function(axis) {
      return axis.tickFormat((function(_this) {
        return function(d) {
          return _this.formatValues(d);
        };
      })(this));
    };

    ChartBuilder.prototype.formatValues = function(datum) {
      var format, formatted, number;
      number = d3.round(datum, 5);
      format = d3.format(',s');
      formatted = format(number);
      if (formatted === '-0') {
        formatted = '0';
      }
      return formatted;
    };

    ChartBuilder.prototype.displayNotice = function(heading, message) {
      return this.$el.append("<div class=\"chart-notice\"> <h4 class=\"chart-notice-title\">" + heading + "</h4> <p class=\"chart-notice-content\">" + message + "</p> </div>");
    };

    ChartBuilder.prototype.createContainer = function() {
      var boxHeight, boxWidth;
      boxHeight = this.dimensions.height + (this.title ? 40 : 0);
      boxWidth = this.dimensions.width;
      return this.svg = d3.select(this.el).append('svg').attr('width', this.dimensions.width).attr('height', this.dimensions.height + (this.title ? 40 : 0)).attr('viewBox', "0 0 " + boxWidth + " " + boxHeight).attr('perserveaspectratio', 'xMinYMid').append('g').attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
    };

    ChartBuilder.prototype.buildTitle = function() {
      if (this.title) {
        return this.title;
      }
    };

    ChartBuilder.prototype._getLegendVerticalOffset = function(showLabels) {
      var height, offset;
      height = this.dimensions.height;
      offset = this.margin.top;
      if (this.opts.legendOffset) {
        offset += this.opts.legendOffset;
      } else {
        if (showLabels) {
          offset += 20;
        } else {
          offset = offset;
        }
      }
      if (showLabels && !this.isLargeScreen) {
        offset += this.smallScreenOffset;
      }
      return height - offset;
    };

    ChartBuilder.prototype.drawLegend = function(labels) {
      var chartInnerWidth, chartWidth, left, primaryLabel, primaryLabelText, secondaryLabel, secondaryLabelText, top;
      if (this.opts.showLegend !== false) {
        if (this.opts.yLabel != null) {
          primaryLabelText = this.opts.yLabel.split(',')[0];
        } else {
          primaryLabelText = this.opts.legendTitle;
        }
        if (this.opts.yLabelComparison != null) {
          secondaryLabelText = _.str.strLeftBack(this.opts.yLabelComparison, ', ');
        } else {
          secondaryLabelText = null;
        }
        primaryLabel = _.str.capitalize(primaryLabelText);
        secondaryLabel = secondaryLabelText;
        top = this._getLegendVerticalOffset(secondaryLabel != null);
        left = secondaryLabel ? 20 : 0;
        this.svg.append('g').attr('class', 'legend').attr('transform', "translate(" + left + ", " + top + ")").style('font-size', '12px').call(d3.legend);
        if (secondaryLabel) {
          chartWidth = this.dimensions.width;
          chartInnerWidth = this.dimensions.width - this.margin.right - this.margin.left;
          this.svg.selectAll('.legend-items').each(function() {
            var self;
            self = d3.select(this);
            return self.append('text').text(primaryLabel).attr('transform', 'translate(-30, -20)').style('font-size', '10px').style('font-weight', 'bold');
          });
          return this.svg.selectAll('.legend-items-comparison').each(function() {
            var outerWidth, self;
            self = d3.select(this);
            self.append('text').text(secondaryLabel).attr('transform', "translate(-30, -20)").style('font-size', '10px').style('font-weight', 'bold');
            outerWidth = parseInt($('.legend-items-comparison').outerWidth(), 10);
            left = chartInnerWidth - (chartInnerWidth / 2) + 20;
            top = 0;
            return self.attr('transform', "translate(" + left + ", " + top + ")");
          });
        }
      }
    };

    ChartBuilder.prototype.drawTitle = function() {
      return this.svg.append('text').attr('x', (this.dimensions.width - this.margin.left - this.margin.right) / 2).attr('y', 0 - (this.margin.top / 2)).attr('text-anchor', 'middle').attr('class', 'chart-title').text((function(_this) {
        return function() {
          var title;
          title = _this.buildTitle();
          if (title) {
            return title;
          } else {
            return null;
          }
        };
      })(this));
    };

    return ChartBuilder;

  })();

}).call(this);

(function() {
  var LineChartBuilder,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LineChartBuilder = (function(_super) {
    __extends(LineChartBuilder, _super);

    function LineChartBuilder() {
      return LineChartBuilder.__super__.constructor.apply(this, arguments);
    }

    LineChartBuilder.prototype.buildChart = function() {
      var allData, countries, countriesComparison, data, dataComparison, xValues, y0Values, y1Values;
      allData = this.buildData();
      data = allData[0];
      dataComparison = allData[1];
      _(allData.length).times((function(_this) {
        return function(i) {
          var colors;
          colors = _this.countryColors;
          return _this._setColorScale(colors, allData[i]);
        };
      })(this));
      this.x = d3.scale.linear().range([0, this.innerWidth]);
      this.y0 = d3.scale.linear().range([this.innerHeight, 0]);
      this.y1 = d3.scale.linear().range([this.innerHeight, 0]);
      this.xAxis = this.createAxis('x', this.x, 'bottom');
      this.yAxisLeft = this.createAxis('y0', this.y0, 'left', {
        size: {
          major: 0 - this.innerWidth,
          minor: 0 - this.innerWidth,
          end: 0 - this.innerWidth
        }
      });
      this.yAxisRight = this.createAxis('y1', this.y1, 'right');
      countries = this.setCountries(this.color, data);
      if (dataComparison) {
        countriesComparison = this.setCountries(this.colorAlt, dataComparison);
      }
      xValues = [];
      y0Values = [];
      y1Values = [];
      _(data).each(function(v, k) {
        return _(data[k]).each(function(d) {
          xValues.push(d[0]);
          return y0Values.push(d[1]);
        });
      });
      if (dataComparison && dataComparison.length) {
        _(dataComparison).each(v, k)(function() {
          return _(data[k]).each(function(d) {
            return y1Values.push(d[1]);
          });
        });
      }
      this.x.domain(d3.extent(xValues));
      this.setDomain(this.y0, this.findMin(y0Values), this.findMax(y0Values));
      if (dataComparison) {
        this.setDomain(this.y1, this.findMin(y1Values), this.findMax(y1Values));
      }
      setTimeout(function() {
        return $('.data-point').popover({
          container: 'body',
          html: true,
          trigger: 'manual',
          placement: 'top'
        }, 10);
      });
      return this.drawChart(countries, countriesComparison);
    };

    LineChartBuilder.prototype.setCountries = function(scale, data) {
      return scale.domain().map(function(name) {
        return {
          name: name,
          values: data[name]
        };
      });
    };

    LineChartBuilder.prototype.setDomain = function(axis, min, max) {
      if (!(min < 0 || min > 10)) {
        min = 0;
      }
      return axis.domain([min, max]);
    };

    LineChartBuilder.prototype.createAxis = function(plane, scale, position, ticks) {
      var axis, _ticks;
      _ticks = {
        count: 10,
        subdivide: true,
        padding: 10,
        size: {
          major: 0,
          minor: 0,
          end: 0
        }
      };
      ticks = _.extend(_ticks, ticks || {});
      axis = void 0;
      if (plane === 'x') {
        axis = d3.svg.axis().scale(scale).orient(position);
      } else if (plane.match(/^y/)) {
        axis = d3.svg.axis().scale(scale).orient(position).ticks(ticks.count).tickSubdivide(ticks.subdivide).tickSize(ticks.size.major, ticks.size.minor, ticks.size.end).tickPadding(ticks.padding);
        this.setTickFormat(axis);
      }
      return axis;
    };

    LineChartBuilder.prototype.findMin = function(data) {
      return d3.min(data);
    };

    LineChartBuilder.prototype.findMax = function(data) {
      return d3.max(data);
    };

    LineChartBuilder.prototype.drawLines = function(dataset, x, y, color, isComparison) {
      var country, legendAttr, legendColorAttr, line, lines, pointOpacity, pointRadius, points, pointsGroup, transitionDuration;
      isComparison || (isComparison = false);
      line = d3.svg.line().defined(function(d) {
        if (d) {
          return !_.isNaN(d[0]) && !_.isNaN(d[1]);
        }
      }).x(function(d) {
        return x(d[0]);
      }).y(function(d) {
        return y(d[1]);
      });
      lines = this.svg.selectAll('.countries').data(dataset);
      country = lines.enter().append('g').attr('class', 'country');
      legendAttr = "data-legend" + (isComparison ? '-comparison' : void 0);
      legendColorAttr = 'data-legend-color';
      country.append('path').attr('class', 'line').attr('d', function(d) {
        return line(d.values);
      }).attr(legendAttr, function(d) {
        return d.name;
      }).attr(legendColorAttr, function(d) {
        return color(d.name);
      }).style('stroke', function(d) {
        return color(d.name);
      }).style('stroke-dasharray', isComparison ? '5, 5' : null);
      pointRadius = 5.2;
      transitionDuration = 1000;
      pointOpacity = 0.4;
      pointsGroup = this.svg.append('g');
      points = country.selectAll('.data-point').data(function(d) {
        var filtered;
        filtered = _.filter(d.values, function(data) {
          return !_.isNaN(data[0]) && !_.isNaN(data[1]);
        });
        _(filtered).each(function(f) {
          return f.push(d.name);
        });
        return filtered;
      });
      points.enter().append('circle').attr('class', 'data-point').style('opacity', pointOpacity).attr('cx', function(d) {
        return x(d[0]);
      }).attr('cy', function(d) {
        return y(d[1]);
      }).attr('r', function() {
        return pointRadius;
      }).attr('title', function(d) {
        return d[2];
      }).attr('data-toggle', 'popover').attr('data-content', function(d) {
        return "X: " + (parseFloat(d[0], 10).round2()) + " <br /> Y: " + (parseFloat(d[1], 10).round2());
      }).style('fill', function(d, i) {
        return color(d[2]);
      }).on('mouseover', function(d) {
        var $node;
        $node = $(this);
        $node.popover('show');
        return d3.select(this).transition().duration(250).style('opacity', 1);
      }).on('mouseout', function(d) {
        var $node;
        $node = $(this);
        $node.popover('hide');
        return d3.select(this).transition().duration(250).style('opacity', pointOpacity);
      });
      if (points[0] && points[0][0] && (points[0][0].raphaelNode != null)) {
        return _.each(points, function(pointGroup) {
          return _.each(pointGroup, function(point) {
            var $rNode, content, title;
            content = point.domNode['data-content'];
            title = point.domNode['title'];
            $rNode = $("[raphaelid='" + point.raphaelNode.id + "']");
            return $rNode.addClass('data-point').attr('title', title).attr('data-content', content).attr('data-toggle', 'popover');
          });
        });
      }
    };

    LineChartBuilder.prototype.drawChart = function(data, comparison) {
      this.drawAxes(data, comparison);
      this.drawLines(data, this.x, this.y0, this.color);
      if (comparison) {
        this.drawLines(comparison, this.x, this.y1, this.colorAlt, true);
      }
      this.drawLegend();
      return this.drawTitle();
    };

    LineChartBuilder.prototype.drawAxes = function(data, comparison) {
      this.drawXAxis();
      this.drawYAxis();
      if (comparison) {
        return this.drawYAxis(true);
      }
    };

    LineChartBuilder.prototype.drawXAxis = function() {
      return this.svg.append('g').attr('class', 'x axis').attr('transform', "translate(0, " + this.innerHeight + ")").call(this.xAxis);
    };

    LineChartBuilder.prototype.drawYAxis = function(isSecond) {
      var label, labelContent, labelContentText, translation, xPosition, yPosition;
      isSecond || (isSecond = false);
      xPosition = 0;
      if (isSecond) {
        yPosition = this.opts.yLabelComparisonOffset || this.margin.right / 8;
        label = this.opts.yLabelComparison;
      } else {
        yPosition = 0 - this.opts.yLabelOffset;
        label = this.opts.yLabel;
      }
      translation = isSecond ? "translate(" + this.innerWidth + ", 0)" : null;
      labelContentText = _.str.words(label, ", ")[0];
      if (_.str.words(label, ", ")[1]) {
        labelContentText += ',';
      }
      labelContent = this.svg.append('g').attr('class', 'y axis').call(isSecond ? this.yAxisRight : this.yAxisLeft).attr('transform', translation).append('text').attr('transform', "rotate(-90)translate(" + xPosition + ", " + yPosition + ")").style('text-anchor', 'middle').attr('class', 'chart-label chart-label-y-axis');
      labelContent.append('tspan').attr('x', '-160').attr('y', isSecond ? '3.2em' : '-4.2em').text();
      return labelContent.append('tspan').attr('x', '-160').attr('y', isSecond ? '4.4em' : '-3.0em').text(_.str.words(label, ", ")[1]);
    };

    LineChartBuilder.prototype.buildData = function() {
      var countries, data, dataLabels, datasets, datasetsComparison, parseData;
      _.each(this.data, function(data) {
        return _.map(data.data, function(d) {
          return d.country = data.country;
        });
      });
      dataLabels = _.compact(_.pluck(this.data, 'country'));
      if (!dataLabels) {
        dataLabels = _.compact(_.pluck(this.data, 'name'));
      }
      datasets = _.compact(_.flatten(_.pluck(this.data, 'data')));
      datasetsComparison = _.compact(_.flatten(_.pluck(this.data, 'dataComparison')));
      datasets = _.flatten(datasets);
      countries = _.uniq(_.pluck(datasets, 'country'));
      data = _.groupBy(datasets, function(data) {
        return data.country;
      });
      parseData = function(datasets) {
        data = void 0;
        if (datasets && datasets.length) {
          data = {};
          _(datasets).each(function(d) {
            if (data[d.country]) {
              return data[d.country].push([d.xValue, d.yValue]);
            } else {
              return data[d.country] = [[d.xValue, d.yValue]];
            }
          });
        }
        return data;
      };
      return [parseData(datasets), parseData(datasetsComparison)];
    };

    return LineChartBuilder;

  })(ChartBuilder);

}).call(this);

(function() {
  var TimeScaleLineChartBuilder,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TimeScaleLineChartBuilder = (function(_super) {
    __extends(TimeScaleLineChartBuilder, _super);

    function TimeScaleLineChartBuilder() {
      return TimeScaleLineChartBuilder.__super__.constructor.apply(this, arguments);
    }

    TimeScaleLineChartBuilder.prototype.buildChart = function() {
      var allData, data, dataComparison, hasData;
      allData = _.compact(this.buildData());
      data = allData[0];
      if (allData[1] && allData[1].length) {
        dataComparison = allData[1];
      }
      hasData = data && !!data.length;
      if (dataComparison) {
        hasData = hasData && !!dataComparison.length;
      }
      if (!hasData) {
        this.displayNotice('This dataset cannot be rendered.', 'There is insufficient data for this chart.');
        return;
      }
      _(allData.length).times((function(_this) {
        return function(i) {
          var colors;
          colors = _this.countryColors;
          if (allData[i].length) {
            return _this._setColorScale(colors, allData[i]);
          }
        };
      })(this));
      this.x = d3.time.scale().range([0, this.innerWidth]);
      this.y0 = d3.scale.linear().range([this.innerHeight, 0]);
      this.y1 = d3.scale.linear().range([this.innerHeight, 0]);
      this.xAxis = this.createAxis('x', this.x, 'bottom');
      this.yAxisLeft = this.createAxis('y0', this.y0, 'left', {
        size: {
          major: 0 - this.innerWidth,
          minor: 0 - this.innerWidth,
          end: 0 - this.innerWidth
        }
      });
      this.yAxisRight = this.createAxis('y1', this.y1, 'right');
      this.x.domain([this.findMin(data, 'date', false), this.findMax(data, 'date', false)]);
      this.setDomain(this.y0, this.findMin(data), this.findMax(data));
      if (dataComparison) {
        this.setDomain(this.y1, this.findMin(dataComparison), this.findMax(dataComparison));
      }
      setTimeout(function() {
        return $('.data-point').popover({
          container: 'body',
          html: true,
          trigger: 'manual',
          placement: 'top'
        }, 10);
      });
      return this.drawChart(data, dataComparison);
    };

    TimeScaleLineChartBuilder.prototype.findMin = function(data, key, shouldRound) {
      var min;
      if (key == null) {
        key = 'datum';
      }
      if (shouldRound == null) {
        shouldRound = true;
      }
      min = d3.min(data, function(d) {
        return d3.min(d.values, function(v) {
          return v[key];
        });
      });
      return min;
    };

    TimeScaleLineChartBuilder.prototype.findMax = function(data, key, shouldRound) {
      var max;
      if (key == null) {
        key = 'datum';
      }
      if (shouldRound == null) {
        shouldRound = true;
      }
      max = d3.max(data, function(d) {
        return d3.max(d.values, function(v) {
          return v[key];
        });
      });
      return max;
    };

    TimeScaleLineChartBuilder.prototype.drawLines = function(dataset, x, y, color, isComparison) {
      var country, format, legendAttr, legendColorAttr, line, lines, pointOpacity, pointRadius, points, pointsGroup, transitionDuration, translation;
      isComparison || (isComparison = false);
      format = d3.format('n');
      line = d3.svg.line().x(function(d) {
        return x(d.date);
      }).y(function(d) {
        return y(d.datum);
      });
      lines = this.svg.selectAll('.countries').data(dataset);
      country = lines.enter().append('g').attr('class', 'country');
      legendAttr = 'data-legend';
      legendColorAttr = 'data-legend-color';
      if (isComparison) {
        legendAttr += '-comparison';
      }
      country.append('path').attr('class', 'line').attr('d', function(d) {
        return line(d.values);
      }).attr(legendAttr, function(d) {
        return d.key;
      }).attr(legendColorAttr, function(d) {
        return color(d.key);
      }).style('stroke', function(d) {
        return color(d.key);
      }).style('stroke-dasharray', isComparison ? '5, 5' : null);
      pointRadius = 5.2;
      transitionDuration = 1000;
      pointOpacity = 0.4;
      pointsGroup = this.svg.append('g');
      points = country.selectAll('.data-point').data(function(d) {
        var filtered;
        filtered = _.filter(d.values, function(v) {
          return !_.isNaN(v.datum);
        });
        return filtered;
      });
      points.enter().append('circle').attr('class', 'data-point').style('opacity', pointOpacity).attr('cx', function(d) {
        return x(d.date);
      }).attr('cy', function(d) {
        return y(d.datum);
      }).attr('r', function() {
        return pointRadius;
      }).attr('title', function(d) {
        return d.country;
      }).attr('data-toggle', 'popover').attr('data-content', function(d) {
        return "<strong style=\"color: " + (color(d.country)) + "\"> " + (format(parseFloat(d.datum, 10).round2())) + " #</strong> " + (d.date.getFullYear());
      }).style('fill', function(d, i) {
        return color(d.country);
      }).on('mouseover', function(d) {
        var $node;
        $node = $(this);
        $node.popover('show');
        return d3.select(this).transition().duration(250).style('opacity', 1);
      }).on('mouseout', function(d) {
        var $node;
        $node = $(this);
        $node.popover('hide');
        return d3.select(this).transition().duration(250).style('opacity', pointOpacity);
      });
      if (this.opts.labelLines === true && !this.opts.dualY) {
        translation = "translate(" + (x(d.value.date)) + ", " + (y(d.value.datum)) + ")";
        return country.append('text').datum(function(d) {
          return {
            name: d.name,
            value: d.values[d.values.length - 1]
          };
        }).attr('transform', function(d) {
          return translation;
        }).attr('y', 5).attr('x', 10).text(function(d) {
          return d.name;
        });
      }
    };

    TimeScaleLineChartBuilder.prototype._nestData = function(data, isComparison, primaryData) {
      var dataset, datasets, maxYear, minYear;
      isComparison || (isComparison = false);
      if (primaryData) {
        minYear = this.findMin(primaryData, 'date');
        minYear = new Date(minYear).getFullYear();
        maxYear = this.findMax(primaryData, 'date');
        maxYear = new Date(maxYear).getFullYear();
      }
      dataset = isComparison ? 'dataComparison' : 'data';
      datasets = _.chain(data).pluck(dataset).compact().value();
      if ((datasets != null) && datasets.length) {
        datasets = _.chain(datasets).flatten().map(function(d) {
          return {
            country: d.country,
            datum: +d.value,
            date: new Date(d.year, 0, 1)
          };
        }).value();
        datasets = _.reject(datasets, function(d) {
          return _.isNaN(d.datum);
        });
        if ((maxYear != null) && (minYear != null)) {
          datasets = _.reject(datasets, function(d) {
            var date;
            date = new Date(d.date).getFullYear();
            return date < minYear || date > maxYear;
          });
        }
        return d3.nest().key(function(d) {
          return d.country;
        }).entries(datasets);
      } else {
        return null;
      }
    };

    TimeScaleLineChartBuilder.prototype.buildData = function() {
      var parsedData, parsedDataComparison;
      _.each(this.data, function(data) {
        return _.map(data.data, function(d) {
          return d.country = data.country;
        });
      });
      parsedData = this._nestData(this.data, false);
      if (this.opts.dualY) {
        parsedDataComparison = this._nestData(this.data, true, parsedData);
      }
      return [parsedData, parsedDataComparison];
    };

    return TimeScaleLineChartBuilder;

  })(LineChartBuilder);

}).call(this);
