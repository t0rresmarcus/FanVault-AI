# FanVault AI 🏟️

**FanVault AI** is a Retrieval-Augmented Generation (RAG) chatbot that works as an intelligent sports knowledge assistant. It helps fans instantly discover players, teams, games, records, and history, with answers grounded in a curated knowledge base instead of the model's guesswork.

---

## ✨ Features

- **Conversational sports Q&A**: ask about players, teams, games, records, and history in natural language.
- **Grounded answers**: responses are generated only from retrieved context; if the answer isn't in the documents, the assistant says so rather than hallucinating.
- **Fast semantic search**: documents are embedded and stored in a Chroma vector database for quick similarity retrieval.
- **Clean API layer**: a FastAPI backend exposes the RAG engine over a simple JSON HTTP endpoint.
- **Modern frontend**: a TanStack-based UI for chatting with the assistant.

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| RAG engine | Python, LangChain, OpenAI API, Chroma |
| Environment | Anaconda |
| Backend API | FastAPI |
| Frontend | TanStack (Query / Router) |

---

## 🏗️ Architecture

```
┌──────────────┐    POST /chat     ┌────────────────┐
│   Frontend   │ ────────────────▶ │  FastAPI       │
│   (TanStack) │ ◀──────────────── │  Backend       │
└──────────────┘    JSON answer    └───────┬────────┘
                                           │
                                           ▼
                                   ┌────────────────┐
                                   │  RAG Engine    │
                                   │  (LangChain)   │
                                   └───┬────────┬───┘
                                       │        │
                          retrieve     │        │  generate
                          top-k docs   ▼        ▼
                                 ┌─────────┐ ┌──────────┐
                                 │ Chroma  │ │ OpenAI   │
                                 │ Vector  │ │ API      │
                                 │ Store   │ │ (LLM +   │
                                 └─────────┘ │ Embeds)  │
                                             └──────────┘
```

**How it works**

1. Sports documents are split into chunks, embedded with OpenAI embeddings, and stored in Chroma.
2. When a user asks a question, the most relevant chunks are retrieved from Chroma.
3. The retrieved context and the question are inserted into a prompt that instructs the LLM to answer using **only** that context.
4. The answer is returned to the frontend as JSON.

---

## 📁 Project Structure

> Adjust to match your actual layout.

```
FanVault/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app & routes
│   │   ├── rag.py           # RAG chain (retriever + prompt + LLM)
│   │   └── ingest.py        # Document loading, chunking, embedding
│   ├── data/                # Source documents
│   ├── chroma_db/           # Persisted vector store
│   ├── environment.yml      # Conda environment
│   └── .env                 # Environment variables (not committed)
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Anaconda](https://www.anaconda.com/) or Miniconda
- Node.js 18+ and npm / pnpm / bun
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Backend setup

```bash
cd backend

# Create and activate the conda environment
conda create -n fanvault python=3.11 -y
conda activate fanvault

# Install dependencies
pip install fastapi uvicorn langchain langchain-openai langchain-community chromadb python-dotenv
```

Create a `.env` file in `backend/`:

```env
OPENAI_API_KEY=your-openai-api-key
```

### 3. Ingest your data

Load your sports documents into the Chroma vector store:

```bash
python -m app.ingest
```

### 4. Run the API server

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 5. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed in your terminal (typically `http://localhost:3000` or `http://localhost:5173`).

---

## 📡 API Reference

### `POST /chat`

Ask the assistant a question.

**Request**

```json
{
  "question": "Who holds the record for most career goals in the World Cup?"
}
```

**Response**

```json
{
  "answer": "..."
}
```

**Example**

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Who won the 2018 World Cup?"}'
```

If the answer cannot be found in the indexed documents, the assistant responds that it could not find the answer in the provided documents.

---

## 🖥️ Calling the API from the Frontend

```ts
import { useMutation } from '@tanstack/react-query';

export function useAskQuestion() {
  return useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return res.json();
    },
  });
}
```

---

## ⚙️ Configuration

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

---

## 🗺️ Roadmap

- [ ] Streaming responses
- [ ] Source citations for each answer
- [ ] Conversation memory / multi-turn context
- [ ] Support for more sports and live data sources
- [ ] Deployment guide (Docker)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss what you'd like to change, then submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
