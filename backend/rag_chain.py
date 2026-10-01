from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

import os
from dotenv import load_dotenv
import logging
logging.basicConfig(level=logging.INFO)

load_dotenv()
print(bool(os.getenv("OPENAI_API_KEY")))

logger = logging.getLogger(__name__)

def log_and_format_docs(docs):
    logger.info("Documents retrieved: %d", len(docs))

    for i, doc in enumerate(docs, start=1):
        logger.info(
            "\n--- Retrieved %d ---\n%s\n",
            i,
            doc.page_content,
        )

    return "\n\n".join(doc.page_content for doc in docs)

def format_docs(docs):
    formatted = "\n\n".join(doc.page_content for doc in docs)
    print("\n--- Retrieved ---\n", formatted, "\n--- End of Retrieved ---\n")
    return formatted

def get_rag_chain():
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    # load VectorDB in local
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )
    
    # retriever: retrieve k of nearest vector(pieces of document)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    prompt_template = """Answer the question using only the following context.
    If the answer is not in the context, respond with "The answer cannot be found in the provided documents."
    
    Context:{context}
    
    Question: {question}
    
    Answer:"""

    prompt = ChatPromptTemplate.from_template(template=prompt_template)

    chain = (
        {
            "context": retriever| format_docs, #RunnableLambda(log_and_format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
    )
    
    return chain
