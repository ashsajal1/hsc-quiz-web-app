# HSC Quiz Web App

Welcome to the **HSC Quiz Web App** - an interactive learning platform designed to help students prepare for their Higher Secondary Certificate (HSC) examinations. This application offers a variety of engaging study tools and games to make learning more effective and enjoyable.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Project](#running-the-project)
  - [Building the Project](#building-the-project)
- [Project Structure](#project-structure)
- [Features in Detail](#features-in-detail)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Quizzes**: Test your knowledge with multiple-choice questions
- **Word Games**: Improve vocabulary with engaging word-based games
- **Drop Game**: A fun, interactive game to enhance learning through play
- **Dark/Light Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works on desktop and mobile devices
- **Progress Tracking**: Monitor your learning progress over time
- **Formulas & Equations**: Study complex formulas with interactive components
- **Practice Exams**: Simulate real exam conditions with timed tests

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or Yarn (v1.22 or later)
- Git (for version control)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hsc-quiz-web-app.git
   cd hsc-quiz-web-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The build will be available in the `dist/` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── formula-puzzle.tsx  # Interactive formula components
│   ├── mcq-card.tsx        # Multiple choice question cards
│   ├── mode-toggle.tsx     # Dark/light theme toggle
│   └── word-puzzle.tsx     # Word game components
├── pages/          # Page components
│   ├── drop-game.tsx       # Interactive drop game
│   ├── word-game.tsx       # Word puzzle game
│   ├── quiz.tsx           # Quiz interface
│   └── ...
├── lib/           # Utility functions and data
│   └── words/      # Word lists and categories
├── hooks/          # Custom React hooks
└── styles/         # Global styles and Tailwind config
├── .prettierrc          # Prettier configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project metadata and scripts
└── pnpm-lock.yaml       # Package lock file
```

## Features in Detail

### Interactive Quizzes
- **Multiple Choice Questions**: Test your knowledge across various subjects
- **Immediate Feedback**: Get instant results after each question
- **Progress Tracking**: Monitor your improvement over time
- **Categorized Content**: Questions organized by subject and topic

### Word Games
- **Vocabulary Building**: Enhance your terminology across subjects
- **Interactive Puzzles**: Engaging way to learn and remember key terms
- **Multiple Categories**: Words organized by topics and difficulty levels

### Drop Game
- **Interactive Learning**: Catch falling words to score points
- **Timed Challenges**: Test your knowledge under time pressure
- **Multiple Word Lists**: Various categories to choose from
- **Scoring System**: Track your performance and improve

### Study Tools
- **Formula Reference**: Interactive formula sheets with examples
- **Bookmarking**: Save important questions for later review
- **Performance Analytics**: Detailed insights into your strengths and weaknesses

### User Experience
- **Responsive Design**: Seamless experience across all devices
- **Dark/Light Mode**: Choose your preferred theme
- **Intuitive Navigation**: Easy access to all features
- **Accessible**: Designed with accessibility in mind

## Contributing

We welcome contributions from the community! Here's how you can help:

1. **Report Bugs**: Open an issue to report any bugs or issues you find
2. **Suggest Features**: Share your ideas for new features or improvements
3. **Submit Pull Requests**: Help us improve the codebase
4. **Improve Documentation**: Help make our documentation better

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details on how to contribute.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for students preparing for their HSC examinations. If you have any questions or need assistance, please don't hesitate to open an issue. Happy studying! 📚✨
