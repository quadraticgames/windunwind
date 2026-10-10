# Attune: Siddhartha's Journey

**Attune** is a meditative, audiovisual tone-memory game inspired by Hermann Hesse's classic spiritual novel *Siddhartha*. Players journey through 9 stages across the three spiritual realms of **Body**, **Mind**, and **Spirit**, repeating harmonic sequences of temple chimes and singing bowls along a winding ink-wash path to reach Enlightenment and Oneness (27 puzzles in total).

---

## ✨ Features & Recent Updates

### 🎨 Handcrafted Progression Path (Affinity Designer)
- **Ascending S-Curve Flow:** An organic horizontal path created in Affinity Designer guiding players through 9 stages.
- **Stage Nodes & Active Indicator:** Balanced circular stage stations with Roman numerals, featuring a custom vector Lotus medallion (`lotus.svg`) enclosed in an animated white pulsing dotted halo to mark the player's active stage.

### 🔊 Seamless Web Audio Ambient Engine
- **Pop-Free Looping:** Built a dedicated Web Audio API engine using sample-accurate buffer memory playback and a 1.0-second equal-power crossfade between loop boundaries, eliminating MP3 seek dropouts and audio clicks.
- **4.4-Second Ambient Fade-In:** The drone gently swells into the soundscape over 4.4 seconds upon the first player interaction.
- **Balanced Background Level:** Tuned ambient drone volume down by 60% (`0.14`) to provide a soothing bed that never overpowers the chimes.
- **Micro-Ramped Gain Transitions:** Smooth 40–50ms linear ramps on mute, unmute, and stop prevent abrupt digital audio cuts.

### 🔔 Calibrated Chime Acoustics & Sound Effects
- **Equal-Loudness Balancing:** Boosted the lower tone volume by +4.5 dB (`+0.5 dB` vs `-4 dB` on high tone), compensating for raw file master differences and acoustic hearing contours so both notes ring with equal perceived loudness.
- **Anti-Click Note Fades:** Applied gentle envelope micro-fades (`fadeIn: 0.005`, `fadeOut: 0.04`) on `Tone.Player` to ensure clean audio cuts when notes retrigger.
- **Tactile UI Clicks:** Responsive audio pool utilizing `click.mp3` for all interface buttons and navigation (excluding tone buttons).

### 🏷️ Realm Announcement Banners & Icons
- **Celebration Banners:** Elegant animated pill banner appearing at the top of the canvas when entering a new stage.
- **Thematic Realm Icons:** Dedicated visual iconography replacing generic AI-style stars:
  - 🧘 **Body (Stages 1–3):** Contemplative seated figure in lotus meditation posture.
  - 🧠 **Mind (Stages 4–6):** Intellect and consciousness brain icon.
  - 🌬️ **Spirit (Stages 7–9):** Transcendent wind and breath icon.

### 📖 Mandatory Chapter Lore Progression
- When advancing to a new stage, after the celebration banner fades, the game automatically opens that stage's chapter in the **Lore Book**.
- Players read the concept, conflict, and objective before clicking through to embark on that stage's 3 tone puzzles.

### 🏮 Zen Aesthetic & Visual Polish
- Atmospheric Asian ink-wash landscape background.
- Translucent washi paper card styling with gentle parchment textures.
- Jade stone primary action buttons with realistic depth and active states.
- Traditional Chinese/Japanese calligraphy streak counter with the script character **道** (*The Way / Dao*).

---

## 📜 Stages of the Journey

### 🧘 Body (Stages 1 to 3)

- **Stage 1: The Brahmin’s Cage (The Departure)**
  - *Concept:* The protagonist begins in a world of perfection, ritual, and intellectual privilege.
  - *Conflict:* Despite mastering all scriptures, Siddhartha feels a profound inner emptiness. He must stand up to his father's expectations to earn the right to leave.
  - *Objective:* Break away from comfort and cross the threshold into the unknown.
- **Stage 2: The Samana Trials (Asceticism)**
  - *Concept:* Extreme physical denial, fasting, and testing the limits of the bodily vessel.
  - *Conflict:* Siddhartha endures pain to kill the "Self," only to realize self-mortification is a temporary escape rather than true enlightenment.
  - *Objective:* Strip away the ego through rigorous physical discipline.
