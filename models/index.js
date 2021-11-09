const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];

const User = require("./user");
const Board = require("./board");
const Image = require("./image");
const Recommend = require("./recommend");
const Comment = require("./comment");
const Product = require("./product");
const Sellog = require("./sellog");

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
db.User = User;
db.Board = Board;
db.Image = Image;
db.Recommend = Recommend;
db.Comment = Comment;
db.Product = Product;
db.Sellog = Sellog;

// 모델들 init 실행
Object.keys(db).forEach((modelName) => {
  if (db[modelName].init) {
    db[modelName].init(sequelize);
  }
});

// 모델들 associate 실행
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
