var gulp = require("gulp"),
    rename = require("gulp-rename"),
    less = require("gulp-less"),
    plumber = require("gulp-plumber"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    mqpacker = require("css-mqpacker"),
    minify = require("gulp-csso"),
    server = require("browser-sync"),
    imagemin = require("gulp-imagemin"),
    svgmin = require("gulp-svgmin"),
    svgstore = require("gulp-svgstore"),
    run = require("run-sequence"),
    del = require("del");

gulp.task("less", function() {
  gulp.src("less/main.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

//Сжимаем изображения
gulp.task("img-min", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

// Создаем спрайт SVG
gulp.task("sprite-svg", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

// Живой сервер для build
gulp.task("serve", function() {
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

gulp.task("build", ["serve"], function(fn) {
  run("clean", "copy", "less", "js-min", "img-min", "sprite-png", "sprite-svg", fn);
});
