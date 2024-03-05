import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('off')
        .setDescription('Turns the bot off.'),
    async execute(interaction, botActive, setActive) {
        if (botActive) {
            setActive(false);
            console.log('Bot turned off');
            await interaction.reply('Bot is now off.');
        } else {
            await interaction.reply('Bot is already off.');
        }
    },
};

export default command;
