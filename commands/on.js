import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('on')
        .setDescription('Turns the bot on.'),
    async execute(interaction) {
        await interaction.deferReply();
        console.log(`Received /on command from ${interaction.user.tag}`);
        if (!global.botActive) {
            global.botActive = true;
            console.log('Bot turned on');
            await interaction.editReply('Bot is now on.');
        } else {
            console.log('Attempt to turn on bot, but bot was already on');
            await interaction.editReply('Bot is already on.');
        }
    },
};

export default command;
