const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const data = require('../triggers.json');

module.exports = (client) => {
    try{
        client.on('messageCreate', (message) => {
            if (message.author.bot) return false;
            let found = false
            const channel = client.channels.cache.find(channel => channel.name === "aurora-logs")
            data.forEach((trigger) => {
                if (found == true) {return false}
                const clean_message = message.content.toLowerCase().replace(/[^a-z0-9]/gi, '')
                if (clean_message.includes(trigger.toLowerCase().replace(/[^a-z0-9]/gi, ''))) {
                    const CriticalActions = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('sendinfo_' + message.author.id)
                            .setLabel('Send Help')
                            .setStyle(ButtonStyle.Success),
                    );
                    const CriticalActEmbed = new EmbedBuilder()
                        .setTitle("Aurora")
                        .setDescription("Sent by: <@" + message.author.id + ">")
                        .setColor("#a4c16a")
                        .setThumbnail("https://m.media-amazon.com/images/I/61IT3BhhUsL._AC_UF894,1000_QL80_.jpg")
                        .addFields(
                        { name: 'Channel', value: "#" + message.channel.name, inline:false },
                        { name: 'Message', value: message.content, inline:false },
                    );
                    channel.send({embeds: [CriticalActEmbed], content: "Early detection is critical to prevent suicidal ideation and attempts. Now is the time to act. Would you like me to send some helpful information to them?", components: [CriticalActions] }); 
                    found = true
                }
            });
        });

        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isButton()) return;
            if (interaction.customId.includes("sendinfo_")) {
                const ply = interaction.customId.substring(9);
                client.users.send(ply, "Hey <@" + ply + ">, I noticed you were feeling down and your friends are worried about you ❤️ If you're having a difficult time right now, allow me to send you a few link which may help. There is always someone to talk to, plus it's free and completely anonymous! https://findahelpline.com. If you're in the US, simply dial 988!").catch(() => interaction.channel.send("error: user declined direct message from server members. If you believe that they are in danger of suicide and you have their contact information, contact your local law enforcement for immediate help. You can also encourage the person to contact a suicide prevention hotline."));
                await interaction.update ({content: "I've just sent <@" + ply + "> some helpful resources. If you believe that they may be in danger of suicide and you have their contact information, contact your local law enforcement for immediate help.", components: [], embeds: [] });
            }    
        });
        
    }catch (e){
        console.log(String(e.stack).bgRed)
    }
}
