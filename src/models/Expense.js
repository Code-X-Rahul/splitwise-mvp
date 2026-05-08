import Sequelize, { Model } from "sequelize";

class Expense extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: "INR",
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
    this.belongsToMany(models.User, {
      through: "ExpenseMembers",
      foreignKey: "expenseId",
      as: "members",
    });
  }
}

export default Expense;
