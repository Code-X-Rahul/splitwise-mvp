import * as Yup from "yup";
import { Op } from "sequelize";
import moment from "moment";
import Expense from "../models/Expense";
import User from "../models/User";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../utils/ApiError";
import { successResponse } from "../utils/ApiResponse";

let expenseController = {
  // Create a new expense
  add: async (req, res, next) => {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        value: Yup.number().required().positive(),
        currency: Yup.string(),
        date: Yup.string().required(),
        members: Yup.array().of(Yup.number()),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      const { name, value, currency, date, members } = req.body;

      const expense = await Expense.create({
        name,
        value,
        currency,
        date,
        createdBy: req.userId,
      });

      if (members && members.length > 0) {
        const users = await User.findAll({ where: { id: members } });
        await expense.setMembers(users);
      }

      const result = await Expense.findByPk(expense.id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "members", attributes: ["id", "name", "email"] },
        ],
      });

      return successResponse(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  // Get all expenses created by the authenticated user
  get: async (req, res, next) => {
    try {
      const expenses = await Expense.findAll({
        where: { createdBy: req.userId },
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "members", attributes: ["id", "name", "email"] },
        ],
        order: [["date", "DESC"]],
      });

      return successResponse(res, expenses);
    } catch (error) {
      next(error);
    }
  },

  // Find a single expense by ID
  find: async (req, res, next) => {
    try {
      const { id } = req.params;
      const expense = await Expense.findByPk(id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "members", attributes: ["id", "name", "email"] },
        ],
      });

      if (!expense) throw new NotFoundError();

      return successResponse(res, expense);
    } catch (error) {
      next(error);
    }
  },

  // Update an expense
  update: async (req, res, next) => {
    try {
      const schema = Yup.object().shape({
        name: Yup.string(),
        value: Yup.number().positive(),
        currency: Yup.string(),
        date: Yup.string(),
        members: Yup.array().of(Yup.number()),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      const { id } = req.params;
      const expense = await Expense.findByPk(id);

      if (!expense) throw new NotFoundError();
      if (expense.createdBy !== req.userId)
        throw new BadRequestError("You can only update your own expenses");

      const { members, ...expenseData } = req.body;

      await expense.update(expenseData);

      if (members) {
        const users = await User.findAll({ where: { id: members } });
        await expense.setMembers(users);
      }

      const result = await Expense.findByPk(id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "members", attributes: ["id", "name", "email"] },
        ],
      });

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  // Delete an expense
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const expense = await Expense.findByPk(id);

      if (!expense) throw new NotFoundError();
      if (expense.createdBy !== req.userId)
        throw new BadRequestError("You can only delete your own expenses");

      await expense.destroy();

      return successResponse(res, { msg: "Deleted" });
    } catch (error) {
      next(error);
    }
  },

  // Activity log: all expenses where user is creator or member
  // Grouped by current month, last month, and optional custom date range
  activity: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
      const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");
      const lastMonthStart = moment()
        .subtract(1, "month")
        .startOf("month")
        .format("YYYY-MM-DD");
      const lastMonthEnd = moment()
        .subtract(1, "month")
        .endOf("month")
        .format("YYYY-MM-DD");

      // Helper: find all expenses where user is creator OR member within a date range
      const findExpensesInRange = async (from, to) => {
        // Expenses created by user in range
        const createdExpenses = await Expense.findAll({
          where: {
            createdBy: userId,
            date: { [Op.between]: [from, to] },
          },
          include: [
            { model: User, as: "creator", attributes: ["id", "name", "email"] },
            { model: User, as: "members", attributes: ["id", "name", "email"] },
          ],
          order: [["date", "DESC"]],
        });

        // Expenses where user is a member (but not creator) in range
        const memberExpenses = await Expense.findAll({
          where: {
            createdBy: { [Op.ne]: userId },
            date: { [Op.between]: [from, to] },
          },
          include: [
            { model: User, as: "creator", attributes: ["id", "name", "email"] },
            {
              model: User,
              as: "members",
              attributes: ["id", "name", "email"],
              where: { id: userId },
            },
          ],
          order: [["date", "DESC"]],
        });

        // Merge & deduplicate by ID
        const allMap = new Map();
        [...createdExpenses, ...memberExpenses].forEach((exp) => {
          allMap.set(exp.id, exp);
        });
        return Array.from(allMap.values()).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      };

      const result = {
        currentMonth: await findExpensesInRange(
          currentMonthStart,
          currentMonthEnd
        ),
        lastMonth: await findExpensesInRange(lastMonthStart, lastMonthEnd),
      };

      // Custom range if query params provided
      if (startDate && endDate) {
        result.custom = await findExpensesInRange(startDate, endDate);
      }

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  },
};

export default expenseController;
