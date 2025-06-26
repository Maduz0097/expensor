💰 Personal Finance Tracker
  
Welcome to my Personal Finance Tracker, a pet project to manage my personal finances with ease and clarity! This app helps me track income, expenses, savings, budgets, and net worth, all in Sri Lankan Rupees (LKR ₨). It's built with love, a bit of code, and a lot of AI assistance. 😄

Note: This project is 90% AI-generated (thanks to tools like Grok!) with 10% my own tweaks. It's a work in progress, so please don't judge me—I'm just trying to keep my finances in check! 🙈


🚀 Features

Dashboard Overview 📊: Visualize total income, expenses, net worth, and trends with dynamic charts.
Income & Expense Tracking 💸: Add, edit, and delete records for income and expenses.
Savings & Investments 🏦: Monitor savings accounts and investment contributions.
Budget Management 📅: Set and track monthly budgets by category.
Assets & Liabilities 🏠: Calculate net worth with detailed asset and liability tracking.
Date Range Filtering ⏳: Filter data by custom date ranges (defaults to last 30 days).
Currency Support 🇱🇰: All amounts displayed in LKR (₨) for local relevance.
Responsive UI 📱: Compact design (no CSS changes needed!).

Progress:

🛠️ Tech Stack

Backend: Node.js, Express.js
Frontend: EJS templates
Database: SQLite (finance.db)
Libraries: moment for date handling, chart.js for charts
Deployment: Supports Render, Glitch, Cyclic (see Deployment)


📂 Project Structure
personal-finance-tracker/
├── public/               # Static assets (CSS, JS)
│   └── style.css         # Compact UI styling
├── routes/               # Express route handlers
│   ├── index.js          # Dashboard route
│   ├── income.js         # Income routes
│   ├── expenses.js       # Expense routes
│   ├── savings.js        # Savings routes
│   ├── budget.js         # Budget routes
│   └── assetsLiabilities.js # Assets & Liabilities routes
├── utils/                # Utility functions
│   ├── db.js             # Database queries
│   └── dateUtils.js      # Date range helpers
├── views/                # EJS templates
│   ├── index.ejs         # Dashboard
│   ├── income.ejs        # Income page
│   ├── expenses.ejs      # Expenses page
│   ├── savings.ejs       # Savings page
│   ├── budget.ejs        # Budget page
│   └── assets_liabilities.ejs # Assets & Liabilities page
├── models/
│   └── database.js       # SQLite database setup
├── app.js                # Main Express app
├── package.json          # Dependencies and scripts
└── finance.db            # SQLite database


🏁 Getting Started
Follow these steps to run the project locally:
Prerequisites

Node.js (v16 or higher)
npm (v8 or higher)
SQLite3 (for database)

Installation

Clone the Repository:
git clone https://github.com/your-username/personal-finance-tracker.git
cd personal-finance-tracker


Install Dependencies:
npm install


Verify Database:

Ensure finance.db is created in the project root by running node models/database.js or manually:sqlite3 finance.db




Run the App:
npm start

🚀 App runs at http://localhost:3000.



🙏 Acknowledgments

AI Assistance: 90% of this project was generated with help from AI tools like Grok by xAI. 🤖
My Contribution: 10% custom tweaks to make it my own! 🛠️
Purpose: A personal tool to track my finances—no judgment, please! 😅


📜 License
This project is licensed under the MIT License. See LICENSE for details.

Happy Tracking! 💸Made with ❤️ by Yamika Perera and a sprinkle of AI magic! ✨
