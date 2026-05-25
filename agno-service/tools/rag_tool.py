import os
import requests

from dotenv import load_dotenv

load_dotenv()

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL")


def search_documents(
    query: str,
    pdfNames: list[str] = []
) -> str:

    print("RAG TOOL CALLED")

    try:

        response = requests.post(
            f"{RAG_SERVICE_URL}/api/rag/ask",

            json={
                "question": query,
                "pdfNames": pdfNames
            },

            timeout=30
        )

        data = response.json()

        context = data.get("context", [])

        if not context:
            return "No relevant document context found."

        return "\n\n".join(context)

    except Exception as e:

        return f"RAG tool error: {str(e)}"