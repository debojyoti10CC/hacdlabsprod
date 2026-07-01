/**
 * data.js — FORGE demo data, wallet state, and HACD record generation
 */

// Valid HACD 16-letter character set
const HACD_CHARSET = 'WTYUIAHXVMEKBSZN';

/**
 * Generate a deterministic 6-char HACD name from an address string.
 * Uses a simple hash so the same address always yields the same name.
 */
export function generateHacdName(address) {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0;
  }
  // Always positive
  hash = Math.abs(hash);

  let name = '';
  for (let i = 0; i < 6; i++) {
    name += HACD_CHARSET[hash % HACD_CHARSET.length];
    hash = Math.floor(hash / HACD_CHARSET.length) + (i * 7919); // prime step to vary
  }
  return name;
}

/**
 * Generate a random 64-character hex string resembling a Hacash tx hash.
 */
export function generateTxHash() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mock summary: take first sentence of input + append demo label.
 */
export function mockSummary(input) {
  const cleaned = input.trim().replace(/\s+/g, ' ');
  // Try to extract first sentence
  const sentenceMatch = cleaned.match(/^[^.!?]+[.!?]/);
  const firstSentence = sentenceMatch ? sentenceMatch[0].trim() : cleaned.substring(0, 120);
  return `${firstSentence} ... [AI: mocked for demo]`;
}

// === Demo wallet configuration ===
export const DEMO_WALLET_ADDRESS = '1HacashFRGDemoWallet9B8FE8Stack2Cohort2xZ';

/**
 * Initial HacdStackRecord for the demo wallet.
 * @returns {object} HacdStackRecord
 */
export function createDemoHacdRecord() {
  const hacdName = generateHacdName(DEMO_WALLET_ADDRESS);
  // Use a fixed past formation time for demo realism
  const formedAt = new Date('2025-11-14T09:23:07Z').toISOString();

  return {
    hacdName,
    formedAt,
    stackCostHac: 50,
    unitsFormed: 1,
    frgFromLot: 10000,
    status: 'mocked',
    walletAddress: DEMO_WALLET_ADDRESS,
  };
}

/**
 * Initial wallet state.
 * @returns {object} WalletState
 */
export function createInitialWalletState() {
  return {
    address: DEMO_WALLET_ADDRESS,
    frgBalance: 10000,
    totalBurned: 0,
    tasksRun: 0,
  };
}

/**
 * Create a BurnEvent object.
 */
export function createBurnEvent({ input, outputSummary, aiSource }) {
  return {
    id: crypto.randomUUID(),
    burnedAt: new Date().toISOString(),
    taskType: 'summarize',
    inputSnippet: input.trim().substring(0, 60),
    outputSummary,
    frgBurned: 1,
    txHash: generateTxHash(),
    aiSource,
  };
}

/** Format an ISO timestamp to a human-readable short form */
export function formatTimestamp(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Format number with commas */
export function formatNumber(n) {
  return n.toLocaleString('en-US');
}

/** Truncate tx hash for display: first 8 + … + last 8 */
export function truncateTxHash(hash) {
  if (!hash || hash.length < 20) return hash;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}
