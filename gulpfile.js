const gulp = require('gulp');  // инициализация, подключение модуля
const concat = require('gulp-concat');
const gulpSass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');

const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const plumber = require('gulp-plumber');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const run = require('run-sequence');
const browserSync = require('browser-sync').create();

const cssFiles = [
    "./node_modules/normalize.css/normalize.css",
    "./src/css/some.css",
    "./src/css/other.css"];
const jsFiles = [
    "./src/js/style.js",
    "./src/js/other.js"];

/*Functions*/

function hello() {
    return console.log('hello');
}

function styles() {
   return gulp.src(cssFiles)
       .pipe(concat('style.css'))
       .pipe(autoprefixer({
           browsers: ['last 2 versions'],
           cascade: false
       }))
       .pipe(cleanCSS({level: 2}))
       .pipe(gulp.dest('./build/css/'))
       .pipe(browserSync.stream());
}

function sass() {
    return gulp.src("./src/scss/style.scss")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(gulpSass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream());
}

function scripts() {
    return gulp.src(jsFiles)
        .pipe(concat('script.js'))
        .pipe(uglify({toplevel: true}))
        .pipe(gulp.dest('./build/js/'))
        .pipe(browserSync.stream());
}
function html() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream());
}

function srcImg() {
    return gulp.src('./src/img/**/*.{png,jpg}')
        .pipe(gulp.dest('./build/img'))
        .pipe(browserSync.stream());
}
function images() {
    return gulp.src('./build/img/**/*.{png,jpg}')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 'medium'
            }),
            imagemin.optipng({optimizationLevel:3}),
            pngquant({quality: [0.65,0.70], speed: 5})
        ]))
        .pipe(gulp.dest('./build/img'));
}

function svg() {
    return gulp.src('./src/img/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty :true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode : true}
        }))
        .pipe(replace('&gt;','>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('./build/img'));
}

function watch(){

    browserSync.init({
            proxy: "verstka.land"
    });

    // gulp.watch('./src/css/**/*.css', styles);
    gulp.watch('./src/scss/**/*.scss',{usePolling: true}, sass);
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch('./src/img/**/*.{png,jpg,jpeg}', srcImg);
    gulp.watch('./src/img/**/*.{svg}', svg);
    // gulp.watch('./*.php').on('change', browserSync.reload);
    gulp.watch('./src/*.html', {usePolling: true}, html);
}

function clean(){
    return del(['build/*']);
}

/*Task*/

gulp.task('styles', styles);
gulp.task('sass', sass);
gulp.task('scripts', scripts);
gulp.task('srcImg', srcImg);
gulp.task('svg', svg);
gulp.task('images', images);
gulp.task('watch', watch);

gulp.task('build', gulp.series(clean, gulp.parallel(styles,scripts)) );
gulp.task('dev', gulp.series('build', 'watch') );

gulp.task('copy', function () {
    return gulp.src([
        './src/img/**',
        './src/js/**',
        './src/css/**',
    ])
        .pipe(gulp.dest('./build'));

});

function defaultTask(cb) {
    cb();
    // console.log('hello');
}
exports.default = watch;