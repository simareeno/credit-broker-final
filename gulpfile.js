var gulp = require('gulp'),
	path = require('path'),
	autoPrefixer = require('autoprefixer'),
	minify = require('cssnano'),
	sourceMaps = require('gulp-sourcemaps'),
	pug = require('gulp-pug'),
	concat = require('gulp-concat'),
	less = require('gulp-less'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	babel = require("gulp-babel"),
	postCss = require('gulp-postcss'),
	watch = require('gulp-watch');
	gulpif = require('gulp-if');
	imagemin = require('gulp-imagemin');
	browserSync = require('browser-sync').create(),
	runSequence = require('run-sequence'),
	webpack = require('webpack-stream'),
	del = require('del'),
	join = path.join;

var DEST = 'out',
	SRC = 'src',
	TEMPLATES = join(SRC, 'templates'),
	STYLES = join(SRC, 'styles'),
	SCRIPTS = join(SRC, 'scripts');
	IMAGES = join(SRC, 'images');


gulp.task('less', function() {

	var processors = [
		autoPrefixer({browsers: ['last 2 versions']}),
		// minify()
	];

	return gulp.src(join(STYLES, 'main.less'))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: "LESS",
					message: err.message
				}
			})
		}))
		// .pipe(sourceMaps.init())
		.pipe(less())
		.pipe(postCss(processors))
		.pipe(concat('styles.css'))
		// .pipe(sourceMaps.write())
		.pipe(gulp.dest(join(DEST, 'styles')));
});


gulp.task('images', function(){
	return gulp.src(join(IMAGES, '**/*.+(png|jpg|jpeg|gif|svg)'))
	.pipe(imagemin())
	.pipe(gulp.dest(join(DEST, 'images')));
});


gulp.task('pug-index', function() {
	return gulp.src([join(TEMPLATES, '*.pug')])
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'pug-index',
					message: err.message
				}
			})
		}))
		.pipe(pug({
			compileDebug: false,
			pretty: true
		}))
		.pipe(gulp.dest(DEST));
});


gulp.task('js', function() {

	return gulp.src(join(SCRIPTS, 'app.js'))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: "JS",
					message: err.message
				}
			})
		}))
		.pipe(babel({
			presets: ["es2015"]
		}))
		.pipe(webpack({
			output: {
				filename: 'bundle.js',
			},
		}))
		.pipe(gulp.dest(join(DEST, 'scripts')));
});


gulp.task('clean:dist', function() {
	return del.sync(DEST);
});


gulp.task('pug-index:sync', ['pug-index'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('less:sync', ['less'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('js:sync', ['js'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: './out'
		},
	})
	gulp.watch(join(TEMPLATES, '**/*.pug'), ['pug-index:sync']);
	gulp.watch(join(STYLES, '**/*.less'), ['less:sync']);
	gulp.watch(join(SCRIPTS, '**/*.js'), ['js:sync']);
	gulp.watch(join(SRC, 'img/*'), ['images']);
})


gulp.task('watch', ['browserSync'], function() {
	gulp.watch(join(TEMPLATES, '**/*.pug'), ['pug-index']);
	gulp.watch(join(STYLES, '**/*.less'), ['less']);
	gulp.watch(join(SCRIPTS, '**/*.js'), ['js']);
	gulp.watch(join(SRC, 'img/*'), ['images']);
})


gulp.task('build', function (callback) {
	runSequence('clean:dist',
		['pug-index', 'less', 'js', 'images'],
		callback
	)
})
