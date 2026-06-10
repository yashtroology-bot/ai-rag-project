from fastapi import FastAPI
from pydantic import BaseModel

# Initialize the FastAPI app
app = FastAPI(title="AI RAG Microservice", description="API for communicating with our local AI models")

# Define the structure for incoming requests
class QueryRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "AI RAG Microservice is running and ready!"}

@app.post("/ask")
def ask_question(request: QueryRequest):
    # TODO: Connect to ChromaDB (retrieval) and Ollama (generation)
    return {"answer": f"You asked: '{request.question}'. The AI brain is currently being wired up!"}

# To run this server: uvicorn main:app --reload
