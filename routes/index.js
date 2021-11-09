const express = require("express");
const middle = require("./middleware");
const { QueryTypes } = require("sequelize");
const { User, Board, Recommend, sequelize } = require("../models");

const router = express.Router();
const getBoardRouter = require("./getBoard");

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get("/", async (req, res, next) => {
  try {
    // 최신글 15개
    const mainBoard = await sequelize.query(
      `
    SELECT boards.id, boards.title, COUNT(c.BoardId) cCount
    FROM boards 
    LEFT JOIN comments c
    ON boards.id = c.BoardId
    GROUP BY boards.id
    ORDER BY boards.id DESC
    LIMIT 15;`,
      { type: QueryTypes.SELECT }
    );

    // 일주일동안 가장 많은 추천을 받은 게사글 10개
    // 최소 1개 이상의 추천이 있어야함.
    const recommendBoard = await sequelize.query(
      `
      SELECT b.id, b.title, COUNT(DISTINCT(r.UserId)) rCount, COUNT(DISTINCT(c.id)) cCount
      FROM boards b LEFT JOIN recommends r
      ON b.id = r.BoardId
      LEFT JOIN comments c
      ON b.id = c.BoardId
      WHERE DATE_FORMAT(b.createdAt,'%Y-%m-%d')
      BETWEEN DATE_SUB(CURDATE(), INTERVAL(DAYOFWEEK(CURDATE())- 1) DAY) 
      AND 	DATE_ADD(CURDATE(), INTERVAL(7 - DAYOFWEEK(CURDATE())) DAY)
      GROUP BY b.id
      HAVING rCount > 0
      ORDER BY rCount DESC
      LIMIT 10;`,
      { type: QueryTypes.SELECT }
    );

    // 최신 리뷰글
    const reviewBoard = await sequelize.query(
      `
    SELECT boards.id, boards.title, COUNT(c.BoardId) cCount
    FROM boards 
    LEFT JOIN comments c
    ON boards.id = c.BoardId
    WHERE boards.kind = 'review'
    GROUP BY boards.id
    ORDER BY boards.id DESC
    LIMIT 15;`,
      { type: QueryTypes.SELECT }
    );

    // 판매랭킹(판매 금액으로 순위를 정했음)
    const rankProduct = await sequelize.query(
      `
    SELECT p.name, s.productId, sum(s.count) countSum, p.price, sum(s.count) * p.price as total
    FROM sellog s LEFT JOIN products p
    ON s.productId = p.id
    WHERE DATE_FORMAT(s.createdAt,'%Y-%m-%d')
    BETWEEN DATE_SUB(CURDATE(), INTERVAL(DAYOFWEEK(CURDATE())- 1) DAY) 
    AND 	DATE_ADD(CURDATE(), INTERVAL(7 - DAYOFWEEK(CURDATE())) DAY)
    GROUP BY s.productId
    ORDER BY total DESC
    LIMIT 10;`,
      { type: QueryTypes.SELECT }
    );

    res.render("main", {
      title: "Market Main",
      mainBoard,
      recommendBoard,
      reviewBoard,
      rankProduct,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.use("/", getBoardRouter);

router.get("/login", middle.isNotLoggedIn, (req, res, next) => {
  res.render("login", {
    title: "Market login",
  });
});

router.get("/join", middle.isNotLoggedIn, (req, res, next) => {
  res.render("join", {
    title: "Market join",
  });
});

router.get("/mainForum", async (req, res, next) => {
  try {
    const boards = await Board.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
        {
          model: Recommend,
          attributes: ["id"],
        },
      ],
      attributes: ["id", "title", "kind", "createdAt"],
      order: [["id", "DESC"]],
      limit: 10,
      offset: 0,
    });

    const length = await sequelize.query(
      `SELECT COUNT(id) as length FROM market.boards WHERE deletedAt IS NULL;`,
      { type: QueryTypes.SELECT }
    );

    const arrayLength = Math.ceil(length[0].length / 10);
    const maxPage = Array.from({ length: arrayLength }, () => 0);
    const currentPage = 0;

    res.render("mainForum", {
      title: "Market - 메인게시판",
      boards,
      maxPage,
      currentPage,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 페이지네이션 처리
router.patch("/mainForum", async (req, res, next) => {
  try {
    const { selectPage } = req.body;
    const boards = await Board.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
        {
          model: Recommend,
          attributes: ["id"],
        },
      ],
      attributes: ["id", "title", "kind", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 10,
      offset: selectPage * 10,
    });

    const length = await sequelize.query(
      `SELECT COUNT(id) as length FROM boards WHERE deletedAt IS NULL;`,
      { type: QueryTypes.SELECT }
    );

    const arrayLength = Math.ceil(length[0].length / 10);
    const maxPage = Array.from({ length: arrayLength }, () => 0);
    const currentPage = selectPage;

    res.json({
      boards,
      maxPage,
      currentPage,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 검색
router.post("/search", async (req, res, next) => {
  try {
    const { searchAs } = req.body;
    const searchAsValue = `%${searchAs.trim()}%`;

    const boards = await sequelize.query(
      `
      SELECT 
      Board.id, Board.title, Board.kind, Board.createdAt, 
      User.id uId, User.nick uNick, 
      COUNT(Recommends.id) rCount
      FROM 
            (SELECT Board.id, Board.title, Board.kind, Board.createdAt, Board.ProductId, Board.UserId 
            FROM boards AS Board
            WHERE (
            Board.deletedAt IS NULL) 
            ORDER BY Board.id DESC) AS Board
                  
      LEFT OUTER JOIN users User 
      ON Board.UserId = User.id AND (User.deletedAt IS NULL)
      
      LEFT OUTER JOIN recommends Recommends 
      ON Board.id = Recommends.BoardId
      
      LEFT OUTER JOIN products product
      ON Board.ProductId = product.id AND (product.deletedAt IS NULL)
      
      WHERE (Board.title LIKE '${searchAsValue}') OR (product.name LIKE '${searchAsValue}')
      GROUP BY Board.id
      ORDER BY Board.id DESC
      LIMIT 10 OFFSET 0;
      `,
      { type: QueryTypes.SELECT }
    );

    const length = Math.ceil(boards.length / 10);
    const maxPage = Array.from({ length }, () => 0);
    const currentPage = 0;

    res.render("mainForumSearch", {
      title: `Market - Search${searchAs}`,
      boards,
      maxPage,
      currentPage,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
