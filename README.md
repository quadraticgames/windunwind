# Wind & Unwind

Wind & Unwind is an audiovisual memory game where players repeat sequences of higher and lower tones, moving along a winding left-to-right spiritual hero's journey inspired by Hermann Hesse's *Siddhartha*.

![Main Menu](https://github-production-user-asset-6210df.s3.amazonaws.com/6210df/placeholder-main-menu.png)

## Features

- Winding horizontal sumi-e ink path tracking progression through 9 stages across Body, Mind, and Spirit.
- Progressive difficulty where each stage contains three tone puzzles of equal length, totaling 27 puzzles to reach Enlightenment.
- In-game lore reader detailing the concept, conflict, and objective of every stage.
- Interface with gradient styling built with Tailwind CSS and Framer Motion.
- Dynamic audio with crystalline chimes and lush reverb using Tone.js.
- Built with Vite and React 18.

## Stages of the journey

### Mind (Stages 1 to 3)

- **Stage 1: The Brahmin’s Cage (The Departure)**
  - Concept: The protagonist begins in a world of perfection, ritual, and intellectual privilege.
  - Conflict: Despite mastering all the texts, Siddhartha feels a profound inner emptiness. He must stand up to his father's traditional expectations to earn the right to leave.
  - Objective: Break away from comfort and cross the threshold into the unknown.
- **Stage 2: The Samana Trials (Asceticism)**
  - Concept: A stage of extreme denial, survival, and testing the limits of the physical body.
  - Conflict: Siddhartha fasts, breathes minimally, and endures pain to kill the "Self." However, he realizes that self-mortification is just a temporary escape, not true enlightenment.
  - Objective: Survive the elements and strip away the ego through intense discipline.
- **Stage 3: Confronting the Buddha (The Rejection of Doctrine)**
  - Concept: Meeting the ultimate spiritual authority: Gotama, the Buddha.
  - Conflict: Siddhartha recognizes the Buddha's perfection but realizes that wisdom cannot be taught through words or doctrines; it must be experienced firsthand. He leaves his companion Govinda behind to walk alone.
  - Objective: Walk away from ready-made answers and choose a solitary, unguided path.

### Body (Stages 4 to 6)

- **Stage 4: The Garden of Kamala (The Awakening of Senses)**
  - Concept: Stepping into the vibrant, tactile material world.
  - Conflict: Siddhartha enters the city and encounters the courtesan Kamala. To win her love, he must learn the art of desire, trade, and love-making, transitioning from a spirit-focused monk to a creature of the flesh.
  - Objective: Master the arts of the material world, social status, and physical pleasure.
- **Stage 5: The Gambler’s Trap (The Descent into Samsara)**
  - Concept: The slow decay of the soul through wealth, greed, and addiction.
  - Conflict: Over the years, Siddhartha becomes a wealthy merchant. He falls victim to high-stakes gambling, drinking, and spiritual sloth, losing touch with his inner voice.
  - Objective: Navigate a world of luxury while watching your spiritual health bar hit absolute rock bottom.
- **Stage 6: The River of Rebirth (The Dark Night of the Soul)**
  - Concept: Facing total despair and the death of the old self.
  - Conflict: Disgusted by his bloated, worldly existence, Siddhartha flees to the river to drown himself. At the edge of death, he hears the sacred sound "Om" from the water, awakening him into a state of pure joy.
  - Objective: Survive a psychological trial of self-hatred and awaken with a clean slate.

### Spirit (Stages 7 to 9)

- **Stage 7: The Ferryman’s Disciple (Listening to the River)**
  - Concept: Learning a completely new form of wisdom based on quiet observation and nature.
  - Conflict: Siddhartha moves in with Vasudeva, a humble ferryman. Instead of reading books, he learns to listen deeply to the river, realizing that time is an illusion and all things exist in a simultaneous, eternal present.
  - Objective: Master the art of listening, patience, and guiding others across the threshold.
- **Stage 8: The Wound of Love (The Ultimate Human Trial)**
  - Concept: Facing the agonizing pain of human attachment and grief.
  - Conflict: Kamala dies, leaving Siddhartha with their spoiled, rebellious son. Siddhartha tries to force the boy to love the river life, but the son robs them and runs away. Siddhartha must endure the heartbreak of letting him go, fully experiencing human sorrow.
  - Objective: Overcome personal grief and break the cycle of trying to control others.
- **Stage 9: The Eternal Flow (Total Integration)**
  - Concept: Achieving full enlightenment, peace, and unity with the universe.
  - Conflict: Vasudeva departs into the woods, leaving Siddhartha as the master ferryman. When his old friend Govinda returns, Siddhartha passes on his final realization: everything is sacred, time is a construct, and love is the most important force.
  - Objective: Attain ultimate oneness, bridge the gap for others, and complete the spiritual cycle.

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Running the app

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to play

1. Click Begin The Journey to start.
2. Watch the central circle and listen to the chime tones.
3. Press the Up and Down arrow keys (or click Higher Tone / Lower Tone) to repeat the sequence.
4. Each stage has three tone puzzles of equal length. Stage 1 begins with single-tone puzzles; each subsequent stage adds one tone to its three puzzles.
5. Solve all three puzzles to advance to the next stage along the wheel.
6. Solve all 27 puzzles across all 9 stages to attain Enlightenment. You have 3 strikes before the journey resets.

## Project structure

```text
├── src/
│   ├── components/
│   │   └── Game.tsx        # Core game loop, journey wheel, and lore modal
│   ├── utils/
│   │   └── sound.ts        # Tone.js audio configurations
│   ├── index.css           # Custom theme & Glassmorphism styles
│   └── App.tsx             # Entry component
└── tailwind.config.js      # Design tokens
```

## License

This project is licensed under the MIT License; see [LICENSE](LICENSE) for details.

### Credits

- Design and logic: Antigravity
- Icons: [Lucide React](https://lucide.dev/)
- Audio engine: [Tone.js](https://tonejs.github.io/)
