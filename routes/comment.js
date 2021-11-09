const router = require("express").Router();
const { Comment } = require("../models");
const middle = require("./middleware");

// 댓글 등록
router.post("/comment", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { boardId, commentContent } = req.body;
    const { count } = await Comment.findAndCountAll({
      where: { BoardId: boardId },
    });
    await Comment.create({
      content: commentContent,
      order: count,
      UserId: req.user.id,
      BoardId: boardId,
    });
    res.redirect(`/board/${boardId}`);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 대댓글 등록
router.post("/commentReply", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { boardId, commentContent, parent, target } = req.body;
    // 같은 부모를 가진 얘들 숫자
    const { count } = await Comment.findAndCountAll({
      where: { parent },
    });
    await Comment.create({
      content: commentContent,
      parent,
      target,
      order: count,
      UserId: req.user.id,
      BoardId: boardId,
    });
    res.redirect(`/board/${boardId}`);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
