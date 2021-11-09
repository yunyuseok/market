const router = require("express").Router();
const { User, Board, Image, Product } = require("../models");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const middle = require("./middleware");
const recommendRouter = require("./recommend");
const commentRouter = require("./comment");
const productRouter = require("./product");

// 파일 생성
try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("no find file.");
  fs.mkdirSync("uploads");
}

function makeStorage() {
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname); //확장자
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  });
}

const upload = multer({
  storage: makeStorage(),
  limits: 30 * 1024 * 1024, //30mb
});

// 게시글 수정
router.get("/update/:boardId", middle.isLoggedIn, async (req, res, next) => {
  try {
    const board = await Board.findOne({
      include: {
        model: User,
        attributes: ["id", "nick", "seller"],
      },
      where: { id: req.params.boardId },
    });
    const products = await Product.findAll({
      where: { UserId: req.user.id },
      attributes: ["name", "price", "count"],
    });
    const images = await Image.findAll({
      where: { BoardId: req.params.boardId },
      attributes: ["filename"],
    });

    res.render("boardWrite", {
      title: "Market 게시글 쓰기",
      board,
      images,
      products,
    });
    //imgs,
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 게시글 삭제
router.delete("/:boardId/delete", middle.isLoggedIn, async (req, res, next) => {
  try {
    await Board.destroy({
      where: { id: req.params.boardId },
    });
    // 해당 게시글 이미지도 삭제
    await Image.destroy({
      where: { BoardId: req.params.boardId },
    });
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 이미지 올리기
router.post("/img", middle.isLoggedIn, upload.array("img"), (req, res) => {
  let filesData = {};
  for (let i = 0; i < req.files.length; ++i) {
    filesData["url" + i] = `/img/${req.files[i].filename}`;
  }
  console.log("파일 데이터 : ", filesData);
  res.json(filesData);
});

// 게시글 등록
router.post("/", middle.isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    let product = null;
    let board = null;
    if (req.body.boardKind === "sell") {
      product = req.body.product;
    }
    if (product) {
      const textValues = product.split(" ");
      console.log(textValues);
      const name = textValues[0];
      const price = textValues[1];
      //const count = textValues[2];

      const findProduct = await Product.findOne({
        where: {
          UserId: req.user.id,
          name,
          price,
          //count,
        },
        attributes: ["id"],
      });
      board = await Board.upsert({
        id: req.body.boardId,
        title: req.body.boardTitle,
        kind: req.body.boardKind,
        content: req.body.boardContent,
        UserId: req.user.id,
        ProductId: findProduct.id,
      });
    } else {
      board = await Board.upsert({
        id: req.body.boardId,
        title: req.body.boardTitle,
        kind: req.body.boardKind,
        content: req.body.boardContent,
        UserId: req.user.id,
        ProductId: null,
      });
    }

    // 현재 게시글이 가진 이미지들 모두 가져옴.
    const imgs = await Image.findAll({
      where: { BoardId: board[0].id },
    });

    // 넘어온 url을 모두 배열에 넣음.
    const urlArr = [];
    for (let i = 0; i < req.body.urlCount; ++i) {
      urlArr.push(req.body[`url${i}`]);
    }

    const createImgUrl = async (urlArr) => {
      for (const url of urlArr) {
        await Image.create({
          filename: url,
          BoardId: board[0].id,
        });
      }
    };

    // 게시글에 등록된 이미지가 없었을 경우 이번에 온 이미지를 등록함.
    if (!imgs.length) {
      createImgUrl(urlArr);
    } else {
      // 이미지 있는 경우 db에서 지우고 등록
      Image.destroy({ where: { BoardId: board[0].id } });
      createImgUrl(urlArr);
      console.log("이미지 : ", imgs);
      // 파일 지우기
      imgs.forEach((img, index) => {
        const fileName = img.filename.split("/")[2];
        console.log("파일 지우는 파일 : ", fileName);
        fs.unlink("uploads/" + fileName, (err) => {
          if (err) {
            console.error(err, "파일 삭제 에러");
          }
        });
      });
    }

    res.redirect("/mainForum");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 추천 관련
router.use("/", recommendRouter);
// 댓글 관련
router.use("/", commentRouter);
// 물건 관련
router.use("/", productRouter);

module.exports = router;
