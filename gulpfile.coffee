'use strict'

gulp   = require 'gulp'
gutil  = require 'gulp-util'
clean  = require 'gulp-clean'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
lint   = require 'gulp-coffeelint'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'

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
  return gulp.src(["#{paths.dist}/*.js", "!#{paths.dist}/*.min.js"])
    .pipe(concat 'd3-fakebook.js')
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
    .pipe(gulp.dest paths.dist)
    .pipe(rename {suffix: '.min'})
    .pipe(uglify())
    .pipe(gulp.dest paths.dist)

gulp.task 'watch', ->
  gulp.watch paths.scripts, ['coffee']
