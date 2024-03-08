// /tasks/fetchTrendingCoins.js
import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function fetchTrendingCoins(client) {
    console.log('Fetching trending coins...');

    const url = `https://api.coingecko.com/api/v3/search/trending`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch trending coins, status: ${response.status}`);
        }
        const trendingData = await response.json();

        const trendingCoins = trendingData.coins.slice(0, 7); // Get the top-7 trending coins

        for (const { item } of trendingCoins) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${item.name} (${item.symbol.toUpperCase()}) is trending!`)
                .setURL(`https://www.coingecko.com/en/coins/${item.id}`)
                .setThumbnail(item.large)
                .addFields(
                    { name: 'Current Rank', value: `#${item.market_cap_rank}`, inline: true },
                    { name: 'Score', value: `${item.score}`, inline: true }
                );

            if (client.channels.cache.get(config.channelId)) {
                await client.channels.cache.get(config.channelId).send({ embeds: [embed] })
                    .then(() => console.log(`Trending message successfully sent for ${item.name}.`))
                    .catch(console.error);
            }
        }
    } catch (error) {
        console.error('Error fetching trending coins:', error);
    }
}

function getNextNoonParisTime() {
    const now = new Date();
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    parisTime.setHours(12, 0, 0, 0); // Set to 12:00:00.000

    // If it's already past 12:00 PM Paris time, set for the next day
    if (now.getTime() > parisTime.getTime()) {
        parisTime.setDate(parisTime.getDate() + 1);
    }

    return parisTime.getTime() - now.getTime();
}

export function setupTrendingCoinsTask(client) {
    const delayUntilNextNoonParis = getNextNoonParisTime();

    setTimeout(() => {
        fetchTrendingCoins(client); // Fetch immediately at next 12:00 PM Paris time
        setInterval(() => fetchTrendingCoins(client), 86400000); // Then every 24 hours
    }, delayUntilNextNoonParis);
}

export default setupTrendingCoinsTask;
