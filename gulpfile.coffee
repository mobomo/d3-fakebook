'use strict'

gulp   = require 'gulp'
gutil  = require 'gulp-util'
clean  = require 'gulp-clean'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
karma  = require 'gulp-karma'
lint   = require 'gulp-coffeelint'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'
rjs    = require 'gulp-requirejs'

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
  return gulp.src([
    "#{paths.dist}/*.js",
    "!#{paths.dist}/*.min.js",
    "!#{paths.dist}/*-amd.js",
    "!#{paths.dist}/*-amd.min.js"
  ]).pipe(concat 'd3-fakebook.js')
    .pipe(gulp.dest './')
    .pipe(rename {suffix: '.min'})
    .pipe(uglify())
    .pipe(gulp.dest './')

gulp.task 'coffee', ['clean'], ->
  # Minify and package up all JS files
  return gulp.src(paths.scripts)
    .pipe(lint())
    .pipe(lint.reporter())
    .pipe(coffee())
    .pipe(rename {suffix: '.min'})
    .pipe(gulp.dest paths.dist)
    .pipe(rename {suffix: '.min'})
    .pipe(uglify())
    .pipe(gulp.dest paths.dist)

gulp.task 'watch', ->
  gulp.watch paths.scripts, ['coffee']

gulp.task 'autotest', ->
  # pass in a non-existent file to the gulp pipe because the karma plugin
  # doesn't currently play well with requirejs, and karma is properly
  # configured in the karma.conf and test/main files.
  # See: https://github.com/lazd/gulp-karma/issues/7
  gulp.src('noop')
    .pipe karma
      configFile : 'karma.conf.js'
      action     : 'watch'

gulp.task 'test', ->
  # pass in a non-existent file to the gulp pipe because the karma plugin
  # doesn't currently play well with requirejs, and karma is properly
  # configured in the karma.conf and test/main files.
  # See: https://github.com/lazd/gulp-karma/issues/7
  return gulp.src('noop')
    .pipe karma
      configFile : 'karma.conf.js'
      action     : 'run'
