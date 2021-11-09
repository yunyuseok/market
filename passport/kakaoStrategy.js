const passport = require("passport");
const kakaoStrategy = require("passport-kakao").Strategy;
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");

const uuid = () => {
  const tokens = uuidv4().split("-");
  return tokens[0] + tokens[1] + tokens[2] + tokens[3] + tokens[4];
};

module.exports = () => {
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const findUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          // 이미 있는 아이디면 바로 로그인
          if (findUser) {
            done(null, findUser);
          } else {
            const findUserNick = await User.findOne({
              where: { nick: profile.displayName },
            });
            // 중복 닉네임이 있는 경우 uuid로 랜덤성이 보장된 닉네임을 정해준다.
            let nick = profile.displayName;
            if (findUserNick) {
              nick = uuid();
            }
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email,
              nick,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
