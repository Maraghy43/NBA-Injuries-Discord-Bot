const { CommandType } = require("wokcommands");
const puppeteer = require("puppeteer");

const { teamsOne, teamsTwo } = require("./../teams.json");

module.exports = {
	// Required for slash commands
	description: "Check for injuries",
	// Create a legacy and slash command
	type: CommandType.SLASH,
	options: [
		{
			name: "team_name",
			description: "name of team",
			type: 3,
			choices: teamsOne.map((team) => ({ name: team, value: team })),
		},
		{
			name: "extra_team_name",
			description: "name of team",
			type: 3,
			choices: teamsTwo.map((team) => ({ name: team, value: team })),
		},
	],
	callback: async ({ interaction }) => {
		const { options } = interaction;

		let browser;

		try {
			await interaction.deferReply();

			browser = await puppeteer.launch();
			const page = await browser.newPage();

			const teamName =
				options.getString("team_name") ?? options.getString("extra_team_name");

			if (!teamName) throw new Error("Please put team name");

			await page.goto("https://www.espn.com/nba/injuries");

			const INJURY_SECTION_SELECTOR =
				"#fittPageContainer > div:nth-child(3) > div > div.layout__column.layout__column--1 > section > div > section";

			await page.waitForSelector(INJURY_SECTION_SELECTOR);

			const injurySection = await page.$(INJURY_SECTION_SELECTOR);

			if (!injurySection) throw new Error("No injury section found");

			const teamTables = await injurySection.$$(
				".ResponsiveTable.Table__league-injuries",
			);

			if (teamTables.length === 0) throw new Error("No team table found");

			let realTeam;

			for (const team of teamTables) {
				const spanElement = await team.$("span.injuries__teamName");

				if (!spanElement) continue;

				const spanText = await spanElement.evaluate(
					(span, name) => span.textContent.trim() === name,
					teamName,
				);

				if (!spanText) continue;

				realTeam = team;
				break;
			}
			if (!realTeam) throw new Error("No team with given name found");

			const boundingBox = await realTeam.boundingBox();
			const encode = await page.screenshot({
				optimizeForSpeed: true,
				clip: {
					x: boundingBox.x,
					y: boundingBox.y,
					width: boundingBox.width,
					height: boundingBox.height,
				},
				encoding: "binary",
			});

			await interaction.editReply({ files: [encode] });
		} catch (error) {
			console.log(error);
			await interaction.editReply({ content: error.message });
		} finally {
			await browser.close();
		}
	},
};
