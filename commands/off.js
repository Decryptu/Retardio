import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('off')
        .setDescription('Turns the bot off.'),
    async execute(interaction) {
        await interaction.deferReply();
        console.log(`Received /off command from ${interaction.user.tag}`);
        if (global.botActive) {
            global.botActive = false;
            console.log('Bot turned off');
            await interaction.editReply('Bot is now off.');
        } else {
            console.log('Attempt to turn off bot, but bot was already off');
            await interaction.editReply('Bot is already off.');
        }
    },
};

export default command;
