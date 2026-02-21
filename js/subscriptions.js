import { appState, addSubscription, deleteSubscription } from './state.js';
import { formatCurrency } from './utils.js';

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' },
];

export function renderSubscriptions() {
  const subs = appState.subscriptions || [];
  const alerts = detectAlerts(subs);
  const monthlyTotal = subs
    .filter((s) => s.active !== false)
    .reduce((sum, s) => sum + toMonthly(s), 0);

  return `
    <div class="uts-section-hd">
      <span class="uts-section-label">Subscriptions</span>
      ${monthlyTotal > 0 ? `<span class="sub-monthly-total">${formatCurrency(monthlyTotal)}/mo</span>` : ''}
    </div>
    ${alerts.length > 0 ? `<div class="sub-alerts">${alerts.map(renderAlert).join('')}</div>` : ''}
    <ul class="sub-list">
      ${subs.length > 0 ? subs.map(renderSubItem).join('') : '<li class="sub-empty">No subscriptions tracked yet.</li>'}
    </ul>
    <form class="sub-add-form" id="sub-add-form">
      <div class="sub-add-fields">
        <input class="form-input sub-input" name="name" placeholder="e.g. Netflix" required autocomplete="off" />
        <input class="form-input sub-input" name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
        <select class="form-input sub-input" name="frequency">
          ${FREQUENCIES.map((f) => `<option value="${f.value}">${f.label}</option>`).join('')}
        </select>
        <button class="btn btn-primary sub-add-btn" type="submit">Add</button>
      </div>
    </form>
  `;
}

function renderSubItem(sub) {
  const suffix = sub.frequency === 'monthly' ? '/mo' : sub.frequency === 'weekly' ? '/wk' : '/yr';
  const monthly = toMonthly(sub);
  const showMonthly = sub.frequency !== 'monthly';
  return `
    <li class="sub-item" data-id="${sub.id}">
      <div class="sub-name">${escapeHtml(sub.name)}</div>
      <div class="sub-meta">
        <span class="sub-amount">${formatCurrency(sub.amount)}${suffix}</span>
        ${showMonthly ? `<span class="sub-monthly">${formatCurrency(monthly)}/mo</span>` : ''}
      </div>
      <button class="sub-delete-btn" data-id="${sub.id}" aria-label="Remove ${escapeHtml(sub.name)}">&#215;</button>
    </li>
  `;
}

function renderAlert(alert) {
  return `<div class="sub-alert sub-alert--${alert.type}">
    <span class="sub-alert-icon">${alert.type === 'duplicate' ? '&#9888;' : '&#126;'}</span>
    <span class="sub-alert-msg">${escapeHtml(alert.message)}</span>
  </div>`;
}

export function wireSubscriptions(container) {
  const form = container.querySelector('#sub-add-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name')).trim();
      const amount = parseFloat(String(fd.get('amount')));
      const frequency = String(fd.get('frequency'));
      if (!name || isNaN(amount) || amount <= 0) {
        return;
      }
      addSubscription({ name, amount, frequency });
      rerenderSubs(container);
    });
  }
  container.querySelectorAll('.sub-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteSubscription(btn.dataset.id);
      rerenderSubs(container);
    });
  });
}

function rerenderSubs(container) {
  const section = container.querySelector('#subs-section');
  if (section) {
    section.innerHTML = renderSubscriptions();
    wireSubscriptions(container);
  }
}

function detectAlerts(subs) {
  const alerts = [];
  const active = subs.filter((s) => s.active !== false);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const na = normalizeName(active[i].name);
      const nb = normalizeName(active[j].name);
      if (na === nb) {
        alerts.push({
          type: 'duplicate',
          message: `Duplicate: "${active[i].name}" and "${active[j].name}" (${formatCurrency(active[i].amount)} vs ${formatCurrency(active[j].amount)}) — you may be paying twice.`,
        });
      } else if (
        na.length >= 4 &&
        nb.length >= 4 &&
        (similarity(na, nb) > 0.6 || na.includes(nb) || nb.includes(na))
      ) {
        alerts.push({
          type: 'similar',
          message: `Similar: "${active[i].name}" and "${active[j].name}" — are these the same service?`,
        });
      }
    }
  }
  return alerts;
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function similarity(a, b) {
  if (!a.length || !b.length) {
    return 0;
  }
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function toMonthly(sub) {
  if (sub.frequency === 'weekly') {
    return (sub.amount * 52) / 12;
  }
  if (sub.frequency === 'yearly') {
    return sub.amount / 12;
  }
  return sub.amount;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
