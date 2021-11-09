const { Model, DataTypes } = require("sequelize");

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        buyerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        count: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,

        underscored: false,

        timestamps: true,
        paranoid: true,

        modelName: "Sellog",
        tableName: "sellog",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {}
};
