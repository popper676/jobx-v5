# JobX 🎯

**JobX** is a "Skill-First Career Marketplace" inspired by the trust-building models of platforms like Airbnb and Agoda. It aims to solve the core frustrations of traditional professional networks (like LinkedIn) by prioritizing transparency, skill verification, and a modern, engaging user experience.

---

## 🚀 The Vision

Traditional professional networks are often resume-first and corporate-focused, leading to "application black holes," hidden salaries, and meaningless skill endorsements.

**JobX** reimagines the career platform:
*   **From "A better LinkedIn" to "The Airbnb of Careers"**
*   **Skills first. Resume second.**
*   **Find work you love. Show what you can do.**

---

## ✨ Core Features & Unique Selling Points (USPs)

1.  🔍 **Application Tracker (Transparent Pipeline)**
    *   No more ghosting. Track your application status in real-time (Applied → Viewed → Shortlisted → Interview → Offered).
2.  💰 **Salary Transparency**
    *   Know your worth before you apply. Upfront salary ranges for all job listings.
3.  🏆 **Skill Verification (Proof > Endorsement)**
    *   Skills are backed by actual projects and challenges, not just random endorsements. Verified skill badges show employers what you can *really* do.
4.  🎬 **Career Spotlight (Shorts)**
    *   A TikTok-style feed for career content. Showcase a "Day in the life," project walkthroughs, or interview tips in 60 seconds.
5.  🤝 **Gig Board (Coming Soon)**
    *   A marketplace for short-term projects and freelance work, catering to the modern gig economy.
6.  🔄 **Seamless Role Switching**
    *   Easily switch between "Job Seeker" and "Employer" modes within the same account.

---

## 🎨 Design & Theme

JobX features a warm, inviting, travel-inspired design (Agoda/Airbnb theme) that breaks away from the cold, corporate blue of traditional platforms.
*   **Brand Color:** Coral/Pink (`#FF385C`)
*   **Typography:** Nunito (friendly and accessible)
*   **UI Vibe:** Clean, modern, with generous rounded corners, soft shadows, and dynamic micro-animations.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Routing:** React Router v6
*   **Animations:** Motion (Framer Motion)
*   **Icons:** Lucide React
*   **Testing:** Vitest

---

## 💻 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (or yarn/pnpm)

### Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory:
    ```bash
    cd "JobX 29"
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:
```bash
npm run dev
```
The app will typically run on `http://localhost:3000` (or `3001`/`3002` if ports are busy).

### Building for Production

To create a production-ready build:
```bash
npm run build
```

### Running Tests

To run the unit tests:
```bash
npm run test
```

---

## 📁 Project Structure (Key Folders)

*   `src/components/`: Reusable UI components (buttons, cards, modals).
*   `src/pages/`: Main page components (Home, Jobs, Profile, Dashboard, etc.).
*   `src/store/`: State management context (`StoreProvider.tsx`).
*   `src/services/`: Mock backend services and data persistence (`db.ts`, `authService.ts`).
*   `src/data/`: Static mock data used across the app.
*   `src/index.css`: Global styles and Tailwind theme configuration.

---

*Built with ❤️ for a better career future.*
