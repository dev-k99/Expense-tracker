# Expense Tracker CLI

A simple yet powerful **command-line expense tracker** built as part of the [roadmap.sh](https://roadmap.sh/projects/expense-tracker) backend project challenge.

Track your daily expenses, view summaries (total and monthly), manage entries, and keep everything persistently stored in a local JSON file — all from your terminal.


## ✨ Features

- ➕ Add new expenses with description, amount, category & date
- 📋 List all expenses with IDs
- 🗑️ Delete expenses by ID
- 📊 View total expenses summary
- 📅 View monthly expense summary
- 💾 Persistent storage using JSON file (`expenses.json`)
- ✅ Input validation & helpful error messages
- Clean modular code structure
- Easy to extend (categories, budgets, CSV export, etc.)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-k99/Expense-tracker.git

# Go to project directory
cd Expense-tracker

# Install dependencies (if any - most likely just npm init)
npm install

### Usage

# Add an expense
node expense-tracker.js add --description "Lunch" --amount 120 --category food

# Add with date (optional - defaults to today)
node expense-tracker.js add --description "Coffee" --amount 45 --date 2025-12-15

# List all expenses
node expense-tracker.js list

# Delete an expense by ID
node expense-tracker.js delete 3

# View total summary
node expense-tracker.js summary

# View summary for a specific month (MM-YYYY)
node expense-tracker.js summary --month 12-2025


