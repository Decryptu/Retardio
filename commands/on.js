const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('on')
        .setDescription('Turns the bot on.'),
    async execute(interaction, botActive, setActive) {
        if (!botActive) {
            setActive(true);
            console.log('Bot turned on');
            await interaction.reply('Bot is now on.');
        } else {
            await interaction.reply('Bot is already on.');
        }
    },
};
