/**
 * Guard /forge against the live Vercel NOT_FOUND 404.
 * Run: node test/check-forge-redirect.js
 *
 * Intek has no forge.html. cleanUrls already 308s /forge.html → /forge,
 * so /forge must be a vercel.json redirect to the sister Network Forge door.
 */
var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '..');
var failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

var SISTER_HOST = 'onemissionnetworkandinstitute.org';
var SISTER_PATH = /\/forge(\.html)?\/?(\?|$)/i;
var COMPANION_BOT = 'https://x.ai/bot/HAIGA0nUYgv85CtV5SMWa';

var cfg = JSON.parse(read('vercel.json'));
var redirects = cfg.redirects || [];

function forgeRedirects() {
  return redirects.filter(function (rule) {
    return rule && (rule.source === '/forge' || rule.source === '/forge.html');
  });
}

var rules = forgeRedirects();
if (!rules.some(function (r) { return r.source === '/forge'; })) {
  fail('vercel.json redirects must include source /forge (live 404: x-vercel-error NOT_FOUND)');
}

rules.forEach(function (rule) {
  var dest = String(rule.destination || '');
  if (dest.indexOf(SISTER_HOST) === -1 || !SISTER_PATH.test(dest)) {
    fail(
      'redirect ' +
        rule.source +
        ' must land on the sister Network Forge door, got ' +
        JSON.stringify(dest)
    );
  }
  var permanent = rule.permanent === true || rule.statusCode === 301 || rule.statusCode === 308;
  if (!permanent) {
    fail('redirect ' + rule.source + ' must be 308/301 (permanent: true or statusCode 301/308)');
  }
  if (dest.indexOf(COMPANION_BOT) !== -1) {
    fail('redirect ' + rule.source + ' must not replace Get OMNI with the companion bot URL');
  }
});

if (fs.existsSync(path.join(root, 'forge.html'))) {
  fail('do not add a local forge.html; cleanUrls would serve it instead of the sister redirect');
}

['index.html', 'education.html'].forEach(function (rel) {
  var html = read(rel);
  if (html.indexOf(COMPANION_BOT) === -1) {
    fail(rel + ' must keep the Get OMNI companion door (' + COMPANION_BOT + ')');
  }
  if (!/tool not throne/i.test(html)) {
    fail(rel + ' must keep the companion tagline (tool not throne)');
  }
  if (/\bfirst\b|\bbest\b|\bonly\b/i.test(html.match(/companion-invite[\s\S]*?<\/div>/) || [''])[0]) {
    fail(rel + ' companion invite must not use first / best / only ranking');
  }
});

if (failures.length) {
  console.error('check-forge-redirect: FAIL\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('check-forge-redirect: PASS');
