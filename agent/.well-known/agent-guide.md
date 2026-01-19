# Hello World Agent Guide

## Overview
The Hello World Agent demonstrates the ReACT (Reasoning and Acting) methodology for autonomous task execution. This guide explains how to use and interact with the agent effectively.

## ReACT Methodology Implementation

### 1. Research Mode
```python
[THOUGHT] Clear reasoning process
[ACTION] Specific action to take
[OBSERVATION] Results and findings
[REFLECTION] Analysis and next steps
```

### 2. Execution Mode
```python
[THOUGHT] Implementation analysis
[ACTION] Implementation steps
[OBSERVATION] Implementation results
[VALIDATION] Quality checks
```

### 3. Analysis Mode
```python
[THOUGHT] Analysis process
[ACTION] Evaluation steps
[OBSERVATION] Performance findings
[RECOMMENDATION] Optimization suggestions
```

## Operation Modes

### Autonomous Mode (Default)
- Self-directed task execution
- Streaming responses
- Progress tracking
- Error handling

### Human-in-the-Loop Mode (Optional)
Enable with `--hitl` flag for validation at key points:
1. Research focus definition
2. Analysis approach approval
3. Execution plan verification
4. Results validation

## Authentication
```bash
# Add to .env file
OPENROUTER_API_KEY=your_api_key_here
```

## API Usage

### Research Task
```bash
curl -X POST /api/v1/research \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{"prompt": "What is quantum computing?", "hitl": false}'
```

### Execute Task
```bash
curl -X POST /api/v1/execute \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{"prompt": "Implement feature X", "hitl": false}'
```

### Analyze Task
```bash
curl -X POST /api/v1/analyze \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{"prompt": "Analyze performance", "hitl": false}'
```

## Command Line Usage

### Basic Usage
```bash
./start.sh --prompt "Your task here" --task research
```

### With HITL Mode
```bash
./start.sh --prompt "Your task here" --task research --hitl
```

## Resource Management
- Rate limit: 100 requests/hour
- Max tokens: 4096 per request
- Concurrent tasks: 1

## Best Practices

1. **Task Definition**
   - Be specific in prompts
   - Include success criteria
   - Specify constraints

2. **HITL Usage**
   - Enable for critical tasks
   - Provide clear feedback
   - Validate at key points

3. **Error Handling**
   - Check response status
   - Handle interruptions
   - Preserve state

## Examples

### Research Task
```bash
./start.sh --prompt "What is quantum computing?" --task research
```

### Execution Task
```bash
./start.sh --prompt "Implement error handling" --task execute
```

### Analysis Task
```bash
./start.sh --prompt "Analyze system performance" --task analyze
```

## Support and Resources
- [Documentation](/docs/)
- [GitHub Repository](https://github.com/ruvnet/hello_world_agent)
- [Issue Tracker](https://github.com/ruvnet/hello_world_agent/issues)