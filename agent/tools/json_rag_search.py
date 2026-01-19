import json

class JSONRagSearch:
    """
    JSONRagSearch tool.

    Searches within a JSON structure for keys or values that contain the specified query.
    The input may be provided as a dict or a JSON-formatted string.
    """

    def __init__(self, json_input):
        """
        Initialize the JSONRagSearch with a JSON input.

        Args:
            json_input (dict or str): A dictionary or a JSON string.
        """
        if isinstance(json_input, str):
            self.data = json.loads(json_input)
        else:
            self.data = json_input

    def search(self, query: str) -> list:
        """
        Search for the query in all keys and values of the JSON data.

        Args:
            query (str): The search term.

        Returns:
            list: A collection of matching key-value pairs as dictionaries.
        """
        results = []

        def recursive_search(data):
            if isinstance(data, dict):
                for key, value in data.items():
                    if query in str(key) or query in str(value):
                        results.append({key: value})
                    recursive_search(value)
            elif isinstance(data, list):
                for item in data:
                    recursive_search(item)

        recursive_search(self.data)
        return results