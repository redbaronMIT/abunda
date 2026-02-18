import { loadState, appState } from './state.js';
import { initTabBar, showView, showTabBar } from './views.js';
import { initOnboarding } from './onboarding.js';
import { initShore } from './shore.js';
import { initSortingRoom } from './sorting-room.js';
import { initCockpit } from './cockpit.js';

function boot() {
  loadState();
  initTabBar();

  if (!appState.onboardingComplete) {
    showView('onboarding');
    initOnboarding();
  } else {
    initShore();
    initSortingRoom();
    initCockpit();
    showTabBar();
    showView('shore');
  }
}

boot();
