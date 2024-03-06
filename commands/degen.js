import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('degen')
        .setDescription('Toggles the degen mode.'),
    async execute(interaction) {
        await interaction.deferReply();
        global.degenActive = !global.degenActive; // Toggle degen mode
        const stateMessage = global.degenActive ? 'Degen mode is now on.' : 'Degen mode is now off.';
        await interaction.editReply(stateMessage);
    },
};

export default command;
