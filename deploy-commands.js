const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach(dir => {
	const commandFiles = fs.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith('.js'));

	commandFiles.forEach(file => {
		const command = require(`${commandsPath}/${dir}/${file}`);
		commands.push(command.data.toJSON());
	});
});

const rest = new REST( {version: '10'} ).setToken(token);

async function guildCommands() { // -> node -e 'require(\"./deploy-commands\").guildCommands()'
    try {
		console.log(`Started refreshing ${commands.length} application (/) guild commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) guild commands.`);
	} catch (error) {
		console.error(error);
	}
}

async function globalCommands() { // -> node -e 'require(\"./deploy-commands\").globalCommands()'
    try {
		console.log(`Started refreshing ${commands.length} application (/) global commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);		

		console.log(`Successfully reloaded ${data.length} application (/) global commands.`);
	} catch (error) {
		console.error(error);
	}
}

exports.guildCommands = guildCommands;
exports.globalCommands = globalCommands;