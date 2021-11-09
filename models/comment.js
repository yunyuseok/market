const { Model, DataTypes } = require("sequelize");

module.exports = class Comment extends Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: DataTypes.STRING(200),
          allowNull: false,
          unique: true,
        },
        parent: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        target: {
          // 대댓글의 대상 유저
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,

        underscored: false,

        timestamps: true,
        paranoid: true,

        modelName: "Comment",
        tableName: "comments",

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Board);
  }
};
