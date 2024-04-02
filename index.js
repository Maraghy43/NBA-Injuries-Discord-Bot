const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");
const dotenv = require("dotenv");

const { DefaultCommands } = WOK;
dotenv.config({ path: "./.env" });

const { TOKEN } = process.env;

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessageReactions,
	],
	partials: [Partials.Channel],
});

client.on("ready", async (readyClient) => {
	console.log(`${readyClient.user.username} is running 🧶`);

	new WOK({
		client,
		commandsDir: path.join(__dirname, "./commands"),
		events: {
			dir: path.join(__dirname, "events"),
		},
		disabledDefaultCommands: [
			DefaultCommands.ChannelCommand,
			DefaultCommands.CustomCommand,
			DefaultCommands.Prefix,
			DefaultCommands.RequiredPermissions,
			DefaultCommands.RequiredRoles,
			DefaultCommands.ToggleCommand,
		],
		cooldownConfig: {
			errorMessage: "Please wait {TIME} before doing that again.",
			botOwnersBypass: false,
			dbRequired: 300,
		},
	});
});
client.login(TOKEN);
