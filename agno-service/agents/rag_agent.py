import os

from dotenv import load_dotenv

from agno.agent import Agent
from agno.models.openai import OpenAIChat

from tools.rag_tool import search_documents

load_dotenv()

model = OpenAIChat(
    id="openai/gpt-4o-mini",

    api_key=os.getenv("OPENROUTER_API_KEY"),

    base_url="https://openrouter.ai/api/v1",
)

rag_agent = Agent(
    model=model,

    tools=[search_documents],

    markdown=True,

    instructions="""
You are an intelligent AI assistant.

You have access to uploaded PDF documents.

IMPORTANT:
- Use search_documents whenever the user asks about:
  - PDFs
  - uploaded files
  - summaries
  - resumes
  - reports
  - documents

- Always retrieve document context before answering.

- Use retrieved context carefully.

- If context is unavailable, clearly say so.
"""
)