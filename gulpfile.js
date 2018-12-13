var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	minifyhtml = require('gulp-minify-html');

var paths = {
	scripts: ['src/js/*.js','src/js/lib/*.js'],
    styles: ['src/css/*.css'],
    images: ['src/img/*'],
    content: ['src/index.html']
}
gulp.task('uglify', function(){
	return gulp.src(paths.scripts[0])
		.pipe(uglify()).on('error', function(e){
            console.log(e);
         })
		.pipe(gulp.dest('dist/js/'));
});
gulp.task('jsmove', function(){
	gulp.src(paths.scripts[1])
		.pipe(gulp.dest('dist/js/lib/'));
});
gulp.task('minifyCSS', function(){
	return gulp.src(paths.styles[0])
		.pipe(minifyCSS()).on('error', function(e){
            console.log(e);
         })
		.pipe(gulp.dest('dist/css/'));
});
gulp.task('imagemove', function(){
	gulp.src(paths.images[0])
		.pipe(gulp.dest('dist/img/'));
});
gulp.task('minifyhtml', function(){
	return gulp.src(paths.content[0])
		.pipe(minifyhtml()).on('error', function(e){
            console.log(e);
         })
		.pipe(gulp.dest('dist/'));
});
gulp.task('default', function() {
  // place code for your default task here
});
gulp.task("all",['uglify','jsmove','minifyCSS','imagemove','minifyhtml']);
