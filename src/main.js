/**
 * main.js — FORGE (FRG) Demo App
 * Wires together state, UI, AI calls, and animations.
 */

import './style.css';
import {
  createDemoHacdRecord,
  createInitialWalletState,
  createBurnEvent,
  formatTimestamp,
  formatNumber,
  truncateTxHash,
} from './data.js';
import { runSummarize, getAiSource } from './ai.js';

// ============================================================
// State
// ============================================================
let wallet = createInitialWalletState();
let hacdRecord = createDemoHacdRecord();
let burnHistory = []; // newest first
let isRunning = false;

// ============================================================
// DOM refs
// ============================================================
const $ = id => document.getElementById(id);

const elBalance       = $('frg-balance');
const elTotalBurned   = $('total-burned');
const elTasksRun      = $('tasks-run');
const elAiSource      = $('ai-source');
const elRunBtn        = $('run-task-btn');
const elTaskInput     = $('task-input');
const elTaskOutput    = $('task-output');
const elOutputText    = $('output-text');
const elOutputTx      = $('output-tx');
const elOutputAiTag   = $('output-ai-tag');
const elHistoryFeed   = $('history-feed');
const elHistoryEmpty  = $('history-empty');
const elHistoryCount  = $('history-count');

// Formation Record
const elHacdName      = $('hacd-name');
const elFormedAt      = $('formed-at');
const elStackCost     = $('stack-cost');
const elFrgLot        = $('frg-lot');
const elUnitsFormed   = $('units-formed');
const elFormationStatus = $('formation-status');
const elWalletAddress = $('wallet-address');

// ============================================================
// Init
// ============================================================
function init() {
  renderFormationRecord();
  renderWalletState();
  updateAiSourceLabel();

  elRunBtn.addEventListener('click', handleRunTask);
}

// ============================================================
// Render Formation Record
// ============================================================
function renderFormationRecord() {
  elHacdName.textContent = hacdRecord.hacdName;
  elFormedAt.textContent = formatTimestamp(hacdRecord.formedAt);
  elStackCost.textContent = `${hacdRecord.stackCostHac} HAC`;
  elFrgLot.textContent = `${formatNumber(hacdRecord.frgFromLot)} FRG`;
  elUnitsFormed.textContent = `${hacdRecord.unitsFormed} HACD lot`;
  elWalletAddress.textContent = hacdRecord.walletAddress;
  // Status is already styled via CSS class
}

// ============================================================
// Render Wallet State
// ============================================================
function renderWalletState() {
  elBalance.textContent = formatNumber(wallet.frgBalance);
  elTotalBurned.textContent = `${formatNumber(wallet.totalBurned)} FRG`;
  elTasksRun.textContent = String(wallet.tasksRun);
}

// ============================================================
// Update AI source label
// ============================================================
function updateAiSourceLabel() {
  const src = getAiSource();
  elAiSource.textContent = src;

  // If mock, update header badge text optionally — it's already "mocked for demo"
  const mockBadge = $('mock-badge');
  if (src !== 'mock') {
    mockBadge.textContent = `AI: ${src} · Formation: mocked for demo`;
  }
}

// ============================================================
// Handle Run Task
// ============================================================
async function handleRunTask() {
  if (isRunning) return;
  if (wallet.frgBalance < 1) {
    showError('Insufficient FRG balance.');
    return;
  }

  const inputText = elTaskInput.value.trim();
  if (!inputText) {
    // Use the placeholder text as a demo fallback
    const placeholder = elTaskInput.getAttribute('placeholder').replace(/^Paste.*?\n\n/s, '').trim();
    elTaskInput.value = placeholder;
    return;
  }

  isRunning = true;
  setButtonLoading(true);

  try {
    const { summary, source } = await runSummarize(inputText);

    // 1. Create burn event
    const burnEvent = createBurnEvent({ input: inputText, outputSummary: summary, aiSource: source });

    // 2. Update wallet state
    wallet.frgBalance -= 1;
    wallet.totalBurned += 1;
    wallet.tasksRun += 1;

    // 3. Prepend to history (max 10)
    burnHistory.unshift(burnEvent);
    if (burnHistory.length > 10) burnHistory = burnHistory.slice(0, 10);

    // 4. Render updates
    renderWalletState();
    triggerBalanceGlow();
    renderLatestOutput(burnEvent, source);
    renderBurnHistory();

  } catch (err) {
    console.error('Task run failed:', err);
    showError('Task failed. Please try again.');
  } finally {
    isRunning = false;
    setButtonLoading(false);
  }
}

