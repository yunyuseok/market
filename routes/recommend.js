const router = require("express").Router();
const { Recommend } = require("../models");
const middle = require("./middleware");

// 추천
router.put("/:boardId/recommend", middle.isLoggedIn, async (req, res, next) => {
  try {
    const [recommend, created] = await Recommend.findOrCreate({
      where: {
        UserId: req.user.id,
        BoardId: req.params.boardId,
      },
      defaults: {
        UserId: req.user.id,
        BoardId: req.params.boardId,
      },
    });

    if (created) {
      res.send("success");
    } else {
      res.send("fail");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 추천 취소
router.delete(
  "/:boardId/recommendCancel",
  middle.isLoggedIn,
  async (req, res, next) => {
    try {
      await Recommend.destroy({
        where: {
          UserId: req.user.id,
          BoardId: req.params.boardId,
        },
      });
      res.send("success");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

module.exports = router;
