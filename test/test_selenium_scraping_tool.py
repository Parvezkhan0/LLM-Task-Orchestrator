from agent.tools.selenium_scraping_tool import SeleniumScrapingTool

def test_scrape():
    tool = SeleniumScrapingTool(["h1", ".content"])
    results = tool.scrape("http://example.com")
    expected = {
        "h1": "Dummy content for h1 from http://example.com",
        ".content": "Dummy content for .content from http://example.com"
    }
    assert results == expected, f"Expected {expected} but got {results}"
    print("SeleniumScrapingTool scrape test passed.")

if __name__ == "__main__":
    test_scrape()