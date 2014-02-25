(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D3Fakebook.BarChartBuilder = (function(_super) {
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
        return key !== 'date' && key !== 'values';
      });
      this.x0.domain(data.map(function(d) {
        return d.date;
      }));
      this.x1.domain(categories).rangeRoundBands([0, this.x0.rangeBand()]);
      this.y.domain([minVal, maxVal]);
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
      var data, dates, values;
      data = this.data;
      dates = _.keys(data);
      values = _.values(data);
      _(dates).each(function(date) {
        data[date].values = [];
        return _(data[date]).each(function(v, k) {
          var obj;
          if (!(k === 'date' || k === 'values' || _(v).isNaN())) {
            obj = {
              name: k,
              value: +v,
              date: +data[date].date
            };
            if (k === 'World') {
              return data[date].values.unshift(obj);
            } else {
              return data[date].values.push(obj);
            }
          }
        });
      });
      return data;
    };

    BarChartBuilder.prototype.drawChart = function(data) {
      this.drawAxes();
      this.drawBars(data);
      return this.drawTitle();
    };

    BarChartBuilder.prototype.drawBars = function(data) {
      var date, format;
      format = function(val) {
        var formatter, value;
        formatter = d3.format('n');
        value = formatter(val);
        if (value === '-0') {
          value = '0';
        }
        return value;
      };
      date = this.svg.selectAll('.date').data(data).enter().append('g').attr('class', 'g').attr('transform', (function(_this) {
        return function(d) {
          return 'translate(' + _this.x0(d.date) + ',0)';
        };
      })(this));
      return date.selectAll('rect').data(function(d) {
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
          return "<strong style=\"color: " + (_this.color(d.name)) + ";\"> " + (format(_this.utils.round2(d.value))) + " #</strong> " + d.date;
        };
      })(this));
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
      return labelContent.append('tspan').attr('x', '-160').attr('y', '-4.2em').text("" + this.opts.yLabel);
    };

    return BarChartBuilder;

  })(D3Fakebook.Chart);

  'use strict';

  window.D3Fakebook = {};

  D3Fakebook.Chart = (function() {
    function Chart(el, opts) {
      var error, _base, _defaultDimensions, _margin;
      if (opts == null) {
        opts = {};
      }
      if (!el) {
        error = new Error('Fakebook Chart requires a node selector');
        error.name = 'ArgumentError';
        throw error;
      }
      this.opts = opts;
      (_base = this.opts).valueName || (_base.valueName = 'value');
      this.el = d3.select(el)[0][0];
      this.$el = d3.select(this.el);
      this.title = opts.title;
      if (_.isUndefined(this.opts.showPoints)) {
        this.opts.showPoints = true;
      }
      this.chartColors = this.opts.colors || ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
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
        height: window.innerHeight < 480 ? 500 : this.el.offsetHeight,
        width: window.innerWidth < 480 ? 900 : this.el.offsetWidth
      };
      this.dimensions = _.extend(_defaultDimensions, this.opts.dimensions);
      delete this.opts.dimensions;
      this.innerWidth = this.dimensions.width - this.margin.left - this.margin.right;
      this.innerHeight = this.dimensions.height - this.margin.top - this.margin.bottom;
    }

    Chart.prototype.render = function() {
      this.createContainer();
      return this.buildChart();
    };

    Chart.prototype._setColorScale = function(colors, data) {
      var chartColors, colorScale, values;
      chartColors = _.clone(colors);
      if (data) {
        if (_.isArray(data)) {
          values = d3.values(data[0]);
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
      colorScale = d3.scale.category20();
      if (this.color != null) {
        return this.colorAlt = colorScale;
      } else {
        return this.color = colorScale;
      }
    };

    Chart.prototype.setTickFormat = function(axis) {
      return axis.tickFormat((function(_this) {
        return function(d) {
          return _this.formatValues(d);
        };
      })(this));
    };

    Chart.prototype.formatValues = function(datum) {
      var format, formatted, number;
      number = d3.round(datum, 5);
      format = d3.format(',s');
      formatted = format(number);
      if (formatted === '-0') {
        formatted = '0';
      }
      return formatted;
    };

    Chart.prototype.displayNotice = function(heading, message) {
      return this.el.innerHTML = "<div class=\"chart-notice\"> <h4 class=\"chart-notice-title\">" + heading + "</h4> <p class=\"chart-notice-content\">" + message + "</p></div>";
    };

    Chart.prototype.createContainer = function() {
      var boxHeight, boxWidth;
      boxHeight = this.dimensions.height + (this.title ? 40 : 0);
      boxWidth = this.dimensions.width;
      return this.svg = d3.select(this.el).append('svg').attr('width', this.dimensions.width).attr('height', this.dimensions.height + (this.title ? 40 : 0)).attr('viewBox', "0 0 " + boxWidth + " " + boxHeight).attr('perserveaspectratio', 'xMinYMid').append('g').attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
    };

    Chart.prototype.getTitle = function() {
      return this.title;
    };

    Chart.prototype._getLegendVerticalOffset = function(showLabels) {
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

    Chart.prototype.drawLegend = function(labels) {
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
        primaryLabel = primaryLabelText;
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

    Chart.prototype.drawTitle = function() {
      return this.svg.append('text').attr('x', (this.dimensions.width - this.margin.left - this.margin.right) / 2).attr('y', 0 - (this.margin.top / 2)).attr('text-anchor', 'middle').attr('class', 'chart-title').text((function(_this) {
        return function() {
          var title;
          title = _this.getTitle();
          if (title) {
            return title;
          } else {
            return null;
          }
        };
      })(this));
    };

    Chart.prototype.utils = {
      round2: function(num) {
        num = parseFloat(num, 10);
        +num.toFixed(2).replace(/\.00$/, '');
        return num;
      }
    };

    return Chart;

  })();

  'use strict';

  D3Fakebook.LineChart = (function(_super) {
    __extends(LineChart, _super);

    function LineChart() {
      return LineChart.__super__.constructor.apply(this, arguments);
    }

    LineChart.prototype.setDomain = function(axis, min, max) {
      if (!(min < 0 || min > 10)) {
        min = 0;
      }
      return axis.domain([min, max]);
    };

    LineChart.prototype.createAxis = function(plane, scale, position, ticks) {
      var axis, _ticks;
      _ticks = {
        count: 10,
        padding: 10,
        size: null
      };
      ticks = _.extend(_ticks, ticks || {});
      axis = void 0;
      if (plane === 'x') {
        axis = d3.svg.axis().scale(scale).innerTickSize(10).outerTickSize(10).orient(position);
      } else if (plane.match(/^y/)) {
        axis = d3.svg.axis().scale(scale).orient(position).ticks(ticks.count).innerTickSize(ticks.size).outerTickSize(ticks.size).tickPadding(ticks.padding);
        this.setTickFormat(axis);
      }
      return axis;
    };

    LineChart.prototype.drawChart = function(data, comparison) {
      this.drawAxes(data, comparison);
      this.drawLines(data, this.x, this.y0, this.color);
      if (comparison) {
        this.drawLines(comparison, this.x, this.y1, this.colorAlt, true);
      }
      return this.drawTitle();
    };

    LineChart.prototype.drawAxes = function(data, comparison) {
      this.drawXAxis();
      this.drawYAxis();
      if (comparison) {
        return this.drawYAxis(true);
      }
    };

    LineChart.prototype.drawXAxis = function() {
      return this.svg.append('g').attr('class', 'x axis').attr('transform', "translate(0, " + this.innerHeight + ")").call(this.xAxis);
    };

    LineChart.prototype.drawYAxis = function(isSecond) {
      var axis, label, labelContent, labelContentText, offset, translation, xPosition, y, yPosition;
      isSecond || (isSecond = false);
      y = isSecond ? this.y1 : this.y0;
      xPosition = 0;
      if (isSecond) {
        yPosition = this.opts.yLabelComparisonOffset || (this.innerWidth - this.margin.right / 8);
        label = this.opts.yLabelComparison;
      } else {
        if (this.opts.yLabelOffset != null) {
          offset = this.opts.yLabelOffset;
        } else {
          offset = this.margin.left / 8;
        }
        yPosition = 0 - offset;
        label = this.opts.yLabel;
      }
      translation = isSecond ? "translate(" + this.innerWidth + ", 0)" : null;
      labelContentText = label;
      axis = this.svg.append('g').attr('class', "y axis" + (isSecond ? ' comparison' : ''));
      axis.call(isSecond ? this.yAxisRight : this.yAxisLeft).selectAll('.tick').data(y.ticks(10), function(d) {
        return d;
      }).exit().classed('minor', true).attr('transform', translation);
      labelContent = axis.append('text').attr('transform', "rotate(-90)translate(" + xPosition + ", " + yPosition + ")").style('text-anchor', 'middle').attr('class', 'chart-label chart-label-y-axis');
      labelContent.append('tspan').attr('x', '-160').attr('y', isSecond ? '3.2em' : '-4.2em').text();
      return labelContent.append('tspan').attr('x', '-160').attr('y', isSecond ? '4.4em' : '-3.0em').text(label);
    };

    return LineChart;

  })(D3Fakebook.Chart);

  'use strict';

  D3Fakebook.TimeScaleLineChart = (function(_super) {
    __extends(TimeScaleLineChart, _super);

    function TimeScaleLineChart() {
      return TimeScaleLineChart.__super__.constructor.apply(this, arguments);
    }

    TimeScaleLineChart.prototype.buildChart = function() {
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
          colors = _this.chartColors;
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
        size: 0 - this.innerWidth
      });
      this.yAxisRight = this.createAxis('y1', this.y1, 'right', {
        size: this.innerWidth
      });
      this.x.domain([this.findMin(data, 'date', false), this.findMax(data, 'date', false)]);
      this.setDomain(this.y0, this.findMin(data), this.findMax(data));
      if (dataComparison) {
        this.setDomain(this.y1, this.findMin(dataComparison), this.findMax(dataComparison));
      }
      return this.drawChart(data, dataComparison);
    };

    TimeScaleLineChart.prototype.findMin = function(data, key, shouldRound) {
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

    TimeScaleLineChart.prototype.findMax = function(data, key, shouldRound) {
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

    TimeScaleLineChart.prototype.drawLegend = function() {};

    TimeScaleLineChart.prototype.drawLines = function(dataset, x, y, color, isComparison) {
      var format, legendAttr, legendColorAttr, line, lines, pointOpacity, pointRadius, points, pointsGroup, series, transitionDuration, translation;
      isComparison || (isComparison = false);
      format = d3.format('n');
      line = d3.svg.line().x(function(d) {
        return x(d.date);
      }).y(function(d) {
        return y(d.datum);
      });
      lines = this.svg.selectAll('.dataset').data(dataset);
      series = lines.enter().append('g').attr('class', 'series');
      legendAttr = 'data-legend';
      legendColorAttr = 'data-legend-color';
      if (isComparison) {
        legendAttr += '-comparison';
      }
      series.append('path').attr('class', 'line').attr('d', function(d) {
        return line(d.values);
      }).attr(legendAttr, function(d) {
        return d.key;
      }).attr(legendColorAttr, function(d) {
        return color(d.key);
      }).style('stroke', function(d) {
        return color(d.key);
      }).style('stroke-dasharray', isComparison ? '5, 5' : null);
      if (this.opts.showPoints) {
        pointRadius = 5.2;
        transitionDuration = 1000;
        pointOpacity = 0.4;
        pointsGroup = this.svg.append('g');
        points = series.selectAll('.data-point').data(function(d) {
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
          return "" + (d.date.getFullYear()) + " - " + d.datum;
        }).style('fill', function(d, i) {
          return color(d.country);
        }).on('mouseover', function(d) {
          return d3.select(this).transition().duration(250).style('opacity', 1);
        }).on('mouseout', function(d) {
          return d3.select(this).transition().duration(250).style('opacity', pointOpacity);
        });
      }
      if (this.opts.labelLines === true && !this.opts.dualY) {
        translation = "translate(" + (x(d.value.date)) + ", " + (y(d.value.datum)) + ")";
        return series.append('text').datum(function(d) {
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

    TimeScaleLineChart.prototype._nestData = function(data, isComparison, primaryData) {
      var dataset, datasets, maxdate, mindate, primaryKey;
      isComparison || (isComparison = false);
      primaryKey = this.opts.valueName;
      if (primaryData) {
        mindate = this.findMin(primaryData, 'date');
        mindate = new Date(mindate).getFullYear();
        maxdate = this.findMax(primaryData, 'date');
        maxdate = new Date(maxdate).getFullYear();
      }
      dataset = isComparison ? 'dataComparison' : 'data';
      datasets = _.chain(data).pluck(dataset).compact().value();
      if ((datasets != null) && datasets.length) {
        primaryKey = this.opts.valueName;
        datasets = _.chain(datasets).flatten().map(function(d) {
          var dataAttrs;
          dataAttrs = {
            datum: +d.value,
            date: new Date(d.date, 0, 1)
          };
          dataAttrs[primaryKey] = d[primaryKey];
          return dataAttrs;
        }).value();
        datasets = _.reject(datasets, function(d) {
          return _.isNaN(d.datum);
        });
        if ((maxdate != null) && (mindate != null)) {
          datasets = _.reject(datasets, function(d) {
            var date;
            date = new Date(d.date, 0, 1).getFullYear();
            return date < mindate || date > maxdate;
          });
        }
        return d3.nest().key(function(d) {
          return d[primaryKey];
        }).entries(datasets);
      } else {
        dataset = [];
        _.each(data, function(d) {
          var props;
          props = {
            datum: +d[primaryKey],
            date: new Date(d.date)
          };
          return dataset.push(props);
        });
        return d3.nest().key(function(d) {
          return d[primaryKey];
        }).entries(dataset);
      }
    };

    TimeScaleLineChart.prototype.buildData = function() {
      var dateRegex, parsedData, parsedDataComparison, primaryKey;
      primaryKey = this.opts.valueName;
      dateRegex = new RegExp(/\d{4}/);
      _.each(this.data, function(data) {
        if (data.data) {
          return _.map(data.data, function(d) {
            return d[primaryKey] = data[primaryKey];
          });
        } else if (data.dataComparison) {
          return _.map(data.dataComparison, function(d) {
            return d[primaryKey] = data[primaryKey];
          });
        } else {
          return _.map(data, function(v, k) {
            var date;
            if (k === 'date') {
              if (dateRegex.test(v)) {
                date = new Date(v, 0, 1);
              } else {
                date = new Date(v);
              }
              return data[k] = date;
            } else {
              return data[k] = +v;
            }
          });
        }
      });
      parsedData = this._nestData(this.data, false);
      if (this.opts.dualY) {
        parsedDataComparison = this._nestData(this.data, true, parsedData);
      }
      return [parsedData, parsedDataComparison];
    };

    return TimeScaleLineChart;

  })(D3Fakebook.LineChart);

}).call(this);
