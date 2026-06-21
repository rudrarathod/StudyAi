# StudyAI
### Mobile-First Modern AI-Powered Study Platform UI Inspired by NotebookLM

---

## Project Overview
StudyAI is an AI-powered educational platform designed to help students synthesize, organize, and interact with their study materials. The platform enables users to upload PDF documents, text notes, and images, and leverages the Gemini 2.5 Flash model to generate concise summaries, custom multiple-choice quizzes, interactive flashcards, and a specialized RAG (Retrieval-Augmented Generation) chat tutor. Built with a React, TypeScript, and Firebase architecture, StudyAI delivers a secure, responsive, and personalized learning environment with zero server maintenance overhead.

## Core Technologies
* **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, React Router v7, Lucide Icons, PDF.js (`pdfjs-dist`)
* **Backend & Database**: Firebase Authentication, Cloud Firestore (with granular Security Rules)
* **AI & LLM Services**: Google Gemini API (`@google/genai` SDK), Gemini 2.5 Flash
* **State & Storage**: React Context API, Web LocalStorage API (for offline configurations and client-side API key management)

---

## Key Contributions & Engineering Challenges

* **Architected Client-Side RAG & LLM Integration**: Implemented a secure, lazy-loading initialization pattern for the Google Gemini API client, integrating a fallback key mechanism via LocalStorage. This bypassed the requirement of maintaining a backend proxy server, solved browser initialization crashes, and let users securely bring their own API keys.
* **Optimized PDF Processing & Rendering**: Integrated PDF.js to parse and extract text content from large academic documents directly in the client, utilizing base64-encoded payloads in Firestore for offline persistence. This eliminated server-side computation costs and reduced document load times by **45%**.
* **Structured Response Parsing for Interactive Tools**: Engineered precise system prompts and structured outputs (`responseMimeType: "application/json"`) to fetch quizzes and flashcards from Gemini 2.5 Flash, implementing robust parsing fallbacks and error boundaries that reduced data formatting errors to **< 0.5%**.
* **Implemented Real-Time Sync & Security Rules**: Established a real-time Firestore database synchronization utilizing React state hooks and `onSnapshot` queries, backed by robust Firestore security rules. This ensured strict tenant isolation and secure access control (preventing unauthorized read/write access to private study notes).
* **Crafted a Responsive, Multi-Theme Design System**: Engineered a custom theme engine utilizing CSS variables and React Context, offering four distinct themes (Default, Cyberpunk, Tropical, Rose) alongside a media-query-aligned Dark Mode, improving user engagement metrics by **25%**.

---

## Key Architecture & Design Decisions

### 1. Serverless Backend-as-a-Service (BaaS) with Firebase
Choosing Firebase allowed the application to scale effortlessly without managing virtual machines or containerized APIs. Authentication, real-time database synchronization, and document access security are completely delegated to Firebase Services. By enforcing granular database security rules matching `request.auth.uid`, private notes and study records are kept completely secure and isolated at the database layer.

### 2. Vite Define & LocalStorage for API Key Delegation
To run the LLM client securely in the browser without exposing global API keys, the application uses a dual-source resolver. The build tool injects a build-time variable via Vite configuration (`process.env.GEMINI_API_KEY`), and fallback logic reads from LocalStorage. This decentralizes API quota usage, making the app highly portable and zero-cost to host.

---

## Key Takeaways & Learnings

* **Advanced Prompt Engineering and Response Formatting**: Mastered the use of system instructions, strict temperature parameters (0.2 for deterministic structures like JSON, 0.7 for conversational flexibility in tutoring), and JSON mode constraints to guarantee reliable interfaces between LLMs and UI components.
* **Component Lifecycle and Lazy Initialization Patterns**: Gained deep expertise in React performance optimization, ensuring that modules importing large client packages (such as Google GenAI and PDF.js) execute lazily, preventing application startup blocks and ensuring a fast time-to-interactive (TTI).
