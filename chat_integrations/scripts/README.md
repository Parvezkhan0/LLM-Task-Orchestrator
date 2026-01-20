# Discord Bot Scripts

This directory contains scripts for testing and deploying the Discord bot with slash commands.

## Available Scripts

### `test_discord_commands.sh`

Tests the Discord bot by simulating slash command interactions locally.

```bash
./test_discord_commands.sh [options]
```

Options:
- `-p, --port PORT`: Specify the port to run on (default: 8000)
- `-k, --key KEY`: Specify a test Discord public key (optional)
- `-h, --help`: Display help message

This script:
1. Starts the Discord bot locally
2. Sends simulated slash command interactions
3. Displays the responses
4. Stops the bot when testing is complete

### `register_commands.sh`

Registers slash commands with Discord's API.

```bash
./register_commands.sh [options]
```

Options:
- `-t, --token TOKEN`: Discord bot token (required)
- `-a, --app-id ID`: Discord application ID (required)
- `-g, --guild-id ID`: Guild ID for guild-specific commands (optional)
- `-h, --help`: Display help message

This script registers the following commands:
- `/ask [query]`: Ask the agent any question or give it a task
- `/calc [expression]`: Perform a calculation using the calculator tool
- `/domain [domain] [query] [reasoning_type]`: Use domain-specific reasoning
- `/info`: Get information about the bot and its capabilities
- `/help [command]`: Get help on how to use commands

## Usage Examples

### Testing the Bot Locally

```bash
# Test with default settings
./test_discord_commands.sh

# Test with a custom port
./test_discord_commands.sh --port 9000

# Test with a custom Discord public key
./test_discord_commands.sh --key your_test_key
```

### Registering Commands

```bash
# Register global commands
./register_commands.sh --token YOUR_BOT_TOKEN --app-id YOUR_APP_ID

# Register guild-specific commands (for testing)
./register_commands.sh --token YOUR_BOT_TOKEN --app-id YOUR_APP_ID --guild-id YOUR_GUILD_ID
```

## Notes

- The test script requires `jq` for JSON formatting. Install it with `apt-get install jq` on Debian/Ubuntu or `brew install jq` on macOS.
- The register script requires a valid Discord bot token and application ID, which you can obtain from the Discord Developer Portal.
- Guild-specific commands are updated instantly and are useful for testing, while global commands can take up to an hour to propagate.