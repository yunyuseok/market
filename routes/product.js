const router = require("express").Router();
const { User, Product, Sellog } = require("../models");
const middle = require("./middleware");

// 물건 구매
router.put("/buyProduct", middle.isLoggedIn, async (req, res, next) => {
  try {
    const name = decodeURIComponent(req.body.name);
    const { writerId, price, count } = req.body;

    const findProduct = await Product.findOne({
      where: {
        UserId: writerId,
        name,
        price,
      },
      attributes: ["id", "count"],
    });

    // 물건을 못찾았을 때.
    if (!findProduct) {
      res.send("find Not Product");
      return;
    }

    const remaining = findProduct.count - count;
    // 수량이 부족한 경우
    if (remaining < 0) {
      res.send("product lack");
      return;
    }

    const findUser = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "money"],
    });

    const updateMoney = findUser.money - price * count;

    // 돈이 모자란 경우
    if (updateMoney < 0) {
      res.send("lack of money");
      return;
    }

    // 물건수량 수정
    findProduct.update({
      count: remaining,
    });
    // 유저 돈 수정
    findUser.update({
      money: updateMoney,
    });

    await Sellog.create({
      buyerId: findUser.id,
      productId: findProduct.id,
      count,
    });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
