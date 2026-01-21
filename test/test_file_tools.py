import os
from agent.tools.file_writer_tool import FileWriterTool
from agent.tools.file_read_tool import FileReadTool

def test_file_writer_and_reader():
    temp_file = "temp_test_file.txt"
    test_content = "Hello, CrewAI!"
    
    # Test FileWriterTool
    writer = FileWriterTool(temp_file)
    writer.write(test_content)
    
    # Ensure file was written correctly using FileReadTool
    reader = FileReadTool(temp_file)
    output = reader.read()
    assert output == test_content, f"Expected '{test_content}', got '{output}'"
    
    # Cleanup temporary file
    if os.path.exists(temp_file):
        os.remove(temp_file)
    print("FileWriterTool and FileReadTool tests passed.")

if __name__ == "__main__":
    test_file_writer_and_reader()