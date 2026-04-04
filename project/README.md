# 🌬️ Wind & Unwind

**Wind & Unwind** is an immersive, audiovisual memory game built with a modern, glassmorphic design. Players challenge their minds by repeating increasingly complex sequences of "Up" and "Down" movements, set against a calming, reactive soundscape.

![Main Menu](https://github-production-user-asset-6210df.s3.amazonaws.com/6210df/placeholder-main-menu.png) *Replace with actual screenshot link if preferred.*

---

## ✨ Features

- **🧠 Memory Challenge**: A "Simon Says" style loop where players watch a sequence and repeat it to build a high streak.
- **🎨 Premium Aesthetics**: Features a modern, glassmorphic UI with vibrant "Aurora" gradients, neon typography, and fluid Framer Motion animations.
- **🎵 Audiovisual Experience**: Integrated with **Tone.js** to generate specific musical notes for every move, making the game a rhythmic journey.
- **🏆 Global Leaderboard**: Powered by **Supabase**, allowing players to compete globally. 
- **⚡ Built for Speed**: Powered by **Vite** and **React 18** for nearly instant load times and 60fps animations.
- **🛡️ Robust Reliability**: Includes local-storage fallback for scores in case of database disconnection.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Audio Logic**: [Tone.js](https://tonejs.github.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or use the existing one) and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*Note: The game includes a "Local Fallback" mode and will still function perfectly for local testing even without these keys.*

### 4. Database Setup (Optional)
If you are setting up your own Supabase project, execute the SQL migration found in:
`supabase/migrations/20250317163330_calm_reef.sql`

This migration creates the `leaderboard` table and sets up **Row Level Security (RLS)** allowing public reads and authenticated/anonymous writes.

### 5. Running Vertically
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎮 How to Play

1. **Enter Your Name**: Start your journey as a "Wanderer".
2. **Watch the Sequence**: The central Wind icon will rotate and play musical notes.
3. **Repeat the Rhythm**: Use your **ArrowUp** and **ArrowDown** keys to repeat the sequence exactly.
4. **Build Your Streak**: The sequences get longer as you progress. You have **3 lives** (strikes) before your memory fades.
5. **Join the Legends**: Submit your score to the global leaderboard.

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── Game.tsx        # Core game loop & UI
│   │   └── Leaderboard.tsx # High scores presentation
│   ├── utils/
│   │   ├── sound.ts        # Tone.js audio configurations
│   │   └── supabase.ts     # Supabase client & DB hooks
│   ├── index.css           # Custom theme & Glassmorphism styles
│   └── App.tsx             # Entry component
├── supabase/               # Database migrations & configuration
└── tailwind.config.js      # Design tokens
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### 🙌 Credits
- Design & Logic: Created by **Antigravity**.
- Icons: [Lucide React](https://lucide.dev/).
- Audio Engine: [Tone.js](https://tonejs.github.io/).
