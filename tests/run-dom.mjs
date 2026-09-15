const mod = await import('../.tmp-test/ssr-entry.js');
const res = await mod.run();
const text = res.html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const need = ['POCKEY', 'SIMPLE', 'BEAUTIFUL', '$189', '.00', 'WHAT IS POCKEY', 'EASY TO USE', 'SMART & PRACTICAL', 'DESIGNED FOR EVERYDAY USE', 'GET YOUR', 'POCKEY', 'Buy now', 'Simple. Practical. Made for you.', 'Scroll to rotate', 'Sapphire lens array'];
const hay = text.toLowerCase();
const missing = need.filter((n) => !hay.includes(n.toLowerCase()));
console.log('html length:', res.length);
console.log('missing strings:', missing.length ? missing : 'none ✅');
// jsdom lacks WebGL/ResizeObserver; those are environmental, not app bugs.
const noise = ['Not implemented', 'ResizeObserver', 'THREE_CJS_DEPRECATED', 'act('];
const realErrors = res.errors.filter((e) => !noise.some((n) => e.includes(n))).slice(0, 12);
console.log('react errors:', realErrors.length ? realErrors : 'none ✅');
process.exit(missing.length || realErrors.length ? 1 : 0);
