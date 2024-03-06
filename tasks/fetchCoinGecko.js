import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const cooldowns = new Map();
const degenCooldowns = new Map();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function controlledFetch(url) {
    await delay(200); // Adjusted delay to manage request rate
    const response = await fetch(url);
    return response;
}

async function fetchAndProcessData(client, mode = 'scanner') {
    const isActive = mode === 'scanner' ? global.botActive : global.degenActive;
    if (!isActive) return;

    console.log(`Starting to fetch data for ${mode} mode.`);

    const modeConfig = config[`${mode}Mode`];
    let coinsFetched = 0;
    let currentPage = 1;
    const startRank = mode === 'scanner' ? 1 : config.scannerMode.perPage + 1;
    const endRank = startRank + modeConfig.perPage - 1;
    const currentCooldowns = mode === 'scanner' ? cooldowns : degenCooldowns;
    let lastCoinRank = 0;

    while (coinsFetched < modeConfig.perPage) {
        const fetchSize = 250; // Keep using batches of 250 to minimize the number of requests
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${fetchSize}&page=${currentPage}&sparkline=false&price_change_percentage=24h`;

        try {
            const response = await controlledFetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            if (data.length === 0) break; // Exit loop if no more data is returned

            for (const coin of data) {
                const rank = coin.market_cap_rank;
                const now = Date.now();
                const cooldownEnd = currentCooldowns.get(coin.symbol) ? currentCooldowns.get(coin.symbol) + config.cooldownPeriod : 0;

                if (rank >= startRank && rank <= endRank && Math.abs(coin.price_change_percentage_24h) >= modeConfig.minChangePercentage && now > cooldownEnd) {
                    const color = coin.price_change_percentage_24h > 0 ? '#00FF00' : '#FF0000';
                    const coinTitle = mode === 'degen' ? `🔥 ${coin.name}` : coin.name;
                    const embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${coinTitle}`)
                        .setThumbnail(coin.image)
                        .addFields(
                            { name: 'Rank', value: `#${coin.market_cap_rank}`, inline: true },
                            { name: 'Ticker', value: coin.symbol.toUpperCase(), inline: true },
                            { name: 'Price', value: `$${coin.current_price}`, inline: true },
                            { name: 'Market Cap', value: `$${coin.market_cap.toLocaleString()}`, inline: true },
                            { name: '24h Change', value: `${coin.price_change_percentage_24h.toFixed(2)}%`, inline: true }
                        );

                    if (client.channels.cache.get(config.channelId)) {
                        await client.channels.cache.get(config.channelId).send({ embeds: [embed] })
                            .then(() => console.log(`Message successfully sent for ${coin.name} (${coin.symbol.toUpperCase()}) in ${mode} mode.`))
                            .catch(console.error);
                        currentCooldowns.set(coin.symbol, now);
                    }
                    lastCoinRank = rank;
                }
            }

            coinsFetched += data.filter(coin => coin.market_cap_rank >= startRank && coin.market_cap_rank <= endRank).length;
            currentPage++;

            console.log(`Fetched ${data.length} coins for ${mode} mode. Page: ${currentPage - 1}`);
            await delay(20000); // Adjusted delay after each fetch to manage API rate limit
        } catch (error) {
            console.error(`Error fetching data from CoinGecko in ${mode} mode:`, error);
            break;
        }
    }

    console.log(`Finished fetching data for ${mode} mode. Last coin rank fetched: #${lastCoinRank}, indicating the total number of coins fetched.`);
    cleanupCooldowns(currentCooldowns); // Cleanup cooldowns after processing is complete
}

// Cleanup function to remove coins from cooldowns if their cooldown period has expired
function cleanupCooldowns(cooldownMap) {
    const now = Date.now();
    for (const [coin, timestamp] of cooldownMap.entries()) {
        if (now > timestamp + config.cooldownPeriod) {
            cooldownMap.delete(coin);
        }
    }
}

export function setupCoinGeckoTask(client) {
    fetchAndProcessData(client, 'scanner'); // Initialize fetching for scanner mode
    setInterval(() => fetchAndProcessData(client, 'scanner'), config.fetchInterval + 5000); // Set an interval to periodically fetch data in scanner mode

    fetchAndProcessData(client, 'degen'); // Initialize fetching for degen mode
    setInterval(() => fetchAndProcessData(client, 'degen'), config.fetchInterval + 10000); // Set an interval to periodically fetch data in degen mode
}
