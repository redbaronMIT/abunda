import { generateId } from './utils.js';

const STORAGE_KEY = 'abunda-data';

const DEFAULT_CATEGORIES = [
  { id: 'cat_housing', name: 'Housing', color: '#60a5fa', icon: 'shell', budgetAmount: 0 },
  { id: 'cat_food', name: 'Food', color: '#4ade80', icon: 'starfish', budgetAmount: 0 },
  { id: 'cat_transport', name: 'Transport', color: '#facc15', icon: 'seahorse', budgetAmount: 0 },
  { id: 'cat_fun', name: 'Fun', color: '#c084fc', icon: 'coral', budgetAmount: 0 },
  { id: 'cat_other', name: 'Other', color: '#94a3b8', icon: 'pebble', budgetAmount: 0 },
];

function createDefaultState() {
  return {
    version: 1,
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
    budget: {
      monthlyIncome: 0,
      monthlyBudget: 0,
      categories: DEFAULT_CATEGORIES.map((cat) => ({ ...cat })),
    },
    transactions: [],
    goals: [],
  };
}

/** @type {Object|null} */
export let appState = null;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    appState = raw ? JSON.parse(raw) : createDefaultState();
  } catch {
    console.warn('Failed to load state, resetting to defaults.');
    appState = createDefaultState();
  }
  return appState;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch {
    console.error('Failed to save state to localStorage.');
  }
}

export function completeOnboarding(income, budgetAmount, categories) {
  appState.onboardingComplete = true;
  appState.budget.monthlyIncome = income;
  appState.budget.monthlyBudget = budgetAmount;
  appState.budget.categories = categories;
  saveState();
}

export function addTransaction(transaction) {
  const entry = {
    id: generateId('txn'),
    createdAt: new Date().toISOString(),
    ...transaction,
  };
  appState.transactions.push(entry);
  saveState();
  return entry;
}

export function deleteTransaction(id) {
  appState.transactions = appState.transactions.filter((t) => t.id !== id);
  saveState();
}

export function resetState() {
  appState = createDefaultState();
  saveState();
}
