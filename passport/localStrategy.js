const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const findUser = await User.findOne({ where: { email } });
          if (findUser) {
            const result = await bcrypt.compare(password, findUser.password);
            if (result) {
              done(null, findUser);
            } else {
              done(null, false, { message: "비밀번호가 틀렸습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않은 아이디입니다." });
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
