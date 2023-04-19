import { Bot } from 'grammy';
import { InlineKeyboard, session, GrammyError, HttpError } from 'grammy';
import { MongoClient } from 'mongodb';
import { MongoDBAdapter } from '@grammyjs/storage-mongodb';

// Create a Bot
const bot = new Bot(process.env.TELEBOTAPI);

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

client.connect();
const collection = client.db('oasisone');

bot.use(
	session({
		type: 'multi',
		tenant: {
			initial: () => undefined,
			storage: new MongoDBAdapter({
				collection: collection.collection('tenants'),
			}),
		},
	})
);

async function runBot() {
	let member_type;

	// MENU
	const welcomeTitle = `<b>Welcome to Oasis One</b>\n\n`;

	const body_notIntegrated =
		`Seems like your telegram user id have not been integrated to Oasis One` +
		`\nPlease register as user or tenant to continue.`;

	const body_integrated = `Your user id have been integrated to Oasis One\n`;

	// check is connected
	bot.command('start', async (context) => {
		const teleUsername = context.from.username;
		const teleUserId = context.from.id;

		const tenantIntegration = await collection
			.collection('tenants')
			.findOne({
				$and: [
					{ telegram_username: teleUsername },
					{ telegram_userid: teleUserId },
				],
			});
		console.log(tenantIntegration);

		const userIntegration = await collection.collection('users').findOne({
			$and: [
				{ telegram_username: teleUsername },
				{ telegram_userid: teleUserId },
			],
		});
		console.log(userIntegration);

		if (tenantIntegration) {
			member_type = 'Tenant';
			const body_memberdata =
				`\nTenant ID : ${tenantIntegration.tenant_id}` +
				`\nTenant Name : ${tenantIntegration.name}` +
				`\nFoodcourt Name : ${tenantIntegration.foodcourt_name}`;

			await context.reply(
				welcomeTitle + body_integrated + body_memberdata,
				{
					parse_mode: 'HTML',
				}
			);
		} else if (userIntegration) {
			member_type = 'User';
			const body_memberdata =
				`\nTenant ID : ${userIntegration.tenant_id}` +
				`\nTenant Name : ${userIntegration.name}` +
				`\nFoodcourt Name : ${userIntegration.foodcourt_name}`;

			await context.reply(
				welcomeTitle + body_integrated + body_memberdata,
				{ parse_mode: 'HTML' }
			);
		} else {
			member_type = '';

			const memberType_button = new InlineKeyboard()
				.text('Tenant')
				.text('User');

			await context
				.reply(welcomeTitle + body_notIntegrated, {
					parse_mode: 'HTML',
					reply_markup: memberType_button,
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});

	bot.callbackQuery('Tenant', async (ctx) => {
		const register_body =
			`To register your tenant, please reply this message with: \n` +
			`/regtenant tenantID`;

		await ctx.editMessageText(register_body, {
			parse_mode: 'HTML',
		});
	});

	bot.callbackQuery('Konfirmasi Pesanan', async (ctx) => {
		console.log(ctx);
		console.log(ctx.chat);
		console.log(ctx.msg);
		console.log(ctx.msg.reply_markup.inline_keyboard);
	});

	bot.callbackQuery('User', async (ctx) => {
		const register_body =
			`To register your user, please reply this message with: \n` +
			`/reguser phonenumber`;

		await ctx.editMessageText(register_body, {
			parse_mode: 'HTML',
		});
	});

	bot.command('regtenant', async (context) => {
		let credentials = context.message.text;

		const formatCredentials = (string) => {
			const spaceIndex = string.indexOf(' ');
			if (spaceIndex === -1) {
				return '';
			}
			return string.substring(spaceIndex + 1);
		};

		credentials = formatCredentials(credentials);

		const checkTenant = await collection.collection('tenants').findOne({
			$or: [{ tenant_id: credentials }, { name: credentials }],
		});

		if (
			checkTenant &&
			(checkTenant.tenant_id == credentials ||
				checkTenant.name == credentials)
		) {
			await collection.collection('tenants').updateOne(
				{ tenant_id: checkTenant.tenant_id },
				{
					$set: {
						telegram_username: context.from.username,
						telegram_userid: context.from.id,
					},
				}
			);

			const updatedTenant = await collection
				.collection('tenants')
				.findOne({
					$or: [{ tenant_id: credentials }, { name: credentials }],
				});

			if (updatedTenant) {
				const checkTenant_body =
					`Tenant ID : ${updatedTenant.tenant_id}\n` +
					`Tenant Name : ${updatedTenant.name}\n` +
					`Foodcourt Name : ${updatedTenant.foodcourt_name}\n` +
					`\nAny future order and updates will be notified to this telegram user\n` +
					`username: @${context.from.username}\n` +
					`user ID: ${context.from.id}`;

				await context.reply(checkTenant_body, {
					parse_mode: 'HTML',
				});
			}
		} else {
			const checkTenant_body = `There is no tenant registered with this tenant ID or tenant name: ${credentials}`;

			await context.reply(checkTenant_body, {
				parse_mode: 'HTML',
			});
		}
	});

	bot.command('reguser', async (context) => {
		let credentials = context.message.text.split(' ')[1];

		const checkUser = await collection.collection('users').findOne({
			phoneNumber: credentials,
		});

		if (checkUser && checkUser.phoneNumber == credentials) {
			await collection.collection('users').updateOne(
				{ phoneNumber: credentials },
				{
					$set: {
						telegram_username: context.from.username,
						telegram_userid: context.from.id,
					},
				}
			);

			const updatedUser = await collection.collection('users').findOne({
				phoneNumber: credentials,
			});

			if (updatedUser) {
				const checkUser_body =
					`Tenant ID : ${updatedUser.user_id}\n` +
					`Tenant Name : ${updatedUser.name}\n` +
					`Foodcourt Name : ${updatedUser.phoneNumber}\n` +
					`\nAny future order and updates will be notified to this telegram user\n` +
					`username: @${context.from.username}\n` +
					`user ID: ${context.from.id}`;

				await context.reply(checkUser_body, {
					parse_mode: 'HTML',
				});
			}
		}
	});

	// start the bot
	bot.start();

	bot.catch((err) => {
		const ctx = err.ctx;
		console.error(`Error while handling update ${ctx.update.update_id}:`);
		const e = err.error;
		if (e instanceof GrammyError) {
			console.error('Error in request:', e.description);
		} else if (e instanceof HttpError) {
			console.error('Could not contact Telegram:', e);
		} else {
			console.error('Unknown error:', e);
		}
	});
}

export { runBot, bot };
