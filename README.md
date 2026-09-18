# 💎 XPance — Level Up Your Wealth

<p align="center">
  <img src="public/pwa-icon.svg" width="128" height="128" alt="XPance Logo" />
</p>

<p align="center">
  <b>A mindful personal finance tracker with impulse spending radar, multi-currency accounts, and gamification.</b>
  <br />
  <i>100% Local-First • Offline Capable • Zero Third-Party Trackers • Installable PWA for Smartphones & Desktop</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-100%25_Offline-00e699?style=flat-square" alt="PWA" />
  <img src="https://img.shields.io/badge/Privacy-Local--First-f59e0b?style=flat-square" alt="Local First" />
  <img src="https://img.shields.io/badge/i18n-EN%20%7C%20RU-a855f7?style=flat-square" alt="i18n" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

---

## ⚡ Why XPance?

Most personal finance apps suffer from one of two flaws: they either charge monthly subscriptions and upload your private financial history to external servers, or they turn expense logging into a tedious chore that you abandon after three days.

**XPance** solves both problems:
1. **Your Data Stays With You**: Built with a strict **Local-First** philosophy. Your transactions, balances, and accounts are stored on your device in your browser's local storage. No trackers, no databases, no leaks.
2. **Conscious Tracking Instead of Guilt**: Rather than micro-managing pennies, XPance classifies spending by rationality (*Base*, *Joy*, *Impulse*) and rewards discipline with streaks, experience points (XP), and trophies.
3. **True Multi-Currency Net Worth**: Track cash, bank accounts, and crypto across different currencies (`RUB`, `USD`, `EUR`, `USDT`, `KZT`, `GEL`) converted live into your total Net Worth.
4. **Bilingual UI (English & Russian)**: Switch languages on the fly with a single click in the top header.

---

## 🚀 Key Features

### 1. 🌿 Mindful Spending Radar (Base • Joy • Impulse)
Every expense is tagged into one of three conscious tiers:
* 🌿 **Base (Essential)** — Non-negotiable living expenses (housing, groceries, transit, health).
* ✨ **Joy (Mindful)** — Intentional spending that enriches your life (hobbies, travel, dining with loved ones).
* ⚠️ **Impulse (Spontaneous)** — Emotional or bored impulse purchases that add no lasting value.

*The interactive radar dynamically analyzes your ratio and warns you if impulse expenses spike beyond healthy boundaries.*

---

### 2. 🏆 Gamification & Hall of Trophies
* **Leveling & XP System**: Progress from *Budget Novice* all the way to *Financial Sage*.
* **Mindful Streaks 🔥**: Track consecutive days without a single impulse purchase.
* **Trophies & Milestones**:
  * 🛡️ *Cool Calculation* (3 consecutive impulse-free days)
  * ⚔️ *Iron Discipline* (7 consecutive impulse-free days)
  * 🧘 *Samurai Zen* (14 consecutive impulse-free days)
  * 🌐 *Multi-Currency Mogul* (Maintain accounts in 2+ currencies)
  * 🐷 *Capital Guardian* (Open a high-yield savings deposit)
  * 🔄 *Capital Allocation* (Perform your first intra-account transfer)
* **Confetti Celebrations**: Visual fireworks when you unlock achievements or level up!

---

### 3. 💳 Multi-Currency Accounts & Smart Transfers
* Supports multiple fiat and digital currencies: `RUB (₽)`, `USD ($)`, `EUR (€)`, `USDT (₮)`, `KZT (₸)`, `GEL (₾)`.
* **Aggregated Net Worth**: Automatically calculates your total wealth across all cards and accounts.
* **Full Account Management**: Add banks, customize card colors and account types (Debit, Credit, Savings, Cash, Crypto).
* **Inter-Account Transfers**: Move funds between your accounts with automatic currency conversion rates without distorting your income/expense reports.

---

### 4. 🔒 Privacy-First & Google Drive Backup
* **100% Local-First**: Zero backend reliance. Your financial privacy is completely respected.
* **100% Offline Capable**: Built-in Progressive Web App Service Worker caches the application for airplane or subway use.
* **Single-File Vault**: Export or import your entire financial state with one click (`xpance_vault.json`).
* **Optional Google Drive Sync**: Authorize your personal Google OAuth Client ID to sync directly to your private Google Drive folder.

---

### 5. 📱 Progressive Web App (PWA)
* Responsive design tailored for mobile screens (e.g., Samsung Galaxy S24 Ultra, iPhone) and desktop monitors.
* Installable straight from the browser to your home screen with a native-app feel.
* Ergonomic mobile navigation bar: **Input**, **Accounts**, **Radar**, and **Trophies**.

---

## 🛠 Quick Start (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm`

```bash
# 1. Clone repository
git clone https://github.com/mishganchick/xpance.git
cd xpance

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🚀 Deployment

### Option A: Vercel (Recommended for instant global access without VPN)
1. Fork or push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import `xpance` — Vercel detects Vite automatically.
4. Click **Deploy**!

### Option B: GitHub Pages
This repository includes a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` will automatically build and deploy the app to `https://<username>.github.io/xpance/`.

---

## 🏗 Tech Stack

* **Framework**: [React 19](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Tooling**: [Vite 8](https://vitejs.dev/)
* **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Effects**: [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Styling**: Modern Vanilla CSS (Glassmorphism, CSS Custom Properties, Dark Mode)

---

## 📄 License

Distributed under the [MIT License](LICENSE). Free for personal and commercial use.
