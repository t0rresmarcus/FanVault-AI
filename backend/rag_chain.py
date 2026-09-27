from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

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

    prompt = ChatPromptTemplate.from_template(template=prompt_template,input_variables=["context", "question"])

    chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
    )
    
    return chain