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
