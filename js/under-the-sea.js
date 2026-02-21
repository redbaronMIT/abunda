import { appState } from './state.js';
import { formatCurrency } from './utils.js';
import { renderSubscriptions, wireSubscriptions } from './subscriptions.js';

export function initUnderTheSea() {
  const container = document.getElementById('view-under-the-sea');
  renderView(container);
}

function renderView(container) {
  const initData = groupExpenses('30d');
  container.innerHTML = `
    <div class="uts-wrapper">
      <header class="uts-header">
        <h2 class="uts-title">Under the Sea</h2>
        <p class="uts-subtitle">Your finances, in depth</p>
      </header>

      <section class="uts-section">
        <div class="uts-section-hd">
          <span class="uts-section-label">Expense Tide</span>
          <div class="period-tabs">
            <button class="period-tab is-active" data-period="30d">30 days</button>
            <button class="period-tab" data-period="3m">3 months</button>
            <button class="period-tab" data-period="12m">12 months</button>
          </div>
        </div>
        <div id="chart-wrap">${buildChart(initData)}</div>
        <p class="chart-insight" id="chart-insight">${expenseInsight(initData)}</p>
      </section>

      <section class="uts-section" id="subs-section">
        ${renderSubscriptions()}
      </section>
    </div>
  `;

  container.querySelectorAll('.period-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.period-tab').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const data = groupExpenses(btn.dataset.period);
      container.querySelector('#chart-wrap').innerHTML = buildChart(data);
      container.querySelector('#chart-insight').textContent = expenseInsight(data);
    });
  });

  wireSubscriptions(container);
}

function groupExpenses(period) {
  const now = new Date();
  const expenses = (appState.transactions || []).filter((t) => t.type === 'expense');
  if (period === '30d') {
    return groupByDay(expenses, now, 30);
  }
  if (period === '3m') {
    return groupByWeek(expenses, now, 13);
  }
  return groupByMonth(expenses, now, 12);
}

function groupByDay(expenses, now, count) {
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, key, total: 0 });
  }
  expenses.forEach((t) => {
    const key = (t.date || t.createdAt).slice(0, 10);
    const bucket = buckets.find((bk) => bk.key === key);
    if (bucket) {
      bucket.total += t.amount;
    }
  });
  return buckets;
}

function groupByWeek(expenses, now, count) {
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    buckets.push({
      label: `Wk ${count - i}`,
      key: d.toISOString().slice(0, 10),
      endKey: '',
      total: 0,
    });
  }
  for (let i = 0; i < buckets.length; i++) {
    buckets[i].endKey =
      i < buckets.length - 1
        ? buckets[i + 1].key
        : new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  }
  expenses.forEach((t) => {
    const key = (t.date || t.createdAt).slice(0, 10);
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (key >= buckets[i].key && key < buckets[i].endKey) {
        buckets[i].total += t.amount;
        break;
      }
    }
  });
  return buckets;
}

function groupByMonth(expenses, now, count) {
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    buckets.push({ label, key, total: 0 });
  }
  expenses.forEach((t) => {
    const key = (t.date || t.createdAt).slice(0, 7);
    const bucket = buckets.find((bk) => bk.key === key);
    if (bucket) {
      bucket.total += t.amount;
    }
  });
  return buckets;
}

function buildChart(data) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const W = 560;
  const H = 160;
  const pad = { top: 8, right: 12, bottom: 28, left: 46 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const bSpacing = cW / data.length;
  const bW = Math.max(2, Math.floor(bSpacing) - 3);

  const bars = data
    .map((d, i) => {
      const bH = Math.round((d.total / max) * cH);
      const x = Math.round(pad.left + i * bSpacing + (bSpacing - bW) / 2);
      const y = pad.top + cH - bH;
      const cls = d.total === 0 ? 'chart-bar chart-bar--empty' : 'chart-bar';
      return `<rect class="${cls}" x="${x}" y="${y}" width="${bW}" height="${Math.max(bH, 1)}" rx="2"><title>${d.label}: ${formatCurrency(d.total)}</title></rect>`;
    })
    .join('');

  const step = Math.ceil(data.length / 7);
  const xLabels = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => {
      const i = data.indexOf(d);
      const x = Math.round(pad.left + i * bSpacing + bSpacing / 2);
      return `<text class="chart-lbl" x="${x}" y="${H - 4}" text-anchor="middle">${d.label}</text>`;
    })
    .join('');

  const yTicks = [0, 0.5, 1]
    .map((pct) => {
      const val = max * pct;
      const y = Math.round(pad.top + cH - pct * cH);
      const lbl = val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${Math.round(val)}`;
      return `<line class="chart-grid" x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" /><text class="chart-lbl chart-lbl--y" x="${pad.left - 4}" y="${y + 4}" text-anchor="end">${lbl}</text>`;
    })
    .join('');

  return `<svg class="expense-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Expenses over time"><g>${yTicks}</g><g>${bars}</g><g>${xLabels}</g></svg>`;
}

function expenseInsight(data) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) {
    return 'No expenses recorded in this period.';
  }
  const nonZero = data.filter((d) => d.total > 0);
  const peak = data.reduce((a, b) => (a.total >= b.total ? a : b));
  return `Total: ${formatCurrency(total)} across ${nonZero.length} ${nonZero.length === 1 ? 'period' : 'periods'}. Peak: ${peak.label} (${formatCurrency(peak.total)}).`;
}
