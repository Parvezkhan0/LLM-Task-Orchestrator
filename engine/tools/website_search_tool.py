"""
WebsiteSearchTool module.

This module provides a dummy implementation of a website search tool for CrewAI.
"""

class WebsiteSearchTool:
    """
    WebsiteSearchTool allows searching for content on a given website.
    
    Attributes:
        website (str): The website domain to search (e.g., "example.com").
    """
    
    def __init__(self, website: str):
        """
        Initialize the WebsiteSearchTool with a website.
        
        Args:
            website (str): The website to search.
        """
        self.website = website

    def search(self, query: str, max_results: int = 10) -> list:
        """
        Search for a query in the configured website.
        
        Args:
            query (str): The search query.
            max_results (int, optional): Maximum number of results. Defaults to 10.
        
        Returns:
            list: List of dummy search result strings.
        """
        return [f"{self.website} result {i} for '{query}'" for i in range(1, max_results+1)]