// ============================================================
// Button state
// ============================================================
function setButtonLoading(loading) {
  const btnText = elRunBtn.querySelector('.btn-text');
  const btnIcon = elRunBtn.querySelector('.btn-icon');

  if (loading) {
    elRunBtn.disabled = true;
    elRunBtn.classList.add('loading');
    btnText.textContent = 'Running... burning 1 FRG';
    btnIcon.textContent = '◌';
  } else {
    elRunBtn.disabled = false;
    elRunBtn.classList.remove('loading');
    btnText.textContent = 'Run Agent Task';
    btnIcon.textContent = '▶';
  }
}

// ============================================================
// Glow animation on balance
// ============================================================
function triggerBalanceGlow() {
  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  elBalance.classList.remove('glow-animate');
  // Force reflow to restart animation
  void elBalance.offsetWidth;
  elBalance.classList.add('glow-animate');

  elBalance.addEventListener('animationend', () => {
    elBalance.classList.remove('glow-animate');
  }, { once: true });
}

// ============================================================
// Render latest output card
// ============================================================
function renderLatestOutput(burnEvent, source) {
  elOutputText.textContent = burnEvent.outputSummary;
  elOutputTx.textContent = `−1 FRG burned · tx: ${truncateTxHash(burnEvent.txHash)}`;
  elOutputAiTag.textContent = source === 'mock' ? 'AI: mocked for demo' : `AI: ${source}`;
  elTaskOutput.hidden = false;
}

// ============================================================
// Render burn history feed
// ============================================================
function renderBurnHistory() {
  // Update count badge
  const count = burnHistory.length;
  elHistoryCount.textContent = `${count} burn${count !== 1 ? 's' : ''}`;

  // Hide empty state
  if (elHistoryEmpty) elHistoryEmpty.style.display = 'none';

  // Clear feed (keep empty state node)
  const existingCards = elHistoryFeed.querySelectorAll('.burn-event');
  existingCards.forEach(c => c.remove());

  // Render each event
  burnHistory.forEach(event => {
    const card = createBurnEventCard(event);
    elHistoryFeed.insertBefore(card, elHistoryFeed.firstChild);
  });
}

function createBurnEventCard(event) {
  const div = document.createElement('div');
  div.className = 'burn-event';
  div.setAttribute('role', 'article');
  div.setAttribute('aria-label', `Burn event at ${formatTimestamp(event.burnedAt)}`);

  const aiLabel = event.aiSource === 'mock'
    ? 'AI: mocked for demo'
    : `AI: ${event.aiSource}`;

  const snippetText = event.inputSnippet
    ? `"${event.inputSnippet}${event.inputSnippet.length >= 60 ? '…' : ''}"`
    : '';

  div.innerHTML = `
    <div class="burn-event-header">
      <span class="burn-timestamp">${formatTimestamp(event.burnedAt)}</span>
      <span class="burn-cost">−${event.frgBurned} FRG</span>
    </div>
    <div class="burn-task-type">task: ${event.taskType} · ${aiLabel}</div>
    ${snippetText ? `<p class="burn-snippet">${escapeHtml(snippetText)}</p>` : ''}
    <p class="burn-summary">${escapeHtml(event.outputSummary)}</p>
    <div class="burn-tx">tx: ${event.txHash}</div>
  `;

  return div;
}

// ============================================================
// Error display
// ============================================================
function showError(message) {
  // Simple inline error on the button area
  const existing = document.querySelector('.run-error');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.className = 'run-error';
  el.style.cssText = `
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: #e07070;
    margin-top: -12px;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: rgba(224, 112, 112, 0.08);
    border: 1px solid rgba(224, 112, 112, 0.2);
    border-radius: 6px;
  `;
  el.textContent = message;
  elRunBtn.insertAdjacentElement('afterend', el);

  setTimeout(() => el.remove(), 4000);
}

// ============================================================
// Utility: HTML escaping
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// Boot
// ============================================================
document.addEventListener('DOMContentLoaded', init);
