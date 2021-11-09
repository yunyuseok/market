const { Model, DataTypes } = require("sequelize");

module.exports = class Product extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(40),
          allowNull: false,
        },
        price: {
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

        modelName: "Product",
        tableName: "products",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Product.belongsTo(db.User);
  }
};
