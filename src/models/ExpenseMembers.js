import Sequelize, { Model } from "sequelize";

class ExpenseMembers extends Model {
  static init(sequelize) {
    super.init(
      {
        expenseId: Sequelize.INTEGER,
        userId: Sequelize.INTEGER,
      },
      {
        sequelize,
        timestamps: true,
        tableName: "ExpenseMembers",
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Expense, { foreignKey: "expenseId" });
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

export default ExpenseMembers;
