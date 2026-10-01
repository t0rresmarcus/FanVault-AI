from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_chain import get_rag_chain

app = FastAPI()

# Allow requests from frontend port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load RAG chain just once at server starting(it's slow when load for every requests)
rag_chain = get_rag_chain()

class TestRequest(BaseModel):
    question: str

@app.post("/test")
def test(request: TestRequest):
    return {
        "answer": "I am FanVault - RAG chatbot for sports fans. What's up?",
    }

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
def chat(request: ChatRequest):
    result = rag_chain.invoke(request.question)
    print(result)

    
    # sources = [
    #     doc.metadata.get("source", "Unknown") 
    #     for doc in result["source_documents"]
    # ]
    
    # return {
    #     "answer": result["result"],
    #     "sources": list(set(sources))  # remove duplication
    # }

    return {"answer": result.content}

@app.get("/health")
def health():
    return {"status": "ok"}
