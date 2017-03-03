var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gulpSequence = require('gulp-sequence');

gulp.task('autoprefix', function () {
    return gulp.src('dev/css/*.css')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dev/css'));
});
gulp.task('minifyhtml', function() {
    return gulp.src('dev/templates/*.html')
        .pipe(htmlmin({collapseWhitespace: false}))
        .pipe(gulp.dest('www/templates'))
});
gulp.task('minifycss', function() {
    return gulp.src('dev/css/*.css')
        .pipe(minifyCSS({
            keepBreaks:true,
            keepSpecialComments:0
        }))
        .pipe(gulp.dest('www/dist/css'));
});

gulp.task('concat', function() {
    return gulp.src(['dev/js/*.js','!dev/js/all.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dev/js'));
});

gulp.task('jsmin', function () {
    gulp.src('dev/js/all.js')
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('www/dist/js'));
});

gulp.task('default', function(cb) {
    gulpSequence(['autoprefix','concat','minifyhtml'], 'minifycss', 'jsmin',cb);
});
// gulp.task('default', function(){
//     gulp.run('autoprefix', 'minifycss', 'concat','jsmin');
//
//     // 监听文件变化
//     // gulp.watch(['dev/js/*.js','dev/css/*.css'], function(){
//     //     gulp.run('autoprefix', 'minify-css', 'concat','jsmin');
//     // });
// });