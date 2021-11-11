const router = require("express").Router();
const { Board, User, Product, sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const middle = require("./middleware");

router.get("/", middle.isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      include: [
        {
          model: Board,
          where: { UserId: req.user.id },
          attributes: ["title", "createdAt", "kind"],
          required: false,
        },
        {
          model: Product,
          where: { UserId: req.user.id },
          attributes: ["name", "price", "count"],
          required: false,
        },
      ],
      where: { id: req.user.id },
      attributes: ["id", "nick", "email", "address", "seller", "money"],
      order: [["createdAt", "ASC"]],
    });
    const sellLog = await sequelize.query(
      `
      SELECT p.name, u.nick, p.price, s.count, s.createdAt 
      FROM sellog s 
      LEFT JOIN products p ON s.productId = p.id
      LEFT JOIN users u ON u.id = p.UserId
      WHERE s.buyerId = ${req.user.id};
    `,
      { type: QueryTypes.SELECT }
    );
    console.log(sellLog);
    res.render("mypage", {
      title: "Market 마이페이지",
      user,
      sellLog,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/nickAmend", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { nickValue } = req.body;
    const findNickUser = await User.findOne({
      where: { nick: nickValue },
    });
    if (findNickUser) {
      res.send("fail");
      return;
    }
    await User.update({ nick: nickValue }, { where: { id: req.user.id } });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/addressAmend", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { addressValue } = req.body;
    await User.update(
      { address: addressValue },
      { where: { id: req.user.id } }
    );
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/sellerRegister", middle.isLoggedIn, async (req, res, next) => {
  try {
    await User.update({ seller: "yes" }, { where: { id: req.user.id } });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/addmoney", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { addMoney } = req.body;
    const userMoney = await User.findOne({
      where: { id: req.user.id },
      attributes: ["money"],
    });
    await User.update(
      { money: userMoney.money + parseInt(addMoney) },
      { where: { id: req.user.id } }
    );
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/sellerCancel", middle.isLoggedIn, async (req, res, next) => {
  try {
    await User.update({ seller: "no" }, { where: { id: req.user.id } });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/addProduct", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { name, price, count } = req.body;
    await Product.create({
      name,
      price,
      count,
      UserId: req.user.id,
    });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/productDelete", middle.isLoggedIn, async (req, res, next) => {
  try {
    const { text } = req.body;
    const textValues = text.replace(/ /g, "").split("/");
    const name = textValues[0];
    const price = textValues[1].replace(/[^0-9]/g, "");
    //const count = textValues[2].replace(/[^0-9]/g, "");
    await Product.destroy({
      where: {
        UserId: req.user.id,
        name,
        price,
      },
    });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
