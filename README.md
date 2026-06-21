<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StudyAi: AI-Powered Adaptive Learning & Self-Assessment System

StudyAi is an interactive, client-side optimized study assistant platform designed to transform static study materials into dynamic, personalized learning experiences. Upload lecture notes, slides, or syllabus files in PDF format, extract their content client-side to keep data footprints minimal, and leverage the Gemini API (`gemini-2.5-flash`) for real-time generative learning tools.

👉 **View the app on AI Studio:** [https://ai.studio/apps/9bcad805-01b0-4511-895f-2c68e7afd7b1](https://ai.studio/apps/9bcad805-01b0-4511-895f-2c68e7afd7b1)

---

## 🚀 Key Features

*   **Real-time PDF Parsing**: Client-side text extraction utilizing PDF.js (`pdfjs-dist`). Features an automatic Firestore size-guard checks to optimize document payload sizes.
*   **Contextual Study Chatbot**: Have multi-turn, interactive conversations with a tutor chatbot that has full context of your uploaded notes. Supports document content references and multimodal diagram analyses.
*   **Interactive Flashcards**: Generate, review, and flip structured flashcards designed to drill key concepts.
*   **AI-Generated Quizzes**: Take 3-question multiple-choice quizzes matching your note content to test your understanding.
*   **Automated Summarization**: Create concise, markdown-formatted summaries of long study notes in seconds.
*   **Dynamic Theme Customization**: Custom color schemes (Default, Cyberpunk, Tropical, Rose) alongside a seamless light/dark mode selection engine.
*   **Secure Access Rule Control**: Data separation and user access security controlled natively on the NoSQL database level.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling & Transitions**: Tailwind CSS v4, Framer Motion (`motion`), Lucide Icons
*   **Generative AI**: Google GenAI SDK (`@google/genai` v1.29.0), `gemini-2.5-flash` model
*   **Database & Auth**: Firebase Authentication, Firestore NoSQL DB (with dynamic rules checking)
*   **Parsing & Utilities**: PDF.js (`pdfjs-dist`), React Markdown

---

## 💻 Run Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [NPM](https://www.npmjs.com/) (installed automatically with Node)

### Installation Steps

1.  **Clone and Navigate to Workspace**:
    ```bash
    cd StudyAi
    ```

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root directory and define the following variables:
    ```env
    # Gemini API Key (Required for AI features)
    GEMINI_API_KEY="your-gemini-api-key-here"

    # App Base URL
    APP_URL="http://localhost:3000"
    ```
    *Note: Firebase configuration is automatically loaded from the `firebase-applet-config.json` file in the root directory.*

4.  **Launch the Local Development Server**:
    ```bash
    npm run dev
    ```
    The application will start running at `http://localhost:3000`.

5.  **Compile & Optimize for Production**:
    ```bash
    npm run build
    ```

---

## 🔒 Security & Data Integrity

The application relies on Firebase Authentication and utilizes a customized Firestore rules config (`firestore.rules`) to guarantee:
1.  **Strict Authorization**: Private notes are accessible exclusively by their owner. Public notes are readable globally but modifiable only by the owner or system administrators.
2.  **Schema and Field Constraints**: Enforces type validations (string, boolean, lists) and maximum character length limits (such as contents under 1MB) directly at the database edge.
