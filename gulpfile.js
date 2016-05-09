var gulp = require('gulp'); // First step of setting up Gulp is requiring gulp
var sass = require('gulp-sass'); // Requires the gulp-sass plugin
var browserSync = require('browser-sync').create(); // Creates webserver using browserSync for live-reloading
var useref = require('gulp-useref'); // For concatenating any number of CSS & JS files into a single file
                                     // Does this by looking for a special comment in index.html

var uglify = require('gulp-uglify'); // For minifiying the JS files
var gulpIf = require('gulp-if');  // Ensures the minification is only on JS files

var cssnano = require('gulp-cssnano') // For minifying CSS files
var imagemin = require('gulp-imagemin'); // For optimizing images - works with png, jpg, fig, and svg
var cache = require('gulp-cache'); // For caching optimized images
var del = require('del'); // For cleaning up (deleting) unused files - do this because gulp is auto generating files
var runSequence = require('run-sequence'); // So we can run task 'del' FIRST, then re-build the other assets SECOND
var sourcemaps = require('gulp-sourcemaps');


// Tell browserSync where the root level of the server should be - "app" in this case...
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

// Task for Cleaning up unused files out of our dist
gulp.task('clean:dist', function() {
  return del.sync('dist');
});
// Task for Cleaning up cached files
gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
});

// Compile Sass to CSS
gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.{scss, sass}')
    .pipe(sourcemaps.init()) // Initializes sourcemaps
    .pipe(sass({
      errLogToConsole: true  // prevents gulp from stopping the terminal when an error occurs
      })) // Using gulp-sass
    .pipe(sourcemaps.write()) // Writes sourcemaps into the CSS file
    .pipe(gulp.dest('app/css'))
    // for browserSync to inject new CSS styles into the browser
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Task for Copying fonts over into dist
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// Task for concatenating CSS and JS files we indicated in the index.html
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JS file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

// Task for optimizing images
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('dist/images'))
});

gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'], callback)
});

// Task to Watch for file changes across multiple files
      // the array belowe are tasks that need to be completed before "watch" is allowed to run
gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Task to Build for production
gulp.task('build', function (callback) {
  runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback)
});
