import * as Yup from "yup";
import User from "../models/User";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "../utils/ApiError";
import { successResponse } from "../utils/ApiResponse";

let userController = {
	add: async (req, res, next) => {
		try {
			const schema = Yup.object().shape({
				name: Yup.string().required(),
				email: Yup.string().email().required(),
				password: Yup.string().required().min(6),
				currency: Yup.string(),
			});

			if (!(await schema.isValid(req.body))) throw new ValidationError();

			const { email } = req.body;

			const userExists = await User.findOne({
				where: { email },
			});

			if (userExists) throw new BadRequestError();

			const user = await User.create(req.body);

			return successResponse(res, user, 201);
		} catch (error) {
			next(error);
		}
	},

	profile: async (req, res, next) => {
		try {
			const user = await User.findByPk(req.userId, {
				attributes: ["id", "name", "email", "currency", "createdAt"],
			});

			if (!user) throw new NotFoundError();

			return successResponse(res, user);
		} catch (error) {
			next(error);
		}
	},

	get: async (req, res, next) => {
		try {
			const users = await User.findAll({
				attributes: ["id", "name", "email", "currency"],
			});

			return successResponse(res, users);
		} catch (error) {
			next(error);
		}
	},

	find: async (req, res, next) => {
		try {
			const { id } = req.params;
			const user = await User.findByPk(id, {
				attributes: ["id", "name", "email", "currency"],
			});

			if (!user) throw new NotFoundError();

			return successResponse(res, user);
		} catch (error) {
			next(error);
		}
	},

	update: async (req, res, next) => {
		try {
			const schema = Yup.object().shape({
				name: Yup.string(),
				email: Yup.string().email(),
				currency: Yup.string(),
				oldPassword: Yup.string().min(6),
				password: Yup.string()
					.min(6)
					.when("oldPassword", (oldPassword, field) => {
						if (oldPassword) {
							return field.required();
						} else {
							return field;
						}
					}),
				confirmPassword: Yup.string().when("password", (password, field) => {
					if (password) {
						return field.required().oneOf([Yup.ref("password")]);
					} else {
						return field;
					}
				}),
			});

			if (!(await schema.isValid(req.body))) throw new ValidationError();

			const { email, oldPassword } = req.body;

			const user = await User.findByPk(req.userId);

			if (!user) throw new NotFoundError();

			if (email) {
				const userExists = await User.findOne({
					where: { email },
				});

				if (userExists) throw new BadRequestError();
			}

			if (oldPassword && !(await user.checkPassword(oldPassword)))
				throw new UnauthorizedError();

			const newUser = await user.update(req.body);

			return successResponse(res, newUser);
		} catch (error) {
			next(error);
		}
	},

	delete: async (req, res, next) => {
		try {
			const user = await User.findByPk(req.userId);
			if (!user) throw new NotFoundError();

			await user.destroy();

			return successResponse(res, { msg: "Account deleted" });
		} catch (error) {
			next(error);
		}
	},
};

export default userController;
