"""
FileWriterTool module.

This module provides a simple implementation of a file writer tool for CrewAI.
"""

class FileWriterTool:
    """
    FileWriterTool writes content to a specified file.
    
    Attributes:
        file_path (str): The path of the file to write.
    """
    
    def __init__(self, file_path: str):
        """
        Initialize the FileWriterTool with a file path.
        
        Args:
            file_path (str): The target file path.
        """
        self.file_path = file_path

    def write(self, content: str) -> None:
        """
        Write the given content to the file.
        
        Args:
            content (str): The content to write.
        """
        with open(self.file_path, "w", encoding="utf-8") as f:
            f.write(content)