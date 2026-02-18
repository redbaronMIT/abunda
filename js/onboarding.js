import { appState, completeOnboarding } from './state.js';
import { showView, showTabBar } from './views.js';
import { initShore } from './shore.js';
import { generateId } from './utils.js';

const EXTRA_COLORS = [
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f43f5e',
  '#8b5cf6',
  '#14b8a6',
  '#fb923c',
];

let incomeValue = 0;
let categoryValues = [];

export function initOnboarding() {
  const container = document.getElementById('view-onboarding');
  renderStep(container, 1);
}

function renderStep(container, step) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'onboarding-wrapper';
  container.appendChild(wrapper);

  if (step === 1) {
    renderWelcome(wrapper);
  } else if (step === 2) {
    renderCategories(wrapper);
  }
}

function renderWelcome(wrapper) {
  wrapper.innerHTML = `
    <div class="onboarding-step">
      <div class="onboarding-wave">🐚</div>
      <h1 class="onboarding-title">Welcome to Abunda</h1>
      <p class="onboarding-subtitle">
        Your finances are a walk along the shore.<br />
        Let's get you set up.
      </p>
      <button class="btn btn-primary" id="ob-next">Begin &rarr;</button>
    </div>
  `;

  const container = wrapper.closest('#view-onboarding');
  wrapper.querySelector('#ob-next').addEventListener('click', () => renderStep(container, 2));
}

