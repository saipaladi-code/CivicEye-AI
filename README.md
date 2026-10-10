# CivicEye AI
> **Intelligent Public Issue Detection & Resolution Platform**
> *Report Smarter. Resolve Faster. Build Better Cities.*

![CivicEye AI Banner](https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80)

CivicEye AI is a modern, responsive web prototype designed for smart city governance. It demonstrates an end-to-end workflow from citizen civic issue reporting to multimodal AI vision analysis (Google Gemini API), transparent 100-point priority scoring, authority department assignment, field resolution with before/after photo evidence, and live citizen tracking.

---

## ✨ Features & Highlights

- 🤖 **Google Gemini Vision AI Integration**: Multimodal AI vision model automatically classifies photo uploads (*Potholes, Garbage Overflow, Broken Streetlights, Water Leakage, Drainage Blockages*), calculates visual confidence, and estimates hazard severity.
- 🎯 **Transparent 100-Point Priority Model**: Priority scoring formula based on Severity (max 40pt), Duplicate Reports (max 25pt), Public Impact (max 20pt), and Location Factor (max 15pt).
- 🗺️ **Interactive OpenStreetMap Integration**: Spatial issue plotting using Leaflet maps with custom priority-colored markers and popup cards.
- 🔄 **Dual User Roles (Citizen & Authority)**: Instant role toggle with specialized dashboards for both citizens and municipal authorities.
- 📸 **Before & After Resolution Evidence**: Field worker resolution tool allowing photo evidence upload before marking complaints as RESOLVED.
- 🪄 **Interactive Demo Tour Controller**: Floating guided controller walking evaluators step-by-step through the 14-stage presentation scenario.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm`

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/saipaladi-code/CivicEye-AI.git
cd CivicEye-AI

# 2. Install dependencies
npm install

# 3. Create .env file with your Gemini API Key
echo "VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY" > .env

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## 🛠️ Built With

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Leaflet / OpenStreetMap
- **AI Vision Engine**: Google Gemini API (`gemini-1.5-flash`)
- **Animations**: Canvas Confetti & Custom CSS scanning radar

---

## 📜 License

MIT License. Developed as a College AI Project Prototype.
