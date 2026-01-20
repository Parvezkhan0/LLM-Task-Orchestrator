# Configuration Guide

## Overview
The Hello World Agent is highly configurable, allowing you to tailor its behavior to your specific needs. This guide provides detailed instructions on how to configure the agent using YAML files located in the `agent/config/` directory.

## Configuration Files
The main configuration files are:
- `agents.yaml`: Defines agent-specific settings.
- `tasks.yaml`: Configures task parameters and behaviors.
- `analysis.yaml`: Sets rules for data analysis.
- `prompts.yaml`: Contains templates for system prompts and responses.

## agents.yaml
This file contains settings specific to the agent's operation.

### Example Configuration
```yaml
agent_name: "Hello World Agent"
version: "1.0"
default_task: "research"
```

### Customizing Agent Settings
- **agent_name**: The display name of the agent.
- **version**: The current version of the agent.
- **default_task**: The default task type when none is specified.

## tasks.yaml
This file configures task-related parameters.

### Example Configuration
```yaml
tasks:
  research:
    depth: "comprehensive"
    focus_areas:
      - "technology"
      - "science"
  execute:
    safety_checks: true
    max_runtime: 300
```

### Customizing Task Parameters
- **depth**: The level of detail for research tasks.
- **focus_areas**: Specific areas of interest for research.
- **safety_checks**: Enable or disable safety checks for execution tasks.
- **max_runtime**: Maximum allowed runtime for execution tasks (in seconds).

## analysis.yaml
This file sets rules for data analysis.

### Example Configuration
```yaml
analysis:
  methods:
    - "statistical"
    - "predictive"
  output_format: "summary"
```

### Customizing Analysis Rules
- **methods**: List of analysis methods to apply.
- **output_format**: Format of the analysis output (e.g., summary, detailed).

## prompts.yaml
This file contains templates for system prompts and responses.

### Example Configuration
```yaml
system_prompt: |
  You are an AI assistant focused on {task_type}.
  Your primary goal is to {goal_description}.

prompts:
  greeting: "Hello! How can I assist you today?"
  farewell: "Goodbye! Have a great day!"
```

### Customizing Prompts
- **system_prompt**: The main prompt that defines the agent's behavior.
- **greeting**: The message displayed when the agent starts.
- **farewell**: The message displayed when the agent ends.

## Advanced Configuration

### Environment Variables
The agent can use environment variables for sensitive information, such as API keys. Define these in a `.env` file:

```env
OPENROUTER_API_KEY=your_api_key_here
```

### Dynamic Configuration
For advanced users, consider implementing dynamic configuration loading in `agent/config/config_loader.py`. This allows for runtime configuration changes.

## Best Practices

1. **Consistency**: Maintain consistent naming conventions across configuration files.
2. **Documentation**: Comment configuration files for clarity.
3. **Version Control**: Track configuration changes in version control.
4. **Security**: Use environment variables for sensitive information.

## Conclusion
Configuration files provide a flexible way to customize the Hello World Agent's behavior. By understanding and modifying these files, you can create a tailored agent experience that meets your specific needs.