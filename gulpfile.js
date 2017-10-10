// Gulp workflow

// Include gulp
var gulp = require('gulp');

// Include plugins
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var pump = require('pump');
var del = require('del');
var rename = require("gulp-rename");
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant')
var imageminJpegRecompress = require('imagemin-jpeg-recompress')
var cache = require('gulp-cached');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var notify = require("gulp-notify");
var concat = require("gulp-concat");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require("gulp-autoprefixer");
var minifyCSS = require("gulp-minify-css");
var zip = require("gulp-zip")

// Path variables
var IMAGES_PATH = 'img/**/*.{png,jpeg,jpg,svg,gif}';
var IMAGES_DEST = 'dist/img';
var DIST_PATH = 'dist';

// Compress images
 gulp.task('images', function() {
	console.log('Starting Images Task')
  	return gulp.src(IMAGES_PATH)
    .pipe(imagemin(
  	[
		imagemin.gifsicle(),
		imagemin.jpegtran(),
		imagemin.optipng(),
		imagemin.svgo(),
		imageminPngquant(),
		imageminJpegRecompress()
	]
  ))
    .pipe(gulp.dest(IMAGES_DEST))
	.pipe(notify({ title: "Gulp Recipes", message: "Image Optimize: Success", onLast: true }));
});


// Styles: Concat, List Errors, Minify, create Source Maps
gulp.task('styles', function() {
	console.log('Starting Styles Task')
	return gulp.src(['css/normalize.css', 'css/hamburger.css', 'css/flexslider.css', 'css/awwwards.css', 'css/animate.css', 'css/main.css'])
		.pipe(plumber(function (err){
			console.log('Styles Task Error');
			console.log(err);
			this.emit('end');
	}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(concat('styles.css'))
		.pipe(minifyCSS())
		.pipe(sourcemaps.write())
	    .pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest('dist'))
		.pipe(notify({ title: "Gulp Recipes", message: "Styles Task: Success!", onLast: true }));
});


// Scripts: Concat, List Errors, Minify, create Source Maps
gulp.task('scripts', function() {
	console.log('Starting Scripts Task')
	return gulp.src(['js/*.js', '!js/**/*.min.js', '!js/**/*-min.js'])
		.pipe(plumber(function (err){
			console.log('Scripts Task Error');
			console.log(err);
			this.emit('end');
	}))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest('dist'))
		.pipe(notify({ title: "Gulp Recipes", message: "Scripts Task: Success!", onLast: true }));
});


// Check all javascript files for errors
gulp.task('lint', function() {
  return gulp.src('./js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
	.pipe(notify({ message: "JShint: Finished", onLast: true }));
});


// Initiate BrowserSync, set up base directory, select Chrome browser
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
	  browser: "google chrome"
  })
});

// Export site to zipped file
gulp.task('export', function() { 
	return gulp.src(['./**', '!./{node_modules,node_modules/**}'])
		.pipe(zip('digworx_site.zip'))
		.pipe(gulp.dest('./'))
});


// Set up Watched files for BrowserSync
gulp.task('watch', ['browserSync'], function () {
  console.log('Starting Watch Tasks')
  // Reloads the browser whenever CSS files change
  gulp.watch('css/**/*.css', ['styles:reload']); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload); 
  gulp.watch('js/**/*.js', ['scripts:reload']);
  gulp.watch('img/**', ['images:reload']);
});

gulp.task('styles:reload', ['styles'], function () {
    browserSync.reload();
});

gulp.task('scripts:reload', ['scripts'], function() {
	browserSync.reload();
});

gulp.task('images:reload', ['images'], function() {
	browserSync.reload();
});



// Delete existing files in Dist folder before running Gulp tasks
gulp.task('clean:dist', function() {
  console.log('Starting Clean:Dist Task')
  return del.sync([
	  DIST_PATH
  ]);
});


// Production build task
gulp.task('default', function (callback) {
  runSequence('clean:dist', ['images', 'styles', 'scripts'], 'watch', callback)
});


// Default task
gulp.task('old', function (callback) {
  runSequence(['styles', 'browserSync', 'watch'],
    callback
  )
});





// Alternative gulp task runners below, not using runSequence, but instead running the tasks in brackets first.

// Default task
gulp.task('production-NA', ['clean:dist', 'images', 'styles', 'scripts'], function () {
  console.log('Starting default task')
});


// Default task
gulp.task('default-NA', ['clean', 'styles', 'scripts', 'watch'], function () {
  console.log('Starting default task')
});



// Concatenate and minify JS files
////gulp.task('useref', function(){
////  return gulp.src('index.html')
////    .pipe(useref())
////    // Minifies only if it's a JavaScript file
////    .pipe(gulpIf('*.js', uglify()))
////    // Minifies only if it's a CSS file
////    .pipe(gulpIf('*.css', cleanCSS({compatibility: '*'})))
////    .pipe(gulp.dest('dist'));
////});

