import { Op } from "sequelize";
import Expense from "../models/Expense";
import User from "../models/User";
import { successResponse } from "../utils/ApiResponse";

let balanceController = {
	//calculate balanced for current user from all expenses
	// Positive balance = they owe you, Negative = you owe them
	getBalances: async (req, res, next) => {
		try {
			const userId = req.userId;
			const balances = {}; // { otherUserId: { userId, name, email, balance } }

			// expenses created by current user
			const createdExpenses = await Expense.findAll({
				where: { createdBy: userId },
				include: [
					{ model: User, as: "members", attributes: ["id", "name", "email"] },
				],
			});

			for (const expense of createdExpenses) {
				const members = expense.members;
				if (!members.length) continue;

				// Split equally among all members creator=paid, members=owe
				const sharePerMember = parseFloat(expense.value) / members.length;

				for (const member of members) {
					if (member.id === userId) continue;

					if (!balances[member.id]) {
						balances[member.id] = {
							userId: member.id,
							name: member.name,
							email: member.email,
							balance: 0,
						};
					}
					balances[member.id].balance += sharePerMember; // they owe you
				}
			}

			// Expenses where the current user is a member (they owe creator)
			const memberExpenses = await Expense.findAll({
				where: {
					createdBy: { [Op.ne]: userId },
				},
				include: [
					{
						model: User,
						as: "members",
						attributes: ["id", "name", "email"],
						where: { id: userId },
					},
					{
						model: User,
						as: "creator",
						attributes: ["id", "name", "email"],
					},
				],
			});

			for (const expense of memberExpenses) {
				const allMembers = await expense.getMembers();
				const totalMembers = allMembers.length;
				if (!totalMembers) continue;

				const sharePerMember = parseFloat(expense.value) / totalMembers;
				const creatorId = expense.creator.id;

				if (!balances[creatorId]) {
					balances[creatorId] = {
						userId: creatorId,
						name: expense.creator.name,
						email: expense.creator.email,
						balance: 0,
					};
				}
				balances[creatorId].balance -= sharePerMember; // you owe them
			}

			// Round balances to 2 decimal places
			const result = Object.values(balances).map((b) => ({
				...b,
				balance: Math.round(b.balance * 100) / 100,
			}));

			return successResponse(res, result);
		} catch (error) {
			next(error);
		}
	},
};

export default balanceController;
