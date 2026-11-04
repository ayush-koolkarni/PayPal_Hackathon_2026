# NEXUS | Global & Region-Aware Agentic AI Shopping & Product Intelligence Platform

An elite, luxury-grade, autonomous shopping research and durability intelligence engine designed to eliminate foreign currency confusion and out-of-region retailer bias. Built for seamless one-click deployment on **Render**.

---

## 🌟 Key Capabilities

### 1. Dynamic LLM Clarification (Zero Hardcoding)
- Powered dynamically by Google Gemini using Structured Outputs (`responseSchema`).
- When user queries are ambiguous or underspecified (e.g. *"shoes"*, *"laptop"*, *"coffee maker"* without style, use-case, or budget constraints), the agent autonomously chooses `action: "CLARIFY"`, provides targeted questions, and returns clickable quick-reply suggestion pills.
- Zero static keyword lists, regexes, or `if/else` triggers.

### 2. End-User Location & Currency Engine (Crucial for Cloud/Render Hosting)
- Client-side auto-detection via `Intl.DateTimeFormat().resolvedOptions().timeZone` cross-checked with `ipapi.co` and Express backend `x-forwarded-for`.
- Dynamic header Region/Currency Selector Pill (e.g. `🇮🇳 India (INR ₹)`, `🇺🇸 United States (USD $)`, `🇬🇧 UK (GBP £)`, `🇩🇪 Germany (EUR €)`, `🇯🇵 Japan (JPY ¥)`, `🇦🇺 Australia (AUD A$)`, `🇦🇪 UAE (AED)`).
- Regional search query generation: queries are locked to stores operating in the user's active country (e.g. Amazon.in, Flipkart, Croma, Reliance Digital for India; Amazon.com, Best Buy, Walmart for US).

### 3. Whole-Web Grounding, Multi-Retailer Scraping & Product Lifespan Synthesis
- **Layer 1: Gemini Google Search Grounding** (`tools: [{ googleSearch: {} }]`) targeting local street prices, regional stock, and authentic owner discussions.
- **Layer 2: Live Cheerio HTML & JSON-LD Scraping**: Extracts verified OpenGraph images, schema.org `Product` offers, and direct merchant purchase links.
- **Layer 3: Structured Durability & Lifespan Assessment**:
  - Estimated lifespan in years (e.g. `5–7 Years`)
  - Durability Score out of 10
  - Build materials analysis
  - Known component failure points over time (3–7 years)
  - Repairability notes and local warranty coverage

### 4. Interactive UX & Comparison Matrix
- **Obsidian Luxury Design**: `#090A0F` dark obsidian aesthetic with glassmorphic cards, crisp 1px borders, and Framer Motion micro-interactions.
- **Anti-Hotlink Image Proxy**: `/api/image-proxy` endpoint bypasses retailer hotlinking restrictions with fallback visuals.
- **Side-by-Side Comparison Drawer**: Compare up to 4 products simultaneously across street prices, lifespan, durability scores, pros/cons, and specs.
- **Persistent Chat History**: Backed by **SQLite** (`better-sqlite3`), surviving reloads and server restarts.

---

## 🏗️ Technical Stack

- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Cheerio (`cheerio`), `@google/genai` (official SDK).
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Deployment**: Render Blueprint (`render.yaml`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 10

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Set your Gemini API key (or configure it dynamically inside the web app's Settings Vault):
```env
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_GEMINI_MODEL=gemini-3.8-flash
PORT=3000
```

### 3. Development Mode
Run the development server:
```bash
npm run dev
```
Or run the client dev server with hot reload:
```bash
npm run dev:client
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## ☁️ Deployment on Render

This repository includes a production-ready `render.yaml` Blueprint.

1. Connect your repository to **Render**.
2. Select **New Blueprint Instance**.
3. Render will automatically read `render.yaml`, execute `npm install && npm run build`, and launch `npm run start`.
4. Add your `GEMINI_API_KEY` under the service environment variables (or let end users provide their own via the Settings Vault).
