# Historical AI Chatbot (Backend)

The backend service for the Historical AI Chatbot, providing AI-powered responses, dialogue tree management, and static asset serving.

## Features

-   **AI Integration**: Uses Google's Gemini API to generate persona-based responses.
-   **Dialogue Trees**: Manages structured conversation flows with branching logic.
-   **Persona Management**: Loads and serves persona definitions and specific topic responses.
-   **Static Assets**: Serves avatar images for the frontend.
-   **History Management**: Tracks conversation context for better AI responses.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **AI SDK**: Google Generative AI
-   **Testing**: Jest

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

Create a `.env` file in the root directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### Running the Server

Start the server:

```bash
node server.js
```

The server will run on `http://localhost:3000`.

## API Endpoints

### `POST /api/chat`

Sends a message to the chatbot.

-   **Body**:
    ```json
    {
      "message": "Hello",
      "persona": "cleopatra"
    }
    ```
-   **Response**:
    ```json
    {
      "reply": "Greetings...",
      "timestamp": "10 Dec 20:55",
      "mode": "ai_fallback" // or "topic_match", "tree_active"
    }
    ```

### `GET /api/chat/history`

Retrieves the chat history for a specific persona.

-   **Query Params**: `?persona=cleopatra`

## Testing

Run unit tests with Jest:

```bash
npm test
```
