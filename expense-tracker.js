#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File to store expenses
const DATA_FILE = path.join(__dirname, 'expenses.json');

// Initialize data file if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ expenses: [], nextId: 1, budgets: {} }));
  }
}

// Read expenses from file
function readExpenses() {
  initializeDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write expenses to file
function writeExpenses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Add expense
function addExpense(description, amount, category = null) {
  if (!description || !amount) {
    console.log('Error: Description and amount are required');
    return;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    console.log('Error: Amount must be a positive number');
    return;
  }

  const data = readExpenses();
  const expense = {
    id: data.nextId,
    date: getCurrentDate(),
    description,
    amount: numAmount,
    category: category || 'Uncategorized'
  };

  data.expenses.push(expense);
  data.nextId++;
  writeExpenses(data);

  console.log(`# Expense added successfully (ID: ${expense.id})`);
  
  // Check budget after adding
  const currentMonth = new Date().getMonth() + 1;
  checkBudget(currentMonth);
}

// Update expense
function updateExpense(id, description, amount, category) {
  const data = readExpenses();
  const expense = data.expenses.find(e => e.id === parseInt(id));

  if (!expense) {
    console.log(`Error: Expense with ID ${id} not found`);
    return;
  }

  if (description) expense.description = description;
  if (amount) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log('Error: Amount must be a positive number');
      return;
    }
    expense.amount = numAmount;
  }
  if (category) expense.category = category;

  writeExpenses(data);
  console.log(`# Expense updated successfully (ID: ${id})`);
}

// Delete expense
function deleteExpense(id) {
  const data = readExpenses();
  const initialLength = data.expenses.length;
  data.expenses = data.expenses.filter(e => e.id !== parseInt(id));

  if (data.expenses.length === initialLength) {
    console.log(`Error: Expense with ID ${id} not found`);
    return;
  }

  writeExpenses(data);
  console.log('# Expense deleted successfully');
}

// List all expenses
function listExpenses(category = null) {
  const data = readExpenses();
  let expenses = data.expenses;

  if (category) {
    expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  if (expenses.length === 0) {
    console.log('# No expenses found');
    return;
  }

  console.log('# ID  Date       Description          Amount    Category');
  expenses.forEach(e => {
    const desc = e.description.padEnd(20).substring(0, 20);
    const cat = e.category.padEnd(15).substring(0, 15);
    console.log(`# ${e.id.toString().padEnd(3)} ${e.date}  ${desc} $${e.amount.toFixed(2).padStart(8)} ${cat}`);
  });
}

// Show summary
function showSummary(month = null) {
  const data = readExpenses();
  let expenses = data.expenses;

  if (month) {
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.log('Error: Month must be between 1 and 12');
      return;
    }

    const currentYear = new Date().getFullYear();
    expenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === monthNum && expenseDate.getFullYear() === currentYear;
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`# Total expenses for ${monthNames[monthNum - 1]}: $${total.toFixed(2)}`);
  } else {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`# Total expenses: $${total.toFixed(2)}`);
  }
}

// Show summary by category
function showCategorySummary() {
  const data = readExpenses();
  const categoryTotals = {};

  data.expenses.forEach(e => {
    if (!categoryTotals[e.category]) {
      categoryTotals[e.category] = 0;
    }
    categoryTotals[e.category] += e.amount;
  });

  if (Object.keys(categoryTotals).length === 0) {
    console.log('# No expenses found');
    return;
  }

  console.log('# Category Summary:');
  Object.entries(categoryTotals).forEach(([category, total]) => {
    console.log(`# ${category.padEnd(20)} $${total.toFixed(2)}`);
  });

  const grandTotal = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  console.log(`# ${'Total'.padEnd(20)} $${grandTotal.toFixed(2)}`);
}

// Export to CSV
function exportToCSV(filename = 'expenses.csv') {
  const data = readExpenses();
  
  if (data.expenses.length === 0) {
    console.log('# No expenses to export');
    return;
  }

  let csv = 'ID,Date,Description,Amount,Category\n';
  data.expenses.forEach(e => {
    csv += `${e.id},${e.date},"${e.description}",${e.amount},${e.category}\n`;
  });

  fs.writeFileSync(filename, csv);
  console.log(`# Expenses exported to ${filename}`);
}

// Set budget
function setBudget(month, amount) {
  const monthNum = parseInt(month);
  const budgetAmount = parseFloat(amount);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    console.log('Error: Month must be between 1 and 12');
    return;
  }

  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    console.log('Error: Budget must be a positive number');
    return;
  }

  const data = readExpenses();
  if (!data.budgets) data.budgets = {};
  
  const currentYear = new Date().getFullYear();
  const key = `${currentYear}-${monthNum}`;
  data.budgets[key] = budgetAmount;
  
  writeExpenses(data);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  console.log(`# Budget for ${monthNames[monthNum - 1]} set to $${budgetAmount.toFixed(2)}`);
  
  // Check if current expenses exceed budget
  checkBudget(monthNum);
}

// Check budget
function checkBudget(month = null) {
  const data = readExpenses();
  if (!data.budgets) return;

  const currentYear = new Date().getFullYear();
  const currentMonth = month || (new Date().getMonth() + 1);
  const key = `${currentYear}-${currentMonth}`;
  const budget = data.budgets[key];

  if (!budget) return;

  const monthExpenses = data.expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (total > budget) {
    console.log(`# ⚠️  Warning: You have exceeded your budget! ($${total.toFixed(2)} / $${budget.toFixed(2)})`);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];

  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : '';
    options[key] = value;
    if (!value || value.startsWith('--')) {
      i--; // Don't skip next arg if current value is empty or another flag
    }
  }

  return { command, options };
}

// Show help
function showHelp() {
  console.log(`
Expense Tracker CLI

Usage:
  expense-tracker <command> [options]

Commands:
  add                   Add a new expense
  update                Update an existing expense
  delete                Delete an expense
  list                  List all expenses
  summary               Show summary of expenses
  category-summary      Show summary by category
  export                Export expenses to CSV
  budget                Set monthly budget
  help                  Show this help message

Options:
  --description <text>  Description of the expense
  --amount <number>     Amount of the expense
  --category <text>     Category of the expense
  --id <number>         ID of the expense
  --month <number>      Month (1-12)
  --file <filename>     Filename for export

Examples:
  expense-tracker add --description "Lunch" --amount 20
  expense-tracker add --description "Dinner" --amount 10 --category "Food"
  expense-tracker update --id 1 --amount 25
  expense-tracker delete --id 2
  expense-tracker list
  expense-tracker list --category "Food"
  expense-tracker summary
  expense-tracker summary --month 8
  expense-tracker category-summary
  expense-tracker export --file expenses.csv
  expense-tracker budget --month 8 --amount 1000
  `);
}

// Main function
function main() {
  const { command, options } = parseArgs();

  switch (command) {
    case 'add':
      addExpense(options.description, options.amount, options.category);
      break;
    case 'update':
      updateExpense(options.id, options.description, options.amount, options.category);
      break;
    case 'delete':
      deleteExpense(options.id);
      break;
    case 'list':
      listExpenses(options.category);
      break;
    case 'summary':
      showSummary(options.month);
      break;
    case 'category-summary':
      showCategorySummary();
      break;
    case 'export':
      exportToCSV(options.file);
      break;
    case 'budget':
      setBudget(options.month, options.amount);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run the CLI
main();