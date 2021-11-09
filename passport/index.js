const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const fideUser = await User.findOne({
        where: { id },
        attributes: ["id", "nick"],
      });
      done(null, fideUser);
    } catch (err) {
      console.error(err);
      done(err);
    }
  });

  local();
  kakao();
};
