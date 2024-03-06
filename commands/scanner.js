import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('scanner')
        .setDescription('Toggles the scanner mode.'),
    async execute(interaction) {
        await interaction.deferReply();
        global.botActive = !global.botActive;
        const stateMessage = global.botActive ? 'Scanner is now on.' : 'Scanner is now off.';
        await interaction.editReply(stateMessage);
    },
};

export default command;
