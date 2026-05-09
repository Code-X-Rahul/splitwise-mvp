import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.MAILTRAP_HOST,
	port: Number(process.env.SMTP_PORT) || 2525,
	auth: {
		user: process.env.MAILTRAP_USERNAME,
		pass: process.env.MAILTRAP_PASSWORD,
	},
});

const emailService = {
	sendBalanceReport: async (user, balances) => {
		try {
			if (!balances.length) return;

			const balanceRows = balances
				.map((b) => {
					const direction = b.balance > 0 ? "owes you" : "you owe";
					const amount = Math.abs(b.balance).toFixed(2);
					return `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${b.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${b.email}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${b.balance > 0 ? "#16a34a" : "#dc2626"};">
              ${direction} ${amount}
            </td>
          </tr>`;
				})
				.join("");

			const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Monthly Balance Report</h2>
          <p>Hi ${user.name},</p>
          <p>Here's your monthly balance summary:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left;">Email</th>
                <th style="padding: 8px; text-align: left;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${balanceRows}
            </tbody>
          </table>
          <p style="color: #64748b; font-size: 12px;">
            This is an automated report. Log in to your account to settle balances.
          </p>
        </div>
      `;

			await transporter.sendMail({
				from: process.env.SMTP_FROM || process.env.SMTP_USER,
				to: user.email,
				subject: "Your Monthly Balance Report",
				html,
			});

			console.log(`[EMAIL] Balance report sent to ${user.email}`);
		} catch (error) {
			console.log(
				`[EMAIL] Failed to send report to ${user.email}:`,
				error.message,
			);
		}
	},
};

export default emailService;
