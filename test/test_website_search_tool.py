from agent.tools.website_search_tool import WebsiteSearchTool

def test_search():
    tool = WebsiteSearchTool("example.com")
    results = tool.search("test", max_results=3)
    expected = [
        "example.com result 1 for 'test'",
        "example.com result 2 for 'test'",
        "example.com result 3 for 'test'"
    ]
    assert results == expected, f"Expected {expected} but got {results}"
    print("WebsiteSearchTool search test passed.")

if __name__ == "__main__":
    test_search()