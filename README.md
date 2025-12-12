# Historical AI Chatbot (Backend)

The backend service for the Historical AI Chatbot, providing AI-powered responses, dialogue tree management, and robust chat history management.

## Features

-   **AI Integration**: Uses Google's Gemini API with **safety settings** and **prompt injection protection**.
-   **Dialogue Trees**: Manages structured conversation flows with branching logic.
-   **Persona Management**: Loads and validates persona definitions (JSON) using **Mongoose schemas**.
-   **Chat History**: Saves and retrieves chat sessions, supporting title generation and pagination.
-   **Rate Limiting**: Protects the AI endpoint (`/api/chat`) with a configurable rate limiter (30 requests/hour).
-   **Validation**: Strict input validation using Mongoose models (`Chat`, `Persona`, `Message`).
-   **Error Handling**: Centralized error handling middleware.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **AI SDK**: Google Generative AI
-   **Validation**: Mongoose
-   **Security**: Helmet, Share-based Rate Limiter
-   **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm
-   A Google Gemini API Key

### Installation

1.  Clone the repository.
2.  Navigate to the backend directory:
    ```bash
    cd historical-ai-chatbot-backend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### Running the Server

Start the server:

```bash
npm run dev # or node server.js
```

The server will run on `http://localhost:3000`.

## API Endpoints

### 1. Chat Interaction
**POST** `/api/chat`
-   **Rate Limit**: 30 requests / hour
-   **Body**:
    ```json
    {
      "message": "Hello",
      "personaName": "Cleopatra",
      "history": [], // Optional: Array of previous messages for context
      "treeState": null // Optional: Current dialogue tree state
    }
    ```

### 2. Chat History
**GET** `/api/chat/history`
-   **Query**: `?page=1&limit=8`
-   **Response**: Paginated list of chat summaries.

**POST** `/api/chat/history`
-   Creates or updates a chat session.
-   **Body**: Full chat object (messages, mode, personaName).

**GET** `/api/chat/history/:chatId`
-   Retrieves a full specific chat session.

**DELETE** `/api/chat/history/:chatId`
-   Deletes a chat session.

## Testing

Run unit and integration tests:

```bash
npm test
```