- **Stage 3: Confronting the Buddha (The Rejection of Doctrine)**
  - *Concept:* Meeting the ultimate spiritual teacher: Gotama, the Buddha.
  - *Conflict:* Siddhartha recognizes the Buddha's perfection but realizes wisdom cannot be taught through words or doctrines; it must be experienced firsthand. He leaves Govinda behind to walk alone.
  - *Objective:* Walk away from ready-made answers and choose a solitary, unguided path.

### 🧠 Mind (Stages 4 to 6)

- **Stage 4: The Garden of Kamala (Awakening of the Senses)**
  - *Concept:* Stepping into the vibrant, tactile material world.
  - *Conflict:* Siddhartha meets the courtesan Kamala. To win her affection, he must master trade, desire, and worldly cleverness, transitioning into a creature of the mind and flesh.
  - *Objective:* Master the arts of the material world, social status, and worldly intellect.
- **Stage 5: The Gambler’s Trap (Descent into Samsara)**
  - *Concept:* The slow decay of the soul through wealth, greed, and addiction.
  - *Conflict:* Becoming a wealthy merchant, Siddhartha falls victim to gambling, drinking, and spiritual numbness, losing touch with his inner voice.
  - *Objective:* Navigate luxury while witnessing spiritual health reach rock bottom.
- **Stage 6: The River of Rebirth (The Dark Night of the Soul)**
  - *Concept:* Facing total despair and the death of the worldly self.
  - *Conflict:* Disgusted by his bloated existence, Siddhartha flees to the river to end his life. At the brink, he hears the sacred sound "Om" vibrating from the waters, awakening with a cleansed soul.
  - *Objective:* Overcome self-hatred and awaken with a clean slate.

### 🌬️ Spirit (Stages 7 to 9)

- **Stage 7: The Ferryman’s Disciple (Listening to the River)**
  - *Concept:* Learning wisdom through quiet observation and nature alongside the humble ferryman Vasudeva.
  - *Conflict:* Instead of reading doctrines, Siddhartha learns to listen deeply to the water, realizing that time is an illusion and all voices exist in a unified eternal present.
  - *Objective:* Master the art of listening without judgment.
- **Stage 8: The Wound of Love (The Human Trial)**
  - *Concept:* Facing the agonizing pain of human attachment and parental grief.
  - *Conflict:* Kamala dies, leaving Siddhartha with their rebellious son. Siddhartha attempts to force the boy into river life, but the boy runs away. Siddhartha must endure the heartbreak of letting go.
  - *Objective:* Overcome personal grief and release the need to control others.
- **Stage 9: The Eternal Flow (Total Integration & Om)**
  - *Concept:* Achieving full enlightenment, peace, and unity with the cosmos.
  - *Conflict:* Vasudeva departs into the forest. When Govinda returns, Siddhartha imparts his final realization: all things are sacred, time is non-linear, and love is the unifying truth.
  - *Objective:* Attain ultimate oneness, bridge the gap for others, and complete the 27-puzzle journey.

---

## 🎮 How to Play

1. **Start:** Click **Begin The Journey** on the main menu.
2. **Listen:** Observe the central circle as the sequence of higher and lower chime tones plays.
3. **Repeat:** Press the **Up** / **Down** arrow keys (or click **Higher Tone** / **Lower Tone**) to repeat the pattern.
4. **Progression:** Each stage contains 3 puzzles of matching length. Stage 1 begins with single-tone puzzles; each subsequent stage adds one tone.
5. **Enlightenment:** Solve all 27 puzzles across the 9 stages to achieve Enlightenment. You have 3 strikes before the journey resets.

### ⌨️ Keyboard Shortcuts
- **Up Arrow / Down Arrow:** Play Higher / Lower Tone
- **M:** Toggle ambient drone audio mute
- **Shift + A:** *(Developer cheat)* Advance to the next stage to test transitions

---

## 🛠️ Technology Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS + Vanilla CSS (Zen parchment tokens)
- **Animations:** Framer Motion
- **Audio Engine:** Web Audio API (custom seamless loop engine) + Tone.js (FMSynth, Reverb, Tone.Player)
- **Vector Assets:** Affinity Designer (SVG path & mandala components)
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/quadraticgames/windunwind.git
cd windunwind

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📄 License

This project is licensed under the MIT License.
