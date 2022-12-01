const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const { token} = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
require(`./handlers/messages.js`)(client);

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Aurora is online!');
	const id = client.guilds.cache.map(guild => guild.id);
	id.forEach((server) => {
		const guild = client.guilds.cache.get(server);
		const log_channel = client.channels.cache.find(channel => channel.name === "aurora-logs");
		if (!log_channel) {
			guild.channels.create({
				name: "aurora-logs" ,
				type: ChannelType.GuildText,
				permissionOverwrites: [
					{
						id: server, //everyone
						deny: [PermissionsBitField.Flags.ViewChannel],
					}
				]
			})
		};	
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);