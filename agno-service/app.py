from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from agents.rag_agent import rag_agent

app = FastAPI()


class ChatRequest(BaseModel):
    message: str
    pdfNames: Optional[List[str]] = []


@app.post("/chat")
async def chat(req: ChatRequest):

    final_prompt = f"""
    User Question:
    {req.message}

    Uploaded PDFs:
    {req.pdfNames}
    """

    response = rag_agent.run(final_prompt)

    return {
        "response": response.content
    }