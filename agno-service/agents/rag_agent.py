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

   instructions=[
    """
    Use search_documents whenever:
    - user asks about PDFs
    - uploaded files
    - summaries
    - document questions

    Always use the provided pdfNames
    when searching documents.
    """
]
)