"""
YoutubeVideoSearchTool module.

This module provides a dummy implementation of a YouTube video search tool for CrewAI.
"""

class YoutubeVideoSearchTool:
    """
    YoutubeVideoSearchTool provides a dummy implementation for searching YouTube videos.
    """

    def __init__(self):
        pass

    def search(self, query: str, max_results: int = 5) -> list:
        """
        Simulate a search on YouTube videos for the given query.

        Args:
            query (str): The search term.
            max_results (int, optional): The maximum number of results. Defaults to 5.

        Returns:
            list: A list of dummy search results.
        """
        return [f"YouTube video result {i} for '{query}'" for i in range(1, max_results + 1)]