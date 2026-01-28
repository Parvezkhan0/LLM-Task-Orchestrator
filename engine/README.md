A simple demonstration orchestrator using the ReACT methodology for analyzing and executing tasks.

## Quick Install

```bash
pip install llm_task_orchestrator
```

## Prerequisites

* Python 3.8 or higher
* OpenRouter API key (for LLM access)

## Installation

1. Install via pip:

   ```bash
   pip install llm_task_orchestrator
   ```

   Or install from source:

   ```bash
   git clone https://github.com/ruvnet/llm_task_orchestrator.git
   cd llm_task_orchestrator
   pip install -e .
   ```

2. Add your OpenRouter API key to the `.env` file:

   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

## Usage

1. Start the orchestrator using the command-line tool:

   ```bash
   orchestrator --prompt "What is quantum computing?" --task research
   ```

   Or run from source:

   ```bash
   ./start.sh --prompt "What is quantum computing?" --task research
   ```

### Command Line Arguments

* `--prompt`: Specify the input prompt (default: "Tell me about yourself")
* `--task`: Specify the task type: research, execute, analyze, or both (default: both)
* `--hitl`: Enable human-in-the-loop mode (optional)

Example:

```bash
orchestrator --prompt "What is quantum computing?" --task research --hitl
```

## Features

* ReACT Methodology Implementation
* Research Analysis
* Task Execution
* Performance Analysis
* Progress Tracking
* Streaming Responses



## Documentation

For detailed documentation and user guides, refer to:

* [User Guide](docs/readme.md)
* [Templates Guide](docs/templates.md)
* [Tools Guide](docs/tools.md)
* [Configuration Guide](docs/configuration.md)
* [Advanced Implementations Guide](docs/advanced_implementations.md)
* [Memory and Storage Guide](docs/memory_and_storage.md)
* [Human-in-the-Loop Guide](docs/human_in_the_loop.md)

## Examples

Explore the [Examples](examples/README.md) directory for sample usage scenarios and human-in-the-loop implementations.


## Acknowledgments

* Built with [CrewAI](https://github.com/joaomdmoura/crewAI)
* Powered by [OpenRouter](https://openrouter.ai/)
