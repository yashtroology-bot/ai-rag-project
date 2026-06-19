import os
import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from rag_core import process_and_store_document, query_rag

# Load environment variables from .env file
load_dotenv()

# Initialize the FastAPI app
app = FastAPI(title="AI RAG Microservice", description="API for communicating with our Cloud AI")

# Initialize the Groq model
# This will automatically pick up GROQ_API_KEY from your .env file
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.7)

# Define the structure for incoming requests
class QueryRequest(BaseModel):
    question: str
    image_base64: str = None
    history: List[Dict[str, Any]] = []

@app.get("/")
def read_root():
    return {"message": "AI RAG Microservice is running and ready!"}

@app.post("/ask")
def ask_question(request: QueryRequest):
    # Return a StreamingResponse that yields text chunks
    try:
        return StreamingResponse(query_rag(request.question, llm, request.image_base64, request.history), media_type="text/plain")
    except Exception as e:
        def error_gen():
            yield f"Error searching database: {str(e)}"
        return StreamingResponse(error_gen(), media_type="text/plain")

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Process the document and store in RAG database
        num_chunks = process_and_store_document(temp_file_path)
        return {"message": f"Successfully processed {file.filename} into {num_chunks} chunks and stored in ChromaDB."}
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

# To run this server: uvicorn main:app --reload
