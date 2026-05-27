from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from agents.rag_agent import rag_agent
from tools.rag_tool import search_documents

app = FastAPI()


class ChatRequest(BaseModel):
    message: str
    pdfNames: Optional[List[str]] = []


@app.post("/chat")
async def chat(req: ChatRequest):

    def document_tool(query: str):

        return search_documents(
            query=query,
            pdfNames=req.pdfNames
        )

    rag_agent.tools = [document_tool]

    response = rag_agent.run(req.message)

    return {
        "response": response.content
    }