function renderCategories(wrapper) {
  categoryValues = appState.budget.categories.map((cat) => ({ ...cat }));

  wrapper.innerHTML = `
    <div class="onboarding-step onboarding-step--wide">
      <h2 class="onboarding-step-title">Your Baskets</h2>
      <div class="income-field">
        <label class="income-label">Monthly Income</label>
        <div class="income-input-row">
          <span class="income-prefix">$</span>
          <input class="income-input" id="ob-income" type="number" placeholder="0" min="0" />
        </div>
      </div>
      <div class="allocation-bar-wrap">
        <div class="allocation-bar" id="allocation-bar"></div>
        <div class="allocation-summary" id="allocation-summary"></div>
      </div>
      <div class="onboarding-form onboarding-categories" id="ob-category-rows"></div>
      <button class="btn btn-add-category" id="ob-add-category">+ Add basket</button>
      <button class="btn btn-primary" id="ob-finish">Set Sail &rarr;</button>
    </div>
  `;

  function getMax() {
    return Math.max(incomeValue, 1000);
  }

  function rowHtml(cat, i) {
    const canRemove = categoryValues.length > 1;
    return `
      <div class="onboarding-category">
        <span class="category-swatch" style="background:${cat.color}"></span>
        <input
          class="form-input category-name-input"
          data-index="${i}"
          type="text"
          value="${cat.name}"
          placeholder="Category name"
        />
        <input
          class="category-slider"
          data-index="${i}"
          type="range"
          min="0"
          max="${getMax()}"
          step="10"
          value="${cat.budgetAmount}"
          style="--thumb-color:${cat.color}"
        />
        <span class="slider-amount" data-index="${i}">$${cat.budgetAmount}</span>
        <button
          class="category-remove-btn"
          data-index="${i}"
          aria-label="Remove ${cat.name}"
          ${canRemove ? '' : 'disabled'}
        >&times;</button>
      </div>
    `;
  }

  function rebuildRows() {
    const form = wrapper.querySelector('#ob-category-rows');
    form.innerHTML = categoryValues.map((cat, i) => rowHtml(cat, i)).join('');

    wrapper.querySelectorAll('.category-name-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        categoryValues[parseInt(e.target.dataset.index)].name = e.target.value;
      });
    });

    wrapper.querySelectorAll('.category-slider').forEach((slider) => {
      let lastValue = parseFloat(slider.value) || 0;
      let lastTime = Date.now();
      let isFast = false;
      let slowTimer = null;

      slider.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.index);
        const now = Date.now();
        const raw = parseFloat(e.target.value) || 0;
        const elapsed = Math.max(now - lastTime, 1);
        const valueDelta = Math.abs(raw - lastValue);

        const sliderPx = e.target.offsetWidth;
        const maxVal = parseFloat(e.target.max) || 1000;
        const pixelDelta = (valueDelta / maxVal) * sliderPx;
        const velocityPxPerMs = pixelDelta / elapsed;

        // 0.75 CSS inch/sec threshold; once triggered, stay fast for 500ms buffer
        if (velocityPxPerMs >= 0.072) {
          isFast = true;
          clearTimeout(slowTimer);
          slowTimer = setTimeout(() => (isFast = false), 500);
        }

        const step = isFast ? 100 : 10;
        const snapped = Math.round(raw / step) * step;

        lastValue = raw;
        lastTime = now;
        categoryValues[i].budgetAmount = snapped;
        e.target.value = snapped;
        wrapper.querySelector(`.slider-amount[data-index="${i}"]`).textContent = `$${snapped}`;
        updateBar();
      });
    });

    wrapper.querySelectorAll('.category-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.dataset.index);
        categoryValues.splice(i, 1);
        rebuildRows();
        updateBar();
      });
    });
  }

  function updateBar() {
    const total = categoryValues.reduce((sum, cat) => sum + (cat.budgetAmount || 0), 0);
    const remaining = incomeValue - total;
    const bar = wrapper.querySelector('#allocation-bar');
    const summary = wrapper.querySelector('#allocation-summary');

    const segments = categoryValues
      .filter((cat) => cat.budgetAmount > 0)
      .map(
        (cat) =>
          `<div class="allocation-segment" style="flex:${cat.budgetAmount};background:${cat.color}" title="${cat.name}"></div>`
      )
      .join('');

    const slack =
      remaining > 0
        ? `<div class="allocation-segment allocation-segment--unallocated" style="flex:${remaining}"></div>`
        : '';

    bar.innerHTML = incomeValue > 0 ? segments + slack : '';

    if (incomeValue <= 0) {
      summary.innerHTML = `<span class="alloc-hint">Enter your income to start dividing.</span>`;
      return;
    }

    const over = total > incomeValue;
    summary.innerHTML = `
      <span class="${over ? 'is-over' : ''}">${formatDollars(total)} allocated</span>
      <span class="alloc-sep">/</span>
      <span>${formatDollars(incomeValue)} income</span>
      <span class="${over ? 'alloc-tag alloc-tag--over' : 'alloc-tag alloc-tag--left'}">
        ${over ? `${formatDollars(total - incomeValue)} over` : `${formatDollars(remaining)} left`}
      </span>
    `;
  }

  rebuildRows();
  updateBar();

  wrapper.querySelector('#ob-income').addEventListener('input', (e) => {
    incomeValue = parseFloat(e.target.value) || 0;
    const max = getMax();
    wrapper.querySelectorAll('.category-slider').forEach((s) => (s.max = max));
    updateBar();
  });

  wrapper.querySelector('#ob-add-category').addEventListener('click', () => {
    const color = EXTRA_COLORS[categoryValues.length % EXTRA_COLORS.length];
    categoryValues.push({ id: generateId('cat'), name: '', color, icon: 'shell', budgetAmount: 0 });
    rebuildRows();
    updateBar();
    const inputs = wrapper.querySelectorAll('.category-name-input');
    inputs[inputs.length - 1].focus();
  });

  wrapper.querySelector('#ob-finish').addEventListener('click', () => {
    const total = categoryValues.reduce((sum, cat) => sum + (cat.budgetAmount || 0), 0);
    completeOnboarding(incomeValue, total, categoryValues);
    initShore();
    showTabBar();
    showView('shore');
  });
}

function formatDollars(n) {
  return '$' + Math.round(n).toLocaleString();
}
