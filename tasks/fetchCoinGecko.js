// tasks/fetchCoinGecko.js
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

// tasks/fetchCoinGecko.js
// (Include the imports and other initializations as before)

async function fetchAndProcessData(client) {
  if (!global.botActive) return;

  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h");
    const data = await response.json();

    for (const coin of data) {
      const { symbol, price_change_percentage_24h, name } = coin;
      if (Math.abs(price_change_percentage_24h) >= 20 && !cooldowns.has(symbol)) {
        const color = price_change_percentage_24h > 0 ? '#00FF00' : '#FF0000'; // Green for positive, red for negative

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

        await delay(1000); // Wait for 1 second before proceeding

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

        cooldowns.set(symbol, Date.now());
      } else {
        console.log(`No significant change or already notified for ${name} (${symbol.toUpperCase()}).`);
      }
    }

    // Remove coins from cooldown after 12h
    const now = Date.now();
    cooldowns.forEach((timestamp, symbol) => {
      if (now - timestamp >= 43200000) { // 12 hours in milliseconds
        cooldowns.delete(symbol);
        console.log(`Cooldown expired for ${symbol}, it can be notified again.`);
      }
    });
  } catch (error) {
    console.error("Error fetching data from CoinGecko or processing data:", error);
  }
}

export function setupCoinGeckoTask(client) {
  // Run immediately and then every 5 minutes
  fetchAndProcessData(client);
  setInterval(() => fetchAndProcessData(client), 300000); // 300000 milliseconds = 5 minutes
}
