# Yerrithatha Choppa - Personal Portfolio Website

A modern, responsive, and interactive developer portfolio website showcasing my experience, projects, certifications, and technical skills. It features a built-in floating **AI Chatbot assistant** powered by Groq LLMs to answer questions about my professional background in real-time.

---

## 🚀 Live Demo & Repository
* **GitHub Repository:** [https://github.com/Yerrithathachoppa/Portfolio_Website](https://github.com/Yerrithathachoppa/Portfolio_Website)
* **Vercel Host:** Deployed via Vercel Serverless Functions.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom properties, CSS Grid, Flexbox, Animations), Modular JavaScript.
* **Serverless Backend (Vercel):** Node.js Serverless Functions for secure API handling.
  * `/api/content`: Serves profile details, work history, projects, and skills.
  * `/api/chat`: Handles floating widget AI query streaming via Server-Sent Events (SSE).
* **AI Model:** `llama-3.3-70b-versatile` running via the Groq SDK (`groq-sdk`).
* **Content Database:** Powered by [profile.md](./profile.md) (Markdown file parsed dynamically at runtime), guaranteeing absolute reliability and simple updates.

---

## ✨ Key Features

1. **AI Chatbot Widget:** A custom floating chat panel. Users can ask questions about my background, and the chatbot streams contextual replies using data loaded from my profile.
2. **Direct Project Navigation:** Quick access buttons on featured project cards to visit live Streamlit application deployments or review GitHub repositories.
3. **Interactive Project Modals:** Custom modals showing case study descriptions and tech tags for in-depth analysis.
4. **Live Resume Viewer:** Direct access to view my latest resume PDF in a clean, new browser window.
5. **Modern Dark Aesthetics:** Harmonious HSL colors, responsive layouts, glassmorphism card overlays, and fluid floating entry animations.

---

## 📁 File Structure

```text
├── api/                  # Vercel Serverless Functions
│   ├── chat.js           # Streams LLM chat replies
│   ├── content.js        # Parses and returns profile contents
│   └── seed.js           # Database migration/seeding controller
├── lib/                  # Backend utilities & schema logic
│   ├── build-context.js  # Resolves textual context for AI prompts
│   ├── parse-profile.js  # Markdown parser matching profile.md to JSON
│   └── seed.js           # PostgreSQL seeding controller
├── public/               # Static frontend client files
│   ├── css/              # Modular styling files (layout, projects, chatbot, etc.)
│   ├── js/               # Modular components logic (hero, modal, projects, etc.)
│   ├── YCHOPPA_newV2.pdf # Live resume document
│   ├── ychoppa.jpg       # Profile picture asset
│   └── index.html        # Main landing page entry
├── profile.md            # Local markdown database (Source of truth)
└── vercel.json           # Vercel Serverless bundle configurations
```

---

## 💻 Local Development

Follow these steps to run the portfolio website locally on your computer:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Development Server
```bash
npm run local
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Deployment (Vercel)

1. Import your GitHub repository to **Vercel**.
2. Go to **Settings ➔ Environment Variables** and add your `GROQ_API_KEY`.
3. Click **Deploy**. Vercel will automatically compile the serverless functions and serve the static files.
