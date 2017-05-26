"use strict";

let gulp = require("gulp");
let less = require("gulp-less");
let plumber = require("gulp-plumber");
let postcss = require("gulp-postcss");
let autoprefixer = require("autoprefixer");
let mqpacker = require("css-mqpacker"); //Сортировка медиавыражений
let minify = require("gulp-csso"); //Минификация scc
let minifyjs = require("gulp-js-minify"); //Минификация js
let concat = require("gulp-concat"); //Сборка js-файлов
let rename = require("gulp-rename"); //Переименовываем файлы
let imagemin = require("gulp-imagemin"); //Сжимаем изображения
let spritesmith = require("gulp.spritesmith"); //Спрайт png
let svgstore = require("gulp-svgstore"); //Спрайт svg
let svgmin = require("gulp-svgmin");  //Сжатие svg
let server = require("browser-sync").create();
let run = require("run-sequence");
let del = require("del"); //Очистка папки

//BUILD

// Очистка папки build (всегда висит)
gulp.task("clean", function() {
  return del("build");
});

// Копирование файлов для build
gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2,eot,ttf}",
      "img/**",
      "js/**",
      "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

// Копирование html-файлов для живого сервера build
gulp.task("html:copy", function() {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

// Сборка и минификация JS для build
gulp.task("js-min", function () {
  return gulp.src("build/js/**/*.js")
    .pipe(plumber())
    .pipe(concat("script.js"))
    .pipe(minifyjs())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"));
});

// Gulp-imagemin для build
gulp.task("img-min", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

// Png-спрайт для build
gulp.task("sprite-png", function() {
  return gulp.src("img/icons-png/*.png")
    .pipe(spritesmith({
      imgName: "sprite.png",
      cssName: "sprite.less"
     }))
    .pipe(gulp.dest("build/img"));
});

// Gulp-svgstore для build
gulp.task("sprite-svg", function() {
  return gulp.src("build/img/icons-svg/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});



// Gulp-less для build
gulp.task("less", function() {
  gulp.src("less/main.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

// Живой сервер для build
gulp.task("server-build", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("less/**/*.less", ["less"]);
  gulp.watch("js/**/*.js", ["js-min"]);
  gulp.watch("*.html", ["html:update"]);
});

gulp.task("build", ["server-build"], function(fn) {
  run("clean", "copy", "less", "js-min", "img-min", "sprite-png", "sprite-svg", fn);
});
