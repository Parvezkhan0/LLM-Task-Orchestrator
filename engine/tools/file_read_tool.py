"""
FileReadTool module.

This module provides a simple implementation of a file reader tool for CrewAI.
"""

class FileReadTool:
    """
    FileReadTool reads content from a specified file.
    
    Attributes:
        file_path (str): The path of the file to read.
    """
    
    def __init__(self, file_path: str):
        """
        Initialize the FileReadTool with a file path.
        
        Args:
            file_path (str): The target file path.
        """
        self.file_path = file_path

    def read(self) -> str:
        """
        Read and return the content of the file.
        
        Returns:
            str: The content of the file.
        """
        with open(self.file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return content