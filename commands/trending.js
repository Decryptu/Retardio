import { SlashCommandBuilder } from 'discord.js';

global.trendingActive = true; // Enable trending by default

const command = {
    data: new SlashCommandBuilder()
        .setName('trending')
        .setDescription('Toggles the trending coins feature.'),
    async execute(interaction) {
        await interaction.deferReply();
        global.trendingActive = !global.trendingActive; // Toggle trending feature
        const stateMessage = global.trendingActive ? 'Trending coins feature is now on.' : 'Trending coins feature is now off.';
        await interaction.editReply(stateMessage);
    },
};

export default command;
