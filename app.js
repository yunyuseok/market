class Main {
  // private 변수 선언 구간
  #express = require("express");
  #path = require("path");

  #dotenv = require("dotenv");
  #dotenvConfig = this.#dotenv.config();
  #morgan = require("morgan");

  #cookieParser = require("cookie-parser");
  #session = require("express-session");

  #nunjucks = require("nunjucks");

  #passport = require("passport");
  #passportConfig = require("./passport/index");

  #sequelize = require("./models").sequelize;

  #app = this.#express();

  #indexRouter = require("./routes");
  #authRouter = require("./routes/auth");
  #boardRouter = require("./routes/board");
  #mypageRouter = require("./routes/mypage");

  // initialize
  init() {
    // app setting
    this.#app.set("port", process.env.PORT || 3000);
    this.#app.set("view engine", "html");
    this.#nunjucks.configure("views", {
      express: this.#app,
      watch: true,
    });

    // DB, passport 연결
    this.#sequelize
      .sync({ alter: false })
      .then(() => {
        console.log("mysql 연결 성공");
      })
      .catch((err) => {
        console.error(err);
      });
    this.#passportConfig();

    this.#app.use(this.#morgan("dev"));

    // file path init
    this.#app.use(this.#express.static(this.#path.join(__dirname, "public")));
    this.#app.use(
      "/img",
      this.#express.static(this.#path.join(__dirname, "uploads"))
    );

    // body-parser
    this.#app.use(this.#express.json());
    this.#app.use(this.#express.urlencoded({ extended: true }));

    // cookie && seession init
    this.#app.use(this.#cookieParser(process.env.COOKIE_SECRET));
    this.#app.use(
      this.#session({
        name: "marketCookie",
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: false,
        },
      })
    );

    // passport
    this.#app.use(this.#passport.initialize());
    this.#app.use(this.#passport.session());
  }

  serviceRouter() {
    this.#app.use("/", this.#indexRouter);
    this.#app.use("/auth", this.#authRouter);
    this.#app.use("/board", this.#boardRouter);
    this.#app.use("/mypage", this.#mypageRouter);
  }

  errorRouter() {
    // 404
    this.#app.use((req, res, next) => {
      const error = new Error(
        `${req.method} ${req.url} 경로가 존재하지 않습니다.`
      );
      error.status = 404;
      next(error);
    });

    //500
    this.#app.use((err, req, res, next) => {
      res.locals.message = err.message;
      res.locals.error = process.env.NODE_ENV != "production" ? err : {};
      res.status(err.status || 500);
      res.render("error");
    });
  }

  serverStart() {
    this.#app.listen(this.#app.get("port"), () => {
      console.log(`${this.#app.get("port")}번 포트에서 대기중입니다.`);
    });
  }
}

module.exports = new Main();
