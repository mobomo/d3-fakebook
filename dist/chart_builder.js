(function() {
  define(['d3', 'underscore'], function(d3, _) {
    var Chart;
    Chart = (function() {
      function Chart(el, opts) {
        var error, _defaultDimensions, _margin;
        if (opts == null) {
          opts = {};
        }
        if (!el) {
          error = new Error('Fakebook Chart requires a DOM node');
          error.name = 'ArgumentError';
          throw error;
        }
        this.opts = opts;
        this.el = el;
        this.$el = d3.select(this.el);
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
          height: window.innerHeight < 480 ? 500 : this.el.offsetHeight,
          width: window.innerWidth < 480 ? 900 : this.el.offsetWidth
        };
        this.dimensions = _.extend(_defaultDimensions, this.opts.dimensions);
        delete this.opts.dimensions;
        this.innerWidth = this.dimensions.width - this.margin.left - this.margin.right;
        this.innerHeight = this.dimensions.height - this.margin.top - this.margin.bottom;
        this.createContainer();
      }

      Chart.prototype.chartColors = ['#e69545', '#5cb5dd', '#6272d3', '#5dc960', '#e645cd', '#a25cdd', '#dd5c5c'];

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
        colorScale = d3.scale.ordinal().range(chartColors);
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

      return Chart;

    })();
    return Chart;
  });

}).call(this);
