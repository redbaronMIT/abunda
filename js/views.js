const VIEWS = ['onboarding', 'shore', 'sorting-room', 'cockpit'];

let currentView = null;

export function showView(viewId) {
  VIEWS.forEach((id) => {
    const el = document.getElementById(`view-${id}`);
    if (el) {
      el.classList.remove('is-active');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('is-active');
    target.setAttribute('aria-hidden', 'false');
  }

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === viewId);
  });

  currentView = viewId;
}

export function showTabBar() {
  const tabBar = document.getElementById('tab-bar');
  if (tabBar) {
    tabBar.classList.remove('is-hidden');
    tabBar.setAttribute('aria-hidden', 'false');
  }
}

export function hideTabBar() {
  const tabBar = document.getElementById('tab-bar');
  if (tabBar) {
    tabBar.classList.add('is-hidden');
    tabBar.setAttribute('aria-hidden', 'true');
  }
}

export function getCurrentView() {
  return currentView;
}

export function initTabBar() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
    });
  });
}
