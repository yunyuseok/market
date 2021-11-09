const { Model, DataTypes } = require("sequelize");

module.exports = class Board extends Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING(1000),
          allowNull: false,
        },
        kind: {
          type: DataTypes.ENUM("sell", "review"),
          allowNull: false,
          defaultValue: "sell",
        },
      },
      {
        sequelize,

        underscored: false,

        timestamps: true,
        paranoid: true,

        modelName: "Board",
        tableName: "boards",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Board.hasMany(db.Image);
    db.Board.hasMany(db.Recommend);
    db.Board.hasMany(db.Comment);

    db.Board.belongsTo(db.User);
    db.Board.belongsTo(db.Product);
  }
};
