import { SlashCommandBuilder } from 'discord.js';
import { setupCoinGeckoTask } from '../tasks/fetchCoinGecko.js';
import { setupTrendingCoinsTask } from '../tasks/fetchTrendingCoins.js';

const ready = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);

        const commands = [
            new SlashCommandBuilder().setName('scanner').setDescription('Toggles the scanner mode.'),
            new SlashCommandBuilder().setName('degen').setDescription('Toggles the degen mode.')
        ].map(command => command.toJSON());

        try {
            await client.application?.commands.set(commands);
            console.log('Commands set successfully');

            // Call setupCoinGeckoTask here to ensure it starts after the bot is ready
            setupCoinGeckoTask(client);
            setupTrendingCoinsTask(client);
            console.log('CoinGecko fetching task started.');
        } catch (error) {
            console.error("Error setting up commands:", error);
        }
    },
};

export default ready;
