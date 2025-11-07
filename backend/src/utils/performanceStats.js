// Simple in-memory performance stats collector
// Stores recent N response times and provides average and percentiles.

const MAX_SAMPLES = 1000; // keep memory bounded
const samples = [];

export const recordResponseTime = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return;
  samples.push(ms);
  if (samples.length > MAX_SAMPLES) samples.shift();
};

export const getAverageResponseTime = () => {
  if (samples.length === 0) return null;
  const sum = samples.reduce((a, b) => a + b, 0);
  return Math.round(sum / samples.length);
};

export const getPercentile = (p) => {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return Math.round(sorted[idx]);
};

export default {
  recordResponseTime,
  getAverageResponseTime,
  getPercentile
};
