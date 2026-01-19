"""
MDXRagSearch module.

This module provides a dummy implementation of an MDX search tool for CrewAI.
"""

class MDXRagSearch:
    """
    MDXRagSearch allows searching for a query within MDX content.

    For simplicity, this dummy implementation treats the MDX content as plain text.
    """
    
    def __init__(self, mdx_content: str):
        """
        Initialize MDXRagSearch with MDX content.
        
        Args:
            mdx_content (str): The MDX content to search.
        """
        self.mdx_content = mdx_content

    def search(self, query: str) -> list:
        """
        Search for the query in the MDX content.
        
        Args:
            query (str): The search term.
        
        Returns:
            list: A list with a dummy result if the query is found; otherwise, an empty list.
        """
        if query in self.mdx_content:
            return [f"Found '{query}' in MDX content"]
        return []