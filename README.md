d3-fakebook
===========

NOTICE
======

This project is no longer maintained. If you're interested in contributing (or possibly taking it over), please contact [the current maintainers](mailto:opensource@mobomo.com) and let them know.

-----

A useful collection of scripts to get you working with D3, quickly.

Read the [docs](https://github.com/intridea/d3-fakebook/wiki) for more information on how to use the API.

Basic usage:

    <!-- in index.html -->
    <div id="stocks"></div>

    // in main.js
    // From the D3 Basic Line Chart example: http://bl.ocks.org/mbostock/3883245
    d3.tsv('./data/aapl_stock.tsv', function(error, data) {
      if (error) {
        console.error(error);
      } else {
        var chart = new D3Fakebook.TimeScaleLine('#stocks', {
          data : data,
          valueName : 'close',
          showPoints : false
        });
        chart.render();
      }
    });
    
## Styles

Until [this issue](https://github.com/intridea/d3-fakebook/issues/15) is resolved, it's recommended that you pull in the styles found in the [demo page CSS](https://github.com/intridea/d3-fakebook/blob/65ede2ff2830788f400b93bf3e4587011668285e/examples/d3-fakebook.css), which contains some very basic (but important) styles for the charts.

## Installation

### Bower

    $ bower install d3-fakebook

This will install D3 Fakebook as well as both D3 and Underscore to a bower_components directory.

### Build files

The production-ready files are stored in the [dist](./dist) directory.

Alternately, the coffeescript files in the [src](./src) directory can be added to your coffeescript project. However, keep in mind that ([currently](https://github.com/intridea/d3-fakebook/issues/10)) these aren't proper modules, and the specific chart-types are dependent on the [core](./src/core.coffee) file, which is in turn dependent on the [legend](./src/legend.coffee) file.

## Dependencies

This project depends on [D3](http://d3js.org) (3.4.2 or newer) and [Underscore](http://underscorejs.org) ([Lo-Dash](http://lodash.com/) should also work, though it hasn't been tested). Copies of each are included in the `dist` directory.

## Development

You'll need to get your environment set up and working in order to work with the codebase. This project depends on node and npm, and through that it also depends on bower. Assuming you have node (and npm) installed, do the following:

    $ npm install && bower install

This will download and install the packages that you need in order to work with the codebase.

## PRs and Patches

Please be sure to include test cases for any patches that are submitted.

### Gulp

We're using [Gulp](http://gulpjs.com/) as the build tool and task runner for this project.

The default task will compile the coffeescript files and start a filewatcher. The files in the `example` directory will load this compiled code as well as D3 and Underscore (via Bower).

The available tasks are:

* build - compiles the CoffeeScript files (currently jsut an alias for `coffee`)
* test - runs the test suite once and exits
* autotest - watches for file changes and re-runs the tests
* watch - watches file changes and will reload pages within the directory
* coffee - compiles the CoffeeScript files, linting them as it does so
* clean - removes the `dist` directory.

### Testing

The test suite is built up with Mocha, using Chai and Sinon, using Karma as a test runner. All of the files in the test suite are loaded via Require.js (to help with isolation) and are compiled from CoffeeScript on the fly.

## "Fakebook"?

The concept of a 'fake book' comes from Jazz improvisation - the intent was to provide a roadmap for the playing of Jazz standards, and then the musicians would improvise on top of the main melody, making the song their own.
