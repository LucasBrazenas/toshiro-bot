const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client(({ intents: [3276799] }));

const config = require('./config.json');

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
let totalCategories = 0;
let totalCommands = 0;

fs.readdirSync(commandsPath).forEach(dir => {
	const commandFiles = fs.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith('.js'));

	totalCategories += 1;

	commandFiles.forEach(file => {
		const filePath = path.join(`${commandsPath}/${dir}/`, file);
		const command = require(filePath);
	
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			totalCommands += 1;
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(config.token).then(console.log("[Toshiro] I´m ready!"));