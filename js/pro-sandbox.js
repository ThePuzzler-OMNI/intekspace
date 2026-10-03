/* OMNI-Grok Bot Pro · Sandbox — Forward View module.
   Everything runs in this browser tab. No network calls, no storage, no outside code.
   Photos are read from a local file into an object URL and drawn to a canvas on export,
   which drops camera EXIF and GPS tags. */
(function () {
  "use strict";

  var PAINTBRUSH = "Paintbrush: OMNI-Grok Bot / One Mission Network and Institute · onemissionnetworkandinstitute.org · omniexchange.org · instituteofmatureimagination.org · onemissionfoundation.org · intekspace.com";
  var SCHEMA = "omni.forward-view.design/v1";
  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var C = {
    ink: "#2f2a24", inkSoft: "#5d554b", moss: "#4f6b43", honey: "#c8902c",
    card: "rgba(255, 250, 240, 0.9)", sage: "rgba(239, 246, 234, 0.94)",
    halo: "rgba(255, 250, 240, 0.55)", track: "#e3d8c3"
  };
  var MAX_EXPORT = 2400;
  var LEVEL_BUSY = 20, LEVEL_OVER = 35;

  var TYPES = {
    label:  { kind: "Label", w: 0.26, h: 0.09, text: "Trail to the lake", size: true, hasText: true },
    note:   { kind: "Note", w: 0.30, h: 0.20, text: "Water ahead\nRefill point in about 1.2 km.", size: true, hasText: true },
    bubble: { kind: "Companion prompt", w: 0.32, h: 0.16, text: "Want me to stay quiet until the ridge?", size: true, hasText: true },
    ring:   { kind: "Focus ring", w: 0.14, round: 1, text: "" },
    arrow:  { kind: "Pathway arrow", w: 0.26, h: 0.12, text: "", angle: -20 },
    gauge:  { kind: "Simple gauge", w: 0.18, round: 0.7, text: "Water", value: 60, hasText: true }
  };
  var SENSORS = [
    ["head_pose", "Head pose"], ["eye_gaze", "Eye gaze"], ["hand", "Hand"],
    ["depth_slam", "Depth / SLAM"], ["gps", "GPS"], ["object_recognition", "Object recognition"],
    ["body_techsuit", "Body / techsuit"]
  ];
  var SENSOR_LABEL = {};
  SENSORS.forEach(function (s) { SENSOR_LABEL[s[0]] = s[1]; });
  var SUGGEST = {
    label: ["head_pose", "depth_slam", "object_recognition"],
    note: ["head_pose"],
    bubble: ["head_pose", "eye_gaze"],
    ring: ["head_pose", "eye_gaze", "depth_slam", "object_recognition"],
    arrow: ["head_pose", "depth_slam", "gps"],
    gauge: ["head_pose", "body_techsuit"]
  };
  var CHECKS = [
    ["no_infinite_scroll", "No infinite scroll"],
    ["no_urgency_scarcity", "No urgency or scarcity tricks"],
    ["no_hidden_tracking", "No hidden tracking"],
    ["no_ads_in_view", "No ads in the field of view"],
    ["user_can_turn_off_overlays", "The user can turn off every overlay"],
    ["real_world_primary", "The real world stays primary"],
    ["no_faces_without_consent", "No faces tagged without consent"]
  ];
  var PRINCIPLE = "Trust first: the human is the judge; the bot earns trust; never divide people or profit from attention.";

  var state = {
    photo: null, overlays: [], selectedId: null, allOff: false,
    checklist: {}, coverage: 0, nextId: 1, counters: {}
  };

  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), overlaysEl = $("overlays"), photo = $("photo");
  var els = {};
  var photoUrl = null;

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function aspect() { return state.photo ? state.photo.w / state.photo.h : 4 / 3; }
  function byId(id) { for (var i = 0; i < state.overlays.length; i++) if (state.overlays[i].id === id) return state.overlays[i]; return null; }
  function sel() { return byId(state.selectedId); }
  function stageU() { return stage.clientWidth / 100; }
  function svgEl(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function stamp() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }
  function slug(s) { return (s || "design").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "design"; }
  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function setStatus(msg) { $("export-status").textContent = msg; }

  /* ---------- geometry shared by screen and export ---------- */
  function arrowPoints(bw, bh, angleDeg, u) {
    var a = angleDeg * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    var pad = 1.2 * u;
    var t = clamp(Math.min(bw, bh) * 0.16, 1.2 * u, 3.2 * u);
    var hw = t * 2.6, hl = t * 2.2;
    var L1 = c > 0.01 ? (bw - 2 * pad - hw * s) / c : Infinity;
    var L2 = s > 0.01 ? (bh - 2 * pad - hw * c) / s : Infinity;
    var L = Math.max(Math.min(L1, L2), hl * 1.5);
    hl = Math.min(hl, L * 0.45);
    var h = L / 2;
    var pts = [[-h, -t / 2], [h - hl, -t / 2], [h - hl, -hw / 2], [h, 0], [h - hl, hw / 2], [h - hl, t / 2], [-h, t / 2]];
    var ca = Math.cos(a), sa = Math.sin(a), cx = bw / 2, cy = bh / 2;
    return pts.map(function (p) { return [cx + p[0] * ca - p[1] * sa, cy + p[0] * sa + p[1] * ca]; });
  }
  function gaugeArc(f) {
    var ang = Math.PI - Math.PI * f;
    return [50 + 36 * Math.cos(ang), 56 - 36 * Math.sin(ang)];
  }

  /* ---------- screen rendering ---------- */
  function buildOverlayEl(o) {
    var el = document.createElement("div");
    el.className = "ov ov-" + o.type;
    el.tabIndex = 0;
    el.dataset.id = o.id;
    var body = document.createElement("div");
    body.className = "ov-body";
    el.appendChild(body);
    var handle = document.createElement("div");
    handle.className = "handle";
    handle.setAttribute("aria-hidden", "true");
    el.appendChild(handle);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("keydown", onOverlayKey);
    el.addEventListener("focus", function () { if (state.selectedId !== o.id) select(o.id); });
    overlaysEl.appendChild(el);
    els[o.id] = el;
    updateContent(o);
    return el;
  }

  function updateContent(o) {
    var el = els[o.id]; if (!el) return;
    var body = el.querySelector(".ov-body");
    body.textContent = "";
    el.style.setProperty("--s", o.size || 1);
    el.setAttribute("aria-label", TYPES[o.type].kind + ": " + o.name + (o.text ? " — " + o.text.replace(/\n/g, " ") : ""));
    if (o.type === "label" || o.type === "note") {
      var t = document.createElement("span"); t.className = "ov-text";
      var lines = o.text.split("\n");
      if (o.type === "note" && lines.length > 1) {
        var st = document.createElement("strong"); st.textContent = lines[0];
        t.appendChild(st); t.appendChild(document.createTextNode(lines.slice(1).join("\n")));
      } else t.textContent = o.text;
      body.appendChild(t);
    } else if (o.type === "bubble") {
      var inner = document.createElement("div"); inner.className = "ov-inner";
      var k = document.createElement("span"); k.className = "ov-kicker"; k.textContent = "Companion asks";
      var tx = document.createElement("span"); tx.className = "ov-text"; tx.textContent = o.text;
      inner.appendChild(k); inner.appendChild(tx); body.appendChild(inner);
    } else if (o.type === "gauge") {
      var svg = svgEl("svg", { viewBox: "0 0 100 70", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
      svg.appendChild(svgEl("path", { d: "M14 56 A36 36 0 0 1 86 56", fill: "none", stroke: C.track, "stroke-width": 7, "stroke-linecap": "round" }));
      var f = clamp(o.value, 0, 100) / 100;
      if (f > 0.001) {
        var e = gaugeArc(f);
        svg.appendChild(svgEl("path", { d: "M14 56 A36 36 0 0 1 " + e[0].toFixed(2) + " " + e[1].toFixed(2), fill: "none", stroke: C.honey, "stroke-width": 7, "stroke-linecap": "round" }));
      }
      var v = svgEl("text", { x: 50, y: 52, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: C.ink, "font-family": FONT });
      v.textContent = Math.round(o.value);
      var lb = svgEl("text", { x: 50, y: 67, "text-anchor": "middle", "font-size": 9, fill: C.inkSoft, "font-family": FONT });
      lb.textContent = o.text.slice(0, 24);
      svg.appendChild(v); svg.appendChild(lb); body.appendChild(svg);
    } else if (o.type === "arrow") {
      body.appendChild(svgEl("svg", { "aria-hidden": "true" }));
    }
    updateGeometry(o);
  }

  function updateGeometry(o) {
    var el = els[o.id]; if (!el) return;
    el.style.left = (o.x * 100) + "%";
    el.style.top = (o.y * 100) + "%";
    el.style.width = (o.w * 100) + "%";
    el.style.height = (o.h * 100) + "%";
    el.style.opacity = o.opacity;
    el.classList.toggle("hidden", !o.visible);
    el.classList.toggle("selected", o.id === state.selectedId);
    if (o.type === "arrow") {
      var svg = el.querySelector("svg");
      var bw = o.w * stage.clientWidth, bh = o.h * stage.clientHeight;
      if (bw > 0 && bh > 0) {
        svg.setAttribute("viewBox", "0 0 " + bw.toFixed(1) + " " + bh.toFixed(1));
        svg.textContent = "";
        var pts = arrowPoints(bw, bh, o.angle, stageU()).map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
        svg.appendChild(svgEl("polygon", { points: pts, fill: C.moss, stroke: "rgba(255,250,240,0.85)", "stroke-width": Math.max(1.5, stageU() * 0.5), "stroke-linejoin": "round" }));
      }
    }
  }

  function renderAll() {
    var ids = {};
    state.overlays.forEach(function (o, i) {
      ids[o.id] = 1;
      if (!els[o.id]) buildOverlayEl(o);
      els[o.id].style.zIndex = i + 1;
      updateGeometry(o);
    });
    Object.keys(els).forEach(function (id) { if (!ids[id]) { els[id].remove(); delete els[id]; } });
    stage.classList.toggle("all-off", state.allOff);
    renderLayers(); renderProps(); renderHardware(); scheduleCoverage();
  }

  /* ---------- layers ---------- */
  function renderLayers() {
    var list = $("layers"); list.textContent = "";
    $("layers-empty").hidden = state.overlays.length > 0;
    for (var i = state.overlays.length - 1; i >= 0; i--) (function (o, i) {
      var li = document.createElement("li");
      li.className = "layer" + (o.id === state.selectedId ? " selected" : "");
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = o.visible;
      cb.setAttribute("aria-label", "Show " + o.name);
      cb.addEventListener("change", function () { o.visible = cb.checked; updateGeometry(o); scheduleCoverage(); });
      var nb = document.createElement("button"); nb.type = "button"; nb.className = "layer-name";
      nb.textContent = o.name;
      var kind = document.createElement("span"); kind.className = "layer-kind";
      kind.textContent = TYPES[o.type].kind + " · " + Math.round(o.opacity * 100) + "%";
      nb.appendChild(kind);
      nb.addEventListener("click", function () { select(o.id); });
      var act = document.createElement("div"); act.className = "layer-actions";
      [["↑", "Bring " + o.name + " forward", function () { move(i, 1); }, i === state.overlays.length - 1],
       ["↓", "Send " + o.name + " back", function () { move(i, -1); }, i === 0],
       ["✕", "Delete " + o.name, function () { remove(o.id); }, false]].forEach(function (b) {
        var btn = document.createElement("button"); btn.type = "button";
        btn.className = "icon-btn" + (b[0] === "✕" ? " del" : "");
        btn.textContent = b[0]; btn.setAttribute("aria-label", b[1]); btn.title = b[1];
        btn.disabled = b[3]; btn.addEventListener("click", b[2]);
        act.appendChild(btn);
      });
      li.appendChild(cb); li.appendChild(nb); li.appendChild(act);
      list.appendChild(li);
    })(state.overlays[i], i);
  }
  function move(i, dir) {
    var j = i + dir; if (j < 0 || j >= state.overlays.length) return;
    var t = state.overlays[i]; state.overlays[i] = state.overlays[j]; state.overlays[j] = t;
    renderAll();
  }
  function remove(id) {
    state.overlays = state.overlays.filter(function (o) { return o.id !== id; });
    if (state.selectedId === id) state.selectedId = null;
    renderAll();
  }
  function select(id) {
    state.selectedId = id;
    state.overlays.forEach(updateGeometry);
    renderLayers(); renderProps();
  }

  /* ---------- properties + sensors ---------- */
  function buildSensorGrid() {
    var g = $("sensor-grid");
    SENSORS.forEach(function (s) {
      var lab = document.createElement("label"); lab.className = "tick";
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.value = s[0]; cb.id = "sn-" + s[0];
      cb.addEventListener("change", function () {
        var o = sel(); if (!o) return;
        var set = o.sensors.filter(function (x) { return x !== s[0]; });
        if (cb.checked) set.push(s[0]);
        o.sensors = SENSORS.map(function (x) { return x[0]; }).filter(function (x) { return set.indexOf(x) >= 0; });
        renderHardware();
      });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(s[1]));
      g.appendChild(lab);
    });
  }
  function renderProps() {
    var o = sel();
    $("props-empty").hidden = !!o; $("props-body").hidden = !o;
    if (!o) return;
    var t = TYPES[o.type];
    $("props-h").textContent = "Selected card · " + t.kind;
    $("p-name").value = o.name;
    $("p-text-wrap").hidden = !t.hasText;
    $("p-text").value = o.text;
    $("p-opacity").value = Math.round(o.opacity * 100);
    $("p-opacity-out").textContent = Math.round(o.opacity * 100) + "%";
    $("p-size-wrap").hidden = !t.size;
    $("p-size").value = Math.round((o.size || 1) * 100);
    $("p-size-out").textContent = Math.round((o.size || 1) * 100) + "%";
    $("p-angle-wrap").hidden = o.type !== "arrow";
    $("p-angle").value = o.angle;
    $("p-angle-out").textContent = o.angle + "°";
    $("p-value-wrap").hidden = o.type !== "gauge";
    $("p-value").value = o.value;
    $("p-value-out").textContent = Math.round(o.value);
    SENSORS.forEach(function (s) { $("sn-" + s[0]).checked = o.sensors.indexOf(s[0]) >= 0; });
  }
  function bindProps() {
    function on(id, fn) { $(id).addEventListener("input", function () { var o = sel(); if (o) fn(o, $(id).value); }); }
    on("p-name", function (o, v) { o.name = v.slice(0, 40) || TYPES[o.type].kind; updateContent(o); renderLayers(); renderHardware(); });
    on("p-text", function (o, v) { o.text = v.slice(0, 240); updateContent(o); });
    on("p-opacity", function (o, v) { o.opacity = clamp(num(v, 100) / 100, 0.15, 1); $("p-opacity-out").textContent = Math.round(o.opacity * 100) + "%"; updateGeometry(o); renderLayers(); scheduleCoverage(); });
    on("p-size", function (o, v) { o.size = clamp(num(v, 100) / 100, 0.6, 1.6); $("p-size-out").textContent = Math.round(o.size * 100) + "%"; updateContent(o); });
    on("p-angle", function (o, v) { o.angle = clamp(Math.round(num(v, 0)), -180, 180); $("p-angle-out").textContent = o.angle + "°"; updateGeometry(o); scheduleCoverage(); });
    on("p-value", function (o, v) { o.value = clamp(num(v, 50), 0, 100); $("p-value-out").textContent = Math.round(o.value); updateContent(o); });
    $("btn-suggest").addEventListener("click", function () {
      var o = sel(); if (!o) return;
      var add = SUGGEST[o.type] || [];
      var set = o.sensors.slice(); add.forEach(function (s) { if (set.indexOf(s) < 0) set.push(s); });
      o.sensors = SENSORS.map(function (x) { return x[0]; }).filter(function (x) { return set.indexOf(x) >= 0; });
      renderProps(); renderHardware();
    });
  }

  function hardwareSummary() {
    return SENSORS.map(function (s) {
      var users = state.overlays.filter(function (o) { return o.sensors.indexOf(s[0]) >= 0; });
      return { sensor: s[0], label: s[1], cardCount: users.length, cards: users.map(function (o) { return o.name; }) };
    }).filter(function (r) { return r.cardCount > 0; });
  }
  function renderHardware() {
    var list = $("hw-list"); list.textContent = "";
    var rows = hardwareSummary();
    var none = state.overlays.filter(function (o) { return !o.sensors.length; });
    if (!rows.length) {
      var li0 = document.createElement("li"); li0.className = "fineprint";
      li0.textContent = state.overlays.length ? "No sensor needs marked yet. Select a card and tick what it would need." : "Mark sensor needs on a card to see them gathered here.";
      list.appendChild(li0); return;
    }
    rows.forEach(function (r) {
      var li = document.createElement("li");
      var b = document.createElement("strong"); b.textContent = r.label;
      li.appendChild(b);
      li.appendChild(document.createTextNode(" — " + r.cardCount + (r.cardCount === 1 ? " card: " : " cards: ") + r.cards.join(", ")));
      list.appendChild(li);
    });
    if (none.length) {
      var li2 = document.createElement("li"); li2.className = "fineprint";
      li2.textContent = "Not yet marked: " + none.map(function (o) { return o.name; }).join(", ") + ".";
      list.appendChild(li2);
    }
  }

  /* ---------- checklist ---------- */
  function buildChecklist() {
    var box = $("checklist");
    CHECKS.forEach(function (c) {
      var lab = document.createElement("label"); lab.className = "tick";
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.id = "ck-" + c[0];
      cb.addEventListener("change", function () { state.checklist[c[0]] = cb.checked; renderChecklist(); });
      var span = document.createElement("span"); span.textContent = c[1];
      if (c[0] === "real_world_primary") {
        var hint = document.createElement("span"); hint.className = "check-hint"; hint.id = "rw-hint"; hint.hidden = true;
        hint.textContent = "The clear-view meter shows a lot of the scene is covered. You decide.";
        span.appendChild(hint);
      }
      lab.appendChild(cb); lab.appendChild(span); box.appendChild(lab);
    });
  }
  function confirmedCount() { return CHECKS.filter(function (c) { return state.checklist[c[0]]; }).length; }
  function renderChecklist() {
    CHECKS.forEach(function (c) { $("ck-" + c[0]).checked = !!state.checklist[c[0]]; });
    var n = confirmedCount(), st = $("check-status");
    st.textContent = n === CHECKS.length ? "All 7 confirmed for this design." : n + " of 7 confirmed.";
    st.classList.toggle("partial", n < CHECKS.length);
  }

  /* ---------- canvas drawing (export + coverage) ---------- */
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }
  function wrap(ctx, text, maxW) {
    var out = [];
    text.split("\n").forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean), line = "";
      if (!words.length) { out.push(""); return; }
      words.forEach(function (w) {
        while (ctx.measureText(w).width > maxW && w.length > 1) {
          var k = w.length; while (k > 1 && ctx.measureText(w.slice(0, k)).width > maxW) k--;
          if (line) { out.push(line); line = ""; }
          out.push(w.slice(0, k)); w = w.slice(k);
        }
        var test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
      });
      out.push(line);
    });
    return out;
  }
  function textBlock(ctx, lines, x, y, w, h, px, lh, opts) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.textBaseline = "top";
    var total = lines.length * px * lh;
    var ty = opts.vcenter ? y + Math.max(0, (h - total) / 2) : y;
    lines.forEach(function (ln, i) {
      ctx.font = (opts.boldFirst && i === 0 ? 700 : opts.weight || 400) + " " + px + "px " + FONT;
      ctx.textAlign = opts.center ? "center" : "left";
      ctx.fillText(ln, opts.center ? x + w / 2 : x, ty + i * px * lh + (px * (lh - 1)) / 2);
    });
    ctx.restore();
  }
  function drawOverlay(ctx, o, W, H, noText) {
    var u = W / 100, x = o.x * W, y = o.y * H, w = o.w * W, h = o.h * H, s = o.size || 1;
    ctx.save();
    ctx.globalAlpha = o.opacity;
    if (o.type === "label") {
      var rad = 3 * u, bl = 0.8 * u;
      ctx.save(); rr(ctx, x, y, w, h, rad); ctx.clip();
      ctx.fillStyle = C.card; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = C.moss; ctx.fillRect(x, y, bl, h);
      ctx.restore();
      if (!noText) {
        var px = 2.8 * u * s; ctx.font = "600 " + px + "px " + FONT; ctx.fillStyle = C.ink;
        var ix = x + bl + 1.4 * u, iw = w - bl - 2.8 * u, iy = y + u, ih = h - 2 * u;
        textBlock(ctx, wrap(ctx, o.text, iw), ix, iy, iw, ih, px, 1.2, { center: true, vcenter: true, weight: 600 });
      }
    } else if (o.type === "note") {
      rr(ctx, x, y, w, h, 1.6 * u); ctx.fillStyle = C.card; ctx.fill();
      if (!noText) {
        var p2 = 2.3 * u * s, pad = 1.6 * u; ctx.fillStyle = C.ink;
        var parts = o.text.split("\n"), lines = [];
        ctx.font = "700 " + p2 + "px " + FONT;
        var first = parts.length > 1 ? wrap(ctx, parts[0], w - 2 * pad) : [];
        ctx.font = "400 " + p2 + "px " + FONT;
        var rest = wrap(ctx, parts.length > 1 ? parts.slice(1).join("\n") : o.text, w - 2 * pad);
        ctx.save(); ctx.beginPath(); ctx.rect(x + pad, y + pad, w - 2 * pad, h - 2 * pad); ctx.clip();
        ctx.textBaseline = "top"; ctx.textAlign = "left";
        lines = first.map(function (l) { return [l, 700]; }).concat(rest.map(function (l) { return [l, 400]; }));
        lines.forEach(function (l, i) { ctx.font = l[1] + " " + p2 + "px " + FONT; ctx.fillText(l[0], x + pad, y + pad + i * p2 * 1.3 + p2 * 0.15); });
        ctx.restore();
      }
    } else if (o.type === "bubble") {
      var bw = 0.35 * u;
      rr(ctx, x, y, w, h, 2 * u); ctx.fillStyle = C.sage; ctx.fill();
      ctx.lineWidth = bw; ctx.strokeStyle = C.moss;
      rr(ctx, x + bw / 2, y + bw / 2, w - bw, h - bw, 2 * u); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 3 * u + bw, y + h); ctx.lineTo(x + 5.8 * u + bw, y + h); ctx.lineTo(x + 4.4 * u + bw, y + h + 2.4 * u); ctx.closePath();
      ctx.fillStyle = C.moss; ctx.fill();
      if (!noText) {
        var ix2 = x + bw + 1.8 * u, iy2 = y + bw + 1.4 * u, iw2 = w - 2 * bw - 3.6 * u, ih2 = h - 2 * bw - 2.8 * u;
        var kp = 1.6 * u * s, tp = 2.3 * u * s;
        ctx.save(); ctx.beginPath(); ctx.rect(ix2, iy2, iw2, ih2); ctx.clip();
        ctx.textBaseline = "top"; ctx.fillStyle = C.moss; ctx.font = "700 " + kp + "px " + FONT;
        ctx.fillText("COMPANION ASKS", ix2, iy2 + kp * 0.1);
        ctx.restore();
        ctx.fillStyle = C.ink; ctx.font = "400 " + tp + "px " + FONT;
        var ky = kp * 1.2 + 0.4 * u;
        textBlock(ctx, wrap(ctx, o.text, iw2), ix2, iy2 + ky, iw2, ih2 - ky, tp, 1.3, {});
      }
    } else if (o.type === "ring") {
      var lw = 0.8 * u, hl = 0.35 * u, cx = x + w / 2, cy = y + h / 2;
      var rx = Math.max(1, w / 2 - lw / 2), ry = Math.max(1, h / 2 - lw / 2);
      ctx.strokeStyle = C.halo; ctx.lineWidth = hl;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx + lw / 2 + hl / 2, ry + lw / 2 + hl / 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx - lw / 2 - hl / 2), Math.max(1, ry - lw / 2 - hl / 2), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = C.honey; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (o.type === "arrow") {
      var pts = arrowPoints(w, h, o.angle, u);
      ctx.beginPath();
      pts.forEach(function (p, i) { if (i) ctx.lineTo(x + p[0], y + p[1]); else ctx.moveTo(x + p[0], y + p[1]); });
      ctx.closePath();
      ctx.fillStyle = C.moss; ctx.fill();
      ctx.lineJoin = "round"; ctx.lineWidth = Math.max(1, 0.5 * u); ctx.strokeStyle = "rgba(255,250,240,0.85)"; ctx.stroke();
    } else if (o.type === "gauge") {
      rr(ctx, x, y, w, h, 1.6 * u); ctx.fillStyle = C.card; ctx.fill();
      var sc = Math.min(w / 100, h / 70), ox = x + (w - 100 * sc) / 2, oy = y + (h - 70 * sc) / 2;
      ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, sc);
      ctx.lineCap = "round"; ctx.lineWidth = 7;
      ctx.strokeStyle = C.track; ctx.beginPath(); ctx.arc(50, 56, 36, Math.PI, 2 * Math.PI); ctx.stroke();
      var f = clamp(o.value, 0, 100) / 100;
      if (f > 0.001) { ctx.strokeStyle = C.honey; ctx.beginPath(); ctx.arc(50, 56, 36, Math.PI, Math.PI + Math.PI * f); ctx.stroke(); }
      if (!noText) {
        ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillStyle = C.ink; ctx.font = "700 17px " + FONT; ctx.fillText(String(Math.round(o.value)), 50, 52);
        ctx.fillStyle = C.inkSoft; ctx.font = "400 9px " + FONT; ctx.fillText(o.text.slice(0, 24), 50, 67);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- keep the view clear ---------- */
  var covCanvas = document.createElement("canvas"), covPending = false;
  function scheduleCoverage() {
    if (covPending) return; covPending = true;
    requestAnimationFrame(function () { covPending = false; computeCoverage(); });
  }
  function computeCoverage() {
    var visible = state.allOff ? [] : state.overlays.filter(function (o) { return o.visible; });
    var pct = 0;
    if (visible.length) {
      var W = 160, H = Math.max(40, Math.round(160 / aspect()));
      covCanvas.width = W; covCanvas.height = H;
      var ctx = covCanvas.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, W, H);
      visible.forEach(function (o) { drawOverlay(ctx, o, W, H, true); });
      var d = ctx.getImageData(0, 0, W, H).data, sum = 0;
      for (var i = 3; i < d.length; i += 4) sum += d[i];
      pct = (sum / 255) / (W * H) * 100;
    }
    state.coverage = Math.round(pct * 10) / 10;
    var level = pct > LEVEL_OVER ? "over" : pct > LEVEL_BUSY ? "busy" : "clear";
    $("clear-meter").dataset.level = level;
    $("clear-fill").style.width = Math.min(100, pct) + "%";
    var txt = $("clear-text"); txt.textContent = "";
    var b = document.createElement("strong");
    var p = Math.round(pct);
    if (!state.overlays.length) { b.textContent = "Keep the view clear:"; txt.appendChild(b); txt.appendChild(document.createTextNode(" no overlays yet.")); }
    else if (state.allOff) { b.textContent = "View fully clear:"; txt.appendChild(b); txt.appendChild(document.createTextNode(" every overlay is off.")); }
    else if (level === "clear") { b.textContent = "View clear:"; txt.appendChild(b); txt.appendChild(document.createTextNode(" overlays cover about " + p + "% of the scene.")); }
    else if (level === "busy") { b.textContent = "Getting busy:"; txt.appendChild(b); txt.appendChild(document.createTextNode(" about " + p + "% covered. Over " + LEVEL_OVER + "% hides too much of the real world.")); }
    else { b.textContent = "Too much covered:"; txt.appendChild(b); txt.appendChild(document.createTextNode(" about " + p + "% of the scene is behind overlays. Shrink, fade, or hide some so the real world stays primary.")); }
    var hint = $("rw-hint"); if (hint) hint.hidden = level !== "over";
    state.level = level;
  }

  /* ---------- pointer + keyboard ---------- */
  var drag = null;
  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    var el = e.currentTarget, o = byId(Number(el.dataset.id)); if (!o) return;
    e.preventDefault();
    if (state.selectedId !== o.id) select(o.id);
    el.focus({ preventScroll: true });
    var r = stage.getBoundingClientRect();
    drag = { o: o, el: el, mode: e.target.classList.contains("handle") ? "resize" : "move",
      sx: e.clientX, sy: e.clientY, W: r.width, H: r.height, ox: o.x, oy: o.y, ow: o.w, oh: o.h, pid: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = (e.clientX - drag.sx) / drag.W, dy = (e.clientY - drag.sy) / drag.H, o = drag.o;
    if (drag.mode === "move") {
      o.x = clamp(drag.ox + dx, 0, 1 - o.w); o.y = clamp(drag.oy + dy, 0, 1 - o.h);
    } else {
      o.w = clamp(drag.ow + dx, 0.04, 1 - o.x); o.h = clamp(drag.oh + dy, 0.03, 1 - o.y);
    }
    updateGeometry(o); scheduleCoverage();
  }
  function onPointerUp(e) {
    if (!drag) return;
    var el = drag.el;
    try { el.releasePointerCapture(drag.pid); } catch (_) {}
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
    drag = null;
  }
  function onOverlayKey(e) {
    var o = byId(Number(e.currentTarget.dataset.id)); if (!o) return;
    var step = e.altKey ? 0.002 : 0.01, k = e.key, used = true;
    if (e.shiftKey) {
      if (k === "ArrowRight") o.w = clamp(o.w + step, 0.04, 1 - o.x);
      else if (k === "ArrowLeft") o.w = clamp(o.w - step, 0.04, 1);
      else if (k === "ArrowDown") o.h = clamp(o.h + step, 0.03, 1 - o.y);
      else if (k === "ArrowUp") o.h = clamp(o.h - step, 0.03, 1);
      else used = false;
    } else {
      if (k === "ArrowRight") o.x = clamp(o.x + step, 0, 1 - o.w);
      else if (k === "ArrowLeft") o.x = clamp(o.x - step, 0, 1 - o.w);
      else if (k === "ArrowDown") o.y = clamp(o.y + step, 0, 1 - o.h);
      else if (k === "ArrowUp") o.y = clamp(o.y - step, 0, 1 - o.h);
      else if (k === "Delete") { remove(o.id); }
      else if (k === "Escape") { select(null); e.currentTarget.blur(); }
      else used = false;
    }
    if (used) { e.preventDefault(); updateGeometry(o); scheduleCoverage(); }
  }

  /* ---------- adding cards ---------- */
  function makeOverlay(type, init) {
    var t = TYPES[type]; init = init || {};
    state.counters[type] = (state.counters[type] || 0) + 1;
    var w = t.w, h = t.round ? t.w * aspect() * t.round : t.h;
    var n = state.overlays.length % 5;
    var o = {
      id: state.nextId++, type: type, name: t.kind + " " + state.counters[type],
      x: clamp(0.5 - w / 2 + (n - 2) * 0.04, 0, 1 - w), y: clamp(0.42 - h / 2 + (n - 2) * 0.04, 0, 1 - h), w: w, h: h,
      opacity: 1, visible: true, size: 1, angle: t.angle || 0, value: t.value == null ? 50 : t.value,
      text: t.text, sensors: []
    };
    for (var k in init) o[k] = init[k];
    return o;
  }
  function addOverlay(type) {
    var o = makeOverlay(type);
    state.overlays.push(o); state.selectedId = o.id;
    if (state.allOff) { state.allOff = false; syncAllToggle(); }
    renderAll();
    if (els[o.id]) els[o.id].focus({ preventScroll: true });
  }
  function syncAllToggle() {
    var b = $("btn-all-toggle");
    b.setAttribute("aria-pressed", String(state.allOff));
    b.textContent = state.allOff ? "Turn overlays back on" : "Turn every overlay off";
    stage.classList.toggle("all-off", state.allOff);
    scheduleCoverage();
  }

  /* ---------- photo in ---------- */
  function setPhotoFromBlob(blob, source, alt) {
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = url;
      state.photo = { w: img.naturalWidth, h: img.naturalHeight, source: source };
      photo.src = url; photo.alt = alt + " " + PAINTBRUSH; photo.hidden = false;
      stage.dataset.empty = "false";
      document.querySelectorAll("[data-add]").forEach(function (b) { b.disabled = false; });
      $("btn-export-json").disabled = false; $("btn-export-png").disabled = false;
      requestAnimationFrame(function () { updateU(); renderAll(); });
      setStatus(source === "practice" ? "Practice scene ready." : "Photo opened on this device. Nothing was uploaded.");
    };
    img.onerror = function () { URL.revokeObjectURL(url); setStatus("That file could not be opened as a picture. Try a JPEG or PNG."); };
    img.src = url;
  }
  function onFile(e, source) {
    var f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.type && f.type.indexOf("image/") !== 0) { setStatus("Please choose a picture file."); return; }
    setPhotoFromBlob(f, source, "Your photo of the real world, used as the base of this Forward View design. It stays on this device.");
  }
  function practiceScene() {
    var W = 1600, H = 1067, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    var sky = x.createLinearGradient(0, 0, 0, H * 0.6); sky.addColorStop(0, "#b9d4dc"); sky.addColorStop(1, "#f3e6cf");
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(255,244,214,0.9)"; x.beginPath(); x.arc(W * 0.78, H * 0.2, 70, 0, Math.PI * 2); x.fill();
    function hills(base, amp, color, seed) {
      x.fillStyle = color; x.beginPath(); x.moveTo(0, H);
      for (var i = 0; i <= 40; i++) { var px = W * i / 40; x.lineTo(px, base - amp * (0.5 + 0.5 * Math.sin(i * 0.45 + seed) * Math.cos(i * 0.17 + seed * 2))); }
      x.lineTo(W, H); x.closePath(); x.fill();
    }
    hills(H * 0.5, 160, "#9fb3a6", 1); hills(H * 0.58, 110, "#7f9a6e", 3); hills(H * 0.68, 70, "#a9b46a", 5);
    var g = x.createLinearGradient(0, H * 0.65, 0, H); g.addColorStop(0, "#c9b56c"); g.addColorStop(1, "#9c8a48");
    x.fillStyle = g; x.fillRect(0, H * 0.7, W, H * 0.3);
    x.fillStyle = "#e4d3a8"; x.beginPath();
    x.moveTo(W * 0.42, H); x.bezierCurveTo(W * 0.5, H * 0.85, W * 0.46, H * 0.78, W * 0.56, H * 0.66);
    x.lineTo(W * 0.575, H * 0.66); x.bezierCurveTo(W * 0.52, H * 0.8, W * 0.62, H * 0.88, W * 0.66, H); x.closePath(); x.fill();
    [[0.12, 0.72, 1.2], [0.2, 0.7, 0.9], [0.84, 0.74, 1.3], [0.92, 0.71, 1]].forEach(function (t) {
      var tx = W * t[0], ty = H * t[1], s = 120 * t[2];
      x.fillStyle = "#4d6440"; x.beginPath(); x.moveTo(tx, ty - s * 1.6); x.lineTo(tx - s * 0.5, ty); x.lineTo(tx + s * 0.5, ty); x.closePath(); x.fill();
      x.fillStyle = "#6b4f36"; x.fillRect(tx - 8, ty, 16, 30);
    });
    c.toBlob(function (b) { if (b) setPhotoFromBlob(b, "practice", "A drawn practice scene of sky, hills, trees and a footpath, used as the base of this Forward View design."); }, "image/png");
  }

  function updateU() {
    stage.style.setProperty("--u", stageU() + "px");
    state.overlays.forEach(function (o) { if (o.type === "arrow") updateGeometry(o); });
  }

  /* ---------- export ---------- */
  function designJSON() {
    var n = confirmedCount();
    return {
      schema: SCHEMA,
      app: "OMNI-Grok Bot Pro · Sandbox",
      module: "OMNI Augmented Reality — Forward View",
      name: $("design-name").value.slice(0, 60) || "Forward View sketch",
      exportedAt: new Date().toISOString(),
      principle: PRINCIPLE,
      photo: state.photo ? {
        included: false, widthPx: state.photo.w, heightPx: state.photo.h,
        aspect: Math.round(aspect() * 10000) / 10000, source: state.photo.source,
        metadata: "not read and not stored; flattened PNG is re-encoded through a canvas, which drops EXIF and GPS"
      } : null,
      view: { coveragePercent: state.coverage, level: state.level || "clear", allOverlaysOff: state.allOff,
        thresholds: { busyAbovePercent: LEVEL_BUSY, tooMuchAbovePercent: LEVEL_OVER } },
      coordinates: "rect values are fractions of the photo width (x, w) and height (y, h); z runs from back (0) to front",
      overlays: state.overlays.map(function (o, i) {
        var r = { id: o.id, type: o.type, kind: TYPES[o.type].kind, name: o.name, z: i, visible: o.visible,
          opacity: o.opacity, rect: { x: +o.x.toFixed(4), y: +o.y.toFixed(4), w: +o.w.toFixed(4), h: +o.h.toFixed(4) },
          text: o.text, sensors: o.sensors.slice() };
        if (TYPES[o.type].size) r.textSize = o.size;
        if (o.type === "arrow") r.angleDeg = o.angle;
        if (o.type === "gauge") r.value = o.value;
        return r;
      }),
      hardwareRequirements: {
        sensors: hardwareSummary(),
        cardsWithoutSensorNeeds: state.overlays.filter(function (o) { return !o.sensors.length; }).map(function (o) { return o.name; })
      },
      checklist: {
        judge: "the designer",
        items: CHECKS.map(function (c) { return { id: c[0], label: c[1], confirmed: !!state.checklist[c[0]] }; }),
        confirmed: n, total: CHECKS.length
      },
      flattenedPngAltText: "Flattened OMNI Forward View design \u201c" + ($("design-name").value || "Forward View sketch") + "\u201d: " +
        state.overlays.filter(function (o) { return o.visible && !state.allOff; }).map(function (o) { return TYPES[o.type].kind.toLowerCase() + (o.text ? " \u201c" + o.text.replace(/\n/g, " ") + "\u201d" : ""); }).join(", ") +
        " over a real-world photo. " + PAINTBRUSH,
      trainingNote: "Static designs like this one are specimens for later hardware work: what a person wanted to see, where it sat, how much of the world it covered, and what had to be sensed. Shared with consent, design by design."
    };
  }
  function exportJSON() {
    var d = designJSON();
    download(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }), "omni-forward-view-" + slug(d.name) + "-" + stamp() + ".json");
    var n = d.checklist.confirmed;
    setStatus("Design JSON saved to this device." + (n < 7 ? " " + (7 - n) + " checklist line" + (7 - n === 1 ? " is" : "s are") + " not yet confirmed; the file records that." : ""));
  }
  function exportPNG() {
    if (!state.photo) return;
    var sc = Math.min(1, MAX_EXPORT / Math.max(state.photo.w, state.photo.h));
    var W = Math.round(state.photo.w * sc), H = Math.round(state.photo.h * sc);
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    ctx.drawImage(photo, 0, 0, W, H);
    if (!state.allOff) state.overlays.forEach(function (o) { if (o.visible) drawOverlay(ctx, o, W, H, false); });
    c.toBlob(function (b) {
      if (!b) { setStatus("The picture could not be made on this device."); return; }
      download(b, "omni-forward-view-" + slug($("design-name").value) + "-" + stamp() + ".png");
      setStatus("Flattened PNG saved to this device (" + W + "×" + H + "). It was redrawn from pixels, so camera EXIF and GPS are gone.");
    }, "image/png");
  }
  function importJSON(e) {
    var f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    f.text().then(function (txt) {
      var d = JSON.parse(txt);
      if (!d || typeof d.schema !== "string" || d.schema.indexOf("omni.forward-view.design/") !== 0 || !Array.isArray(d.overlays)) throw new Error("schema");
      state.overlays = []; state.counters = {}; state.selectedId = null;
      d.overlays.slice(0, 40).forEach(function (r) {
        if (!r || !TYPES[r.type]) return;
        var rect = r.rect || {};
        var w = clamp(num(rect.w, TYPES[r.type].w), 0.04, 1), h = clamp(num(rect.h, 0.1), 0.03, 1);
        var o = makeOverlay(r.type, {
          name: String(r.name || TYPES[r.type].kind).slice(0, 40),
          x: clamp(num(rect.x, 0), 0, 1 - w), y: clamp(num(rect.y, 0), 0, 1 - h), w: w, h: h,
          opacity: clamp(num(r.opacity, 1), 0.15, 1), visible: r.visible !== false,
          size: clamp(num(r.textSize, 1), 0.6, 1.6), angle: clamp(Math.round(num(r.angleDeg, TYPES[r.type].angle || 0)), -180, 180),
          value: clamp(num(r.value, 50), 0, 100), text: String(r.text == null ? "" : r.text).slice(0, 240),
          sensors: Array.isArray(r.sensors) ? SENSORS.map(function (s) { return s[0]; }).filter(function (s) { return r.sensors.indexOf(s) >= 0; }) : []
        });
        state.overlays.push(o);
      });
      state.checklist = {};
      if (d.checklist && Array.isArray(d.checklist.items)) d.checklist.items.forEach(function (it) {
        if (it && CHECKS.some(function (c) { return c[0] === it.id; })) state.checklist[it.id] = !!it.confirmed;
      });
      if (typeof d.name === "string") $("design-name").value = d.name.slice(0, 60);
      state.allOff = false; syncAllToggle();
      renderChecklist(); renderAll();
      setStatus("Design loaded: " + state.overlays.length + " cards." + (state.photo ? "" : " Open a photo to see them in place."));
    }).catch(function () { setStatus("That file is not a Forward View design JSON."); });
  }

  /* ---------- privacy check ---------- */
  function outsideRequests() {
    if (!window.performance || !performance.getEntriesByType) return null;
    return performance.getEntriesByType("resource").filter(function (r) {
      try { var u = new URL(r.name); return /^https?:$/.test(u.protocol) && u.origin !== location.origin; } catch (_) { return false; }
    }).length;
  }
  function renderNetCheck() {
    var n = outsideRequests(), el = $("net-check");
    if (n === null) { el.textContent = "Outside requests: this browser cannot report them."; return; }
    el.textContent = n === 0 ? "Outside requests since this page opened: 0" : "Outside requests since this page opened: " + n + " — please report this.";
  }

  /* ---------- wire up ---------- */
  function init() {
    buildSensorGrid(); buildChecklist(); bindProps(); renderChecklist();
    $("in-camera").addEventListener("change", function (e) { onFile(e, "camera"); });
    $("in-upload").addEventListener("change", function (e) { onFile(e, "upload"); });
    $("in-json").addEventListener("change", importJSON);
    $("btn-practice").addEventListener("click", practiceScene);
    document.querySelectorAll("[data-add]").forEach(function (b) { b.addEventListener("click", function () { addOverlay(b.dataset.add); }); });
    $("btn-all-toggle").addEventListener("click", function () { state.allOff = !state.allOff; syncAllToggle(); });
    $("btn-deselect").addEventListener("click", function () { select(null); });
    $("btn-export-json").addEventListener("click", exportJSON);
    $("btn-export-png").addEventListener("click", exportPNG);
    stage.addEventListener("pointerdown", function (e) { if (e.target === stage || e.target === overlaysEl) select(null); });
    if (window.ResizeObserver) new ResizeObserver(updateU).observe(stage); else window.addEventListener("resize", updateU);
    updateU(); renderAll();
    renderNetCheck();
    if (window.PerformanceObserver) { try { new PerformanceObserver(renderNetCheck).observe({ type: "resource", buffered: true }); } catch (_) {} }
    window.addEventListener("load", renderNetCheck);
  }
  init();
})();
