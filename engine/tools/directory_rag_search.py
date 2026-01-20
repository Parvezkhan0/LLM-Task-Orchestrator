import os

class DirectoryRagSearch:
    """
    DirectoryRagSearch tool.

    Searches through the contents of a specified directory and returns file names
    that contain the search query as a substring.
    """
    
    def __init__(self, directory: str):
        """
        Initialize the DirectoryRagSearch with a target directory.

        Args:
            directory (str): The path of the directory to search.
        """
        self.directory = directory

    def search(self, query: str) -> list:
        """
        Search for files in the directory whose names contain the query.

        Args:
            query (str): The substring to search for in file names.

        Returns:
            list: A list of file names matching the query.
        """
        matches = []
        for filename in os.listdir(self.directory):
            if query in filename:
                matches.append(filename)
        return matches