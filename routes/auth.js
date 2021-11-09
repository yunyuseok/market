const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");

const middle = require("./middleware");

const { User } = require("../models");
const Op = require("sequelize").Op;

const router = express.Router();

router.post("/join", middle.isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password, address } = req.body;
  try {
    const findUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { nick }],
      },
    });
    if (findUser) {
      if (email === findUser.email) {
        return res.redirect("/join?error=email_Overrap");
      } else if (nick === findUser.nick) {
        return res.redirect("/join?error=nick_Overrap");
      }
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        nick,
        password: hash,
        address,
      });
      return res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", middle.isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/login?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 세션 쿠키를 브라우저로 보내준다.
      console.log("로그인");
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/kakao", middle.isNotLoggedIn, passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", middle.isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
