"""Human input tool for CrewAI integration"""

def get_human_input(prompt):
    """Get input from human operator"""
    print("\n" + "="*50)
    print("🤝 Human Input Required")
    print("="*50)
    return input(f"\n{prompt}\n\nYour response: ")

def validate_human_input(response):
    """Validate human input"""
    if not response:
        return False, "Empty response not allowed"
    return True, response