const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);

        const commands = [
            new SlashCommandBuilder().setName('on').setDescription('Turns the bot on.'),
            new SlashCommandBuilder().setName('off').setDescription('Turns the bot off.')
        ].map(command => command.toJSON());

        try {
            await client.application?.commands.set(commands);
            console.log('Commands set successfully');
        } catch (error) {
            console.error("Error setting up commands:", error);
        }
    },
};
