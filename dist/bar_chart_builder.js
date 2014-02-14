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
