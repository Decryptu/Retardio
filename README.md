# Retardio Bot

Retardio is an advanced Discord bot that provides real-time alerts on significant cryptocurrency market movements. Powered by the CoinGecko API, it tracks the top 100 cryptocurrencies, delivering beautifully crafted embed messages directly to your designated Discord channel. These alerts include vital information such as the coin's name, price, market cap, and percentage change, offering a comprehensive overview of major market shifts.

## Features

- Real-time tracking of the top 100 cryptocurrencies on CoinGecko.
- Automatic alerts for any coin that moves up or down by 20%.
- Detailed embed messages containing the coin's data, including price and market cap.
- Easy to configure and deploy on any Discord server.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Decryptu/Retardio.git
    ```

2. Install dependencies:

    ```bash
    cd Retardio
    npm install
    ```

3. Configure your bot:

    Create a `.env` file in the root directory and add your Discord bot token like so:

    ```plaintext
    DISCORD_TOKEN=your_discord_bot_token_here
    ```

    Edit the `config.json` file to include the channel ID where alerts should be posted.

4. Start the bot:

    ```bash
    npm run start
    ```

## Demonstration

![Retardio Bot in action](/images/screen.jpeg)

This screenshot demonstrates how alerts appear in your Discord channel, providing real-time updates on significant market movements.

## Usage

Once deployed, Retardio will monitor cryptocurrency movements and automatically post alerts in the specified channel. There's no further action required; just watch for alerts and stay ahead of the market!

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue on the [GitHub repository](https://github.com/Decryptu/Retardio/issues).

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have suggestions, please [open an issue](https://github.com/Decryptu/Retardio/issues) on GitHub.
