// Leaderboard — top 5 scores in localStorage
const LB_KEY = 'snake2-top-scores'
const LB_MAX = 5

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY)
    if (raw) return JSON.parse(raw).slice(0, LB_MAX)
  } catch (_) {}
  return []
}

export function saveToLeaderboard(score) {
  if (score <= 0) return
  const lb = loadLeaderboard()
  lb.push(score)
  lb.sort((a, b) => b - a)
  localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0, LB_MAX)))
}
