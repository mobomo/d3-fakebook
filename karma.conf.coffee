# Karma configuration
# Generated on Fri Feb 21 2014 21:13:28 GMT-0800 (PST)

module.exports = (config) ->
  config.set

    # base path, that will be used to resolve files and exclude
    basePath: '',


    # frameworks to use
    frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],


    preprocessors: {
      '**/*.coffee' : ['coffee']
    },


    plugins: [
      'karma-coffee-preprocessor',
      'karma-mocha',
      'karma-chai',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher',
      'karma-requirejs',
      'karma-sinon'
    ],


    # list of files / patterns to load in the browser
    files: [
      {pattern: 'bower_components/**/*.js', included : false},
      'test/main.js',
      {pattern: 'src/**/*.coffee', included : false},
      {pattern: 'test/**/*.coffee', included : false}
    ],


    # list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    coffeePreprocessor : {
      options : {
        bare : true,
        sourceMap : true
      },
      glob_to_multiple : {
        expand : true,
        cwd : '.',
        src : [
          'src/**/*.coffee',
          'test/**/*.coffee'
        ],
        dest : '.',
        ext : '.js'
      }
    },


    # test results reporter to use
    # possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],


    # web server port
    port: 9877,


    # enable / disable colors in the output (reporters and logs)
    colors: true,


    # level of logging
    # possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    # Start these browsers, currently available:
    # - Chrome
    # - ChromeCanary
    # - Firefox
    # - Opera (has to be installed with `npm install karma-opera-launcher`)
    # - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    # - PhantomJS
    # - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    # If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    # Continuous Integration mode
    # if true, it capture browsers, run tests and exit
    singleRun: false
