const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, ChannelType, PermissionsBitField } = require('discord.js');
const { token, clientId} = require('./config.json');
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

	client.user.setPresence({
		activities: [{ name: `988`, type: ActivityType.Listening }],
		status: 'online',
	});

	const id = client.guilds.cache.map(guild => guild.id);
	id.forEach((server) => {
		const guild = client.guilds.cache.get(server);
		const log_channel = guild.channels.cache.find(channel => channel.name === "aurora-logs");
		if (!log_channel) {
			guild.channels.create({
				name: "aurora-logs" ,
				type: ChannelType.GuildText,
				topic: "Aurora is a passive bot that monitors your server's messages to detect patterns of emotional distress or suicidal ideations. This private channel will be used to notify Server Administrators of any concerning messages. Feel free to move this channel anywhere but do not rename it. To protect the privacy of your users, **keep this channel private and role-locked to server owners & admins only**",
				permissionOverwrites: [
					{
						id: server, //everyone
						deny: [PermissionsBitField.Flags.ViewChannel],
					},
					{
						id: clientId, //bot
						allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					}
				]
			})
		};	
		console.log(server);
	});
});

client.on('guildCreate', (guild) => {
	const log_channel = guild.channels.cache.find(channel => channel.name === "aurora-logs");
	if (!log_channel) {
		guild.channels.create({
			name: "aurora-logs" ,
			type: ChannelType.GuildText,
			topic: "Aurora is a passive bot that monitors your server's messages to detect patterns of emotional distress or suicidal ideations. This private channel will be used to notify Server Administrators of any concerning messages. Feel free to move this channel anywhere but do not rename it. To protect the privacy of your users, **keep this channel private and role-locked to server owners & admins only**",
			permissionOverwrites: [
				{
					id: guild.id, //everyone
					deny: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: clientId, //bot
					allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
				}
			]
		})
	};
})

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