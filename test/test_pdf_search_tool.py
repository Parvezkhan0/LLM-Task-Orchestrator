from agent.tools.pdf_search_tool import PDFSearchTool

def test_pdf_search():
    tool = PDFSearchTool("document.pdf")
    results = tool.search("dummy", max_results=2)
    expected = [
        "Result 1 for 'dummy' in document.pdf",
        "Result 2 for 'dummy' in document.pdf"
    ]
    assert results == expected, f"Expected {expected} but got {results}"
    print("PDFSearchTool search test passed.")

if __name__ == "__main__":
    test_pdf_search()