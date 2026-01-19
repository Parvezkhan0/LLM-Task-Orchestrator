# HITL Example: Human-in-the-Loop for Decision Making using HelloWorldCrew

import os
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from agent.crew import HelloWorldCrew

def run_with_hitl():
    print("Starting HITL Example with HelloWorldCrew...")

    # Initialize the crew
    crew = HelloWorldCrew()

    # Step 1: Task Initiation
    task = "research"
    print(f"Task: {task}")

    # Step 2: Human Input Request
    user_input = input("Do you want to proceed with the research task? (yes/no): ")

    # Step 3: User Feedback
    if user_input.lower() == "yes":
        # Step 4: Task Continuation using HelloWorldCrew
        print("Proceeding with the research task using HelloWorldCrew...")
        result = crew.run(prompt="What is quantum computing?", task_type=task)
    else:
        print("Task aborted by user.")
        result = "Task was not executed."

    # Display result
    print(result)

if __name__ == "__main__":
    run_with_hitl()