const { Model, DataTypes } = require("sequelize");

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: DataTypes.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        seller: {
          type: DataTypes.ENUM("no", "yes"),
          allowNull: false,
          defaultValue: "no",
        },
        money: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        provider: {
          type: DataTypes.STRING(10),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,

        underscored: false,

        timestamps: true,
        paranoid: true,

        modelName: "User",
        tableName: "users",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Board);
    db.User.hasMany(db.Comment);
    db.User.hasMany(db.Recommend);
    db.User.hasMany(db.Product);
  }
};
