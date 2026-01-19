"""
DOCXRagSearch module.

This module provides a dummy implementation of a DOCX search tool for CrewAI.
"""

class DocxRagSearch:
    """
    DocxRagSearch allows searching for a query in a DOCX document.
    
    For simplicity, this dummy implementation does not actually parse DOCX files.
    Instead, it simulates a document with fixed content.
    """
    
    def __init__(self, file_path: str):
        """
        Initialize the DocxRagSearch with a file path.
        
        Args:
            file_path (str): The path to the DOCX document.
        """
        self.file_path = file_path

    def search(self, query: str) -> list:
        """
        Simulate searching for the query in the DOCX document.
        
        Args:
            query (str): The search term.
            
        Returns:
            list: A list with a dummy result if the query is found.
        """
        dummy_content = "This is a dummy DOCX content for testing."
        if query in dummy_content:
            return [f"Found '{query}' in DOCX document"]
        return []