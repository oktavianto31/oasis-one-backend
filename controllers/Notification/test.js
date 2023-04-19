import { TelegramClient } from 'telegram';
import { Api } from 'telegram/tl/index.js';
import { StringSession } from 'telegram/sessions/index.js';
import { Bot, InlineKeyboard } from 'grammy';

// //Store bot screaming status
// let screaming = false;

// const apiId = parseInt(process.env.TELEAPIID);
// const apiHash = process.env.TELEAPIHASH;
// const apiToken = process.env.TELEBOTAPI;
// const gramBot = new Bot(process.env.TELEBOTAPI);

// const firstMenu =
// 	'<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.';
// const secondMenu =
// 	'<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.';

// const nextButton = 'Next';
// const backButton = 'Back';
// const tutorialButton = 'Tutorial';

// const firstMenuMarkup = new InlineKeyboard().text(nextButton, backButton);

// const secondMenuMarkup = new InlineKeyboard()
// 	.text(backButton, backButton)
// 	.text(tutorialButton, 'https://core.telegram.org/bots/tutorial');

// //This function handles the /scream command
// gramBot.command('scream', () => {
// 	screaming = true;
// });

// //This function handles /whisper command
// gramBot.command('whisper', () => {
// 	screaming = false;
// });

// gramBot.command('start', async (ctx) => {
// 	await ctx.reply(firstMenu, {
// 		parse_mode: 'HTML',
// 		reply_markup: firstMenuMarkup,
// 	});
// });

// gramBot.command('menu', async (ctx) => {
// 	await ctx.reply(firstMenu, {
// 		parse_mode: 'HTML',
// 		reply_markup: firstMenuMarkup,
// 	});
// });

// //This handler processes back button on the menu
// gramBot.callbackQuery(backButton, async (ctx) => {
// 	//Update message content with corresponding menu section
// 	await ctx.editMessageText(firstMenu, {
// 		reply_markup: firstMenuMarkup,
// 		parse_mode: 'HTML',
// 	});
// });

// //This handler processes next button on the menu
// gramBot.callbackQuery(nextButton, async (ctx) => {
// 	//Update message content with corresponding menu section
// 	await ctx.editMessageText(secondMenu, {
// 		reply_markup: secondMenuMarkup,
// 		parse_mode: 'HTML',
// 	});
// });

// //This function would be added to the dispatcher as a handler for messages coming from the Bot API
// gramBot.on('message', async (ctx) => {

// 	console.log(ctx.from.id)
// 	console.log(ctx.from.username);
// 	//Print to console
// 	console.log(
// 		`${ctx.from.first_name} wrote ${
// 			'text' in ctx.message ? ctx.message.text : ''
// 		}`
// 	);

// 	if (screaming && ctx.message.text) {
// 		//Scream the message
// 		await ctx.reply(ctx.message.text.toUpperCase(), {
// 			entities: ctx.message.entities,
// 		});
// 	} else {
// 		//This is equivalent to forwarding, without the sender's name
// 		await ctx.copyMessage(ctx.message.chat.id);
// 	}
// });

// //Start the bot
// gramBot.start();

function authTelegram() {
	try {
		const stringSession = new StringSession('');
		(async () => {
			const client = new TelegramClient(stringSession, apiId, apiHash, {
				connectionRetries: 5,
				floodSleepThreshold: 3000,
			});

			await client.start({
				botAuthToken: apiToken,
			});

			client.session.save();
			console.log(client.session.save());
		})();
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function getUpdates(req, res) {
	try {
		const stringSession = new StringSession(process.env.TELESESSION);
		const client = await new TelegramClient(stringSession, apiId, apiHash, {
			connectionRetries: 5,
			floodSleepThreshold: 3000,
		});

		await client.connect();
		const result = await client.invoke(
			new Api.messages.SendMessage({
				peer: 'Denntham',
				message: 'Hello there!',
				noWebpage: true,
				noforwards: true,
			})
		);
		console.log(result);

		res.status(400).json({
			status: 'SUCCESS',
			result: result,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function getCurrentUserData(req, res) {
	try {
		const stringSession = new StringSession(process.env.TELESESSION);
		const client = await new TelegramClient(stringSession, apiId, apiHash, {
			connectionRetries: 5,
			floodSleepThreshold: 3000,
		});

		await client.connect();

		res.status(400).json({
			status: 'SUCCESS',
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function sendTelegram(req, res) {
	try {
		const stringSession = new StringSession(process.env.TELESESSION);
		const client = await new TelegramClient(stringSession, apiId, apiHash, {
			connectionRetries: 5,
			floodSleepThreshold: 3000,
		});

		await client.connect();
		const result = await client.invoke(
			new Api.messages.SendMessage({
				peer: 'Denntham',
				message: 'Hello there!',
				randomId: BigInt('-4156887774564'),
				noWebpage: true,
				noforwards: true,
			})
		);
		console.log(result);

		res.status(400).json({
			status: 'SUCCESS',
			result: result,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

export { sendTelegram, getCurrentUserData };
