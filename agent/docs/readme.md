# Hello World Agent Documentation and User Guide

## Overview
Welcome to the Hello World Agent User Guide. This document will walk you through the purpose, installation, and customization of the Hello World Agent. The agent uses the ReAct (Reasoning and Acting) methodology for analyzing and executing tasks. Whether you are a beginner or an experienced developer, this guide will help you understand how to customize the agent, modify its templates, and extend its tools.

## Prerequisites
Before you begin, ensure your environment meets the following prerequisites:
- Python 3.8 or higher
- pip package manager
- A Unix-like shell (Bash)

## Installation
The installation process is simple:
1. Navigate to the agent directory:
   ```bash
   cd agent
   ```
2. Run the installation script:
   ```bash
   ./install.sh
   ```
   This command installs the agent package in development mode and sets up your environment. It also creates a `.env` file if one does not exist.

## Running the Agent
To start the agent, use the following commands:
1. **Using the start script (recommended):**
   ```bash
   ./start.sh --prompt "Your custom prompt" --task research
   ```
2. **Alternatively, using the console command (after installation):**
   ```bash
   agent --prompt "Your custom prompt" --task research
   ```
By default, the agent accepts these command-line arguments:
- `--prompt`: Specifies the prompt for the AI system. Default: "Tell me about yourself".
- `--task`: Specifies the task type. Allowed values: `research`, `execute`, `analyze`, `both`. Default: `both`.

## Customizing the Agent
The Hello World Agent is designed to be flexible. Here are some customization options:

### Changing Command-Line Arguments
You can modify the default settings by editing the `agent/main.py` file, specifically the `parse_args()` function. Here, you can add, remove, or alter arguments as needed.

### Modifying Configuration Files
The agent uses configuration files in the `agent/config/` directory:
- `agents.yaml`: Agent definitions and settings.
- `tasks.yaml`: Task parameters and definitions.
- `analysis.yaml`: Rules for analysis.
- `prompts.yaml`: Templates for prompts.

Customize these files to change how the agent behaves.

### Custom Templates and Prompts
Edit `agent/config/prompts.yaml` to adjust the templates used for output. This can change the tone, format, or content of the agent's responses.

### Extending Tools and Custom Modules
Additional functionality can be added in the `agent/tools/` directory:
- `custom_tool.py`: A sample tool for adding custom features.
- `user_prompt.py`: Handles user input and prompt processing.

To add a new tool, create a new Python file in `agent/tools/` and integrate it into the agent's code as needed.

### Advanced Customization
For advanced users, consider these modifications:
- Update the package version in `agent/pyproject.toml` and `setup.py`.
- Extend the namespace packaging for multiple agents or modules.
- Customize the ReAct methodology implementation in the agent's code.

## Examples and Use Cases
Here are some sample commands:
1. **Basic Research Task:**
   ```bash
   ./start.sh --prompt "What is quantum computing?" --task research
   ```
2. **Execution Task:**
   ```bash
   ./start.sh --prompt "Run system diagnostic." --task execute
   ```
3. **Combined Mode:**
   ```bash
   ./start.sh --prompt "Analyze market trends." --task both
   ```

## Troubleshooting & FAQs
- **ModuleNotFoundError:** Ensure you run the agent from the correct directory. Use the updated `start.sh` from the `agent` directory.
- **Argument Issues:** Validate that you supply valid values for `--task`.
- **Customization Not Reflecting:** Restart the agent after making changes to the configuration files or templates.

## Conclusion
The Hello World Agent is a flexible tool built on the ReAct methodology. This guide has provided an overview of installation, usage, and customization options to help you tailor the agent to your needs. For more details, refer to the GitHub repository and explore the source code.

Happy customizing!