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
