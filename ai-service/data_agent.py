import os
import json
from pymongo import MongoClient
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Setup Database Connection
# Aap ise apne PARTIQ database connection string se replace kar sakte hain
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://yashshukla0160_db_user:URhXYNaoCsdcCUyN@ai-rag.mnxzvy0.mongodb.net/insightrag?retryWrites=true&w=majority")
client = MongoClient(MONGO_URI)
db = client.get_database() # Defaults to insightrag

# Initialize AI
try:
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
except Exception as e:
    print(f"Error initializing Groq: {e}")
    llm = None

# 1. Schema Definition (Tells AI what your DB looks like)
DB_SCHEMA = """
Database Name: insightrag (or partiq)
Collection: products
Fields:
- name (string): Name of the product
- category (string): Product family/category (e.g., 'Electronics', 'Clothing')
- stock (number): Current inventory count
- price (number): Price of the product

Collection: orders
Fields:
- orderId (string)
- productName (string)
- quantity (number)
- status (string): e.g. 'Delivered', 'Pending'
"""

def generate_mql_query(question: str):
    """Converts English text into a MongoDB Aggregation Pipeline."""
    system_prompt = f"""You are an expert MongoDB database admin.
Your job is to translate the user's natural language question into a MongoDB aggregation pipeline array.

Here is the database schema:
{DB_SCHEMA}

Return ONLY a valid JSON object with this exact structure:
{{
    "collection": "name_of_collection",
    "pipeline": [ array of aggregation stages like $match, $group, $sort, $limit ]
}}

Do NOT include any markdown formatting, backticks or explanations. Just valid JSON.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", question)
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({})
        content = response.content.strip()
        
        # Clean up markdown if hallucinated
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"Query Generation Error: {e}")
        return None

def execute_query(query_data: dict):
    """Executes the generated MQL on MongoDB."""
    if not query_data or "collection" not in query_data or "pipeline" not in query_data:
        return {"error": "Invalid query format generated."}
        
    collection_name = query_data["collection"]
    pipeline = query_data["pipeline"]
    
    print(f"Executing Query on '{collection_name}': {pipeline}")
    
    try:
        collection = db[collection_name]
        results = list(collection.aggregate(pipeline))
        
        # Convert ObjectId to string so it's JSON serializable
        for doc in results:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
                
        return results
    except Exception as e:
        print(f"DB Execution Error: {e}")
        return {"error": str(e)}

def synthesize_results(question: str, db_results: list):
    """Converts raw JSON DB results back into a human-friendly answer."""
    if isinstance(db_results, dict) and "error" in db_results:
        return f"I encountered an error while searching the database: {db_results['error']}"
        
    if not db_results:
        return "I checked the database, but couldn't find any data matching your request."
        
    system_prompt = """You are a smart Data Assistant. 
The user asked a question, and I queried the database for you.
Here are the raw JSON results from the database:
{db_results}

Your job is to read this JSON data and give the user a clear, professional, human-readable summary. 
Keep it concise. If there are numbers, highlight them.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "User Question: {question}")
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "db_results": json.dumps(db_results[:10]), # limit to 10 records for context size
            "question": question
        })
        return response.content
    except Exception as e:
        return "I got the data, but failed to summarize it."

def process_data_chat(question: str):
    """The main workflow function."""
    print(f"\n--- Processing Data Request: {question} ---")
    
    # Step 1: Text to MQL
    query_data = generate_mql_query(question)
    if not query_data:
        return {"answer": "Failed to understand the query request.", "raw_data": []}
        
    # Step 2: Run Query
    raw_results = execute_query(query_data)
    
    # Step 3: Summarize
    human_answer = synthesize_results(question, raw_results)
    
    return {
        "answer": human_answer,
        "query_used": query_data,
        "raw_data": raw_results
    }
