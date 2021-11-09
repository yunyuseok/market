const { Model, DataTypes } = require("sequelize");

module.exports = class Image extends Model {
  static init(sequelize) {
    return super.init(
      {
        filename: {
          type: DataTypes.STRING(200),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,

        underscored: false,

        timestamps: true,
        paranoid: true,

        modelName: "Image",
        tableName: "images",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Image.belongsTo(db.Board);
  }
};
