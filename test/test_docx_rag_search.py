from agent.tools.docx_rag_search import DocxRagSearch

def test_docx_search():
    tool = DocxRagSearch("dummy.docx")
    # Using a query that is present in the dummy content.
    results = tool.search("dummy")
    expected = ["Found 'dummy' in DOCX document"]
    assert results == expected, f"Expected {expected}, got {results}"
    print("DocxRagSearch test passed.")

if __name__ == "__main__":
    test_docx_search()