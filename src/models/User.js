import Sequelize, { Model } from "sequelize";
import bcrypt from "bcryptjs";

class User extends Model {
	static init(sequelize) {
		super.init(
			{
				name: Sequelize.STRING,
				email: Sequelize.STRING,
				password: Sequelize.VIRTUAL, //When it is VIRTUAL it does not exist in the database
				password_hash: Sequelize.STRING,
				currency: {
					type: Sequelize.STRING,
					defaultValue: "INR",
				},
			},
			{
				sequelize,
				timestamps: true,
			},
		);

		this.addHook("beforeSave", async (user) => {
			if (user.password) {
				user.password_hash = await bcrypt.hash(user.password, 8);
			}
		});

		return this;
	}

	static associate(models) {
		this.hasMany(models.Expense, {
			foreignKey: "createdBy",
			as: "createdExpenses",
		});
		this.belongsToMany(models.Expense, {
			through: "ExpenseMembers",
			foreignKey: "userId",
			as: "expenses",
		});
	}

	checkPassword(password) {
		return bcrypt.compare(password, this.password_hash);
	}
}

export default User;
