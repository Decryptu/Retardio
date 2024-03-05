const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('off')
        .setDescription('Turns the bot off.'),
    async execute(interaction, botActive, setActive) {
        if (!botActive) {
            setActive(true);
            console.log('Bot turned off');
            await interaction.reply('Bot is now off.');
        } else {
            await interaction.reply('Bot is already off.');
        }
    },
};
