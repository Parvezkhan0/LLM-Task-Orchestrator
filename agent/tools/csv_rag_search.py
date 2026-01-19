import csv

class CSVRagSearch:
    """
    CSVRagSearch tool.

    Searches within CSV file content for rows containing a specified query.
    """

    def __init__(self, file_path: str):
        """
        Initialize CSVRagSearch with the CSV file path.

        Args:
            file_path (str): The path to the CSV file.
        """
        self.file_path = file_path

    def search(self, query: str) -> list:
        """
        Search for rows in the CSV file that contain the query in any cell.

        Args:
            query (str): The search term.

        Returns:
            list: A list of rows (each row as a list of strings) that contain the query.
        """
        results = []
        with open(self.file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if any(query in cell for cell in row):
                    results.append(row)
        return results