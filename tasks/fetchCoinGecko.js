import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath));
const cooldowns = new Map();

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndProcessData(client) {
  if (!global.botActive) return; // Ensure the bot is active before proceeding

  // Fetch data from CoinGecko API with parameters from config.json
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${config.perPage}&page=1&sparkline=false&price_change_percentage=24h`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (const coin of data) {
      const { symbol, price_change_percentage_24h, name } = coin;
      // Notify only for significant changes based on config.minChangePercentage and if not recently notified
      if (Math.abs(price_change_percentage_24h) >= config.minChangePercentage && !cooldowns.has(symbol)) {
        const color = price_change_percentage_24h > 0 ? '#00FF00' : '#FF0000'; // Green for positive, red for negative

        // Construct the embed message to be sent
        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(name)
          .setThumbnail(coin.image)
          .addFields(
            { name: 'Ticker', value: symbol.toUpperCase(), inline: true },
            { name: 'Price', value: `$${coin.current_price}`, inline: true },
            { name: 'Market Cap', value: `$${coin.market_cap.toLocaleString()}`, inline: true },
            { name: '24h Change', value: `${price_change_percentage_24h.toFixed(2)}%`, inline: true }
          );

        await delay(1000); // Wait for 1 second before proceeding to avoid spamming

        // Fetch the designated channel and send the message
        client.channels.fetch(config.channelId)
          .then(async channel => {
            if (channel) {
              await channel.send({ embeds: [embed] })
                .then(() => console.log(`Message successfully sent for ${name} (${symbol.toUpperCase()}).`))
                .catch(error => console.error(`Could not send message for ${name} (${symbol.toUpperCase()}): ${error}`));
            } else {
              console.log(`Channel with ID ${config.channelId} was not found.`);
            }
          })
          .catch(error => console.error(`Could not fetch channel ${config.channelId}: ${error}`));

        // Set a cooldown for the coin
        cooldowns.set(symbol, Date.now());
      } else {
        console.log(`No significant change or already notified for ${name} (${symbol.toUpperCase()}).`);
      }
    }

    // Remove coins from cooldown after the period specified in config.json
    const now = Date.now();
    cooldowns.forEach((timestamp, symbol) => {
      if (now - timestamp >= config.cooldownPeriod) {
        cooldowns.delete(symbol);
        console.log(`Cooldown expired for ${symbol}, it can be notified again.`);
      }
    });
  } catch (error) {
    console.error("Error fetching data from CoinGecko or processing data:", error);
  }
}

export function setupCoinGeckoTask(client) {
  // Run immediately and then every interval specified in config.json
  fetchAndProcessData(client);
  setInterval(() => fetchAndProcessData(client), config.fetchInterval);
}
