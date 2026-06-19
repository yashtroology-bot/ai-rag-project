# 🚀 GCP AI Developer — Complete Interview Preparation Guide

> **Candidate**: Yash Shukla | **Role**: GCP AI Developer
> **Your Strength**: 3.5+ years Full Stack + AI (LLM integrations, data extraction pipelines)
> **Your Gap**: No production GCP experience — but your AI/ML integration skills transfer directly

---

> [!TIP]
> ## How to Use This Guide
> 1. Read through ALL sections — understand the concepts deeply, not just memorize
> 2. Practice speaking answers out loud — interviewers evaluate communication too
> 3. Wherever you see 🎯 **"Your Angle"** — that's how to connect your existing experience
> 4. Star ⭐ questions you find hard and revisit them multiple times
> 5. The last section has a **Mock Interview Script** — do a dry run before the actual interview

---

## Table of Contents

1. [Section 1: Google Cloud Platform (GCP) Fundamentals](#section-1-gcp-fundamentals)
2. [Section 2: Vertex AI — The Core Platform](#section-2-vertex-ai)
3. [Section 3: Generative AI on GCP](#section-3-generative-ai-on-gcp)
4. [Section 4: Agentic AI — The Future](#section-4-agentic-ai)
5. [Section 5: MLOps & Model Lifecycle](#section-5-mlops--model-lifecycle)
6. [Section 6: RAG (Retrieval-Augmented Generation)](#section-6-rag)
7. [Section 7: Prompt Engineering & Fine-Tuning](#section-7-prompt-engineering--fine-tuning)
8. [Section 8: GCP AI APIs & Pre-built Services](#section-8-gcp-ai-apis)
9. [Section 9: Architecture & System Design](#section-9-architecture--system-design)
10. [Section 10: Practical Scenarios & Coding](#section-10-practical-scenarios)
11. [Section 11: Behavioral & Situational Questions](#section-11-behavioral-questions)
12. [Section 12: Mock Interview Script](#section-12-mock-interview)
13. [Section 13: Quick Revision Cheat Sheet](#section-13-cheat-sheet)

---

# Section 1: GCP Fundamentals

## Q1. What is Google Cloud Platform (GCP) and how does it differ from AWS/Azure?

**Answer:**
Google Cloud Platform is Google's suite of cloud computing services running on the same infrastructure Google uses internally for products like Search, YouTube, and Gmail.

**Key Differentiators from AWS/Azure:**

| Feature | GCP | AWS | Azure |
|---------|-----|-----|-------|
| **AI/ML Strength** | Vertex AI, Gemini, TPUs — industry leading | SageMaker, Bedrock | Azure OpenAI, Azure ML |
| **Data Analytics** | BigQuery (serverless, best-in-class) | Redshift | Synapse |
| **Networking** | Google's private global fiber network | Standard | Standard |
| **Kubernetes** | GKE (Google invented K8s) | EKS | AKS |
| **Open Source** | Strong commitment (TensorFlow, Kubernetes) | Less | Less |
| **Pricing** | Per-second billing, sustained-use discounts | Per-hour | Per-hour |

**Key GCP Services to Know:**
- **Compute**: Compute Engine (VMs), Cloud Run (serverless containers), Cloud Functions (serverless functions), GKE (Kubernetes)
- **Storage**: Cloud Storage (object storage), Persistent Disks, Filestore
- **Database**: Cloud SQL, Cloud Spanner, Firestore, Bigtable, AlloyDB
- **AI/ML**: Vertex AI, Gemini API, AutoML, AI Platform
- **Data**: BigQuery, Dataflow, Pub/Sub, Dataproc

🎯 **Your Angle**: "I've been working with Node.js/Express backends deployed on various platforms. GCP's Cloud Run is particularly interesting to me because it allows containerized Node.js deployments with automatic scaling — which aligns with the microservices I've built."

---

## Q2. Explain GCP's resource hierarchy (Organization → Folder → Project → Resources)

**Answer:**
```
Organization (company level — e.g., troology.com)
  └── Folder (department/team — e.g., AI-Team)
       └── Project (environment — e.g., ai-rag-prod)
            └── Resources (VMs, buckets, Vertex AI endpoints, etc.)
```

- **Organization**: Top-level node, tied to a Google Workspace/Cloud Identity domain
- **Folder**: Grouping mechanism (e.g., by department, environment)
- **Project**: The fundamental unit of GCP — all resources belong to a project. Each project has:
  - A unique **Project ID** (globally unique, immutable)
  - A **Project Number** (auto-assigned)
  - A **Project Name** (human readable, mutable)
- **IAM Policies**: Inherited downward (Organization → Folder → Project → Resource)

**Why This Matters for AI Development:**
- Each Vertex AI model, endpoint, pipeline belongs to a specific project
- Billing is tracked at project level
- Service accounts (used for API authentication) are project-scoped

---

## Q3. What is IAM (Identity and Access Management) in GCP?

**Answer:**
IAM lets you control **who** (identity) has **what access** (role) to **which resource**.

**Key Concepts:**
- **Principal/Member**: Who is requesting access (user, service account, group)
- **Role**: Collection of permissions (e.g., `roles/aiplatform.user`)
- **Policy**: Binds members to roles on a resource

**Types of Roles:**
1. **Basic Roles**: Owner, Editor, Viewer (broad — avoid in production)
2. **Predefined Roles**: Fine-grained (e.g., `roles/aiplatform.admin`, `roles/bigquery.dataViewer`)
3. **Custom Roles**: You define exactly which permissions

**Service Accounts** — Very important for AI workloads:
- Machine-to-machine authentication
- Your Vertex AI pipelines use service accounts to access data in Cloud Storage/BigQuery
- Example: A Cloud Function calling Vertex AI endpoint needs a service account with `roles/aiplatform.user`

🎯 **Your Angle**: "This is similar to how I manage API keys and authentication in my Node.js backends. Service accounts in GCP are like dedicated API credentials for internal services, which is much more secure than sharing user credentials."

---

## Q4. What are the key GCP networking concepts an AI developer should know?

**Answer:**

- **VPC (Virtual Private Cloud)**: Your private network in GCP
- **VPC Peering**: Connect two VPCs privately (used when Vertex AI endpoints need to access your private data)
- **Private Google Access**: Allow VMs without external IPs to access GCP APIs (including Vertex AI)
- **Cloud NAT**: Internet access for private instances
- **Cloud Endpoints / API Gateway**: Manage and secure your AI APIs

**For AI Developers specifically:**
- **VPC-SC (Service Controls)**: Security perimeter around your AI data — prevents data exfiltration
- **Private Endpoints**: Deploy Vertex AI models on private endpoints (not public internet)
- Use **Cloud Armor** for DDoS protection on public-facing AI endpoints

---

## Q5. Explain Cloud Storage classes and when to use each

**Answer:**

| Storage Class | Use Case | Min Duration | Cost |
|---------------|----------|--------------|------|
| **Standard** | Frequently accessed data, model training data | None | Highest |
| **Nearline** | Monthly access — backup models | 30 days | Lower |
| **Coldline** | Quarterly access — old experiment data | 90 days | Lower |
| **Archive** | Yearly access — compliance/audit | 365 days | Lowest |

**For AI Development:**
- Training datasets → **Standard** (frequently read during training)
- Trained model artifacts → **Nearline** (accessed when deploying/retraining)
- Old experiment checkpoints → **Coldline/Archive**

---

# Section 2: Vertex AI

## Q6. What is Vertex AI and why is it important?

**Answer:**
Vertex AI is Google Cloud's **unified AI/ML platform** that brings together all of Google's AI capabilities in one place. Think of it as the "one-stop shop" for building, deploying, and managing ML models on GCP.

**Before Vertex AI (the old way):**
- AI Platform Training (separate service)
- AI Platform Prediction (separate service)
- AutoML (separate service)
- Each had different APIs, SDKs, and interfaces

**With Vertex AI (unified):**
- Single API, single SDK, single console
- Training + Deployment + Monitoring + Feature Store + Pipelines + GenAI — all in one place

**Key Components:**

```
Vertex AI Platform
├── Model Garden          → Pre-trained models (Gemini, PaLM, Llama, etc.)
├── Generative AI Studio  → Test & tune generative models
├── AutoML                → No-code model training
├── Custom Training       → Your own code/framework
├── Feature Store          → Centralized feature management
├── Pipelines             → MLOps workflow orchestration
├── Model Registry        → Version & manage models
├── Endpoints             → Deploy & serve models
├── Experiments           → Track training runs
├── Vector Search         → Similarity search for RAG
├── Vertex AI Search      → Enterprise search
└── Agent Builder         → Build AI agents
```

🎯 **Your Angle**: "In my current role at Troology, I built AI-driven extraction pipelines using external LLM endpoints. Vertex AI would centralize all of this — I could use Model Garden for the LLM, Vertex Pipelines for the extraction workflow, and Endpoints for serving the model, all within one managed platform instead of stitching together multiple services."

---

## Q7. What is Vertex AI Model Garden?

**Answer:**
Model Garden is Vertex AI's **curated catalog of foundation models** — both Google's and third-party models, ready to use.

**Categories of models available:**

1. **Google Foundation Models:**
   - **Gemini** (multimodal — text, image, video, audio, code)
   - **Imagen** (image generation)
   - **Codey** (code generation)
   - **Chirp** (speech-to-text)
   - **Embeddings API** (text/multimodal embeddings)

2. **Open Source Models:**
   - Llama (Meta)
   - Mistral
   - Falcon
   - Stable Diffusion
   - Many more

3. **Task-Specific Models:**
   - Classification, summarization, entity extraction, etc.

**How You Use It:**
- Browse → Select a model → Try in Vertex AI Studio → Deploy to endpoint → Call via API
- Or use via the Vertex AI SDK in Python/Node.js

---

## Q8. Explain the difference between AutoML and Custom Training in Vertex AI

**Answer:**

| Aspect | AutoML | Custom Training |
|--------|--------|-----------------|
| **Who it's for** | Non-ML experts, fast prototyping | ML engineers, custom needs |
| **Code required** | No code (UI-based) | Full code (Python, TF, PyTorch) |
| **Model architecture** | Google chooses the best | You define it |
| **Data prep** | Structured format, labeled | Flexible |
| **Training infra** | Fully managed | You choose (CPU/GPU/TPU) |
| **Customization** | Limited | Full control |
| **Time to production** | Hours/Days | Weeks/Months |
| **Use case example** | Image classification, text sentiment | Custom NER, domain-specific LLM |

**AutoML supports:**
- Image (classification, object detection, segmentation)
- Video (classification, tracking, action recognition)
- Text (classification, extraction, sentiment)
- Tabular (classification, regression, forecasting)

**Custom Training supports:**
- Pre-built containers (TensorFlow, PyTorch, XGBoost, scikit-learn)
- Custom containers (bring your own Docker image)
- Distributed training across multiple GPUs/TPUs

---

## Q9. How do you deploy a model to a Vertex AI Endpoint?

**Answer:**

**Step-by-step process:**

```python
from google.cloud import aiplatform

# 1. Initialize
aiplatform.init(project="my-project", location="us-central1")

# 2. Upload model to Model Registry
model = aiplatform.Model.upload(
    display_name="my-extraction-model",
    artifact_uri="gs://my-bucket/model-artifacts/",
    serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-cpu.2-12:latest"
)

# 3. Create an Endpoint
endpoint = aiplatform.Endpoint.create(display_name="extraction-endpoint")

# 4. Deploy model to endpoint
model.deploy(
    endpoint=endpoint,
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=5,   # auto-scaling!
    traffic_percentage=100
)

# 5. Make predictions
response = endpoint.predict(instances=[{"text": "Parse this PDF content..."}])
print(response.predictions)
```

**Key Deployment Concepts:**
- **Traffic Splitting**: Deploy multiple model versions to same endpoint (A/B testing)
- **Auto-scaling**: Min/Max replicas based on traffic
- **Machine Types**: CPU, GPU (NVIDIA T4, A100, L4), TPU
- **Private Endpoints**: For VPC-internal access only
- **Online vs Batch Prediction**: Online (real-time) vs Batch (large datasets, async)

🎯 **Your Angle**: "This is similar to deploying my Node.js APIs — but instead of deploying a REST API that calls an external LLM, Vertex AI lets me deploy the model itself as a managed endpoint with auto-scaling, which I currently handle manually with container orchestration."

---

## Q10. What is Vertex AI Feature Store?

**Answer:**
Feature Store is a **centralized repository for storing, serving, and managing ML features** — the processed data inputs that models use for predictions.

**Why it matters:**
- **Feature Reuse**: Teams share features instead of re-computing them
- **Training-Serving Consistency**: Same features used in training are served in real-time (prevents "training-serving skew")
- **Time-Travel**: Access historical feature values (point-in-time correctness)
- **Low-Latency Serving**: Optimized for real-time predictions

**Example:**
```
Feature Store
├── Entity Type: "Customer"
│   ├── Feature: avg_order_value
│   ├── Feature: total_purchases_30d
│   └── Feature: churn_risk_score
├── Entity Type: "Product"
│   ├── Feature: avg_rating
│   └── Feature: category_embedding
```

**How it connects to your work:**
If you're building a product recommendation model on the ScalePart eVehicle platform:
- Features like "product_view_count", "category_affinity" are stored in Feature Store
- During training: historical features are read in batch
- During prediction: latest features are served in real-time (< 10ms latency)

---

## Q11. What are Vertex AI Pipelines?

**Answer:**
Vertex AI Pipelines is a **serverless MLOps orchestration service** for building reproducible ML workflows.

**Built on:**
- Kubeflow Pipelines (KFP) — open source
- TFX (TensorFlow Extended) — also supported

**A typical pipeline:**
```
Data Ingestion → Data Validation → Feature Engineering → Model Training → Model Evaluation → Model Deployment
```

**Code Example (Kubeflow Pipelines v2):**
```python
from kfp import dsl
from kfp.dsl import component

@component
def preprocess_data(input_path: str, output_path: str):
    # Read raw data, clean, transform
    import pandas as pd
    df = pd.read_csv(input_path)
    df_clean = df.dropna()
    df_clean.to_csv(output_path)

@component
def train_model(data_path: str, model_path: str):
    # Train your model
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    # ... training logic
    joblib.dump(model, model_path)

@dsl.pipeline(name="my-ml-pipeline")
def my_pipeline():
    preprocess_task = preprocess_data(
        input_path="gs://bucket/raw_data.csv",
        output_path="gs://bucket/clean_data.csv"
    )
    train_task = train_model(
        data_path=preprocess_task.outputs["output_path"],
        model_path="gs://bucket/model/"
    )

# Compile and submit
from kfp import compiler
compiler.Compiler().compile(my_pipeline, "pipeline.json")

# Submit to Vertex AI
from google.cloud import aiplatform
job = aiplatform.PipelineJob(
    display_name="training-pipeline",
    template_path="pipeline.json"
)
job.run()
```

**Key Features:**
- **Scheduled Runs**: Retrain models on schedule (e.g., weekly)
- **Caching**: Skip unchanged steps for faster iteration
- **Lineage Tracking**: Track which data/code produced which model
- **Integration**: With BigQuery, Cloud Storage, Vertex AI endpoints

---

## Q12. Explain Vertex AI Experiments and Model Registry

**Answer:**

### Vertex AI Experiments
- Track and compare **training runs** (like MLflow for GCP)
- Log metrics: accuracy, loss, F1-score, latency
- Log parameters: learning rate, batch size, epochs
- Log artifacts: model checkpoints, plots
- Compare experiments side-by-side in the console

### Model Registry
- **Central catalog** of all trained models
- **Versioning**: v1, v2, v3 of the same model
- **Metadata**: Training data, hyperparameters, performance metrics
- **Lifecycle Management**: Promote from staging → production
- **Integration**: Deploy directly from Registry to Endpoints

```python
# Register a model
model = aiplatform.Model.upload(
    display_name="pdf-extractor-v2",
    artifact_uri="gs://bucket/model-v2/",
    serving_container_image_uri="...",
    labels={"version": "2", "team": "ai"}
)

# List model versions
models = aiplatform.Model.list(filter='display_name="pdf-extractor"')
```

---

# Section 3: Generative AI on GCP

## Q13. What is Generative AI and how does GCP support it?

**Answer:**
Generative AI refers to AI systems that can **create new content** — text, images, code, audio, video — based on patterns learned from training data.

**GCP's Generative AI Stack:**

```
┌─────────────────────────────────────────────┐
│          Applications & Agents              │
│    (Agent Builder, Custom Apps)              │
├─────────────────────────────────────────────┤
│          AI Development Tools               │
│    (Vertex AI Studio, Prompt Design)        │
├─────────────────────────────────────────────┤
│          Foundation Models                  │
│    (Gemini, Imagen, Codey, Embeddings)      │
├─────────────────────────────────────────────┤
│          Infrastructure                     │
│    (TPUs, GPUs, Cloud Storage, BigQuery)    │
└─────────────────────────────────────────────┘
```

**Key GCP GenAI Services:**

1. **Gemini Models** — Google's most capable multimodal model family
   - Gemini Ultra → Most powerful, complex reasoning
   - Gemini Pro → Balanced performance/cost
   - Gemini Flash → Fastest, cheapest, lightweight tasks
   - Gemini Nano → On-device (mobile/edge)

2. **Vertex AI Studio** — Interactive UI to test and tune models
3. **Vertex AI Agent Builder** — Build and deploy AI agents
4. **Vertex AI Search** — Enterprise search powered by LLMs
5. **Vertex AI Conversation** — Build chatbots/virtual agents

🎯 **Your Angle**: "I've been using OpenAI GPT models for conversational AI features at Cognitivo and LLM-based data extraction at Troology. Google's Gemini models offer similar capabilities but with the advantage of native GCP integration — I can use them through Vertex AI with enterprise-grade security, without managing API keys to external providers."

---

## Q14. What is Gemini and what makes it different from other LLMs?

**Answer:**

**Gemini** is Google DeepMind's family of multimodal AI models.

**Key Differentiators:**

1. **Natively Multimodal**: Trained from the ground up on text, images, audio, video, and code together — not bolted on separately
2. **Long Context Window**: Gemini 1.5 Pro supports up to **2 million tokens** — can process entire codebases, books, hours of video
3. **Model Variants for Different Needs**:
   - **Gemini 2.0 Flash** — Latest, fast, great for agentic tasks
   - **Gemini 1.5 Pro** — Long context, complex reasoning
   - **Gemini 1.5 Flash** — Speed optimized
4. **Native Tool Use**: Built-in support for function calling, code execution, Google Search grounding
5. **Enterprise-Ready**: Available via Vertex AI with data privacy guarantees (your data is NOT used for training)

**Comparison:**

| Feature | Gemini | GPT-4 (OpenAI) | Claude (Anthropic) |
|---------|--------|-----------------|---------------------|
| Multimodal | Native (text+image+video+audio+code) | Text+Image | Text+Image |
| Context Window | Up to 2M tokens | 128K tokens | 200K tokens |
| Code Execution | Built-in | Via plugins | Limited |
| Google Search | Native grounding | No | No |
| GCP Integration | Native | Third-party | Third-party |
| On-device | Gemini Nano | No | No |

---

## Q15. How do you call the Gemini API through Vertex AI?

**Answer:**

**Using Python SDK:**
```python
import vertexai
from vertexai.generative_models import GenerativeModel, Part

# Initialize
vertexai.init(project="my-project", location="us-central1")

# Load model
model = GenerativeModel("gemini-1.5-pro")

# Simple text generation
response = model.generate_content("Explain Vertex AI in simple terms")
print(response.text)

# Multimodal — image + text
image = Part.from_uri("gs://bucket/product-catalog.png", mime_type="image/png")
response = model.generate_content([
    image,
    "Extract all product model numbers from this catalog page"
])
print(response.text)

# With generation config
from vertexai.generative_models import GenerationConfig
response = model.generate_content(
    "Write a technical specification document",
    generation_config=GenerationConfig(
        temperature=0.2,       # Lower = more deterministic
        max_output_tokens=8192,
        top_p=0.8,
        top_k=40
    )
)

# Chat (multi-turn)
chat = model.start_chat()
response = chat.send_message("What is RAG?")
print(response.text)
response = chat.send_message("How does it work with Vertex AI?")
print(response.text)
```

**Using REST API (for Node.js integration):**
```javascript
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({ project: 'my-project', location: 'us-central1' });
const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const result = await model.generateContent('Explain Vertex AI');
console.log(result.response.candidates[0].content.parts[0].text);
```

🎯 **Your Angle**: "This is very similar to how I call OpenAI's API in my Node.js backends — the SDK pattern is nearly identical. The key difference is that Vertex AI handles authentication via service accounts and IAM, which is more secure than managing API keys."

---

## Q16. Explain Generation Parameters: Temperature, Top-K, Top-P, Max Output Tokens

**Answer:**

These control **how the model generates text**:

### Temperature (0.0 - 2.0)
- Controls **randomness/creativity**
- `temperature=0.0` → Deterministic, always picks the most probable token (best for factual Q&A, extraction)
- `temperature=0.7` → Balanced creativity (default for most tasks)
- `temperature=1.5` → Very creative/random (brainstorming, creative writing)

### Top-K (1 - 40+)
- At each step, only consider the **top K most probable tokens**
- `top_k=1` → Always pick the single most likely word (greedy)
- `top_k=40` → Choose from top 40 most likely words (more variety)

### Top-P / Nucleus Sampling (0.0 - 1.0)
- Instead of top-K fixed count, pick tokens until cumulative probability reaches P
- `top_p=0.1` → Only tokens making up 10% of probability mass (conservative)
- `top_p=0.95` → Tokens making up 95% (default, flexible)

### Max Output Tokens
- Maximum length of response
- Gemini 1.5 Pro: up to 8,192 output tokens
- Important for cost control and response length

**Practical Recommendations:**

| Use Case | Temperature | Top-P | Top-K |
|----------|-------------|-------|-------|
| Data extraction (your PDF pipeline) | 0.0 - 0.1 | 0.1 | 1-5 |
| Summarization | 0.2 - 0.4 | 0.8 | 20 |
| Chatbot | 0.5 - 0.7 | 0.9 | 40 |
| Creative writing | 0.8 - 1.2 | 0.95 | 40 |
| Code generation | 0.1 - 0.3 | 0.8 | 20 |

---

## Q17. What is Grounding in Vertex AI?

**Answer:**
Grounding connects Gemini's responses to **real-world, verifiable information sources**, reducing hallucinations.

**Types of Grounding:**

1. **Google Search Grounding**:
   - Model can search Google in real-time during response generation
   - Provides citations and source URLs
   - Great for current information (news, prices, live data)

2. **Grounding with Custom Data (Vertex AI Search)**:
   - Ground responses in YOUR enterprise data
   - Upload documents, websites, or data stores
   - Model answers based on your data, not general knowledge

3. **RAG (Retrieval-Augmented Generation)**:
   - You build a custom retrieval pipeline
   - Retrieve relevant documents → Feed to LLM as context

```python
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.preview.generative_models import grounding

model = GenerativeModel("gemini-1.5-pro")

# Google Search grounding
tool = Tool.from_google_search_retrieval(
    grounding.GoogleSearchRetrieval()
)

response = model.generate_content(
    "What are the latest GCP AI announcements?",
    tools=[tool]
)
# Response includes citations from Google Search
```

🎯 **Your Angle**: "In my data extraction pipeline, I feed PDF content as context to the LLM — this is essentially manual grounding. Vertex AI's grounding feature automates this and adds verification, which would significantly improve accuracy in my extraction workflows."

---

## Q18. What is Function Calling in Gemini?

**Answer:**
Function calling allows Gemini to **interact with external systems** by outputting structured function calls that your application executes.

**Flow:**
```
User Query → Gemini → "I need to call function X with params Y" → Your App executes X(Y) → Result back to Gemini → Final response
```

**This is CRITICAL for Agentic AI** — it's how AI models take actions in the real world.

```python
from vertexai.generative_models import GenerativeModel, FunctionDeclaration, Tool

# Define functions the model can call
get_product_info = FunctionDeclaration(
    name="get_product_info",
    description="Get product details from the ScalePart database",
    parameters={
        "type": "object",
        "properties": {
            "model_number": {
                "type": "string",
                "description": "The product model number"
            },
            "category": {
                "type": "string",
                "description": "Product category (e.g., 'motor', 'battery', 'controller')"
            }
        },
        "required": ["model_number"]
    }
)

# Create tool
product_tool = Tool(function_declarations=[get_product_info])

model = GenerativeModel("gemini-1.5-pro", tools=[product_tool])

response = model.generate_content("Find details for motor model XM-5500")
# Gemini returns: function_call { name: "get_product_info", args: { model_number: "XM-5500" } }

# Your app executes the function and sends result back
# Gemini generates final natural language response
```

🎯 **Your Angle**: "This maps directly to my experience building AI integrations at Troology. When my extraction pipeline needs product data, instead of hardcoding API calls, function calling lets the LLM decide when and what to query — making the system much more flexible."

---

## Q19. Explain Embeddings and their use in GCP

**Answer:**

**Embeddings** = Dense vector representations of data (text, images) that capture semantic meaning.

**Why They Matter:**
- "King" and "Queen" have similar embeddings (semantically related)
- Enable **semantic search**, **RAG**, **clustering**, **recommendation**

**GCP Embedding Models:**
- `text-embedding-004` — Latest text embedding model (768 dimensions)
- `multimodalembedding` — Text + Image embeddings in same space

**How to Generate:**
```python
from vertexai.language_models import TextEmbeddingModel

model = TextEmbeddingModel.from_pretrained("text-embedding-004")

embeddings = model.get_embeddings(["electric vehicle motor specifications"])
vector = embeddings[0].values  # [0.023, -0.041, 0.087, ...] (768 floats)
```

**Storage & Search with Vertex AI Vector Search:**
- Store millions/billions of embeddings
- Find nearest neighbors in milliseconds
- Used for RAG systems, recommendation engines, similarity search

**Architecture for RAG:**
```
Documents → Chunk → Embed → Store in Vector Search
                                    ↓
User Query → Embed → Search Vector DB → Top-K Results → Feed to Gemini → Answer
```

---

## Q20. What is Vertex AI Search and Conversation?

**Answer:**

### Vertex AI Search
- **Enterprise-grade search** powered by Google's foundation models
- Upload your data (documents, websites, databases)
- Provides **semantic search** (not just keyword matching)
- Built-in **summarization** — answers questions from your data
- No ML expertise required

**Use Cases:**
- Internal knowledge base search
- Customer support — search documentation
- Product search on e-commerce (relevant for ScalePart!)

### Vertex AI Conversation (Dialogflow CX + LLM)
- Build **chatbots and virtual agents**
- Natural language understanding with LLM-powered responses
- Multi-turn conversations with memory
- Integration with telephony, web chat, messaging platforms

---

# Section 4: Agentic AI

## Q21. What is Agentic AI? Explain the concept

**Answer:**
Agentic AI refers to AI systems that can **autonomously plan, reason, and take actions** to achieve goals — going beyond simple Q&A.

**Key Properties of an AI Agent:**

1. **Autonomy**: Acts independently without constant human guidance
2. **Reasoning**: Breaks complex tasks into steps
3. **Tool Use**: Interacts with external systems (APIs, databases, code)
4. **Memory**: Maintains context across interactions
5. **Planning**: Creates and revises plans to achieve goals
6. **Observation**: Monitors results and adjusts approach

**Traditional AI vs Agentic AI:**

| Traditional AI (ChatGPT-style) | Agentic AI |
|-------------------------------|------------|
| Single response per query | Multi-step execution |
| No external actions | Calls tools, APIs, code |
| Stateless (mostly) | Maintains memory/state |
| Human guides each step | Autonomous planning |
| "Answer my question" | "Complete this task for me" |

**Example — Agentic AI for ScalePart:**
```
Goal: "Add all products from this PDF catalog to the database"

Agent Plan:
1. Parse the PDF → Extract pages
2. For each page, use vision model to extract product info
3. Validate extracted data against schema
4. Check if product already exists in MongoDB
5. If new → insert, if existing → update
6. Generate summary report of changes
7. Send notification to admin
```

The agent executes ALL steps autonomously, handling errors along the way.

---

## Q22. What is Google's Agent Builder (Vertex AI Agent Builder)?

**Answer:**

Agent Builder is GCP's **platform for building and deploying AI agents** without writing complex orchestration code.

**Components:**

1. **Agents**: Define goals, instructions, and available tools
2. **Tools**: Functions the agent can call (APIs, databases, Google Search)
3. **Data Stores**: Connected knowledge bases (documents, websites)
4. **Playbooks**: Step-by-step instructions for complex workflows
5. **Extensions**: Pre-built integrations (Google Workspace, third-party APIs)

**Architecture:**
```
User Input → Agent → Reasoning Loop:
                     ├── Understand intent
                     ├── Plan next action
                     ├── Select & call tool
                     ├── Process result
                     ├── Decide: done or continue?
                     └── Return final answer
```

**Key Features:**
- **Grounding**: Responses grounded in your data
- **Multi-Agent**: Multiple specialized agents collaborating
- **Human-in-the-Loop**: Agent can pause and ask for human approval
- **Evaluation**: Built-in testing and evaluation framework

---

## Q23. What are AI Agent frameworks? Compare LangChain, LangGraph, CrewAI

**Answer:**

| Framework | What It Is | Strengths | When to Use |
|-----------|-----------|-----------|-------------|
| **LangChain** | General-purpose LLM framework | Largest ecosystem, many integrations | Simple chains, RAG, basic agents |
| **LangGraph** | Graph-based agent orchestration (by LangChain team) | Complex, stateful multi-step agents | When you need cycles, branching, state machines |
| **CrewAI** | Multi-agent collaboration framework | Easy multi-agent setup, role-based | When you need multiple specialized agents working together |
| **Vertex AI Agent Builder** | Google's managed agent platform | No infra management, GCP integration | Enterprise production deployments on GCP |
| **AutoGen** (Microsoft) | Multi-agent conversation framework | Research, complex agent interactions | Experimental multi-agent systems |

**On GCP — Best Approach:**
- Use **Vertex AI Agent Builder** for production
- Use **LangChain/LangGraph with Vertex AI** for custom agent logic
- The Vertex AI SDK integrates directly with LangChain

```python
# LangChain + Vertex AI
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-1.5-pro")
response = llm.invoke("What is Vertex AI?")
```

---

## Q24. Explain the ReAct (Reasoning + Acting) pattern for agents

**Answer:**

ReAct is the foundational pattern for how AI agents work:

```
Thought: "I need to find the price of motor XM-5500"
Action: search_product_database(model="XM-5500")
Observation: {"model": "XM-5500", "price": 250, "stock": 42}
Thought: "I found the product. Now I need to check competitor pricing"
Action: search_web("XM-5500 motor price comparison")
Observation: "Competitor A: $270, Competitor B: $245"
Thought: "Our price is competitive. I can now answer the user."
Final Answer: "The XM-5500 motor is priced at $250, which is competitive..."
```

**Key Insight**: The model alternates between:
- **Thinking** (internal reasoning)
- **Acting** (calling external tools)
- **Observing** (processing results)

Until it has enough information to give a final answer.

**This is exactly how Vertex AI Agent Builder works internally.**

🎯 **Your Angle**: "My AI extraction pipeline at Troology follows this pattern implicitly — the LLM reads PDF content (observation), reasons about what product data to extract (thought), and calls our database API to store it (action). Understanding ReAct formalizes what I've been building intuitively."

---

## Q25. What is Multi-Agent Architecture?

**Answer:**

Multiple specialized AI agents collaborating to complete complex tasks, each with specific roles and capabilities.

**Architecture Pattern:**
```
                    ┌──────────────┐
                    │ Orchestrator │
                    │    Agent     │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Research     │ │  Extraction  │ │  Validation  │
    │  Agent        │ │  Agent       │ │  Agent       │
    └──────────────┘ └──────────────┘ └──────────────┘
```

**Example for ScalePart eVehicle platform:**
- **Orchestrator Agent**: Receives PDF catalog, assigns tasks
- **Extraction Agent**: Parses PDF, extracts product data
- **Validation Agent**: Verifies extracted data against schema
- **Database Agent**: Handles CRUD operations in MongoDB
- **Notification Agent**: Alerts admin of results

**GCP Implementation:**
- Each agent is a separate Vertex AI Agent Builder agent
- They communicate through shared state or Pub/Sub messages
- Orchestrator manages the workflow

---

## Q26. What are Extensions and Tools in the context of AI Agents?

**Answer:**

### Tools
Functions that an agent CAN call. Types:
1. **Function Calling**: Custom functions you define (API endpoints, database queries)
2. **Code Execution**: Agent writes and runs Python code
3. **Google Search**: Real-time web search
4. **Vertex AI Extensions**: Pre-built integrations

### Extensions (Vertex AI specific)
Pre-built, Google-managed integrations:
- **Google Search Extension**: Web search with citations
- **Code Interpreter Extension**: Execute Python code in sandbox
- **Google Workspace Extensions**: Read/write Google Docs, Sheets, Gmail
- **Third-party API Extensions**: Connect to external APIs

**Tool vs Extension:**
- **Tool** = Generic concept (any function the agent can call)
- **Extension** = Google's managed, pre-built tool implementation

---

# Section 5: MLOps & Model Lifecycle

## Q27. What is MLOps and how does Vertex AI support it?

**Answer:**
MLOps = **Machine Learning Operations** — the practice of applying DevOps principles to ML systems.

**MLOps Lifecycle:**
```
Data → Train → Evaluate → Deploy → Monitor → Retrain → ...
```

**Vertex AI MLOps Components:**

| MLOps Phase | Vertex AI Component |
|-------------|-------------------|
| Data Management | BigQuery, Cloud Storage, Feature Store |
| Experiment Tracking | Vertex AI Experiments |
| Training | AutoML / Custom Training |
| Pipeline Orchestration | Vertex AI Pipelines (Kubeflow) |
| Model Versioning | Model Registry |
| Deployment | Vertex AI Endpoints |
| Monitoring | Model Monitoring |
| CI/CD | Cloud Build + Vertex AI Pipelines |

**Vertex AI Model Monitoring:**
- **Data Drift Detection**: Alert when input data distribution changes
- **Concept Drift**: Alert when model predictions degrade
- **Feature Skew**: Detect training-serving inconsistencies
- **Prediction Drift**: Monitor prediction distribution over time

```python
# Set up monitoring
from google.cloud import aiplatform

# Create monitoring job
monitoring_job = aiplatform.ModelDeploymentMonitoringJob.create(
    display_name="extraction-model-monitor",
    endpoint=endpoint,
    logging_sampling_strategy={"random_sample_config": {"sample_rate": 0.1}},
    alert_config={"email_alert_config": {"user_emails": ["yash@troology.com"]}},
    drift_thresholds={"model_number_accuracy": 0.05}
)
```

🎯 **Your Angle**: "In my current work, I don't have formal model monitoring — I check extraction accuracy manually. Vertex AI's monitoring would automate this, alerting me when the LLM starts producing lower quality extractions, potentially due to new PDF formats or data drift."

---

## Q28. Explain the ML model lifecycle on GCP

**Answer:**

```
1. PROBLEM DEFINITION
   └── Define business problem, success metrics

2. DATA COLLECTION & PREPARATION
   ├── Cloud Storage (raw data)
   ├── BigQuery (structured data)
   ├── Dataflow (ETL pipelines)
   └── Feature Store (feature engineering)

3. EXPERIMENTATION
   ├── Vertex AI Workbench (Jupyter notebooks)
   ├── Vertex AI Experiments (track runs)
   └── AutoML or Custom Training

4. TRAINING AT SCALE
   ├── Custom Training Jobs (GPU/TPU)
   ├── Hyperparameter Tuning
   └── Distributed Training

5. EVALUATION
   ├── Vertex AI Evaluation
   ├── Metrics: Accuracy, Precision, Recall, F1
   └── A/B Testing

6. MODEL REGISTRATION
   └── Model Registry (version, metadata)

7. DEPLOYMENT
   ├── Online Prediction (real-time)
   ├── Batch Prediction (async, large data)
   └── Edge Deployment (for IoT/mobile)

8. MONITORING & MAINTENANCE
   ├── Model Monitoring (drift detection)
   ├── Logging (Cloud Logging)
   └── Continuous Training (retrain on new data)
```

---

## Q29. What is CI/CD for ML on GCP?

**Answer:**

**CI/CD for ML** extends traditional CI/CD with data and model testing:

```
Code Change → Cloud Build → Unit Tests → Integration Tests
                              → Data Validation Tests
                              → Model Training (Vertex AI)
                              → Model Evaluation
                              → If metrics pass → Deploy to Staging Endpoint
                              → A/B Test → Deploy to Production
```

**GCP Services Used:**
- **Cloud Build**: CI/CD automation
- **Cloud Source Repositories / GitHub**: Version control
- **Artifact Registry**: Store Docker images, model artifacts
- **Vertex AI Pipelines**: Orchestrate training/deployment
- **Cloud Functions/Cloud Run**: Trigger pipelines

**Key Best Practices:**
1. Version everything: code, data, models, configs
2. Automate testing: data quality, model performance
3. Use infrastructure-as-code (Terraform) for GCP resources
4. Implement model approval gates before production deployment

---

# Section 6: RAG (Retrieval-Augmented Generation)

## Q30. What is RAG and why is it important?

**Answer:**

**RAG = Retrieval-Augmented Generation**

The fundamental problem with LLMs:
- They only know what they were trained on (knowledge cutoff)
- They can't access your private/enterprise data
- They hallucinate when they don't know something

**RAG Solution:**
```
User Question
     ↓
[RETRIEVAL] Search your knowledge base for relevant documents
     ↓
[AUGMENTATION] Add retrieved documents to the LLM's context
     ↓
[GENERATION] LLM generates answer based on retrieved context
     ↓
Grounded, Accurate Answer (with citations!)
```

**Why RAG > Fine-Tuning for most cases:**

| Aspect | RAG | Fine-Tuning |
|--------|-----|-------------|
| Data freshness | Always current (retrieve from live DB) | Stale (retrain needed) |
| Cost | Low (no training) | High (GPU training) |
| Setup time | Hours | Days/Weeks |
| Data privacy | Data stays in your DB | Data included in model |
| Attribution | Can cite sources | No source tracking |
| Best for | Knowledge-intensive Q&A | Style/behavior changes |

🎯 **Your Angle**: "My AI extraction pipeline is essentially a form of RAG — I retrieve PDF content (context) and augment the LLM's prompt with it to generate structured data. Building a formal RAG system on Vertex AI would scale this to handle thousands of documents with proper vector indexing."

---

## Q31. How do you build a RAG system on GCP?

**Answer:**

### Architecture:
```
                    ┌─────────────────┐
                    │  Document Store  │
                    │ (Cloud Storage)  │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │  Chunking &     │
                    │  Embedding      │
                    │  (Cloud Run)    │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │  Vector Store   │
                    │ (Vertex AI      │
                    │  Vector Search) │
                    └────────┬────────┘
                             ↑
User Query → Embed → Search ─┘
                             ↓
                    ┌─────────────────┐
                    │  Gemini LLM     │
                    │ (with context)  │
                    └────────┬────────┘
                             ↓
                      Answer + Citations
```

### Step-by-Step Implementation:

```python
# Step 1: Chunk documents
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,    # 1000 characters per chunk
    chunk_overlap=200    # 200 char overlap between chunks
)
chunks = splitter.split_documents(documents)

# Step 2: Generate embeddings
from vertexai.language_models import TextEmbeddingModel

embed_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
embeddings = embed_model.get_embeddings([chunk.text for chunk in chunks])

# Step 3: Store in Vertex AI Vector Search
from google.cloud import aiplatform

index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
    display_name="product-catalog-index",
    dimensions=768,
    approximate_neighbors_count=10
)

# Step 4: Query
query_embedding = embed_model.get_embeddings(["What motors are compatible with X?"])
results = index_endpoint.find_neighbors(
    deployed_index_id="product-index",
    queries=[query_embedding[0].values],
    num_neighbors=5
)

# Step 5: Generate with context
from vertexai.generative_models import GenerativeModel

model = GenerativeModel("gemini-1.5-pro")
context = "\n".join([r.text for r in results])
prompt = f"""Based on the following product catalog information:
{context}

Answer this question: What motors are compatible with X?
Provide specific model numbers and specifications."""

response = model.generate_content(prompt)
```

**GCP-Managed RAG (simpler approach):**
Use Vertex AI Search — upload your documents, it handles chunking, embedding, indexing, and retrieval automatically.

---

## Q32. What are the key challenges in RAG and how to solve them?

**Answer:**

| Challenge | Problem | Solution on GCP |
|-----------|---------|-----------------|
| **Chunking Quality** | Bad chunks = bad retrieval | Use semantic chunking (not just fixed size), experiment with chunk size |
| **Retrieval Accuracy** | Wrong documents retrieved | Hybrid search (keyword + semantic), reranking, metadata filtering |
| **Context Window Limits** | Too many retrieved docs | Summarize/compress context, use Gemini's 2M token window |
| **Hallucination** | Model makes up info not in context | Use grounding, add "only answer from provided context" instruction |
| **Latency** | Vector search + LLM = slow | Use Vertex AI Vector Search (optimized), cache frequent queries |
| **Stale Data** | Docs get updated | Incremental indexing pipeline, scheduled refresh |
| **Multimodal Docs** | PDFs with images/tables | Use Gemini vision to process images, Document AI for structured extraction |

---

# Section 7: Prompt Engineering & Fine-Tuning

## Q33. What are the key prompt engineering techniques?

**Answer:**

### 1. Zero-Shot Prompting
```
Classify the following review as POSITIVE or NEGATIVE:
"The motor runs smoothly and quietly" → 
```
No examples given — model uses pre-trained knowledge.

### 2. Few-Shot Prompting
```
Classify these reviews:
"Great product!" → POSITIVE
"Broken on arrival" → NEGATIVE
"The motor runs smoothly" → 
```
Provide examples to guide the model.

### 3. Chain-of-Thought (CoT)
```
Question: A factory produces 150 motors/day. 12% are defective. How many good motors in 5 days?

Let's think step by step:
1. Motors per day: 150
2. Defective per day: 150 × 0.12 = 18
3. Good motors per day: 150 - 18 = 132
4. Good motors in 5 days: 132 × 5 = 660

Answer: 660 good motors
```

### 4. System Instructions
```python
model = GenerativeModel(
    "gemini-1.5-pro",
    system_instruction="""You are a technical product specialist for eVehicle parts.
    Always respond with:
    1. Model number
    2. Technical specifications
    3. Compatibility information
    Never guess — if you don't have data, say so."""
)
```

### 5. Output Structuring
```
Extract product info from this text and return ONLY valid JSON:
{
  "model_number": "...",
  "series": "...",
  "specifications": {...}
}
```

### 6. Persona Prompting
```
You are a senior GCP Solutions Architect. Explain the benefits of 
using Vertex AI Pipelines for MLOps to a non-technical stakeholder.
```

🎯 **Your Angle**: "I use these techniques daily in my extraction pipeline — specifically few-shot prompting with example product entries, system instructions for output format, and structured JSON output. This is directly transferable to Vertex AI."

---

## Q34. What is fine-tuning and when should you use it vs prompting vs RAG?

**Answer:**

**Decision Matrix:**

```
Do you need the model to ACCESS new data?
├── YES → Use RAG (don't fine-tune)
└── NO → Do you need to change the model's STYLE/BEHAVIOR?
         ├── YES → Fine-tune
         └── NO → Use better prompts (few-shot, CoT)
```

**Fine-Tuning on Vertex AI:**

| Method | Description | Data Needed | Cost | Use Case |
|--------|-------------|-------------|------|----------|
| **Supervised Fine-Tuning** | Train on input-output pairs | 100-10K examples | Medium | Domain-specific tasks |
| **RLHF** | Human feedback on outputs | Human raters | High | Alignment, safety |
| **Distillation** | Smaller model learns from larger | Labeled by large model | Medium | Cost reduction |
| **Adapter Tuning** | Lightweight fine-tuning (LoRA) | 10-1K examples | Low | Quick adaptation |

**Vertex AI Fine-Tuning Process:**
```python
from vertexai.generative_models import GenerativeModel

# Supervised fine-tuning
sft_tuning_job = sft.train(
    source_model="gemini-1.5-pro",
    train_dataset="gs://bucket/training_data.jsonl",
    validation_dataset="gs://bucket/validation_data.jsonl",
    epochs=3,
    learning_rate_multiplier=1.0
)

# Training data format (JSONL):
# {"messages": [{"role": "user", "content": "Extract product from: ..."}, 
#               {"role": "model", "content": "{\"model\": \"XM-5500\", ...}"}]}
```

---

# Section 8: GCP AI APIs & Pre-built Services

## Q35. What are GCP's pre-built AI APIs?

**Answer:**

These are **ready-to-use APIs** — no ML expertise needed:

### Vision AI
- **Image Classification**: "Is this an electric motor?"
- **Object Detection**: "Where are the products in this catalog image?"
- **OCR**: Extract text from images
- **Face Detection**: Detect faces (age, emotion)
- **Product Search**: Visual product matching

### Document AI
- **Form Parser**: Extract key-value pairs from forms
- **Invoice/Receipt Parser**: Structured financial data extraction
- **Custom Document Extractor**: Train on your document types
- **OCR**: High-accuracy text extraction from scanned docs

🎯 **Your Angle**: "Document AI is directly relevant to my PDF extraction pipeline. Instead of sending entire PDF pages to an LLM (expensive), I can use Document AI for structured extraction and only use Gemini for complex reasoning."

### Natural Language AI
- **Entity Analysis**: Extract entities (people, places, organizations)
- **Sentiment Analysis**: Positive/negative/neutral
- **Syntax Analysis**: Parts of speech, dependency trees
- **Content Classification**: Categorize text

### Speech-to-Text / Text-to-Speech
- **Chirp**: Google's latest speech model
- **100+ languages** supported
- Real-time and batch processing

### Translation AI
- **Neural Machine Translation**
- **Custom glossaries** for domain-specific terms
- **AutoML Translation** for specialized domains

### Video AI
- **Video Intelligence API**
- Shot detection, label detection, object tracking
- Speech transcription from video
- Explicit content detection

---

## Q36. What is Document AI and how does it work?

**Answer:**

Document AI is GCP's **document processing platform** that uses ML to extract structured data from unstructured documents.

**Processors Available:**
- **General**: OCR, Form Parser
- **Specialized**: Invoice, Receipt, Bank Statement, ID Document, W2, Pay Slip
- **Custom**: Train your own document processor

**Architecture:**
```
PDF/Image → Document AI Processor → Structured Output (JSON)
    ↓
Document AI Warehouse → Search & Query
```

**Code Example:**
```python
from google.cloud import documentai_v1 as documentai

client = documentai.DocumentProcessorServiceClient()

# Process a document
with open("product_catalog.pdf", "rb") as f:
    raw_document = documentai.RawDocument(
        content=f.read(),
        mime_type="application/pdf"
    )

request = documentai.ProcessRequest(
    name="projects/my-project/locations/us/processors/PROCESSOR_ID",
    raw_document=raw_document
)

result = client.process_document(request=request)
document = result.document

# Extract entities
for entity in document.entities:
    print(f"Type: {entity.type_}, Value: {entity.mention_text}, Confidence: {entity.confidence}")
```

**How it differs from just using Gemini for document processing:**

| Aspect | Document AI | Gemini Vision |
|--------|------------|---------------|
| **Accuracy on forms** | Very high (specialized) | Good but general |
| **Speed** | Faster | Slower |
| **Cost** | Lower per page | Higher (token-based) |
| **Structure** | Returns structured entities | Returns text/JSON |
| **Custom training** | Yes (domain-specific) | Via fine-tuning |
| **Best for** | Invoices, forms, IDs | Complex reasoning, multimodal Q&A |

**Best Practice**: Use Document AI for initial extraction, then Gemini for complex reasoning/validation on extracted data.

---

# Section 9: Architecture & System Design

## Q37. Design an AI-powered document processing pipeline on GCP

**Answer:**

**Scenario**: Build a system like your ScalePart extraction pipeline, but fully on GCP.

```
┌──────────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                           │
│  Cloud Storage (PDF upload) → Pub/Sub (event notification)  │
└─────────────────────────────┬────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   PROCESSING LAYER                           │
│  Cloud Run / Cloud Functions                                │
│  ├── Document AI (OCR + form parsing)                       │
│  ├── Gemini Vision (complex page understanding)             │
│  └── Custom extraction logic                                │
└─────────────────────────────┬────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   VALIDATION LAYER                           │
│  Vertex AI Agent (confidence scoring + validation)          │
│  ├── Schema validation against product DB                   │
│  ├── Duplicate detection                                    │
│  └── Human review queue (low confidence items)              │
└─────────────────────────────┬────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                             │
│  ├── Firestore / Cloud SQL (structured product data)        │
│  ├── BigQuery (analytics, reporting)                        │
│  └── Vertex AI Vector Search (semantic search index)        │
└─────────────────────────────┬────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    SERVING LAYER                             │
│  ├── Cloud Run (API for frontend)                           │
│  ├── Vertex AI Endpoint (ML model serving)                  │
│  └── API Gateway (rate limiting, auth)                      │
└──────────────────────────────────────────────────────────────┘
```

🎯 **Your Angle**: "This is exactly what I'm building at Troology, but currently using external LLM endpoints and manual orchestration. Moving to GCP would give me managed services for each layer — Document AI for extraction, Pub/Sub for event-driven processing, Vertex AI for model serving, and built-in monitoring."

---

## Q38. Design a conversational AI system on GCP

**Answer:**

```
User → API Gateway → Cloud Run (Backend)
                        ├── Session Management (Firestore)
                        ├── RAG Pipeline:
                        │   ├── Embed query (Vertex AI Embeddings)
                        │   ├── Search (Vertex AI Vector Search)
                        │   └── Generate (Gemini with context)
                        ├── Function Calling:
                        │   ├── Product DB lookup
                        │   ├── Order status check
                        │   └── Pricing calculator
                        └── Response → User
                        
Monitoring: Cloud Logging → BigQuery → Looker Dashboard
```

**Key Design Decisions:**
1. **Stateful conversations**: Store chat history in Firestore
2. **Streaming responses**: Use Gemini's streaming API for real-time UX
3. **Fallback handling**: If AI can't answer → route to human agent
4. **Rate limiting**: API Gateway prevents abuse
5. **Cost optimization**: Cache frequent queries in Memorystore (Redis)

---

## Q39. How would you handle scaling challenges for AI workloads on GCP?

**Answer:**

### Compute Scaling
- **Cloud Run**: Auto-scales containers 0 → 1000+ instances
- **GKE**: Kubernetes auto-scaling for complex workloads
- **Vertex AI Endpoints**: Auto-scale model replicas based on traffic

### Data Scaling
- **BigQuery**: Serverless, auto-scales to petabytes
- **Cloud Spanner**: Globally distributed, horizontally scalable SQL
- **Vertex AI Vector Search**: Handles billions of vectors

### Cost Optimization
- **Committed Use Discounts**: 1-3 year commitments for GPUs
- **Spot VMs**: Up to 91% cheaper for fault-tolerant training jobs
- **Model selection**: Use Gemini Flash instead of Pro for simple tasks
- **Caching**: Cache embeddings and frequent LLM responses
- **Batch predictions**: Use batch API for non-real-time workloads

### Latency Optimization
- **CDN**: Cache static responses at edge
- **Multi-region deployment**: Deploy models close to users
- **Model distillation**: Use smaller models for low-latency paths
- **Async processing**: Use Pub/Sub + Cloud Tasks for non-blocking operations

---

# Section 10: Practical Scenarios

## Q40. "Tell me about a time you built an AI feature. How would you migrate it to GCP?"

**Answer Template** (customize with your experience):

"At Troology, I built an **AI-driven document extraction pipeline** for the ScalePart eVehicle platform. The system:

1. **Current Architecture**:
   - PDFs uploaded to our Node.js backend
   - Text extracted using custom parsing logic
   - Content sent to external LLM API for structured data extraction
   - Results validated and stored in MongoDB
   - Custom caching layer to reduce API costs

2. **GCP Migration Plan**:
   - **PDF Upload**: Cloud Storage with Pub/Sub notifications
   - **Text Extraction**: Document AI (better accuracy, managed service)
   - **LLM Processing**: Vertex AI Gemini API (native GCP, data stays in-region)
   - **Validation**: Vertex AI Agent with function calling
   - **Storage**: Firestore (similar to MongoDB) or AlloyDB
   - **Caching**: Memorystore for Redis (managed caching)
   - **Monitoring**: Vertex AI Model Monitoring + Cloud Logging
   - **Orchestration**: Vertex AI Pipelines for end-to-end workflow

3. **Benefits of Migration**:
   - Data sovereignty (data never leaves GCP)
   - Reduced latency (no external API calls)
   - Better monitoring and observability
   - Auto-scaling without manual infrastructure management
   - Unified billing and access control"

---

## Q41. Write code to build a simple RAG chatbot using Vertex AI

**Answer:**
```python
"""
Simple RAG Chatbot using Vertex AI
- Uses Gemini for generation
- Uses Vertex AI Embeddings for semantic search
- Uses Firestore for document storage
"""

import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from vertexai.language_models import TextEmbeddingModel
from google.cloud import firestore
import numpy as np

# Initialize
vertexai.init(project="my-project", location="us-central1")
db = firestore.Client()

# Models
gemini = GenerativeModel("gemini-1.5-pro")
embedder = TextEmbeddingModel.from_pretrained("text-embedding-004")


def embed_text(text: str) -> list[float]:
    """Generate embedding for text."""
    embeddings = embedder.get_embeddings([text])
    return embeddings[0].values


def ingest_document(doc_id: str, text: str, metadata: dict):
    """Chunk, embed, and store a document."""
    # Simple chunking (in production, use smarter chunking)
    chunk_size = 500
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    
    for i, chunk in enumerate(chunks):
        embedding = embed_text(chunk)
        db.collection("documents").document(f"{doc_id}_chunk_{i}").set({
            "text": chunk,
            "embedding": embedding,
            "metadata": metadata,
            "doc_id": doc_id,
            "chunk_index": i
        })


def search_similar(query: str, top_k: int = 5) -> list[str]:
    """Find most similar document chunks."""
    query_embedding = embed_text(query)
    
    # In production, use Vertex AI Vector Search for better performance
    docs = db.collection("documents").stream()
    
    similarities = []
    for doc in docs:
        data = doc.to_dict()
        similarity = np.dot(query_embedding, data["embedding"])
        similarities.append((similarity, data["text"]))
    
    similarities.sort(reverse=True, key=lambda x: x[0])
    return [text for _, text in similarities[:top_k]]


def chat(user_message: str, chat_history: list = None) -> str:
    """RAG-powered chat response."""
    # 1. Retrieve relevant context
    relevant_chunks = search_similar(user_message)
    context = "\n---\n".join(relevant_chunks)
    
    # 2. Build prompt with context
    system_prompt = """You are a helpful AI assistant for an eVehicle parts platform.
    Answer questions based ONLY on the provided context.
    If the context doesn't contain the answer, say "I don't have that information."
    Always cite which part of the context your answer comes from."""
    
    prompt = f"""Context from our product database:
    {context}
    
    User Question: {user_message}
    
    Provide a helpful, accurate answer based on the context above."""
    
    # 3. Generate response
    model = GenerativeModel("gemini-1.5-pro", system_instruction=system_prompt)
    response = model.generate_content(
        prompt,
        generation_config=GenerationConfig(
            temperature=0.3,
            max_output_tokens=1024
        )
    )
    
    return response.text


# Usage
if __name__ == "__main__":
    # Ingest some documents
    ingest_document("motor_001", "The XM-5500 is a brushless DC motor...", {"category": "motors"})
    
    # Chat
    answer = chat("What type of motor is the XM-5500?")
    print(answer)
```

---

## Q42. How would you implement error handling and retry logic for Vertex AI API calls?

**Answer:**
```python
import time
from google.api_core import retry, exceptions
import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="my-project", location="us-central1")
model = GenerativeModel("gemini-1.5-pro")

# Method 1: Using google-api-core retry decorator
@retry.Retry(
    initial=1.0,           # Initial delay (seconds)
    maximum=60.0,          # Max delay
    multiplier=2.0,        # Exponential backoff multiplier
    predicate=retry.if_exception_type(
        exceptions.ResourceExhausted,   # 429 - Rate limited
        exceptions.ServiceUnavailable,  # 503 - Service down
        exceptions.DeadlineExceeded,    # 504 - Timeout
    ),
    deadline=300.0         # Total retry deadline
)
def generate_with_retry(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text

# Method 2: Manual retry with error handling
def generate_safe(prompt: str, max_retries: int = 3) -> dict:
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            
            # Check for safety blocks
            if response.candidates[0].finish_reason.name == "SAFETY":
                return {"error": "Content blocked by safety filters", "text": None}
            
            return {"text": response.text, "error": None}
            
        except exceptions.ResourceExhausted:
            # Rate limited - exponential backoff
            wait = 2 ** attempt
            print(f"Rate limited. Waiting {wait}s...")
            time.sleep(wait)
            
        except exceptions.InvalidArgument as e:
            # Bad input - don't retry
            return {"error": f"Invalid input: {e}", "text": None}
            
        except Exception as e:
            if attempt == max_retries - 1:
                return {"error": f"Failed after {max_retries} attempts: {e}", "text": None}
            time.sleep(2 ** attempt)
    
    return {"error": "Max retries exceeded", "text": None}
```

---

# Section 11: Behavioral & Situational Questions

## Q43. "Why do you want to move into GCP AI development?"

**Answer:**
"I've been building AI-powered features for over a year — from LLM-based chatbots at Cognitivo to document extraction pipelines at Troology. But I've been doing this with external APIs and custom infrastructure. 

GCP offers the **complete ecosystem** I need: Vertex AI unifies model development, deployment, and monitoring into one platform. Instead of stitching together multiple services, I can build end-to-end AI solutions with enterprise-grade security, auto-scaling, and monitoring built in.

What excites me most is the **Agentic AI space** — building autonomous systems that can reason, plan, and act. Vertex AI Agent Builder is purpose-built for this, and I want to be at the forefront of this technology."

---

## Q44. "You don't have production GCP experience. How will you ramp up?"

**Answer:**
"You're right that I haven't deployed production systems on GCP yet. However, I bring three things that make me confident:

1. **Transferable Skills**: I've built production AI systems — LLM integrations, data pipelines, caching layers, API architectures. The patterns are the same; GCP provides managed services for what I've been building manually.

2. **Rapid Learning Track Record**: I went from zero Go experience to building production microservices at Singularies. I've picked up new technologies throughout my career — from React to GraphQL to AI integrations.

3. **Active Learning**: I'm already exploring GCP through personal projects and Google Cloud Skills Boost. I understand Vertex AI concepts, the API patterns, and the architecture. The gap is production deployment experience, which I'll close within weeks on the job.

I believe someone who's built these systems from scratch understands them more deeply than someone who's only used managed services."

---

## Q45. "Describe a challenging AI problem you solved"

**Answer:**
"At Troology, I was tasked with building a pipeline to extract product data from PDF catalogs — model numbers, series names, and technical specifications — for the ScalePart eVehicle platform.

**The Challenge**: 
- PDFs had inconsistent formats — some were scanned images, some had tables, some had mixed layouts
- Product naming conventions varied across manufacturers
- We needed 95%+ accuracy because incorrect data means wrong parts for vehicles

**My Solution**:
1. Built a multi-stage pipeline:
   - Stage 1: PDF → Text extraction (handling different PDF formats)
   - Stage 2: Text → LLM with few-shot prompting for entity extraction
   - Stage 3: Confidence scoring — flagging low-confidence extractions for human review
2. Implemented an intelligent **caching layer** that saved identical/similar extractions, reducing LLM API costs by 60%
3. Built a **feedback loop** where human-corrected extractions became new few-shot examples

**Result**: Achieved 93% automated accuracy, with the human review queue handling the remaining 7%, significantly reducing manual data entry time.

**How This Maps to GCP**: On GCP, Stage 1 would use Document AI, Stage 2 would use Gemini with function calling, and the entire pipeline would be orchestrated by Vertex AI Pipelines with built-in monitoring."

---

## Q46. "How do you handle AI hallucinations in production?"

**Answer:**
"This is a critical concern I deal with in my extraction pipeline. My approach:

1. **Structured Output**: Force the model to return JSON with strict schemas — any invalid JSON is rejected
2. **Confidence Scoring**: The model rates its own confidence (0-1) for each extracted field
3. **Validation Layer**: Cross-reference extracted data against known valid values (e.g., model numbers matching a pattern)
4. **Grounding**: Always provide source context — the model can only use information from the provided document
5. **Human Review Queue**: Low-confidence results go to a human review queue
6. **Temperature Control**: Use temperature=0 for extraction tasks (deterministic output)
7. **Guardrails**: Use Vertex AI's safety filters + custom output validation

On GCP specifically:
- **Vertex AI Grounding** with Google Search or custom data
- **Vertex AI Evaluation** to measure hallucination rates
- **Model Monitoring** to detect drift in output quality"

---

## Q47. "How do you stay updated with rapidly changing AI technologies?"

**Answer:**
"AI moves incredibly fast, so I have a structured approach:
1. **Daily**: Follow Google AI Blog, Hugging Face, arXiv papers summaries
2. **Weekly**: Hands-on experimentation with new tools and models
3. **Continuous**: Google Cloud Skills Boost courses, YouTube (Google Cloud channel)
4. **Community**: LeetCode (1000+ problems solved, 831-day streak shows my consistency), tech communities
5. **Project-based learning**: I build real projects to test new technologies, like my current RAG project"

---

# Section 12: Mock Interview Script

> [!IMPORTANT]
> Practice this mock interview OUT LOUD. Time yourself — each answer should be 1-2 minutes.

### Round 1: Introduction (5 min)
**Interviewer**: "Tell me about yourself and your experience with AI development."

**Your Answer**: "Hi, I'm Yash Shukla, a Full Stack AI Developer with 3.5+ years of experience. Currently at Troology, I'm building the ScalePart eVehicle platform where I've engineered an AI-driven document extraction pipeline that automatically parses complex PDF catalogs into structured database records using LLMs. Before this, at Cognitivo, I integrated OpenAI GPT-based conversational features into production applications. My foundation is in MERN stack and TypeScript, and I'm now channeling my AI experience toward Google Cloud and Vertex AI to build more scalable, enterprise-grade AI solutions."

### Round 2: Technical Deep Dive (20 min)

**Q**: "What is Vertex AI and why would a company use it?"
→ Use Answer from Q6

**Q**: "Explain how you would build a RAG system on GCP"
→ Use Answer from Q31

**Q**: "What is the difference between fine-tuning and RAG?"
→ Use Answer from Q34

**Q**: "How does function calling work in Gemini?"
→ Use Answer from Q18

**Q**: "What is Agentic AI?"
→ Use Answer from Q21

### Round 3: System Design (15 min)
**Q**: "Design an AI-powered customer support system on GCP"
→ Use Answer from Q38 + customize

### Round 4: Behavioral (10 min)
**Q**: "Tell me about a challenging technical problem you solved"
→ Use Answer from Q45

**Q**: "Why GCP? Why this role?"
→ Use Answer from Q43

---

# Section 13: Quick Revision Cheat Sheet

## 🔥 Top 20 Terms You MUST Know

| # | Term | One-Line Definition |
|---|------|-------------------|
| 1 | **Vertex AI** | GCP's unified AI/ML platform for building, deploying, managing models |
| 2 | **Gemini** | Google's multimodal LLM family (Ultra/Pro/Flash/Nano) |
| 3 | **Model Garden** | Catalog of pre-trained foundation models on Vertex AI |
| 4 | **RAG** | Retrieval-Augmented Generation — grounding LLM with external data |
| 5 | **Embeddings** | Vector representations of text/images for semantic similarity |
| 6 | **Vector Search** | Finding similar items using embedding vectors (Vertex AI Vector Search) |
| 7 | **Grounding** | Connecting LLM responses to real data sources to reduce hallucination |
| 8 | **Function Calling** | LLM outputs structured function calls for your app to execute |
| 9 | **Agent Builder** | GCP's platform for building autonomous AI agents |
| 10 | **Agentic AI** | AI that autonomously plans, reasons, and takes actions |
| 11 | **ReAct** | Reasoning + Acting pattern: Think → Act → Observe → Repeat |
| 12 | **AutoML** | No-code ML model training on Vertex AI |
| 13 | **Feature Store** | Centralized feature management for ML models |
| 14 | **Vertex AI Pipelines** | MLOps workflow orchestration (Kubeflow-based) |
| 15 | **Model Registry** | Version and manage trained models |
| 16 | **Document AI** | GCP's document processing/extraction service |
| 17 | **Prompt Engineering** | Crafting effective prompts (zero-shot, few-shot, CoT) |
| 18 | **Fine-Tuning** | Adapting a pre-trained model with custom data |
| 19 | **Temperature** | Controls LLM output randomness (0=deterministic, 1+=creative) |
| 20 | **MLOps** | DevOps practices applied to ML systems lifecycle |

## 🗺️ GCP AI Services Map

```
NEED                          →  GCP SERVICE
──────────────────────────────────────────────────
Use a pre-trained LLM         →  Gemini API (via Vertex AI)
Train custom ML model         →  Vertex AI Custom Training
No-code ML                    →  Vertex AI AutoML
Build AI agents               →  Vertex AI Agent Builder
Enterprise search             →  Vertex AI Search
Process documents             →  Document AI
Speech recognition            →  Speech-to-Text (Chirp)
Image generation              →  Imagen (via Vertex AI)
Semantic search               →  Vertex AI Vector Search
Feature management            →  Vertex AI Feature Store
ML pipeline orchestration     →  Vertex AI Pipelines
Model monitoring              →  Vertex AI Model Monitoring
Store training data           →  Cloud Storage / BigQuery
Run serverless AI APIs        →  Cloud Run / Cloud Functions
Event-driven processing       →  Pub/Sub + Cloud Functions
Cache AI responses            →  Memorystore (Redis)
```

## 💡 Key Formulas/Numbers to Remember

- **Gemini 1.5 Pro context window**: 2 million tokens
- **Gemini Flash**: Cheapest and fastest Gemini model
- **text-embedding-004 dimensions**: 768
- **AutoML minimum data**: ~100-1000 labeled examples
- **Fine-tuning minimum data**: ~100 examples (for adapter tuning)
- **Vertex AI regions**: us-central1 (primary), europe-west4, asia-southeast1
- **TPU v5e**: Google's latest efficient training accelerator

---

> [!CAUTION]
> ## Common Mistakes to Avoid in the Interview
> 1. **Don't say "I don't know GCP at all"** — Instead say "I'm actively learning and my AI skills transfer directly"
> 2. **Don't memorize answers word-for-word** — Understand concepts and explain naturally
> 3. **Don't ignore your existing experience** — ALWAYS connect GCP concepts to what you've already built
> 4. **Don't skip system design prep** — They WILL ask you to design something
> 5. **Don't forget to ask questions** — "What AI projects is the team currently working on?" shows genuine interest

---

> [!TIP]
> ## Final Tips
> - **Google Cloud Skills Boost**: Complete the "Generative AI" and "Vertex AI" learning paths
> - **Hands-on**: Create a free GCP account and try Vertex AI Studio (has free tier)
> - **Google I/O and Cloud Next**: Watch recent keynotes for latest GCP AI announcements
> - **Practice coding**: Write at least 2-3 small scripts using the Vertex AI Python SDK
> - **Be honest**: It's OK to say "I haven't used this in production, but here's how I understand it works and how I'd approach it"
