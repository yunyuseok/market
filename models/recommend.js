const { Model, DataTypes } = require("sequelize");

module.exports = class Recommend extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,

        underscored: false,

        createdAt: true,
        updatedAt: false,
        paranoid: false,

        modelName: "Recommend",
        tableName: "recommends",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Recommend.belongsTo(db.User);
    db.Recommend.belongsTo(db.Board);
  }
};
