# Templates Guide

## Overview
Templates in the Hello World Agent are used to structure the agent's responses, prompts, and interactions. This guide explains how to customize these templates to modify the agent's behavior and output format.

## Template Locations
Templates are primarily stored in `agent/config/prompts.yaml`. These templates use YAML syntax and support variable interpolation.

## Template Types

### 1. System Prompts
System prompts define the agent's core behavior and personality. They are found in the `prompts.yaml` file:

```yaml
system_prompt: |
  You are an AI assistant focused on {task_type}.
  Your primary goal is to {goal_description}.
  
  Approach:
  1. Analyze the given prompt
  2. Break down complex tasks
  3. Execute step-by-step
```

### 2. Task Templates
Task templates define how different types of tasks are processed:

```yaml
research_task: |
  Research Task:
  Topic: {topic}
  Depth: {depth}
  Focus Areas:
  - {focus_points}
  
execute_task: |
  Execution Task:
  Objective: {objective}
  Steps:
  1. {step1}
  2. {step2}
```

### 3. Output Templates
Output templates control how results are presented:

```yaml
analysis_output: |
  Analysis Results:
  ==================
  Key Findings:
  {findings}
  
  Recommendations:
  {recommendations}
```

## Customizing Templates

### Adding Variables
You can add new variables to templates using curly braces:
```yaml
custom_template: |
  Processing {custom_var1} with {custom_var2}
```

### Modifying Format
Change the structure and formatting:
```yaml
# Original
result: "Result: {output}"

# Modified
result: |
  ╔════ RESULT ════╗
  {output}
  ╚════════════════╝
```

### Adding New Templates
1. Open `agent/config/prompts.yaml`
2. Add your new template:
```yaml
my_template: |
  Custom output for {scenario}
  Details:
  - {point1}
  - {point2}
```

### Template Variables
Common variables you can use:
- `{task_type}`: Type of task (research/execute/analyze)
- `{prompt}`: User's input prompt
- `{timestamp}`: Current time
- `{result}`: Task results
- `{status}`: Task status

## Advanced Template Features

### Conditional Content
Use YAML anchors and aliases for conditional content:
```yaml
templates:
  base: &base |
    Base content here

  detailed: &detailed |
    Detailed analysis:
    {details}

  combined: |
    <<: *base
    <<: *detailed
```

### Multi-line Formatting
YAML supports various multi-line string formats:
```yaml
# Literal Block (preserves newlines)
template: |
  Line 1
  Line 2
  
# Folded Block (folds newlines)
template: >
  This is a long line
  that will be folded
  into a single line
```

### Template Inheritance
Templates can inherit from others:
```yaml
base_template: &base
  header: "Standard Header"
  footer: "Standard Footer"

custom_template:
  <<: *base
  body: "Custom Content"
```

## Best Practices

1. **Consistency**: Maintain consistent formatting across templates
2. **Documentation**: Comment your templates for clarity
3. **Modularity**: Break down complex templates into reusable components
4. **Testing**: Test templates with various inputs
5. **Version Control**: Track template changes in version control

## Example: Complete Template Set
```yaml
# System Configuration
system:
  name: "Hello World Agent"
  version: "1.0"
  
# Task Templates
tasks:
  research:
    prompt: |
      Research Task: {topic}
      Depth: {depth}
      Outputs:
      - Key findings
      - Supporting evidence
      - Recommendations
      
  execute:
    prompt: |
      Execution Task: {objective}
      Parameters:
      - Target: {target}
      - Method: {method}
      - Success Criteria: {criteria}

# Output Formats
output:
  success: |
    ✅ Task Completed
    ==================
    Results:
    {results}
    
    Next Steps:
    {next_steps}
    
  error: |
    ❌ Task Error
    ==================
    Error: {error_message}
    Resolution: {resolution_steps}
```

## Troubleshooting

### Common Issues
1. **Variable Not Found**
   - Check variable names match exactly
   - Verify variables are passed correctly

2. **Formatting Issues**
   - Validate YAML syntax
   - Check indentation
   - Ensure proper use of | or > for multi-line strings

3. **Template Not Loading**
   - Verify file path
   - Check YAML structure
   - Validate template name

### Testing Templates
Test your templates using the agent's debug mode:
```bash
./start.sh --prompt "test prompt" --task research --debug
```

## Conclusion
Templates provide a powerful way to customize the Hello World Agent's behavior and output. By understanding and modifying these templates, you can create a unique and effective agent experience tailored to your needs.