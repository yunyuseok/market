const router = require("express").Router();
const {
  User,
  Board,
  Image,
  Recommend,
  Product,
  sequelize,
} = require("../models");
const { QueryTypes } = require("sequelize");
const middle = require("./middleware");

// 게시글쓰기
router.get("/boardWrite", middle.isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: {
        model: Product,
        attributes: ["id", "name", "price", "count"],
        order: [["createdAt", "ASC"]],
      },
      attributes: ["id", "nick", "seller"],
    });
    res.render("boardWrite", {
      title: "Market 게시글 쓰기",
      user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 특정 게시물 불러오기
router.get("/board/:id", async (req, res, next) => {
  try {
    const board = await Board.findOne({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
        {
          model: Recommend,
          attributes: ["id"],
        },
        {
          model: Product,
          attributes: ["name", "price", "count"],
        },
      ],
      where: { id: req.params.id },
      attributes: [
        "id",
        "title",
        "content",
        "createdAt",
        "updatedAt",
        "kind",
        "UserId",
      ],
    });
    let userInfo = null;
    if (req.user) {
      userInfo = await User.findOne({
        where: { id: req.user.id },
        attributes: ["id", "nick", "money"],
      });
    }

    const images = await Image.findAll({
      where: { BoardId: req.params.id },
    });

    let recommend = null;
    if (req.user && req.user.id) {
      recommend = await Recommend.findOne({
        where: {
          BoardId: req.params.id,
          UserId: req.user.id,
        },
      });
    }

    const comments = await sequelize.query(
      `SELECT comments.id, comments.content, comments.parent, comments.order, 
          comments.updatedAt, comments.UserId, 
          users.nick, 
          t.nick as targetNick
          FROM comments LEFT JOIN users
          ON comments.UserId = users.id
          LEFT JOIN users t
          ON comments.target = t.id
          WHERE BoardId = ${req.params.id}
          ORDER BY comments.order ASC;`,
      { type: QueryTypes.SELECT }
    );

    res.render("board", {
      title: "Market 게시글",
      board,
      images,
      recommend,
      comments,
      userInfo,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
