/*globals requirejs, window*/
(function() {
  'use strict';

  var specFiles = null;
  var baseUrl = '';
  var requirejsCallback = null;

  // if invoked in karma-runner environment
  if (typeof window !== 'undefined' && window.__karma__ !== undefined) {
    // Karma serves files from '/base'
    baseUrl = '/base';
    requirejsCallback = window.__karma__.start;

    // Looking for *_spec.coffee files
    specFiles = [];
    var file;
    for (file in window.__karma__.files) {
      if (window.__karma__.files.hasOwnProperty(file)) {
        if (/_spec\.js/.test(file)) {
          specFiles.push(file);
        }
      }
    }
  }

  requirejs.config({
    baseUrl: baseUrl,
    paths: {
      'd3'               : 'bower_components/d3/d3',
      'underscore'       : 'bower_components/underscore/underscore',
      'chart'            : 'src/chart_builder',
      'line_chart'       : 'src/line_chart_builder',
      'time_scale_chart' : 'src/time_scale_line_chart',
      'bar_chart'       : 'src/bar_chart_builder'
    },

    shim : {
      'chart' : {
        exports : 'D3Fakebook',
        deps : [
          'd3',
          'underscore'
        ]
      },
      'line_chart' : {
        exports : 'D3Fakebook.LineChart',
        deps : [
          'd3',
          'underscore',
          'chart'
        ]
      },
      'time_scale_chart' : {
        exports : 'D3Fakebook.TimeScaleLineChart',
        deps : [
          'd3',
          'underscore',
          'line_chart'
        ]
      },
      'bar_chart' : {
        exports : 'D3Fakebook.BarChart',
        deps : [
          'd3',
          'underscore',
          'chart'
        ]
      }
    },

    // ask Require.js to load these files (all our tests)
    deps : specFiles,

    callback : requirejsCallback
  });
}());
