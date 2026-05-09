import cron from "node-cron";
import { Op } from "sequelize";
import User from "../models/User";
import Expense from "../models/Expense";
import emailService from "./email.service";

/**
 * Compute balances for a given user (same logic as balance.controller)
 */
const computeBalancesForUser = async (userId) => {
  const balances = {};

  // Expenses created by this user
  const createdExpenses = await Expense.findAll({
    where: { createdBy: userId },
    include: [
      { model: User, as: "members", attributes: ["id", "name", "email"] },
    ],
  });

  for (const expense of createdExpenses) {
    const members = expense.members;
    if (!members.length) continue;

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
      balances[member.id].balance += sharePerMember;
    }
  }

  // Expenses where this user is a member
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
    balances[creatorId].balance -= sharePerMember;
  }

  return Object.values(balances).map((b) => ({
    ...b,
    balance: Math.round(b.balance * 100) / 100,
  }));
};

const cronService = {
  init: async () => {
    // Run on the 1st of every month at 9:00 AM
    cron.schedule("0 9 1 * *", async () => {
      console.log("[CRON] Starting monthly balance report...");

      try {
        const users = await User.findAll();

        for (const user of users) {
          const balances = await computeBalancesForUser(user.id);
          await emailService.sendBalanceReport(
            { id: user.id, name: user.name, email: user.email },
            balances
          );
        }

        console.log("[CRON] Monthly balance report completed.");
      } catch (error) {
        console.log("[CRON] Error during monthly report:", error.message);
      }
    });

    console.log("[CRON] Cron service initialized (monthly report on 1st at 9:00 AM)");
  },
};

export default cronService;
