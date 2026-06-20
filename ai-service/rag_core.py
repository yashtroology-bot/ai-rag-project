import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from sentence_transformers import CrossEncoder
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

# Directory to store the local database
DB_DIR = "./chroma_db"

def process_and_store_document(file_path: str):
    print(f"Loading document: {file_path}")
    
    # 1. Load the PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    # 2. Split the text into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    
    print(f"Split document into {len(chunks)} chunks.")
    
    # 3. Create embeddings model
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # 4. Store chunks in ChromaDB
    print("Saving to Vector Database...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_DIR
    )
    
    print("Document successfully stored in database!")
    return len(chunks)

def query_rag(question: str, llm, image_base64: str = None, history: list = None):
    try:
        # 0. Vision Route
        if image_base64:
            print(f"Vision Mode triggered for question: {question}")
            vision_llm = ChatGroq(model="llama-3.2-11b-vision-instruct", temperature=0.5)
            
            message = HumanMessage(
                content=[
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": image_base64}},
                ]
            )
            for chunk in vision_llm.stream([message]):
                yield chunk.content
            return

        print(f"Searching database for: {question}")
        
        # 1. Load the vector database
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        
        # 2. Broad Retrieval: get top 50 chunks for large PDFs
        print("Performing broad retrieval (top 50)...")
        results = vectorstore.similarity_search(question, k=50)
        
        context = ""
        source = "database"
        
        if results:
            # 3. Re-Ranking with Cross-Encoder
            print("Re-ranking results using Cross-Encoder...")
            cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            
            # Create pairs of (question, chunk_text)
            pairs = [[question, doc.page_content] for doc in results]
            scores = cross_encoder.predict(pairs)
            
            # Sort documents by score descending
            scored_docs = sorted(zip(scores, results), key=lambda x: x[0], reverse=True)
            
            # Take the top 5 highest scoring chunks
            top_5_docs = [doc for score, doc in scored_docs[:5]]
            context = "\n\n---\n\n".join([doc.page_content for doc in top_5_docs])
            
            # 4. Routing (Evaluate Context)
            print("Evaluating if context answers the question...")
            eval_prompt = f"""Given the following context, can you answer the user's question completely based on it?
Context: {context}
Question: {question}
Answer with exactly one word: YES or NO."""
            
            evaluation = llm.invoke(eval_prompt).content.strip().upper()
            print(f"Evaluator decided: {evaluation}")
            
            if "NO" in evaluation:
                context = "" # Context is not sufficient
                
        if not context:
            # 5. Fallback: Agentic Web Search
            print("Context insufficient. Executing Web Search Fallback...")
            source = "web"
            try:
                from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    results = list(ddgs.text(question, max_results=3))
                    web_results = "\n".join([f"- {r['title']}: {r['body']}" for r in results])
                context = f"Web Search Results:\n{web_results}"
            except Exception as e:
                print(f"Web Search Error: {e}")
                context = "Web search failed. Proceed with general knowledge."
                source = "llm"

        # 6. Final Stream Generation
        print(f"Streaming final answer using {source} context...")
        
        # Format chat history
        formatted_history = ""
        if history:
            formatted_history = "Chat History:\n" + "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history]) + "\n"
        
        final_prompt = f"""You are a cool Gen-Z AI assistant. Use a lot of slang like 'fr', 'no cap', and 'lit'. 
Use the following context and chat history to answer the user's question.
If the context contains "Web Search Results:", synthesize a good answer from the web results.
If you are still unsure, state that clearly.

{formatted_history}
Context:
{context}

Question: {question}

Answer:"""

        for chunk in llm.stream(final_prompt):
            yield chunk.content
    except Exception as e:
        import traceback
        error_msg = f"\n\n[Python Error]: {str(e)}\n\nTraceback: {traceback.format_exc()}"
        print(error_msg)
        yield error_msg
