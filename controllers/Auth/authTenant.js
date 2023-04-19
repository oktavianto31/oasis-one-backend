import express from 'express';
const router = express.Router();

// mongodb models
import Tenant from '../../models/tenantModel.js';
import Table from '../../models/tableModel.js';
import Verification from '../../models/verificationModel.js';
import PasswordReset from '../../models/passwordresetModel.js';

// email handler
import nodemailer from 'nodemailer';

// unique string
import { v4 as uuidv4 } from 'uuid';

// env variables
import 'dotenv/config';

// password handler
import bcrypt from 'bcryptjs';
import getRandomString from 'randomstring';

// path for static verified page
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localurl = 'https://admin.oasis-one.com/';

// nodemailer
let transporter = nodemailer.createTransport({
	host: 'smtp.office365.com',
	port: 587,
	// secure: true,
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASS,
	},
});

// Have to turn on less secure apps for verification nodemailer
// testing success
transporter.verify((error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log('Nodemailer Ready');
	}
});

// Component
function sendVerificationEmail({ _id, tenant_id, email }, res) {
	// url to be used in the email
	const currentUrl = 'https://backend.oasis-one.com/api/tenant/verify/';

	const uniqueString = uuidv4() + _id;

	//mail options
	const mailOptions = {
		from: process.env.AUTH_EMAIL,
		to: email,
		subject: 'Oasis One Verification Email',
		html: `<p>Verify your email address to complete the signup process! </p> <p>Click <a href=${
			currentUrl + _id + '/' + uniqueString
		}> here </a> to proceed. </p>`,
	};

	// hash the uniqueString
	const saltRounds = 10;
	bcrypt
		.hash(uniqueString, saltRounds)
		.then((hashedUniqueString) => {
			// set values in verification collection

			const newVerification = new Verification({
				userID: _id,
				uniqueString: hashedUniqueString,
				createdAt: Date.now(),
			});

			newVerification
				.save()
				// .then(async () => {
				// 	await transporter
				// 		.sendMail(mailOptions)
				// 		.then(() => {
				// 			//email sent and verification record saved
				// 			res.json({
				// 				status: 'SUCCESS',
				// 				message: 'Verification email sent',
				// 				data: {
				// 					tenant_id: tenant_id,
				// 				},
				// 			});
				// 		})
				// 		.catch((error) => {
				// 			console.log(error);
				// 			res.json({
				// 				status: 'FAILED',
				// 				message: 'Verification email failed',
				// 			});
				// 		});
				// })
				.catch((error) => {
					console.log(error);
					res.json({
						status: 'FAILED',
						message: "Couldn't save verification email data!",
					});
				});
		})
		.catch(() => {
			res.json({
				status: 'FAILED',
				message: 'An error occurred while hashing email data!',
			});
		});
}

// send password reset email
function sendResetEmail({ _id, email }, redirectUrl, res) {
	const resetString = uuidv4() + _id;

	PasswordReset.deleteMany({ userID: _id })
		.then((result) => {
			//reset records delete successfully
			//mail options
			const mailOptions = {
				from: process.env.AUTH_EMAIL,
				to: email,
				subject: 'Password Reset',
				html: `<p>Please use the link below to reset your password!</p> <p>Click <a href=${
					redirectUrl + '/' + _id + '/' + resetString
				}> here </a> to proceed. </p>`,
			};

			//hash the reset string
			const saltRounds = 10;
			bcrypt
				.hash(resetString, saltRounds)
				.then((hashedResetString) => {
					// set values in password reset collection

					const newPasswordReset = new PasswordReset({
						userID: _id,
						resetString: hashedResetString,
						createdAt: Date.now(),
					});

					newPasswordReset
						.save()
						.then(() => {
							transporter
								.sendMail(mailOptions)
								.then(() => {
									//reset email sent and password reset record saved
									res.json({
										status: 'PENDING',
										message: 'Password reset email sent',
									});
								})
								.catch((error) => {
									console.log(error);
									res.json({
										status: 'FAILED',
										message: 'Password reset email failed!',
									});
								});
						})
						.catch((error) => {
							console.log(error);
							res.json({
								status: 'FAILED',
								message: "Couldn't save password reset data!",
							});
						});
				})
				.catch((error) => {
					console.log(error);
					res.json({
						status: 'FAILED',
						message: 'An error occured while hashing the password reset data!',
					});
				});
		})
		.catch((error) => {
			//error while clearing existing records
			console.log(error);
			res.json({
				status: 'FAILED',
				message: 'Clearing existing password reset records failed',
			});
		});
}

