/* global require Buffer */
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var saveLicense = require('uglify-save-license');
var pkg = require('./package.json');
var concat = require('gulp-concat');
var less = require('gulp-less');

var DIST = './dist';
var SRC = './src';
var NAME = pkg.name;
var VERSION = process.env.VERSION || 'local-dev';

gulp.task('qext', function () {
  var qext = {
    name: 'Button for navigation',
    type: 'visualization',
    description: pkg.description + '\nVersion: ' + VERSION,
    version: VERSION,
    icon: 'align-object-center',
    preview: 'qlik-button-for-navigation.png',
    keywords: pkg.keywords,
    author: pkg.author,
    homepage: pkg.homepage,
    license: pkg.license,
    repository: '',
    dependencies: {
      'qlik-sense': '>=5.5.x'
    }
  };
  if (pkg.contributors) {
    qext.contributors = pkg.contributors;
  }
  var src = require('stream').Readable({
    objectMode: true
  });
  src._read = function () {
    this.push(new gutil.File({
      cwd: '',
      base: '',
      path: NAME + '.qext',
      contents: Buffer.from(JSON.stringify(qext, null, 4))
    }));
    this.push(null);
  };
  return src.pipe(gulp.dest(DIST));
});

gulp.task('less', function () {
  var LessPluginAutoPrefix = require('less-plugin-autoprefix');
  var autoprefix = new LessPluginAutoPrefix({
    browsers: ['last 2 versions']
  });
  return gulp.src(SRC + '/lib/less/main.less')
    .pipe(less({
      plugins: [autoprefix]
    }))
    .pipe(cssnano())
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(DIST + '/lib/css'));
});

gulp.task('clean', function (ready) {
  var del = require('del');
  del.sync([DIST]);
  ready();
});

gulp.task('build', ['clean', 'qext', 'less'], function () {
  gulp.src([
    SRC + '/**/*.ng.html',
    SRC + '/**/*.png',
    SRC + '/**/*.json',
  ])
    .pipe(gulp.dest(DIST));
  return gulp.src(SRC + '/**/*.js')
    .pipe(uglify({
      output: {
        comments: saveLicense
      }
    }))
    .pipe(gulp.dest(DIST));
});

gulp.task('zip', ['build'], function () {
  var zip = require('gulp-zip');

  return gulp.src(DIST + '/**/*')
    .pipe(zip(`${NAME}_${VERSION}.zip`))
    .pipe(gulp.dest(DIST));
});

gulp.task('default', ['build']);
