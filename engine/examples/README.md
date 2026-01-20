# Examples

This directory contains examples demonstrating how to use the Hello World Agent with various command-line arguments and configurations.

## Basic Usage

### Example 1: Research Task
Run a research task with a custom prompt:
```bash
./start.sh --prompt "What is quantum computing?" --task research
```

### Example 2: Execution Task
Execute a task with a specific objective:
```bash
./start.sh --prompt "Run system diagnostic." --task execute
```

### Example 3: Combined Task
Perform both research and execution tasks:
```bash
./start.sh --prompt "Analyze market trends and execute report generation." --task both
```

## Human-in-the-Loop (HITL) Example

### Example 4: HITL Workflow
Implement a human-in-the-loop process for decision-making:
1. **Task Initiation**: The agent starts a task and reaches a decision point.
2. **Human Input Request**: The agent prompts the user for input.
3. **User Feedback**: The user provides feedback or approval.
4. **Task Continuation**: The agent uses the feedback to proceed with the task.

```python
# Example HITL implementation in main.py

def run():
    args = parse_args()
    display_banner()
    crew = HelloWorldCrew()
    
    # Example HITL decision point
    if args.task == "research":
        user_input = input("Do you want to proceed with the research task? (yes/no): ")
        if user_input.lower() != "yes":
            print("Task aborted by user.")
            return
    
    result = crew.run(prompt=args.prompt, task_type=args.task)
    if result:
        print("Task completed successfully.")
    else:
        print("Task failed.")
```

## Conclusion
These examples provide a starting point for using the Hello World Agent with different configurations and incorporating human-in-the-loop processes. Customize the examples to fit your specific needs and explore the agent's capabilities.