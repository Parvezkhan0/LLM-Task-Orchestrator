# CrewAI Tools Overview

CrewAI offers a diverse set of tools that enhance AI agent capabilities. This document outlines the key tools available, categorized by their functionality. The suite of tools enables tasks ranging from web content search to document processing, media handling, development and database operations.

## Implemented Tools

- **WebsiteSearchTool**: Enables searching across specific websites. (See `agent/tools/website_search_tool.py`)
- **SeleniumScrapingTool**: Performs advanced web scraping with CSS selector support. (See `agent/tools/selenium_scraping_tool.py`)
- **PDFSearchTool**: Searches within PDF documents. (See `agent/tools/pdf_search_tool.py`)

## Extended Tool Categories

### Search and Content Tools

#### Web Tools
- **WebsiteSearchTool**: Enables searching across specific websites or the entire web [2].
- **ScrapeWebsiteTool**: Extracts content from specified web pages [2].
- **SeleniumScrapingTool**: Performs advanced web scraping with CSS selector support [2].
- **EXA Search Web Loader**: Facilitates web content loading and searching [5].

#### Media Tools
- **YoutubeVideoSearchTool**: Searches within specific videos or across YouTube content [2].
- **YouTube Channel RAG Search**: Enables searching through channel content [5].
- **DALL-E Tool**: Generates and processes images [5].
- **Vision Tool**: Handles visual processing tasks [5].

### Document Processing Tools

#### File Management
- **PDFSearchTool**: Searches within PDF documents [2].
- **FileWriterTool**: Writes content to files [1].
- **FileReadTool**: Reads content from files [5].
- **Directory RAG Search**: Searches through directory contents [5].

#### Format-Specific Tools
- **JSON RAG Search**: Searches within JSON data [5].
- **CSV RAG Search**: Processes CSV file content [5].
- **DOCX RAG Search**: Searches within Word documents [5].
- **MDX RAG Search**: Handles MDX file content [5].

### Development Tools

#### Code and Repository
- **GithubSearchTool**: Performs semantic searches within GitHub repositories [2].
- **Code Interpreter**: Executes and processes code [5].
- **Code Docs RAG Search**: Searches through code documentation [5].

### Database Tools
- **MySQL RAG Search**: Searches within MySQL databases [5].
- **PG RAG Search**: Processes PostgreSQL database content [5].
- **NL2SQL Tool**: Converts natural language to SQL queries [5].

## Citations

[1] https://www.datacamp.com/tutorial/crew-ai  
[2] https://github.com/0xZee/CrewAi-Tools  
[3] https://www.insightpartners.com/ideas/crewai-launches-multi-agentic-platform-to-deliver-on-the-promise-of-generative-ai-for-enterprise/  
[4] https://docs.crewai.com/introduction  
[5] https://docs.crewai.com/tools/composiotool  
[6] https://www.crewai.com/enterprise  
[7] https://www.restack.io/p/crewai-answer-tools-list-overview-cat-ai  
[8] https://github.com/crewAIInc/crewAI-examples  
[9] https://www.crewai.com  
[10] https://github.com/crewAIInc/crewAI-tools  
[11] https://pypi.org/project/crewai/  
[12] https://www.crewai.com/ecosystem  
[13] https://www.youtube.com/watch?v=XrdPxV12QcE  
[14] https://www.crewai.com/templates  
[15] https://www.reddit.com/r/crewai/comments/1hzcpi1/ai_agents_and_tools/  
[16] https://venturebeat.com/ai/crewai-launches-its-first-multi-agent-builder-speeding-the-way-to-agentic-ai/  
[17] https://www.reddit.com/r/crewai/comments/1cjkc5s/can_some_please_post_a_super_simple_example_of_a/  
[18] https://www.ibm.com/think/topics/crew-ai  
[19] https://www.youtube.com/watch?v=VAeQWMaPJk8  

This document is continuously updated as new tools are integrated into CrewAI.