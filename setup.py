from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="llm_task_orchestrator",
    version="0.1.0",
    author="Parvez Khan",
    author_email="",
    description="LLM Task Orchestrator - ReACT-Based Autonomous Agent Framework",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Parvezkhan0/LLM-Task-Orchestrator",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Framework :: AsyncIO",
    ],
    python_requires=">=3.8",
    install_requires=[
        "crewai[local]>=0.1.0",
        "langchain>=0.1.0",
        "python-dotenv>=1.0.0",
        "pyyaml>=6.0.0",
        "httpx>=0.24.0"
    ],
    entry_points={
        "console_scripts": [
            "llm-orchestrator=engine.main:run",
        ],
    },
    include_package_data=True,
    package_data={
        "engine": [
            "config/*.yaml",
            ".well-known/*",
            "docs/*",
            "examples/*"
        ],
    },
)
