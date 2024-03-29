'use strict';

const gulp = require("gulp");

const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const rename = require("gulp-rename"); // Переименование файлов
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');

const path = {
    dist: {
        // html:  'dist/',
        js:    'dist/js/',
        css:   'dist/css/',
        img:   'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html:  '*.html',
        js:    'src/js/*.js',
        style: 'src/sass/*.scss',
        img:   'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        // html:  '*.html',
        js:    'src/js/**/*.js',
        style: 'src/sass/**/*.scss',
        img:   'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// Объединение и сжатие JS-файлов
gulp.task("scripts", function() {
    return gulp.src(path.src.js) // "src/js/*.js"
        .pipe(plumber())
        .pipe(concat('scripts.js'))
        .pipe(uglify()) // вызов плагина uglify - сжатие кода
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.js));
});

gulp.task("scripts-dev", function() {
    return gulp.src(path.src.js) // "src/js/*.js"
        .pipe(plumber())
        .pipe(concat('scripts.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.js));
});

// Копирование файлов HTML в папку dist
// gulp.task("html", function() {
//     return gulp.src(path.src.html)
//         .pipe(plumber())
//         .pipe(rename({ suffix: '.out' }))
//
//         .pipe(gulp.dest(path.dist.html));
// });


gulp.task('img', function() {
    gulp.src(path.src.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist.img))
});


// Объединение, компиляция Sass в CSS, простановка венд. префиксов и дальнейшая минимизация кода
gulp.task("sass", function() {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(concat('styles.scss'))
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', sass.logError))
        //.pipe(sourcemaps.write('.'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.css))
});

gulp.task("sass-dev", function() {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(concat('styles.scss'))
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', sass.logError))

        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.css))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Задача слежения за измененными файлами
gulp.task("watch", ['browserSync'], function() {
     // gulp.watch("./*.html", ["html"]);
    gulp.watch("src/js/*.js", ["scripts-dev"]);
    gulp.watch("src/sass/*.scss", ["sass-dev"]);
    gulp.watch("src/img/*.*", ["img"]);
    gulp.watch('src/**/*.*').on('change', browserSync.reload);
});

gulp.task('browserSync', function () {
    let files = [
        './*.html',
        'css/**/*.css',
        'js/**/*.js',
        'sass/**/*.scss'
    ];

    browserSync.init(files, {
        server: {
            baseDir: "./",
            index: "index.html"
        }
    });
});

const del = require('del');

gulp.task('clean', function() {
    del.sync('dist');
});


gulp.task("dev", ["sass-dev", "scripts-dev", "watch", "img"]); // sass-dev

gulp.task("build", ["clean", "sass", "scripts", "img"]);
