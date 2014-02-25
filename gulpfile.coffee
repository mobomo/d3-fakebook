'use strict'

gulp         = require 'gulp'
gutil        = require 'gulp-util'
clean        = require 'gulp-clean'
coffee       = require 'gulp-coffee'
concat       = require 'gulp-concat'
karma        = require 'gulp-karma'
lint         = require 'gulp-coffeelint'
rename       = require 'gulp-rename'
uglify       = require 'gulp-uglify'
livereload   = require 'gulp-livereload'

paths  =
  scripts: ['./src/*.coffee']
  dist: './dist'

gulp.task 'default', ['coffee', 'watch']

gulp.task 'lint', ->
  return gulp.src(paths.scripts)
      .pipe(lint())
      .pipe(lint.reporter())

gulp.task 'clean', ->
  return gulp.src(paths.dist, {read: false}).pipe clean()

gulp.task 'build', ['coffee'], ->
  return gulp.src(['./bower_components/d3/d3.min.js', './bower_components/underscore/underscore.js'])
    .pipe(gulp.dest paths.dist)

gulp.task 'coffee', ->
  # Minify and package up all JS files
  return gulp.src(['./src/core.coffee', './src/*.coffee'])
    .pipe(lint())
    .pipe(lint.reporter())
    .pipe(concat('d3-fakebook.coffee'))
    .pipe(coffee().on('error', gutil.log))
    .pipe(gulp.dest paths.dist)
    .pipe(rename {suffix: '.min'})
    .pipe(uglify())
    .pipe(gulp.dest paths.dist)
    .pipe(livereload())

gulp.task 'watch', ->
  server = livereload()

  gulp.watch paths.scripts, ['coffee']
  gulp.watch("#{paths.dist}/**").on 'change', (file) ->
    server.changed file.path

gulp.task 'autotest', ->
  # pass in a non-existent file to the gulp pipe because the karma plugin
  # doesn't currently play well with requirejs, and karma is properly
  # configured in the karma.conf and test/main files.
  # See: https://github.com/lazd/gulp-karma/issues/7
  gulp.src('noop')
    .pipe karma
      configFile : 'karma.conf.coffee'
      action     : 'watch'

gulp.task 'test', ->
  # pass in a non-existent file to the gulp pipe because the karma plugin
  # doesn't currently play well with requirejs, and karma is properly
  # configured in the karma.conf and test/main files.
  # See: https://github.com/lazd/gulp-karma/issues/7
  return gulp.src('noop')
    .pipe karma
      configFile : 'karma.conf.coffee'
      action     : 'run'
