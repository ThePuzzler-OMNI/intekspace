/**
 * Guard Forge / Vision / Launch (and chrome siblings) against blank-tab opens.
 * Run: node test/check-outbound-destinations.js
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

function isHttpUrl(href) {
  return /^https?:\/\/[^\s"'<>]+/i.test(String(href || '').trim());
}

function isBlankish(href) {
  var h = String(href || '').trim();
  return !h || /^about:blank$/i.test(h) || h === '#' || /^javascript:/i.test(h);
}

var registry = JSON.parse(read('site-registry.json'));
var nav = (registry.chrome && registry.chrome.nav) || [];

function navByLabel(label) {
  return nav.filter(function (item) {
    return item && item.label === label;
  });
}

var forge = navByLabel('Forge');
if (forge.length !== 1) {
  fail('site-registry.json chrome.nav must have exactly one item labeled Forge (found ' + forge.length + ')');
} else {
  if (!isHttpUrl(forge[0].href) || isBlankish(forge[0].href)) {
    fail('Forge href must be a real http(s) URL, not blank: ' + JSON.stringify(forge[0].href));
  }
  if (!/onemissionnetworkandinstitute\.org\/forge\/?(\?|$)/i.test(forge[0].href)) {
    fail('Forge href must land on OMNI /forge (clean URL), got ' + forge[0].href);
  }
  if (forge[0].external) {
    fail('Forge must not be marked external (external + target=_blank opens about:blank)');
  }
}

var vision = navByLabel('Vision');
if (vision.length !== 1) {
  fail('site-registry.json chrome.nav must have exactly one item labeled Vision (found ' + vision.length + ')');
} else {
  if (!isHttpUrl(vision[0].href) || isBlankish(vision[0].href)) {
    fail('Vision href must be a real http(s) URL, not blank: ' + JSON.stringify(vision[0].href));
  }
  if (!/onemissionnetworkandinstitute\.org\/vision-load/i.test(vision[0].href)) {
    fail('Vision href must land on OMNI /vision-load, got ' + vision[0].href);
  }
  if (/forge/i.test(vision[0].href)) {
    fail('Vision must not reuse the Forge URL: ' + vision[0].href);
  }
  if (vision[0].external) {
    fail('Vision must not be marked external (external + target=_blank opens about:blank)');
  }
}

var chromeJs = read('js/site-chrome.js');
if (/item\.external\s*\?\s*' target="_blank"/.test(chromeJs)) {
  fail('site-chrome.js must not attach target=_blank to external nav items');
}
if (!/function usableHref/.test(chromeJs)) {
  fail('site-chrome.js must filter blank/about:blank hrefs via usableHref');
}

var fallbackForge = chromeJs.match(/href:\s*'([^']+)'\s*,\s*label:\s*'Forge'/);
var fallbackVisionMislabel = /href:\s*'[^']*forge[^']*'\s*,\s*label:\s*'Vision'/.test(chromeJs);
if (!fallbackForge) {
  fail('site-chrome.js FALLBACK_CHROME must include a Forge nav item');
} else if (!/\/forge\/?(\?|$)/i.test(fallbackForge[1])) {
  fail('site-chrome.js fallback Forge href must be OMNI /forge, got ' + fallbackForge[1]);
}
if (fallbackVisionMislabel) {
  fail('site-chrome.js fallback must not label a Forge URL as Vision');
}

var index = read('index.html');
var forgeHrefs = index.match(/href="([^"]*forge[^"]*)"/gi) || [];
if (!forgeHrefs.length) {
  fail('index.html must include at least one Forge destination href');
}
forgeHrefs.forEach(function (attr) {
  var href = attr.replace(/^href="/i, '').replace(/"$/, '');
  if (isBlankish(href) || !isHttpUrl(href)) {
    fail('index.html Forge href is not a real destination: ' + href);
  }
  if (/target="_blank"/i.test(index.split(attr)[1].slice(0, 180))) {
    fail('index.html Forge control must navigate in-place, not target=_blank: ' + href);
  }
});

var launch = read('launch.html');
var launchTag = launch.match(/<a\b[^>]*id="launch-link"[^>]*>|<a\b[^>]*id="launch-link"[\s\S]*?>/);
if (!launchTag) {
  fail('launch.html is missing #launch-link');
} else {
  var tag = launchTag[0];
  if (/target="_blank"/i.test(tag)) {
    fail('launch.html #launch-link must not use target=_blank (opens about:blank)');
  }
  var hrefMatch = tag.match(/href="([^"]*)"/);
  if (!hrefMatch || !isHttpUrl(hrefMatch[1]) || isBlankish(hrefMatch[1])) {
    fail('launch.html #launch-link must have a real http(s) href before JS runs');
  }
}

var jsFiles = ['js/site-chrome.js', 'js/feedback-widget.js', 'launch.html'];
jsFiles.forEach(function (rel) {
  var src = read(rel);
  if (/window\.open\(\s*['"]\s*['"]/.test(src) || /window\.open\(\s*['"]about:blank['"]/.test(src)) {
    fail(rel + ' must not window.open an empty or about:blank URL');
  }
});

if (failures.length) {
  console.error('check-outbound-destinations: FAIL\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('check-outbound-destinations: PASS');
