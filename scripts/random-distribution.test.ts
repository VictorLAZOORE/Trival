/**
 * Test de distribution du random : 1 million de tirages
 * Vérifie que Math.floor(Math.random() * players.length) est bien réparti.
 *
 * Lancer avec : npm run test:random
 * ou : npx tsx scripts/random-distribution.test.ts
 */

const players = ["Alice", "Bob", "Charlie"];
const counts: Record<string, number> = {};

players.forEach((p) => (counts[p] = 0));

const TOTAL = 1_000_000;

for (let i = 0; i < TOTAL; i++) {
  const winner = players[Math.floor(Math.random() * players.length)];
  counts[winner]++;
}

console.log("=== 1 million de simulations ===\n");
console.log("Résultats :");
console.log(counts);
console.log("");

const expected = TOTAL / players.length;
console.log(`Attendu par joueur (uniforme) : ~${expected.toLocaleString()}\n`);

let ok = true;
for (const name of players) {
  const count = counts[name];
  const pct = ((count / TOTAL) * 100).toFixed(2);
  const diff = Math.abs(count - expected);
  const diffPct = (diff / expected) * 100;
  console.log(`${name}: ${count.toLocaleString()} (${pct}%), écart: ${diffPct.toFixed(2)}%`);
  if (diffPct > 2) ok = false;
}

console.log("");
console.log(ok ? "✅ Distribution OK (écart < 2%)" : "⚠️ Écart > 2% sur au moins un joueur");
