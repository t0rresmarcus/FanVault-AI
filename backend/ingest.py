import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()
print(bool(os.getenv("OPENAI_API_KEY")))

# 1. Load documents in `data` directory (.txt, .pdf)
def load_documents():
    txt_loader = DirectoryLoader("data", glob="**/*.txt", loader_cls=TextLoader)
    pdf_loader = DirectoryLoader("data", glob="**/*.pdf", loader_cls=PyPDFLoader)
    return txt_loader.load() + pdf_loader.load()

# 2. Split documents with chunks unit for LLM contexts
def split_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,      # 1000 characters for a chunk
        chunk_overlap=200,    # Overlapping 200 characters to keep continuous context
    )
    return splitter.split_documents(docs)

# 3. Embedding generation + store into Chroma
def create_vectorstore(chunks):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    return vectorstore

if __name__ == "__main__":
    print("Loading documents...")
    docs = load_documents()
    print(f"{len(docs)} documents loading finished")

    chunks = split_documents(docs)
    print(f"{len(chunks)} chunks")

    create_vectorstore(chunks)
    print("VectorStore DB generation done! Confirm with ./chroma_db")