# 🌱 Reflect & Track — Private Journaling, AI Reflections, Mood Tracking, and Crisis Support

Millions struggle with mental health support access in India. **Reflect & Track** provides a private, AI-powered journaling and crisis support platform designed with accessibility and cultural context in mind.  
🌐 **Live Demo:** [ai-mental-journal.vly.site](https://ai-mental-journal.vly.site/)  

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Reflect%20%26%20Track-blue?style=flat&logo=vercel)](https://ai-mental-journal.vly.site/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-orange)]()  

---

## 🔄 How It Works
1. ✍️ Journal privately (text or voice input)
2. 🤖 Receive AI-powered empathetic reflections
3. 📊 Track mood trends & access crisis support if needed

---

## ✨ Features  

- **Private Journaling** with optional voice input (MediaRecorder + Gemini transcription)  
- **AI Reflections** powered by Google Gemini (REST) with heuristic fallback  
- **Mood Tracking** dashboard with trends (Recharts)  
- **Crisis Support & Safety Modal**: emergency calls, trusted contacts, coping tools, and safety plan export  
- **Internationalization**: English, Spanish UI; Hindi auto-aligned to India resources  
- **Authentication**: Email OTP or guest mode (guest data not stored in DB)  
- **Accessibility**: visible focus rings, contrast checks, WCAG unit tests, reduced-motion awareness  
- **Privacy-Focused**: Data stays local unless exported or shared  

---

## 🛠 Tech Stack  

- **Frontend:** React + Vite + React Router, Tailwind CSS, shadcn/ui, Framer Motion  
- **Backend/DB/Auth:** Convex  
- **AI Services:** Google Gemini (REST API) for reflections & transcription  
- **Data Visualization:** Recharts  
- **Tooling:** Sonner (toasts), Axe CLI (a11y checks), Vitest (unit tests)
- Refer **DOCS.md** for more details about the Tech Stack used

---

## 🚀 Getting Started  

**Prerequisites**  
- Node.js 18+ and pnpm  
- Convex project (dev server runs automatically)  
- Optional: Gemini API key (`GOOGLE_API_KEY` or `GEMINI_API_KEY`)  

**Install & run locally:**  
```bash
pnpm install
pnpm dev
# open http://localhost:5173
```  

**Build & preview:**  
```bash
pnpm build
pnpm preview
```  

---

## 🔐 Environment Variables  

Set keys via your platform’s Integrations/API Keys UI:  
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` → enables Gemini reflections & transcription  

---

## 🧾 License  

MIT — See LICENSE.  
