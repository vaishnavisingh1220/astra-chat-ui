from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from agents.rag_agent import rag_agent
from tools.rag_tool import search_documents

app = FastAPI()


class ChatRequest(BaseModel):
    message: str
    pdfNames: Optional[List[str]] = []
    history: Optional[list] = []


@app.post("/chat")
async def chat(req: ChatRequest):

    def document_tool(query: str):

        return search_documents(
            query=query,
            pdfNames=req.pdfNames
        )

    rag_agent.tools = [document_tool]

    memory_context = ""

    for msg in req.history:

        role = msg.get("role", "user")

        content = msg.get("content", "")

        memory_context += (
            f"{role}: {content}\n"
        )

    final_prompt = f"""
You are an intelligent Agentic AI assistant.

Use previous conversation memory naturally.

Remember user preferences,
conversation context,
and uploaded PDF discussions.

Conversation History:
{memory_context}

Current User Message:
{req.message}
"""

    response = rag_agent.run(final_prompt)

    return {
        "response": response.content
    }