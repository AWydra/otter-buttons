import gulp from "gulp";
import babel from "gulp-babel";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import clean from "gulp-clean-css";
import browserSync from "browser-sync";
import del from "del";
import connect from "gulp-connect-php";
import rename from "gulp-rename";

const sync = browserSync.create();
const reload = sync.reload;
const config = {
  paths: {
    src: {
      php: "./src/**/*.php",
      sass: "src/sass/style.scss"
    },
    dist: {
      main: "./dist",
      css: "./dist/css"
    }
  }
};

gulp.task("sassMin", () => {
  return gulp
    .src(config.paths.src.sass)
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"]
      })
    )
    .pipe(clean())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(config.paths.dist.css))
    .pipe(sync.stream());
});

gulp.task("sass", () => {
  return gulp
    .src(config.paths.src.sass)
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"]
      })
    )
    .pipe(gulp.dest(config.paths.dist.css))
    .pipe(sync.stream());
});

function refresh(done) {
  reload();
  done();
}

gulp.task(
  "static",
  gulp.series(function movePHP() {
    return gulp
      .src(config.paths.src.php)
      .pipe(gulp.dest(config.paths.dist.main));
  }, refresh)
);

gulp.task("clean", () => {
  return del([config.paths.dist.main]);
});

gulp.task("build", gulp.series(["clean", "sass", "sassMin", "static"]));

function server() {
  connect.server({}, function() {
    sync.init({
      injectChanges: true,
      proxy: "127.0.0.1/otter-buttons/dist"
    });
  });
}

gulp.task("default", gulp.series(["build"]));

gulp.task(
  "watch",
  gulp.series(["default"], function watch() {
    gulp.watch("src/sass/**/*.scss", gulp.series(["sass", "sassMin"]));
    gulp.watch(["src/**/*.php"], gulp.series(["static"]));
    return server();
  })
);