async function checkVerification(req, res) {
	try {
		const { email } = req.body;

		const checkVerification = await Tenant.aggregate([{ $match: { email: email.trim() } }]);

		if (checkVerification) {
			res.status(200).json({
				status: 'SUCCESS',
				message: 'verified :' + checkVerification[0].verified,
			});
		} else {
			res.status(400).json({
				status: 'FAILED',
				message: 'User does not exists',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

// Signup Functions
async function Register(req, res) {
	try {
		const { name, email, password } = req.body;
		let TenantID;
		let tempId = getRandomString.generate(8);

		const existingId = await Tenant.findOne({ tenant_id: 'T-' + tempId });
		if (existingId === 'T-' + tempId) {
			tempId = new getRandomString.generate(8);
			return tempId;
		}

		TenantID = 'T-' + tempId;

		//Create QrCode link
		const link = 'https://user.oasis-one.com/tenant/' + TenantID;

		if (name == '' || email == '' || password == '') {
			res.status(400).json({
				status: 'FAILED',
				message: 'Empty input fields!',
			});
		} else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
			res.status(400).json({
				status: 'FAILED',
				message: ' Invalid email entered',
			});
		} else if (password.length < 8) {
			res.status(400).json({
				status: 'FAILED',
				message: ' Password is too short',
			});
		} else {
			//checking if user already exists
			const existingTenant = await Tenant.findOne({
				email: email,
			});

			if (existingTenant) {
				res.status(400).json({
					status: 'FAILED',
					message: 'User with the provided email already exists',
				});
			} else {
				// Handle Password
				const saltRounds = 10;
				const generateSalt = await bcrypt.genSalt(saltRounds);
				const hashedPassword = await bcrypt.hash(password, generateSalt);

				const newTenant = new Tenant({
					tenant_id: TenantID,
					name,
					email,
					password: hashedPassword,
					uniqueKey: password,
					verified: true,
					qrCode: link,
					openingDays: [
						{
							day: 'Monday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Tuesday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Wednesday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Thursday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Friday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Saturday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
						{
							day: 'Sunday',
							is24Hours: false,
							isClosed: false,
							OpenHour: '00',
							OpenMins: '00',
							OpenTF: 'AM',
							CloseHour: '00',
							CloseMins: '00',
							CloseTF: 'PM',
						},
					],
				});

				await newTenant
					.save()
					// .then((result) => {
					// 	//handle account verification
					// 	// sendVerificationEmail(result, res);
					// })
					.catch((err) => {
						console.log(err);
						res.status(400).json({
							status: 'FAILED',
							message: 'An error occured while sending verification code',
						});
					});

				const onlineTable = new Table({
					tenant_id: TenantID,
					table: [
						{
							id: TenantID + '-Online',
							index: 0,
							status: 'EMPTY',
							isWaiterCalled: false,
						},
					],
				});

				await onlineTable.save().catch((err) => {
					console.log(err);
					res.status(400).json({
						status: 'FAILED',
						message: 'An error occured while creating online order table!',
					});
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function Login(req, res) {
	try {
		let { email, password, acceptTOS } = req.body;

		if (email == '' || password == '') {
			res.json({
				status: 'FAILED',
				message: 'Empty credentials',
			});
		} else if (acceptTOS == false) {
			res.json({
				status: 'FAILED',
				message: 'Please accept Terms of Service.',
			});
		} else {
			await Tenant.find({ email })
				.then(async (data) => {
					if (data.length) {
						if (!data[0].verified) {
							res.json({
								status: 'FAILED',
								message: "Email hasn't been verified yet!",
							});
						} else {
							if (!data[0].termOfServiceAccepted) {
								await Tenant.update(
									{ email: email },
									{ email: email, termOfServiceAccepted: true },
									{ upsert: true }
								);
							}

							const hashedPassword = data[0].password;
							bcrypt
								.compare(password, hashedPassword)
								.then((result) => {
									if (result) {
										res.json({
											status: 'SUCCESS',
											message: 'Signin successful',
											data: data,
										});
									} else {
										res.json({
											status: 'FAILED',
											message: 'Invalid password entered!',
										});
									}
								})
								.catch((err) => {
									res.json({
										status: 'FAILED',
										message: 'An error occured while comparing password',
									});
								});
						}
					} else {
						res.json({
							status: 'FAILED',
							message: 'Invalid credentials entered!',
						});
					}
				})
				.catch((err) => {
					res.json({
						status: 'FAILED',
						message: 'An error occured while checking for existing user',
					});
				});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function checkAcceptTOS(req, res) {
	try {
		const { email } = req.body;
		const checkTOS = await Tenant.findOne({
			email: email,
		});

		if (checkTOS) {
			res.json({
				status: 'SUCCESS',
				message: checkTOS.termOfServiceAccepted,
			});
		} else {
			res.json({
				status: 'FAILED',
				message: 'tenant not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function VerifyEmail(req, res) {
	try {
		let { userID, uniqueString } = req.params;

		Verification.find({ userID })
			.then((result) => {
				if (result.length > 0) {
					//user verification record exists
					const hashedUniqueString = result[0].uniqueString;

					//compare the hashed unique string
					bcrypt
						.compare(uniqueString, hashedUniqueString)
						.then((result) => {
							if (result) {
								//strings match

								Tenant.updateOne({ _id: userID }, { verified: true })
									.then(() => {
										Verification.deleteOne({ userID })
											.then(() => {
												res.redirect(localurl);
												// res.sendFile(
												//   path.join(__dirname, "../views/verified.html")
												// );
											})
											.catch((error) => {
												console.log(error);
												let message = 'An error occured while finalizing verification.';
												res.redirect(
													`/api/tenant/verified/error=true&message=${message}`
												);
											});
									})
									.catch((error) => {
										console.log(error);
										let message =
											'An error occured while updating tenant record for verification.';
										res.redirect(`/api/tenant/verified/error=true&message=${message}`);
									});
							} else {
								//existing record but incorrect verification details passed
								let message = 'Invalid verification details passed. Check your inbox.';
								res.redirect(`/api/tenant/verified/error=true&message=${message}`);
							}
						})
						.catch((error) => {
							let message = 'An error occured while comparing unique strings.';
							res.redirect(`/api/tenant/verified/error=true&message=${message}`);
						});
				} else {
					//user verification record doesn't exists
					let message =
						"Account record doesn't exists or has been verified! Please proceed to log in.";
					res.redirect(`/api/tenant/verified/error=true&message=${message}`);
				}
			})
			.catch((error) => {
				console.log(error);
				let message = 'An error occured while checking for existing use verification record';
				res.redirect(`/api/tenant/verified/error=true&message=${message}`);
			});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function PasswordResetMail(req, res) {
	try {
		const { email, redirectUrl } = req.body;

		//check if email exists
		Tenant.find({ email })
			.then((data) => {
				if (data.length) {
					//user exists

					//check if user is verified
					if (!data[0].verified) {
						res.json({
							status: 'FAILED',
							message: "Email hasn't been verified yet!",
						});
					} else {
						//proceed with email to reset password
						sendResetEmail(data[0], redirectUrl, res);
					}
				} else {
					res.json({
						status: 'FAILED',
						message: 'No account with the supplied email exists!',
					});
				}
			})
			.catch((error) => {
				console.log(error);
				res.json({
					status: 'FAILED',
					message: 'An error occured while checking for existing user',
				});
			});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function ActualResetPassword(req, res) {
	try {
		let { userID, resetString, newPassword } = req.body;
		console.log(userID, resetString, newPassword);
		PasswordReset.find({ userID })
			.then((result) => {
				if (result.length > 0) {
					//password reset record exist
					//compare hashed reset string
					const hashedResetString = result[0].resetString;
					bcrypt
						.compare(resetString, hashedResetString)
						.then((result) => {
							if (result) {
								//string matched
								//hash password again

								const saltRounds = 10;
								bcrypt
									.hash(newPassword, saltRounds)
									.then((hashedNewPassword) => {
										//update user password

										Tenant.updateOne({ _id: userID }, { password: hashedNewPassword })
											.then(() => {
												//update complete. Now delete reset password record.

												PasswordReset.deleteOne({
													userID,
												})
													.then(() => {
														//both user record and reset record updated
														res.json({
															status: 'SUCCESS',
															message: 'Password has been reset successfully.',
														});
													})
													.catch((error) => {
														console.log(error);
														res.json({
															status: 'FAILED',
															message:
																'An error occurred while finalizing password reset.',
														});
													});
											})
											.catch((error) => {
												console.log(error);
												res.json({
													status: 'FAILED',
													message: 'Updating user password failed.',
												});
											});
									})
									.catch((error) => {
										console.log(error);
										res.json({
											status: 'FAILED',
											message: 'An error occured while hashing new password.',
										});
									});
							} else {
								//existing record but incorrect reset string passed
								console.log(error);
								res.json({
									status: 'FAILED',
									message: 'Invalid password reset details passed.',
								});
							}
						})
						.catch((error) => {
							console.log(error);
							res.json({
								status: 'FAILED',
								message: 'Comparing password reset strings failed!',
							});
						});
				} else {
					//password reset record doesn't exist
					res.json({
						status: 'FAILED',
						message: 'Password reset record does not exist',
					});
				}
			})
			.catch((error) => {
				console.log(error);
				res.json({
					status: 'FAILED',
					message: 'Checking for existing password reset failed!',
				});
			});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

export {
	Register,
	Login,
	checkVerification,
	VerifyEmail,
	PasswordResetMail,
	ActualResetPassword,
	checkAcceptTOS,
};
