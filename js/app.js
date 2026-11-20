/* Révision BTS SIO — logique de l'application (JavaScript pur, aucun framework, aucune dépendance).
   Données lues (globales, chargées par index.html) :
     ANNALES      (data/questions.js, généré)  : { sujets:[…], questions:[…] }
     CORRECTIONS  (data/corrections.js, manuel) : corrections proposées + thèmes + mots-clés
     EPREUVES, MATIERES, THEMES, NOTIONS (data/notions.js, manuel)
   Progression de l'utilisateur : enregistrée dans le navigateur (localStorage, clé STORE_KEY). Les boutons IA transmettent la demande au service choisi au clic.
   Organisation : 1) outils  2) état et sauvegarde  3) calculs et composants communs  4) une fonction V.xxx par page  5) routeur et actions. */
(function () {
'use strict';

/* ───────── 1) Outils ───────── */
var $ = function (s, r) { return (r || document).querySelector(s); };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'"); };
var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
var sur20 = function (x) { return (Math.round(x * 200) / 10).toString().replace('.', ','); };
var IMP = { 3: 'Indispensable', 2: 'Important', 1: 'À connaître' };
var EP_COURT = { E7: 'E7 Cybersécurité', E6: 'E6 Pratique', E5: 'E5 Support', E4: 'E4 CEJM', E3: 'E3 Maths', E1: 'E1 Culture générale', E2: 'E2 Anglais' };
var DAY = 86400000;

/* ───────── 2) État et sauvegarde ─────────
   S.option  : '' (les deux), 'SISR' ou 'SLAM' — masque partout ce qui concerne l'autre option
   S.ep/S.mat: épreuve et matière affichées dans la bibliothèque, les flashcards et les thèmes à réviser
   S.answers : { idQuestion: [ { d: date, rep: texte, auto: note auto 0-1, note: note retenue 0-1 }, … ] } — toutes les réponses rédigées */
var STORE_KEY = 'bts-sio-revision-v1';
/* S.fstats  : { matière: { ok: n, ko: n } } — résultats des flashcards, pour les notes par matière
   S.tpdone  : { idTP: date } — TP SISR marqués comme faits
   S.layout  : 'bas' (document sous la question, pleine largeur) ou 'cote' (côte à côte) ; S.zoom : '' (largeur de page) ou un pourcentage */
/* S.fhist   : { idCarte: [1, 0, …] } — historique « je savais (1) / pas encore (0) » de chaque flashcard (carnet d'erreurs)
   S.ostats  : { matière: { n, sum } } — auto-évaluations du simulateur d'oral ; S.day : compteurs du jour (objectif du jour)
   S.ia      : 'chatgpt' ou 'claude' — IA ouverte par les boutons « Demander à l'IA »
   S.examRun : examen blanc en cours { sid, start, dur, reps, i, page, doc } ; S.examHist : examens blancs terminés
   S.ctrl    : mes contrôles [ { id, titre, mat, date, consignes, texte, dossiers: [ { n, d, fiche, cards, qs } ], fs: { ok, ko } } ] */
function blank() { return { theme: 'light', option: '', ep: 'E7', mat: 'cyber', learned: {}, cards: {}, history: [], qdone: {}, answers: {}, exam: '', fstats: {}, tpdone: {}, layout: 'bas', zoom: '',
  fhist: {}, ostats: {}, day: {}, ia: 'chatgpt', examRun: null, examHist: [], ctrl: [], exstats: {}, days: {}, memo: {}, reals: [], planDone: {}, lastBackup: 0, study: StudyTools.blank() }; }
var S = blank();
var loadError = false;
try { S = readState(JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { loadError = true; }
/* Validate before replacing any live state; old backups receive missing defaults. */
function readState(data) {
  function object(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function check(ok) { if (!ok) throw new Error('Structure de sauvegarde invalide.'); }
  function finite(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0; }
  function text(v) { return typeof v === 'string'; }
  function map(v, fn) { check(object(v)); Object.keys(v).forEach(function (k) { check(fn(v[k])); }); }
  function clean(v) {
    if (v && typeof v === 'object') Object.keys(v).forEach(function (k) {
      check(k !== '__proto__' && k !== 'constructor' && k !== 'prototype'); clean(v[k]);
    });
  }
  check(object(data)); clean(data);
  var out = blank();
  Object.keys(out).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(data, k)) return;
    var v = data[k], def = out[k];
    check(k === 'zoom' ? v === '' || typeof v === 'number' : def === null ? v === null || object(v) : Array.isArray(def) ? Array.isArray(v) : object(def) ? object(v) : typeof v === typeof def);
    out[k] = v;
  });
  ['retention', 'backupSnooze'].forEach(function (k) { if (data[k] != null) { check(finite(data[k])); out[k] = data[k]; } });
  if (out.retention != null) check(out.retention >= .7 && out.retention <= .99);
  if (data.deckOpen != null) { map(data.deckOpen, function (v) { return typeof v === 'boolean'; }); out.deckOpen = data.deckOpen; }
  check(['light','dark'].indexOf(out.theme) >= 0 && ['', 'SISR','SLAM'].indexOf(out.option) >= 0);
  check(['chatgpt','claude'].indexOf(out.ia) >= 0 && ['bas','cote'].indexOf(out.layout) >= 0);
  check(out.zoom === '' || [100,125,150,175,200].indexOf(out.zoom) >= 0);
  check(!out.exam || /^\d{4}-\d{2}-\d{2}$/.test(out.exam) && !isNaN(new Date(out.exam + 'T00:00:00').getTime()));
  map(out.learned, finite); map(out.tpdone, finite); map(out.days, finite); map(out.memo, text);
  map(out.qdone, function (v) { return finite(v) && v <= 1; });
  map(out.cards, function (v) { return object(v) && finite(v.d) && Object.keys(v).every(function (k) { return finite(v[k]); }); });
  map(out.fhist, function (v) { return Array.isArray(v) && v.every(function (x) { return x === 0 || x === 1; }); });
  map(out.answers, function (v) { return Array.isArray(v) && v.every(function (a) { return object(a) && finite(a.d) && text(a.rep) && finite(a.note) && a.note <= 1 && finite(a.auto) && a.auto <= 1; }); });
  map(out.fstats, function (v) { return object(v) && finite(v.ok) && finite(v.ko); });
  map(out.ostats, function (v) { return object(v) && finite(v.n) && finite(v.sum) && v.sum <= v.n; });
  map(out.exstats, function (v) { return object(v) && finite(v.n) && finite(v.ok) && v.ok <= v.n; });
  map(out.planDone, function (v) { return v === 1 || v === true; });
  Object.keys(out.day).forEach(function (k) { check(k === 'd' ? text(out.day[k]) : finite(out.day[k])); });
  out.history.concat(out.examHist).forEach(function (h) { check(object(h) && finite(h.date) && text(h.titre) && finite(h.note) && h.note <= 20 && finite(h.n)); });
  out.examHist.forEach(function (h) { check(text(h.sid) && finite(h.temps)); });
  var ids = {};
  out.ctrl.forEach(function (c) {
    check(object(c) && text(c.id) && /^[a-zA-Z0-9_-]+$/.test(c.id) && !ids[c.id]); ids[c.id] = true;
    check(text(c.titre) && text(c.mat) && (Object.prototype.hasOwnProperty.call(MATIERES, c.mat) || c.mat === 'autre') && Array.isArray(c.dossiers));
    ['date','consignes','texte'].forEach(function (k) { if (c[k] == null) c[k] = ''; check(text(c[k])); });
    if (c.fs) check(finite(c.fs.ok) && finite(c.fs.ko));
    var nums = {};
    c.dossiers.forEach(function (d) {
      check(object(d) && Number.isInteger(d.n) && d.n > 0 && !nums[d.n]); nums[d.n] = true;
      check(finite(d.d) && text(d.fiche) && Array.isArray(d.cards) && Array.isArray(d.qs));
      d.cards.forEach(function (x) { check(object(x) && text(x.q) && text(x.r)); ['explication','exemple','piege'].forEach(function (k) { if (x[k] != null) check(text(x[k])); }); });
      d.qs.forEach(function (x) { check(object(x) && text(x.q) && text(x.correction) && Array.isArray(x.motscles) && x.motscles.every(text)); });
    });
  });
  out.reals.forEach(function (r) { check(object(r) && text(r.id) && /^[a-zA-Z0-9_-]+$/.test(r.id) && text(r.titre) && ['E5','E6'].indexOf(r.ep) >= 0 && Object.keys(r).every(function (k) { return text(r[k]); })); });
  if (out.examRun) {
    var r = out.examRun;
    var qs = ANNALES.questions.concat([].concat.apply([], (window.CAS_ENT || []).map(function (c) { return c.questions.map(function () { return { sujet: c.id }; }); }))).filter(function (q) { return q.sujet === r.sid; });
    check(qs.length > 0 && Number.isInteger(r.i) && r.i >= 0 && r.i < qs.length && finite(r.start) && finite(r.dur) && r.dur > 0);
    map(r.reps, text); check(finite(r.page) && text(r.doc));
  }
  out.study = StudyTools.validate(out.study);
  return out;
}
function storageWarning(message) {
  var el = $('#storageStatus'); if (!el) { el = document.createElement('div'); el.id = 'storageStatus'; el.setAttribute('role', 'alert'); document.body.appendChild(el); }
  el.textContent = message; el.hidden = !message;
}
var study;
function save() { if (loadError) return false; if (study) study.capture(); try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); memoBox.pending = false; storageWarning(''); return true; } catch (e) { storageWarning('Enregistrement impossible dans ce navigateur. Exporte ta progression depuis « Réglages et sauvegarde » avant de fermer.'); return false; } }
function daysUntil(date) { if (!date) return null; var p = date.split('-').map(Number), d = new Date(); return Math.round((Date.UTC(p[0], p[1] - 1, p[2]) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY); }
function resetTransient() { if (study) study.cancelPending(); session = null; flash = null; oral = null; qcm = null; exo = null; express = null; examRes = null; if (reco) reco.stop(); py = { tab: 'fiche', i: 0, rep: null, done: false, code: {} }; }

function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function dayCount(k) { if (S.day.d !== today()) S.day = { d: today(), flash: 0, q: 0, oral: 0 }; S.day[k] = (S.day[k] || 0) + 1; S.days = S.days || {}; S.days[today()] = (S.days[today()] || 0) + 1; }

/* ───────── IA sans clé API (solution A) ─────────
   La demande est copiée dans le presse-papiers puis ChatGPT ou Claude s'ouvre dans un nouvel onglet, la demande pré-remplie
   quand elle est assez courte pour tenir dans l'adresse ; sinon il suffit de la coller (Ctrl+V). La demande courte est donc transmise au service choisi dans l'URL. */
function copyText(t) {
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).catch(function () { copyOld(t); }); return; } } catch (e) {}
  copyOld(t);
}
function copyOld(t) { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }
function toast(msg) {
  var el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { el.className = ''; }, 6000);
}
var IA_PROMPTS = {};   // demandes préparées pour les boutons data-a="ia" data-k="…"
function iaBtn(key, prompt, label, cls) { IA_PROMPTS[key] = prompt; return '<button class="btn ia small' + (cls ? ' ' + cls : '') + '" data-a="ia" data-k="' + esc(key) + '" title="Copie la demande et ouvre ' + (S.ia === 'claude' ? 'Claude' : 'ChatGPT') + ' dans un nouvel onglet">✦ ' + esc(label) + '</button>'; }
function iaOpen(prompt) {
  copyText(prompt);
  var court = prompt.length < 5500, base = S.ia === 'claude' ? 'https://claude.ai/new' : 'https://chatgpt.com/';
  window.open(court ? base + '?q=' + encodeURIComponent(prompt) : base, '_blank', 'noopener');
  toast(court ? 'Demande envoyée à ' + (S.ia === 'claude' ? 'Claude' : 'ChatGPT') + ' (et copiée : si elle n\'apparaît pas, colle-la avec Ctrl+V).' : 'Demande copiée : colle-la dans ' + (S.ia === 'claude' ? 'Claude' : 'ChatGPT') + ' avec Ctrl+V.');
}
var IA_INTRO = 'Je suis étudiant en BTS SIO (Services informatiques aux organisations), 2e année, en France. ';

/* Thèmes des épreuves sans annales (data/entrainement.js) : probabilité ESTIMÉE, pas calculée. */
var EST = {};
Object.keys(window.THEMES_PLUS || {}).forEach(function (id) { var t = THEMES_PLUS[id]; THEMES[id] = [t[0], t[1], t[2]]; EST[id] = { p: t[3], why: t[4] }; });
var EXP = window.EXPLIC || {};

var SUJETS = {}; ANNALES.sujets.forEach(function (s) { SUJETS[s.id] = s; });
/* Cas d'entraînement : même forme qu'un sujet d'annales, avec ent = true et des documents en HTML au lieu d'un PDF. */
var ENT = (window.CAS_ENT || []).map(function (c) {
  var s = { id: c.id, ent: true, anc: !!c.anc, off: !!c.off, mat: c.mat, epreuve: MATIERES[c.mat][2], option: MATIERES[c.mat][3] || '', annee: 0, cas: c.cas, contexte: c.contexte, html: c.docs, docs: {} };
  Object.keys(c.docs).forEach(function (k, i) { s.docs[k] = i + 1; });
  SUJETS[s.id] = s;
  return s;
});
var QUESTIONS = ANNALES.questions.concat([].concat.apply([], (window.CAS_ENT || []).map(function (c) {
  return c.questions.map(function (x) { return { id: c.id + '#' + x[0], sujet: c.id, num: x[0], dossier: '', mission: '', page: 0, contexte: '', texte: x[1], docs: Object.keys(c.docs), ent: x }; });
}))).map(function (q) {
  if (q.ent) {
    var x = q.ent; q.ent = true;
    q.themes = x[3].split(' ').filter(Boolean);
    q.mc = x[4].split(';').map(function (g) { return g.split('|').map(norm); });
    q.mcLabel = x[4].split(';').map(function (g) { return g.split('|')[0]; });
    q.corr = x[5]; q.precis = true;
    q.utiles = x[2].split(' ').filter(Boolean).map(function (n) { return 'Doc ' + n; });
    q.mats = [SUJETS[q.sujet].mat];
    return q;
  }
  var c = (CORRECTIONS[q.sujet] || {})[q.num];
  q.themes = c ? c[0].split(' ') : [];
  q.mc = c ? c[1].split(';').map(function (g) { return g.split('|').map(norm); }) : [];
  q.mcLabel = c ? c[1].split(';').map(function (g) { return g.split('|')[0]; }) : [];
  q.corr = c ? c[2] : '';
  /* q.utiles = documents nécessaires à la question (data/docs_questions.js) ; à défaut, les documents de sa partie. */
  var dq = (window.DOCS_Q && DOCS_Q[q.sujet] || {})[q.num], docs = SUJETS[q.sujet].docs;
  q.precis = dq != null;
  q.utiles = dq == null ? q.docs : dq.split(' ').filter(Boolean).map(function (code) {
    return Object.keys(docs).filter(function (k) { return k.split(' ')[1] === code; })[0];
  }).filter(Boolean);
  /* q.mats = matières touchées par la question (via ses thèmes) : sert aux moyennes par matière. */
  q.mats = q.themes.map(function (t) { return THEMES[t] && THEMES[t][1]; }).filter(function (m, i, a) { return m && a.indexOf(m) === i; });
  if (!q.mats.length) q.mats = [SUJETS[q.sujet].option === 'CEJM' ? 'eco' : 'cyber'];
  return q;
});
var QBYID = {}; QUESTIONS.forEach(function (q) { QBYID[q.id] = q; });
/* Mes contrôles : chaque contrôle devient un pseudo-sujet « K_<id> », ses questions et cartes sont reconstruites à chaque modification. */
var CTRLQ = {}, CTRLC = {};
function buildCtrl() {
  CTRLQ = {}; CTRLC = {};
  Object.keys(SUJETS).forEach(function (id) { if (SUJETS[id].ctrl) delete SUJETS[id]; });
  (S.ctrl || []).forEach(function (c) {
    SUJETS['K_' + c.id] = { id: 'K_' + c.id, ctrl: c.id, cas: c.titre, annee: 0, docs: {}, option: '' };
    (c.dossiers || []).forEach(function (d) {
      (d.qs || []).forEach(function (x, i) {
        var id = 'k_' + c.id + '_' + d.n + '_q' + i, mc = (x.motscles || []).map(String);
        CTRLQ[id] = { id: id, sujet: 'K_' + c.id, ctrl: c.id, num: d.n + '.' + (i + 1), dossier: '', mission: '', page: 0, contexte: '', texte: x.q, docs: [], utiles: [], precis: true,
          themes: [], mats: [], corr: x.correction || '', mc: mc.map(function (g) { return g.split('|').map(norm); }), mcLabel: mc.map(function (g) { return g.split('|')[0]; }) };
      });
      (d.cards || []).forEach(function (x, i) {
        var id = 'k_' + c.id + '_' + d.n + '_c' + i;
        CTRLC[id] = { id: id, mat: c.mat, ctrl: c.id, cat: c.titre + ' — dossier ' + d.n, imp: 2, titre: x.q, q: x.q, a: x.r || '', video: '', theme: '', ex: [x.explication || '', x.exemple || '', x.piege || ''] };
      });
    });
  });
}
buildCtrl();
function qById(id) { return QBYID[id] || CTRLQ[id]; }
function matLabel(m) { return m === 'mesreal' ? 'Mes réalisations' : MATIERES[m] ? MATIERES[m][0] : 'Autre matière'; }
/* Matière à laquelle compter l'oral sur ses réalisations (E5 ou E6 selon l'option). */
function realMat() { var r = oral && oral.rid && (S.reals || []).filter(function (x) { return x.id === oral.rid; })[0]; return r && r.ep === 'E5' ? 'e5' : S.option === 'SLAM' ? 'e6slam' : 'e6sisr'; }
var NOT = NOTIONS.map(function (n) { return { id: n[0], mat: n[1], cat: n[2], imp: n[3], titre: n[4], q: n[5], a: n[6], theme: n[7] || (window.NOTION_THEME || {})[n[0]] || '', video: n[8] }; });
var session = null;   // étude de cas en cours (non sauvegardée ; les réponses validées, elles, le sont)
var flash = null;     // paquet de flashcards en cours

/* ───────── 3) Calculs et composants communs ───────── */
function matOK(m) { var o = MATIERES[m][3]; return !o || !S.option || o === S.option; }
function sujOK(s) { return s.ctrl ? true : s.ent ? matOK(s.mat) : (s.option === 'CEJM' || !S.option || s.option === S.option); }
function mesNotions() { return NOT.filter(function (n) { return matOK(n.mat); }); }
function mesQuestions() { return QUESTIONS.filter(function (q) { return sujOK(SUJETS[q.sujet]); }); }
function matsOf(ep) { return Object.keys(MATIERES).filter(function (m) { return MATIERES[m][2] === ep && matOK(m); }); }
function sujetLabel(s) { return s.ctrl ? 'Contrôle — ' + s.cas : s.ent ? 'Entraînement ' + EP_COURT[s.epreuve] + (s.option ? ' ' + s.option : '') + ' — ' + s.cas : (s.option === 'CEJM' ? 'E4 CEJM' : 'E7 ' + s.option) + ' ' + s.annee + (s.autre ? ' (autres BTS)' : '') + ' — ' + s.cas; }
function sujetKind(s) { return s.ent ? 'mat:' + s.mat : s.option; }   // valeur du filtre « Épreuve » de l'étude de cas
function sujetsFor(mat) {   // sujets concernés par une matière (dénominateur des fréquences)
  return ANNALES.sujets.filter(function (s) {
    if (s.autre || !sujOK(s)) return false;   // sujet d'un autre BTS : pas compté dans les fréquences
    if (mat === 'sisr') return s.option === 'SISR';
    if (mat === 'slam') return s.option === 'SLAM';
    if (mat === 'cyber') return s.option !== 'CEJM';
    return s.option === 'CEJM';
  });
}
var THEME_STATS = {};
function niveauDe(r) { return r >= 0.8 ? 'Très fréquent' : r >= 0.6 ? 'Fréquent' : r >= 0.4 ? 'Régulier' : 'Peu fréquent'; }
function refreshThemeStats() { Object.keys(THEMES).forEach(function (id) {
  if (EST[id]) {   // pas d'annales : probabilité estimée, nombre de questions d'entraînement disponibles
    THEME_STATS[id] = { id: id, est: true, n: 0, total: 0, ratio: EST[id].p, annees: [], niveau: 'À travailler',
      nq: QUESTIONS.filter(function (q) { return q.themes.indexOf(id) >= 0; }).length };
    return;
  }
  var pool = sujetsFor(THEMES[id][1]).map(function (s) { return s.id; });
  var qs = QUESTIONS.filter(function (q) { return q.themes.indexOf(id) >= 0 && pool.indexOf(q.sujet) >= 0; });
  var suj = {}; qs.forEach(function (q) { suj[q.sujet] = 1; });
  var n = Object.keys(suj).length, ratio = pool.length ? n / pool.length : 0;
  var annees = Object.keys(suj).map(function (x) { return SUJETS[x].annee; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  /* nq compte aussi les questions d'entraînement qui portent ce thème (pour le bouton « S'entraîner ») */
  THEME_STATS[id] = { id: id, n: n, total: pool.length, ratio: ratio, nq: QUESTIONS.filter(function (q) { return q.themes.indexOf(id) >= 0; }).length, annees: annees, niveau: niveauDe(ratio) };
}); }
refreshThemeStats();
function themeTag(id) {
  if (!id || !THEMES[id]) return '';
  var st = THEME_STATS[id];
  if (st.est) return '<span class="tag acc" title="Priorité de révision indicative, sans probabilité prédictive">' + esc(THEMES[id][0]) + ' · ' + st.niveau.toLowerCase() + '</span>';
  return '<span class="tag acc" title="Thème présent dans ' + st.n + ' sujet(s) d\'annales sur ' + st.total + '">' + esc(THEMES[id][0]) + ' · ' + st.n + '/' + st.total + '</span>';
}
function videoLink(n) {
  return n.video ? '<a class="btn ghost small" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(n.video) + '">▶ Vidéos</a>' : '';
}
/* Note automatique : part des groupes de mots-clés retrouvés dans la réponse (0 à 1). */
function autoScore(q, answer) {
  var a = norm(answer), found = [], missing = [];
  q.mc.forEach(function (alts, i) { (alts.some(function (w) { return w && (/^[a-z0-9]{1,3}$/.test(w) ? new RegExp('(^|[^a-z0-9])' + w + '($|[^a-z0-9])').test(a) : a.indexOf(w) >= 0); }) ? found : missing).push(q.mcLabel[i]); });
  return { score: q.mc.length ? found.length / q.mc.length : 0, found: found, missing: missing };
}
/* Visionneuse PDF. Paramètres d'URL compris par Chrome, Edge et Firefox :
   view=FitH = largeur de la page ; zoom=150 = 150 % ; navpanes=0 / pagemode=none = masque la colonne des miniatures. */
var ZOOMS = ['', 100, 125, 150, 175, 200];
function pdfUrl(s, page) { return s.fichier + '#page=' + page + (S.zoom ? '&zoom=' + S.zoom : '&view=FitH') + '&navpanes=0&pagemode=none'; }
function viewerBar(label, extra) {
  return '<div class="pdfbar"><span class="pdftitle">' + label + '</span><span class="pdftools">' +
    '<button class="btn ghost small" data-a="zoom" data-v="-1" title="Réduire">A−</button><span class="small zl">' + (S.zoom ? S.zoom + ' %' : 'Largeur') + '</span><button class="btn ghost small" data-a="zoom" data-v="1" title="Agrandir">A+</button>' +
    '<button class="btn ghost small" data-a="layout" title="Changer la disposition">' + (S.layout === 'cote' ? 'Document en dessous' : 'Document à côté') + '</button>' +
    '<button class="btn ghost small" data-a="fullscreen" title="Afficher le document en plein écran (Échap pour sortir)">Plein écran</button>' + (extra || '') + '</span></div>';
}
function pdfFrame(sid, page) {
  var s = SUJETS[sid];
  /* Sur téléphone, les navigateurs n'affichent pas un PDF dans un cadre : on propose de l'ouvrir. */
  if (window.matchMedia && matchMedia('(pointer: coarse)').matches && window.innerWidth < 900)
    return '<div class="docbody mobpdf"><p><b>' + esc(sujetLabel(s)) + '</b></p><p>Sur téléphone, le sujet s\'ouvre dans la visionneuse PDF.</p><a class="btn" target="_blank" rel="noopener" href="' + s.fichier + '#page=' + page + '">Ouvrir la page ' + page + ' du sujet</a></div>';
  return viewerBar(esc(sujetLabel(s)) + ' — page ' + page, '<a class="btn ghost small" target="_blank" rel="noopener" href="' + pdfUrl(s, page) + '">Nouvel onglet</a>') +
    '<iframe title="Sujet au format PDF" src="' + pdfUrl(s, page) + '"></iframe>';
}
/* Document d'un cas d'entraînement : du texte HTML, affiché en grand, zoomable comme le PDF. */
function docFrame(sid, key) {
  var s = SUJETS[sid], html = key === 'ctx' ? '<h4>Contexte du cas</h4><p>' + esc(s.contexte) + '</p>' : s.html[key];
  return viewerBar(esc(s.cas) + ' — ' + (key === 'ctx' ? 'Contexte' : esc(key.replace('Doc ', 'Document ')))) +
    '<div class="docbody" style="font-size:' + (S.zoom ? S.zoom / 100 : 1.1) + 'rem">' + html + '</div>';
}
function dueCards(mat, ep) {
  var now = Date.now();
  return mesNotions().filter(function (n) { return !S.learned[n.id] && (!mat || n.mat === mat) && (!ep || MATIERES[n.mat][2] === ep) && (!S.cards[n.id] || S.cards[n.id].d <= now); })
    .sort(function (a, b) { return b.imp - a.imp; });
}
/* Rythme de révision : algorithme FSRS-6, transcrit de l'implémentation de référence py-fsrs (open-spaced-repetition, paramètres par défaut).
   État d'une carte S.cards[id] = { s: stabilité (jours), k: difficulté (1 à 10), last: dernière révision (ms), d: prochaine échéance (ms), n: révisions, lapses: oublis }.
   Notes : 0 = Pas encore (Again), 1 = Difficile (Hard), 2 = Bien (Good), 3 = Facile (Easy).
   « Pas encore » remet la carte dans la séance (pas d'étapes d'apprentissage en minutes) ; les révisions le même jour utilisent la stabilité « court terme » de FSRS.
   Les anciennes cartes (boîtes 1-3-7-14 j ou rythme simplifié) sont reprises : leur intervalle devient la stabilité, difficulté moyenne 5. */
var FSRS_W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
var FSRS_DECAY = -FSRS_W[20], FSRS_FACTOR = Math.pow(0.9, 1 / FSRS_DECAY) - 1;
var FSRS = {
  clampD: function (d) { return Math.min(Math.max(d, 1), 10); },
  clampS: function (s) { return Math.max(s, 0.001); },
  R: function (t, s) { return Math.pow(1 + FSRS_FACTOR * t / s, FSRS_DECAY); },
  initS: function (r) { return FSRS.clampS(FSRS_W[r - 1]); },
  initD: function (r, clamp) { var d = FSRS_W[4] - Math.exp(FSRS_W[5] * (r - 1)) + 1; return clamp ? FSRS.clampD(d) : d; },
  nextD: function (d, r) {
    var delta = -(FSRS_W[6] * (r - 3)), d2 = d + (10 - d) * delta / 9;
    return FSRS.clampD(FSRS_W[7] * FSRS.initD(4, false) + (1 - FSRS_W[7]) * d2);
  },
  shortS: function (s, r) { var inc = Math.exp(FSRS_W[17] * (r - 3 + FSRS_W[18])) * Math.pow(s, -FSRS_W[19]); if (r >= 2) inc = Math.max(inc, 1); return FSRS.clampS(s * inc); },
  recallS: function (d, s, R, r) {
    var hp = r === 2 ? FSRS_W[15] : 1, eb = r === 4 ? FSRS_W[16] : 1;
    return FSRS.clampS(s * (1 + Math.exp(FSRS_W[8]) * (11 - d) * Math.pow(s, -FSRS_W[9]) * (Math.exp((1 - R) * FSRS_W[10]) - 1) * hp * eb));
  },
  forgetS: function (d, s, R) {
    return FSRS.clampS(Math.min(FSRS_W[11] * Math.pow(d, -FSRS_W[12]) * (Math.pow(s + 1, FSRS_W[13]) - 1) * Math.exp((1 - R) * FSRS_W[14]), s / Math.exp(FSRS_W[17] * FSRS_W[18])));
  },
  interval: function (s, ret) { return Math.min(Math.max(Math.round(s / FSRS_FACTOR * (Math.pow(ret, 1 / FSRS_DECAY) - 1)), 1), 36500); }
};
function fsrsReview(c, r, now) {   // r = 1 (Again) à 4 (Easy), comme dans FSRS ; renvoie le nouvel état
  var ret = S.retention || 0.9, st;
  if (!c || c.s == null && c.b == null) st = { s: FSRS.initS(r), k: FSRS.initD(r, true) };
  else {
    var s = c.k != null ? c.s : (c.s != null ? Math.max(c.s, 0.5) : [0.5, 1, 3, 7, 14][c.b || 0]), k = c.k != null ? c.k : 5;
    var last = c.last || (c.d ? c.d : now) - s * DAY, t = Math.max(0, Math.floor((now - last) / DAY));   // ancienne carte : on suppose qu'elle arrive à échéance
    s = t < 1 ? FSRS.shortS(s, r) : (r === 1 ? FSRS.forgetS(k, s, FSRS.R(t, s)) : FSRS.recallS(k, s, FSRS.R(t, s), r));
    st = { s: s, k: FSRS.nextD(k, r) };
  }
  var ivl = r === 1 ? 0 : FSRS.interval(st.s, ret);
  st.last = now; st.d = now + ivl * DAY; st.ivl = ivl; st.n = (c && c.n || 0) + 1; st.lapses = (c && c.lapses || 0) + (r === 1 && c && c.n ? 1 : 0);
  return st;
}
function nextCardState(c, g) { return fsrsReview(c, g + 1, Date.now()); }   // g : 0 = Pas encore … 3 = Facile
function fmtJours(s) { return s < 1 ? 'tout de suite' : s < 1.5 ? '1 jour' : s < 30 ? Math.round(s) + ' jours' : s < 60 ? '1 mois' : Math.round(s / 30) + ' mois'; }
/* Mélange les matières (alternance des sujets) en gardant l'ordre d'importance dans chaque matière. */
function interleave(list) {
  var g = {}, order = []; list.forEach(function (n) { if (!g[n.mat]) { g[n.mat] = []; order.push(n.mat); } g[n.mat].push(n); });
  var out = [], k = 0; while (out.length < list.length) { order.forEach(function (m) { if (g[m][k]) out.push(g[m][k]); }); k++; }
  return out;
}
/* Sélecteur commun « épreuve puis matière » (bibliothèque, flashcards, thèmes à réviser).
   opt.all : ajoute « Tout » ; opt.sub : affiche la 2e ligne des matières ; opt.count(ep, mat) : nombre affiché dans la puce. */
function picker(opt) {
  var h = '<div class="chips" role="group" aria-label="Épreuve">' + (opt.all ? '<button class="chip' + (!S.ep ? ' on' : '') + '" data-a="setep" data-v="" title="Toutes les matières mélangées : l\'alternance aide à mieux retenir">Tout mélangé' + (opt.count ? ' <i>' + opt.count('', '') + '</i>' : '') + '</button>' : '');
  Object.keys(EPREUVES).forEach(function (ep) {
    if (opt.only && opt.only.indexOf(ep) < 0) return;
    h += '<button class="chip' + (S.ep === ep ? ' on' : '') + '" data-a="setep" data-v="' + ep + '">' + EP_COURT[ep] + (opt.count ? ' <i>' + opt.count(ep, '') + '</i>' : '') + '</button>';
  });
  h += '</div>';
  var mats = S.ep ? matsOf(S.ep) : [];
  if (opt.sub && mats.length > 1) {
    h += '<div class="chips sub" role="group" aria-label="Matière">' + mats.map(function (m) {
      return '<button class="chip' + (S.mat === m ? ' on' : '') + '" data-a="setmat" data-v="' + m + '">' + esc(MATIERES[m][4]) + (opt.count ? ' <i>' + opt.count(S.ep, m) + '</i>' : '') + '</button>';
    }).join('') + '</div>';
  }
  if (S.ep) h += '<p class="small muted epinfo"><b>' + esc(EPREUVES[S.ep][0]) + '</b> — ' + esc(EPREUVES[S.ep][1]) + ' · coefficient ' + EPREUVES[S.ep][2] + '</p>';
  return h;
}
function fixSel() {   // garde S.ep / S.mat cohérents avec l'option choisie
  if (S.ep && !Object.prototype.hasOwnProperty.call(EPREUVES, S.ep)) S.ep = 'E7';
  if (S.ep) { var m = matsOf(S.ep); if (m.indexOf(S.mat) < 0) S.mat = m[0]; }
}

/* ───────── 4) Pages ───────── */
var V = {};
function pageHead(t, sub) { return '<header class="ph"><h1>' + esc(t) + '</h1>' + (sub ? '<p class="lead">' + sub + '</p>' : '') + '</header>'; }

/* Icônes (traits SVG 24×24) et menu latéral, construit ici pour rester rangé au même endroit. */
var ICO = {
  accueil: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', express: 'M13 2 4 14h7l-1 8 9-12h-7z',
  flash: 'M7 3h13v14H7z M4 7v14h13', erreurs: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z M9 9l4 4 M13 9l-4 4',
  controles: 'M9 3h6v3H9z M7 5H5v16h14V5h-2 M9 13l2 2 4-4', cas: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h6',
  examen: 'M12 9v4l3 2 M9 2h6 M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16', oral: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3 M5 11a7 7 0 0 0 14 0 M12 18v3',
  biblio: 'M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z', fiches: 'M6 9V3h12v6 M6 18H4v-7h16v7h-2 M6 14h12v7H6z',
  methode: 'M4 20h4L19 9l-4-4L4 16z M14 6l4 4', pronos: 'M3 17l6-6 4 4 8-8 M15 7h6v6', tp: 'M4 5h16v14H4z M7 9l3 3-3 3 M12 15h5',
  qcm: 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9', exos: 'M4 4h16v16H4z M8 8h3 M8 12h8 M8 16h5 M14 7l2 2-2 2',
  matieres: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  realisations: 'M4 4h16v12H4z M8 20h8 M12 16v4 M8 9l2 2 4-4', planning: 'M4 5h16v16H4z M4 9h16 M8 3v4 M16 3v4 M8 13h3 M8 17h3',
  pentest: 'M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z M9 12l2 2 4-4',
  erreursfreq: 'M12 3 2 20h20z M12 10v4 M12 17h.01', python: 'M8 6 3 12l5 6 M16 6l5 6-5 6 M13.5 4l-3 16',
  glossaire: 'M4 19V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2 M8 7h6 M8 11h4',
  annales: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4', notes: 'M4 20V10 M10 20V4 M16 20v-7 M3 20h18', suivi: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21a8 8 0 0 1 16 0'
};
function epTitre(ep) { return ep !== 'E6' ? EPREUVES[ep][0] : S.option === 'SLAM' ? 'Conception et développement d\'applications' : S.option === 'SISR' ? 'Administration des systèmes et des réseaux' : 'Épreuve pratique SISR / SLAM'; }
function ico(k) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICO[k] || '') + '"/></svg>'; }
var NAV = [
  ['', [['accueil', 'Tableau de bord'], ['matieres', 'Mes matières'], ['flash', 'Flashcards'], ['cas', 'Étude de cas']]],
  ['Réviser', [['express', 'Révision express'], ['seance', 'Séance guidée'], ['erreurs', 'Carnet d\'erreurs'], ['controles', 'Mes contrôles']]],
  ['S\'entraîner', [['examen', 'Examen blanc'], ['oral', 'Simulateur d\'oral'], ['realisations', 'Mes réalisations (E5/E6)'], ['qcm', 'QCM rapide'], ['exos', 'Exercices'], ['ecoute', 'Écouter en anglais']]],
  ['Cours et fiches', [['biblio', 'Bibliothèque de notions'], ['pentest', 'Tests d\'intrusion (pentest)'], ['python', 'Maths et Python (E3)'], ['erreursfreq', 'Erreurs fréquentes'], ['glossaire', 'Glossaire des sigles'], ['fiches', 'Fiches à imprimer'], ['methode', 'Méthode de rédaction']]],
  ['Annales et ressources', [['annales', 'Sujets et corrections'], ['pronos', 'Thèmes à réviser'], ['tp', 'TP SISR'], ['relecture', 'Relire les corrections'], ['horsligne', 'Préparer le hors-ligne']]],
  ['Organisation', [['planning', 'Mon planning'], ['notes', 'Mes notes'], ['suivi', 'Réglages et sauvegarde']]]
];
/* Menu repliable (divulgation progressive) : seul le groupe de la page en cours est ouvert, les autres se déplient au clic. */
var navOpen = {}, curRoute = 'accueil';
var NAV_ALIAS = { apprises: 'biblio', matiere: 'matieres', notion: 'biblio', question: 'annales' };
function groupOf(r) { r = NAV_ALIAS[r] || r; var g = NAV.filter(function (x) { return x[1].some(function (y) { return y[0] === r; }); })[0]; return g ? g[0] : ''; }
function isNavOpen(g) { return !g || (navOpen[g] != null ? navOpen[g] : groupOf(curRoute) === g); }
function renderNav() {
  $('#nav').innerHTML = NAV.map(function (g) {
    var items = g[1].filter(function (x) { return x[0] !== 'tp' || S.option !== 'SLAM'; }), open = isNavOpen(g[0]);
    return (g[0] ? '<button class="navt' + (open ? ' open' : '') + '" data-a="navg" data-v="' + g[0] + '" aria-expanded="' + open + '"><span>' + g[0] + '</span><i>' + items.length + '</i></button>' : '') +
      (open ? items.map(function (x) {
        var badge = x[0] === 'flash' ? dueCards().length : x[0] === 'erreurs' ? questionsErreurs().length + carteErreurs().length : 0;
        return '<a href="#' + x[0] + '" data-r="' + x[0] + '">' + ico(x[0]) + '<span>' + x[1] + '</span>' + (badge ? '<i class="nb">' + badge + '</i>' : '') + '</a>';
      }).join('') : '');
  }).join('');
}
function markNav() { var rr = NAV_ALIAS[curRoute] || curRoute; document.querySelectorAll('nav a').forEach(function (a) { a.classList.toggle('on', a.dataset.r === rr); if (a.dataset.r === rr) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }

V.accueil = function () {
  var nots = mesNotions(), learned = nots.filter(function (n) { return S.learned[n.id]; }).length;
  var jours = daysUntil(S.exam), nm = notesMatieres(), mg = moyenneGenerale(notesEpreuves(nm)), due = dueCards().length;
  var h = new Date().getHours(), salut = h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour';
  var action = function (href, k, t, sub, main) { return '<a class="action' + (main ? ' main' : '') + '" href="' + href + '">' + ico(k) + '<b>' + t + '</b><span>' + sub + '</span></a>'; };
  return '<section class="hero"><div class="hero-copy"><p class="eyebrow">TON ESPACE DE RÉVISION · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><h1>' + salut + ', on progresse ?</h1>' +
      '<p class="lead">BTS SIO 2e année' + (S.option ? ', option ' + S.option : '') + '. Un peu chaque jour, plus de confiance à l’examen.</p><a class="btn hero-cta" href="#express">Lancer ma révision express <span aria-hidden="true">↗</span></a><span class="hero-duration">10 minutes · 3 étapes</span></div>' +
      '<div class="kpis"><a href="#suivi" class="kpi"><b>' + (jours != null ? (jours > 0 ? 'J-' + jours : jours === 0 ? 'Jour J' : 'Terminé') : '—') + '</b><span>' + (jours != null ? (jours < 0 ? 'date d’examen passée' : 'avant l\'examen') : 'date d\'examen à indiquer') + '</span></a>' +
      '<a href="#notes" class="kpi"><b>' + serie() + '<small> j</small></b><span>de révision d\'affilée</span></a>' +
      '<a href="#notes" class="kpi"><b>' + (mg ? sur20(mg.note) : '—') + '<small>/20</small></b><span>moyenne d’entraînement</span></a>' +
      '<a href="#biblio" class="kpi"><b>' + learned + '<small>/' + nots.length + '</small></b><span>notions apprises</span></a></div></section>' +
    (!S.option ? '<div class="card hint"><b>Quelle est ton option ?</b><p class="small muted">L\'application masquera tout ce qui concerne l\'autre option. Modifiable à tout moment en haut de la page.</p><div class="row"><button class="btn" data-a="setoption" data-v="SISR">SISR — réseaux et systèmes</button><button class="btn" data-a="setoption" data-v="SLAM">SLAM — développement</button></div></div>' : '') +
    (study ? study.home() : '') + rappelSauvegarde() + objectifDuJour() +
    '<div class="actions">' + action('#erreurs', 'erreurs', 'Mes erreurs', 'comprendre et progresser') + action('#flash', 'flash', 'Flashcards', due ? due + ' à revoir' : 'tout est à jour') +
      action('#cas', 'cas', 'Étude de cas', 'une note sur 20') + action('#examen', 'examen', 'Examen blanc', 'sujet complet chronométré') + '</div>' +
    '<h2>Mes épreuves</h2><div class="epgrid">' +
    Object.keys(EPREUVES).map(function (ep) {
      var ln = nots.filter(function (n) { return MATIERES[n.mat][2] === ep; }), la = ln.filter(function (n) { return S.learned[n.id]; }).length;
      var ms = Object.keys(nm).filter(function (m) { return nm[m].ep === ep && nm[m].note != null; }), note = ms.length ? ms.reduce(function (t, m) { return t + nm[m].note; }, 0) / ms.length : null;
      var ns = ANNALES.sujets.filter(function (s) { return sujOK(s) && (ep === 'E7' ? s.option !== 'CEJM' : ep === 'E4' ? s.option === 'CEJM' : false); }).length;
      var nent = ENT.filter(function (s) { return sujOK(s) && s.epreuve === ep; }).length;
      return '<div class="card epc"><div class="row sp"><span class="code">' + ep + '</span><span class="small muted">coef. ' + EPREUVES[ep][2] + '</span></div>' +
        '<b class="ept">' + esc(epTitre(ep)) + '</b>' +
        '<span class="small muted">' + esc(EPREUVES[ep][1]) + '</span>' +
        '<div class="epm"><span>' + la + '/' + ln.length + ' notions</span><span>' + (ns ? ns + ' sujets' : nent + ' cas d\'entraînement') + '</span><span>' + (note != null ? noteTag(note) + '/20' : '<span class="muted">pas de note</span>') + '</span></div>' +
        '<div class="bar"><i style="width:' + (ln.length ? la / ln.length * 100 : 0) + '%"></i></div>' +
        '<div class="row"><a class="btn small" href="' + (matsOf(ep).length === 1 ? '#matiere/' + matsOf(ep)[0] : '#matieres') + '">Ouvrir</a><button class="btn ghost small" data-a="goep" data-v="' + ep + '" data-to="flash">Flashcards</button><button class="btn ghost small" data-a="goep" data-v="' + ep + '" data-to="pronos">Thèmes</button></div></div>';
    }).join('') + '</div>';
};

/* — Étude de cas aléatoire — */
V.cas = function (mode, arg) {
  if (mode === 'theme' && arg && THEMES[arg] && !(session && session.theme === arg)) startSession({ theme: arg, n: 5 });
  if (!session) {
    var kinds = [['SISR', 'E7 Cybersécurité — SISR (annales)', 'SISR'], ['SLAM', 'E7 Cybersécurité — SLAM (annales)', 'SLAM'], ['CEJM', 'E4 CEJM (annales)', '']]
      .concat(Object.keys(MATIERES).filter(function (m) { return ENT.some(function (s) { return s.mat === m; }); })
        .map(function (m) { return ['mat:' + m, MATIERES[m][0] + ' (entraînement)', MATIERES[m][3]]; }))
      .filter(function (k) { return !k[2] || !S.option || k[2] === S.option; });
    return '<h1>Étude de cas aléatoire</h1><p class="lead">L\'application tire un sujet au hasard, puis des questions de ce sujet. Tu réponds avec les documents sous les yeux ; ta réponse est enregistrée, notée d\'après les éléments attendus, et tu ajustes la note après avoir lu la correction.</p>' +
      '<div class="card"><div class="filters">' +
        '<label>Épreuve<select id="cEp"><option value="">Toutes</option>' + kinds.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + '</option>'; }).join('') + '</select></label>' +
        '<label>Sujet<select id="cSu"><option value="">Au hasard</option>' + ANNALES.sujets.concat(ENT).filter(sujOK).map(function (s) { return '<option value="' + s.id + '" data-k="' + sujetKind(s) + '">' + esc(sujetLabel(s)) + '</option>'; }).join('') + '</select></label>' +
        '<label>Nombre de questions<select id="cN"><option>3</option><option selected>5</option><option>8</option><option value="99">Tout le sujet</option></select></label>' +
        '<button class="btn" data-a="start">Lancer une étude de cas</button>' +
      '</div><p class="small muted"><b>E7 et E4</b> : vrais sujets d\'examen (annales 2022 à 2026). <b>Autres épreuves</b> : cas d’entraînement, sujets officiels de culture générale et anciennes annales de maths (format antérieur). Les corrections proposées sont non officielles. Pour travailler un seul thème, passe par « Thèmes à réviser ».</p></div>';
  }
  if (session.fini) return viewBilan();
  var it = session.items[session.i], q = it.q, s = SUJETS[q.sujet];
  var nomDoc = function (k) { return k.replace('Doc ', 'Document '); };
  var cur = session.doc || (s.ent ? (q.utiles[0] || 'ctx') : '');
  var docBtns = s.ctrl ? '' : s.ent
    ? '<button class="btn ghost small' + (cur === 'ctx' ? ' on' : '') + '" data-a="doc" data-k="ctx">Contexte du cas</button>' +
      Object.keys(s.html).map(function (k) { var u = q.utiles.indexOf(k) >= 0; return '<button class="btn small ' + (cur === k ? 'on' : u ? 'need' : 'ghost') + '" data-a="doc" data-k="' + k + '" title="' + (u ? 'Utile pour cette question' : 'Document du cas') + '">' + esc(nomDoc(k)) + (u ? ' ★' : '') + '</button>'; }).join('') +
      '<span class="docs-end"><button class="btn ghost small" data-a="togglepdf">' + (session.pdf ? 'Masquer les documents' : 'Afficher les documents') + '</button></span>'
    : '<button class="btn ghost small" data-a="pdf" data-p="' + q.page + '">Énoncé</button>' +
      '<button class="btn ghost small" data-a="pdf" data-p="' + (s.option === 'CEJM' ? 2 : 3) + '">Contexte du cas</button>' +
      q.utiles.map(function (k) { return '<button class="btn small on" data-a="pdf" data-p="' + s.docs[k] + '" title="Page ' + s.docs[k] + ' du sujet">' + esc(nomDoc(k)) + '</button>'; }).join('') +
      (q.precis && !q.utiles.length ? '<span class="small muted">Aucun document nécessaire pour cette question.</span>' : '') +
      '<span class="docs-end"><a class="small" target="_blank" rel="noopener" href="' + s.fichier + '">Sujet complet</a>' +
      '<button class="btn ghost small" data-a="togglepdf">' + (session.pdf ? 'Masquer le PDF' : 'Afficher le PDF') + '</button></span>';
  var h = '<div class="row sp"><h1>' + esc(session.titre) + '</h1><button class="btn ghost small" data-a="quit">Abandonner</button></div>' +
    '<p class="muted">Question ' + (session.i + 1) + ' sur ' + session.items.length + ' · ' + esc(sujetLabel(s)) + '</p>' +
    '<div class="split ' + (session.pdf && !s.ctrl ? (S.layout === 'cote' ? 'cote' : 'stack') : 'nopdf') + '"><div>' +
    '<div class="card">' +
      (s.ent ? (session.i === 0 ? '<div class="ctx">' + esc(s.contexte) + '</div>' : '') : '<p class="small muted where">' + esc(q.dossier ? q.dossier + (q.mission ? ' › ' + q.mission : '') : q.mission) + '</p>') +
      (q.contexte ? '<div class="ctx">' + esc(q.contexte) + '</div>' : '') +
      '<p class="qtext">Question ' + esc(q.num) + ' — ' + esc(q.texte) + '</p>' +
      '<div class="row docs">' + docBtns + '</div>' +
      '<div class="row" style="margin:-.3rem 0 .9rem"><button class="btn ghost small' + (session.ex ? ' on' : '') + '" data-a="qexo">' + (session.ex ? 'Masquer l\'exemple' : 'Exemple') + '</button></div>' + (session.ex ? exemplesQuestion(q) : '');
  if (!it.valide) {
    h += '<label class="small muted" for="rep">Ta réponse</label><textarea id="rep" placeholder="Rédige ta réponse comme à l\'examen…">' + esc(it.rep || '') + '</textarea>' +
      '<div class="row conf"><span class="small muted">Avant la correction, tu es :</span><button class="chip' + (it.conf === 1 ? ' on' : '') + '" data-a="conf" data-v="1">Sûr de moi</button><button class="chip' + (it.conf === 0 ? ' on' : '') + '" data-a="conf" data-v="0">Pas sûr</button></div>' +
      '<div class="row" style="margin-top:.7rem"><button class="btn" data-a="valider">Valider ma réponse</button><button class="btn ghost" data-a="passer">Je ne sais pas</button></div>';
  } else {
    var pct = Math.round(it.note * 100), cls = pct >= 70 ? 'good' : pct >= 40 ? 'mid' : 'bad';
    var surFaux = it.conf === 1 && pct < 50;
    var msg = !it.rep ? 'Pas de souci, c\'est en s\'entraînant qu\'on apprend : lis la correction tranquillement.'
      : pct >= 70 ? 'Très bien, l\'essentiel y est.' : pct >= 40 ? 'Bon début : il manque quelques éléments, regarde-les ci-dessous.' : 'Pas encore tout à fait : la correction va t\'aider à compléter.';
    h += '<div class="corr"><b class="small">Ta réponse</b><p style="white-space:pre-wrap">' + (it.rep ? esc(it.rep) : '<span class="muted">(pas de réponse)</span>') + '</p></div>' +
      '<div class="verdict ' + cls + '"><b>' + sur20(it.note) + ' / 20 — ' + msg + '</b>' + (surFaux ? '<div class="small">Tu étais sûr de toi : lis bien la correction, une erreur faite avec assurance se corrige très bien quand on comprend pourquoi. Elle est en tête de ton carnet d\'erreurs.</div>' : '') +
      (q.mc.length ? '<div class="small">Note automatique : ' + it.auto.found.length + ' élément(s) attendu(s) retrouvé(s) sur ' + q.mc.length + '.</div>' : '') + '</div>' +
      (q.mc.length ? '<div class="kw">' + it.auto.found.map(function (w) { return '<span class="tag good">✓ ' + esc(w) + '</span>'; }).join('') + it.auto.missing.map(function (w) { return '<span class="tag">à ajouter : ' + esc(w) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="corr"><b class="small">Correction proposée (non officielle)</b><p style="white-space:pre-wrap">' + esc(q.corr || 'Pas de correction rédigée pour cette question.') + '</p>' + (study ? study.trace(q) : '') + '<div class="row">' + q.themes.map(themeTag).join('') + '</div></div>' +
      '<div class="row">' + iaBtn('corr', iaCorrige(q, it.rep), 'Faire corriger par l\'IA + réponse modèle') + '</div>' +
      (q.mats && ERR[q.mats[0]] ? '<details class="more"><summary>Erreurs fréquentes en ' + esc(MATIERES[q.mats[0]][4]) + '</summary><div class="cols">' + erreursDe(q.mats[0], 3).map(erreurItem).join('') + '</div><a class="small" href="#erreursfreq">Toutes les erreurs fréquentes</a></details>' : '') + memoBox(q.id, 'Ma note sur cette question : ce que j\'avais oublié, la bonne méthode…') +
      '<p class="small muted">La note automatique ne compare que des mots-clés : si tu as dit la même chose avec d\'autres mots, remonte ta note. Après lecture de la correction :</p>' +
      '<div class="row">' + [[0, 'Faux'], [0.25, 'Peu'], [0.5, 'Moitié'], [0.75, 'Presque'], [1, 'Tout bon']].map(function (o) { return '<button class="btn ghost small' + (Math.abs(it.note - o[0]) < 0.13 ? ' on' : '') + '" data-a="self" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:1rem"><button class="btn" data-a="suivant">' + (session.i + 1 < session.items.length ? 'Question suivante' : 'Voir ma note') + '</button></div>';
  }
  h += '</div></div>' + (session.pdf && !s.ctrl ? '<div class="pdf' + (s.ent ? ' txt' : '') + '" id="pdf">' + (s.ent ? docFrame(q.sujet, cur) : pdfFrame(q.sujet, session.page || q.page)) + '</div>' : '') + '</div>';
  return h;
};
function startSession(o) {
  var pool, titre;
  if (o.ids) {
    pool = shuffle(o.ids.map(qById).filter(Boolean)).slice(0, o.n || 99);
    titre = o.titre || 'Carnet d\'erreurs';
  } else if (o.theme) {
    pool = shuffle(mesQuestions().filter(function (q) { return q.themes.indexOf(o.theme) >= 0; })).slice(0, o.n);
    titre = (o.pretest ? 'Prétest : ' : 'Entraînement : ') + THEMES[o.theme][0];
  } else {
    var cands = ANNALES.sujets.concat(ENT).filter(function (s) { return o.sujet ? s.id === o.sujet : (sujOK(s) && (!o.ep || sujetKind(s) === o.ep)); });
    var s = pick(cands), all = QUESTIONS.filter(function (q) { return q.sujet === s.id; });
    var chosen = {}; shuffle(all).slice(0, o.n).forEach(function (q) { chosen[q.id] = 1; });
    pool = all.filter(function (q) { return chosen[q.id]; });   // on garde l'ordre du sujet
    titre = 'Étude de cas : ' + s.cas;
  }
  session = { pretest: o.pretest ? (o.theme ? '#biblio/theme/' + o.theme : '#biblio') : '', titre: titre, theme: o.theme || '', items: pool.map(function (q) { return { q: q, rep: '', valide: false, note: 0 }; }), i: 0, pdf: true, page: 0, doc: '', fini: false };
}
function viewBilan() {
  var n = session.items.length, moy = session.items.reduce(function (t, it) { return t + it.note; }, 0) / n, note = moy * 20;
  var cls = note >= 14 ? 'good' : note >= 10 ? 'mid' : 'bad';
  var faibles = {}; session.items.forEach(function (it) { if (it.note < 0.5) it.q.themes.forEach(function (t) { faibles[t] = 1; }); });
  if (session.pretest) return '<h1>' + esc(session.titre) + '</h1><div class="verdict mid"><div class="note20">' + sur20(moy) + ' / 20</div><b>C\'était un prétest : la note ne compte pas vraiment. Le fait d\'avoir cherché les réponses avant de lire le cours va t\'aider à mieux retenir.</b></div>' +
    '<p>Maintenant, lis les notions de ce thème, puis reviens t\'entraîner dans quelques jours.</p><div class="row"><a class="btn" href="' + session.pretest + '">Lire les notions</a><button class="btn ghost" data-a="again">Nouvelle étude de cas</button></div>';
  return '<h1>' + esc(session.titre) + '</h1>' +
    '<div class="verdict ' + cls + '"><div class="note20">' + sur20(moy) + ' / 20</div><b>' + (note >= 14 ? 'Excellent travail, tu maîtrises bien ce sujet.' : note >= 10 ? 'C\'est la moyenne : encore quelques notions à consolider et ce sera solide.' : 'Ce n\'est pas encore la moyenne, mais tu sais maintenant exactement quoi revoir : commence par les thèmes ci-dessous.') + '</b></div>' +
    '<div class="card"><table><tr><th>Question</th><th>Thèmes</th><th>Note</th></tr>' + session.items.map(function (it) { return '<tr><td>' + esc(it.q.num) + ' — ' + esc(it.q.texte.slice(0, 110)) + '…</td><td>' + it.q.themes.map(function (t) { return THEMES[t] ? '<span class="tag">' + esc(THEMES[t][0]) + '</span> ' : ''; }).join('') + '</td><td class="n">' + sur20(it.note) + ' / 20</td></tr>'; }).join('') + '</table></div>' +
    (Object.keys(faibles).length ? '<h2>À retravailler</h2><div class="row">' + Object.keys(faibles).map(function (t) { return THEMES[t] ? '<button class="btn ghost small" data-a="gotheme" data-v="' + t + '">' + esc(THEMES[t][0]) + '</button>' : ''; }).join('') + '</div>' : '') +
    '<div class="row" style="margin-top:1.5rem">' + (session.titre === 'Révision express' ? '<a class="btn" href="#express">Continuer la révision express</a>' : '') + '<button class="btn' + (session.titre === 'Révision express' ? ' ghost' : '') + '" data-a="again">Nouvelle étude de cas</button><a class="btn ghost" href="#suivi">Mes réponses et analyse par une IA</a></div>';
}

/* — Flashcards — */
V.flash = function (mode, arg) {
  fixSel();
  var head, key, build;
  if (mode === 'guide') {
    key = 'guide'; build = function () { return []; }; head = '<div class="narrow"><h1>Ma séance · flashcards</h1>';
  } else if (mode === 'express') {
    key = 'express'; build = function () { var d = dueCards(); return (d.length ? d : shuffle(mesNotions().filter(function (n) { return !S.learned[n.id]; }))).slice(0, 5); };
    head = '<div class="narrow"><p><a href="#express">← Révision express</a></p><h1>Étape 1 : 5 flashcards</h1>';
  } else if (mode === 'erreurs') {   // carnet d'erreurs : cartes ratées pas encore réussies deux fois de suite
    key = 'erreurs'; build = function () { return carteErreurs(); };
    head = '<div class="narrow"><p><a href="#erreurs">← Carnet d\'erreurs</a></p><h1>Flashcards : mes erreurs</h1><p class="small muted">Chaque carte quitte le carnet après deux « Oui » de suite.</p>';
  } else if (mode === 'ctrl' && ctrlById(arg)) {   // flashcards d'un contrôle
    var c = ctrlById(arg);
    key = 'ctrl/' + arg; build = function () { var now = Date.now(); return Object.keys(CTRLC).map(function (k) { return CTRLC[k]; }).filter(function (n) { return n.ctrl === arg && !S.learned[n.id] && (!S.cards[n.id] || S.cards[n.id].d <= now); }); };
    head = '<div class="narrow"><p><a href="#controles/' + arg + '">← ' + esc(c.titre) + '</a></p><h1>Flashcards du contrôle</h1>';
  } else if (mode === 'deck' && (arg === 'all' || EPREUVES[arg] || MATIERES[String(arg).split('.')[0]])) {   // un paquet : tout, une épreuve, une matière ou un thème
    key = 'deck/' + arg; build = function () { var d = deckDue(deckCards(arg)); return arg === 'all' || EPREUVES[arg] ? interleave(d) : d; };
    head = '<div class="narrow"><p class="crumbs"><a href="#flash">Flashcards</a> › ' + esc(deckLabel(arg)) + '</p>';
  } else if (mode !== 'pentest') {
    return flashDecks();
  }
  if (mode === 'express' && flash && flash.key === 'express' && !flash.deck.length) { flash = null; return head + '<div class="card"><p><b>Étape 1 terminée, bien joué !</b></p><a class="btn" href="#express">Passer à l\'étape 2</a></div></div>'; }
  if (mode === 'pentest') { key = 'pentest'; build = function () { return []; }; head = '<div class="narrow"><p><a href="#pentest">← Tests d\'intrusion</a></p><h1>Flashcards : tests d\'intrusion</h1>'; }
  if (!flash || flash.key !== key || !flash.deck.length) {
    var due = build();
    flash = { key: key, deck: due.slice(0, 20), i: 0, shown: false, total: due.length };
  }
  if (!flash.deck.length && mode === 'guide') return head + '<div class="card">Cartes terminées. <a href="#seance">Continuer ma séance</a></div></div>';
  if (!flash.deck.length && mode === 'deck') return head + '<div class="card"><p><b>Paquet terminé pour aujourd\'hui, bravo !</b></p><p class="muted">Les cartes reviendront quand il sera temps de les revoir.</p><div class="row"><a class="btn" href="#flash">Revenir aux paquets</a><button class="btn ghost" data-a="fall" data-v="' + arg + '">Revoir quand même tout le paquet</button></div></div></div>';
  if (!flash.deck.length) return head + '<div class="card"><p><b>Bravo, plus rien à revoir ici pour le moment !</b></p><p class="muted">Toutes les cartes de cette sélection sont sues ou apprises. Reviens demain pour la prochaine révision, ou choisis une autre sélection.</p>' + (mode ? '' : '<button class="btn ghost" data-a="freset">Revoir quand même toutes les cartes</button>') + '</div></div>';
  var n = flash.deck[flash.i], ex = n.ex || EXP[n.id];
  return head +
    '<div class="row sp fmeta"><span class="small muted">Carte ' + (flash.i + 1) + ' sur ' + flash.deck.length + (flash.total > flash.deck.length ? ' (' + flash.total + ' à revoir en tout)' : '') + '</span><span class="tag i' + n.imp + '">' + IMP[n.imp] + '</span></div>' +
    '<div class="bar"><i style="width:' + (flash.i / flash.deck.length * 100) + '%"></i></div>' +
    '<div class="fcard' + (flash.shown ? ' open' : '') + '" data-a="flip" tabindex="0" role="button" aria-label="Retourner la carte">' +
      '<div class="fcat">' + esc(matLabel(n.mat)) + ' · ' + esc(n.cat) + '</div>' +
      '<div class="q">' + esc(n.q) + '</div>' +
      (flash.shown ? '<div class="a"><div class="alab">La réponse</div>' + esc(n.a) + '</div>' : '<div class="fhint">Dis ta réponse à voix haute et explique pourquoi, puis clique (ou Espace) pour vérifier.</div>') + '</div>' +
    (!flash.shown && ex && ex[1] ? (flash.ex ? '<div class="exbox"><span class="elab">Exemple (indice)</span><p>' + esc(ex[1]) + '</p></div>' : '<div class="row center" style="margin-bottom:.8rem"><button class="btn ghost small" data-a="fex">Voir un exemple</button></div>') : '') +
    (flash.shown && ex && (ex[0] || ex[1] || ex[2]) ? explication(ex) : '') + (flash.shown ? schemaHtml(n.id) + memoBox(n.id, 'Ma note perso sur cette notion (avec mes mots, un exemple de mon stage…)') : '') +
    (flash.shown ? '<p class="small muted center-t">Alors, c\'était comment ?</p><div class="fbtns g4">' + [[0, 'Pas encore', 'ghost'], [1, 'Difficile', 'ghost'], [2, 'Bien', ''], [3, 'Facile', 'ghost']].map(function (b) {
        return '<button class="btn ' + b[2] + '" data-a="fgrade" data-v="' + b[0] + '"><span>' + b[1] + '</span><small>' + (b[0] ? fmtJours(nextCardState(S.cards[n.id], b[0]).ivl) : 'je la revois') + '</small></button>'; }).join('') + '</div>' +
      '<div class="row center" style="margin-top:.7rem"><button class="btn ghost small" data-a="flearn">Je la maîtrise ✓ (la ranger)</button>' + videoLink(n) +
        iaBtn('cardex', IA_INTRO + 'Donne-moi 3 exemples concrets et variés (vie courante, entreprise, examen BTS SIO) pour bien comprendre cette notion : « ' + n.q + ' » — réponse : « ' + n.a + ' ». Explique chaque exemple en deux phrases.', 'D\'autres exemples (IA)') +
        iaBtn('card', IA_INTRO + 'Je révise ' + (n.ctrl ? 'un contrôle (' + n.cat + ')' : 'l\'épreuve ' + matLabel(n.mat)) + '. Explique-moi simplement cette notion comme un bon professeur : « ' + n.q + ' » — réponse attendue : « ' + n.a + ' ». Donne une analogie de la vie courante, un exemple concret en entreprise, comment elle peut tomber à l\'examen et l\'erreur à ne pas faire. Termine en me posant 3 questions pour vérifier que j\'ai compris, sans donner les réponses : j\'y répondrai et tu me corrigeras.', 'Explique-moi avec l\'IA') + '</div>'
      : '<div class="fbtns"><button class="btn" data-a="flip">Voir la réponse et l\'explication</button></div>') +
    '<p class="small muted fhelp">Sous chaque bouton : quand la carte reviendra, calculé par l\'algorithme FSRS (le même que dans Anki) pour que tu la revoies juste avant de l\'oublier. « Pas encore » la remet un peu plus loin dans le paquet, c\'est normal. « Je la maîtrise » la range dans les notions apprises.</p></div>';
};
var SCH = window.SCHEMAS || {};
function schemaHtml(id) { return SCH[id] ? '<figure class="schema-f">' + SCH[id][1] + '<figcaption>' + esc(SCH[id][0]) + '</figcaption></figure>' : ''; }
/* Note personnelle (élaboration : reformuler avec ses mots), enregistrée au fil de la frappe. */
function memoBox(id, ph) { var v = (S.memo || {})[id] || ''; return '<details class="memo"' + (v ? ' open' : '') + '><summary>' + (v ? 'Ma note perso' : '+ Ajouter une note perso') + '</summary><textarea class="memo-t" data-id="' + esc(id) + '" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea></details>'; }
/* Explication détaillée d'une notion (data/explications.js) : en clair, exemple, piège. */
function explication(ex) {
  return '<div class="expl">' + (ex[0] ? '<div><span class="elab">En clair</span><p>' + esc(ex[0]) + '</p></div>' : '') +
    (ex[1] ? '<div><span class="elab">Exemple</span><p>' + esc(ex[1]) + '</p></div>' : '') +
    (ex[2] ? '<div class="trap"><span class="elab">Piège à éviter</span><p>' + esc(ex[2]) + '</p></div>' : '') + '</div>';
}

/* — Bibliothèque — */
function notionCard(n, learnedView) {
  return '<div class="card notion"><h4>' + esc(n.titre) + '</h4><div class="row tags"><span class="tag i' + n.imp + '">' + IMP[n.imp] + '</span>' + themeTag(n.theme) + '</div><p>' + esc(n.a) + '</p>' +
    (EXP[n.id] && EXP[n.id][1] ? '<details class="more ex1"><summary>Exemple</summary><div class="exbox"><p>' + esc(EXP[n.id][1]) + '</p></div></details>' : '') +
    (EXP[n.id] || SCH[n.id] ? '<details class="more"><summary>Explication détaillée' + (SCH[n.id] ? ' et schéma' : '') + '</summary>' + (EXP[n.id] ? explication(EXP[n.id]) : '') + schemaHtml(n.id) + memoBox(n.id, 'Ma note perso') + '</details>' : '') +
    '<div class="row">' + (learnedView ? '<button class="btn ghost small" data-a="unlearn" data-id="' + n.id + '">Remettre à apprendre</button>' : '<button class="btn small" data-a="learn" data-id="' + n.id + '">J\'ai appris ✓</button>') +
    videoLink(n) + (n.theme && THEME_STATS[n.theme] && THEME_STATS[n.theme].nq ? '<a class="btn ghost small" href="#cas/theme/' + n.theme + '">S\'entraîner</a>' : '') + '</div></div>';
}
/* Liste de notions d'UNE matière : catégories par ordre d'utilité, notions par importance. */
function notionsParCategorie(ln, learnedView) {
  var cats = {}; ln.forEach(function (n) { (cats[n.cat] = cats[n.cat] || []).push(n); });
  return Object.keys(cats).sort(function (a, b) {
    var u = function (c) { return Math.max.apply(null, cats[c].map(function (n) { return n.imp * 10 + (THEME_STATS[n.theme] ? THEME_STATS[n.theme].ratio * 5 : 0); })); };
    return u(b) - u(a);
  }).map(function (c) {
    return '<details class="cat" open><summary>' + esc(c) + ' <span class="muted">· ' + cats[c].length + '</span></summary><div class="cols">' +
      cats[c].sort(function (a, b) { return b.imp - a.imp; }).map(function (n) { return notionCard(n, learnedView); }).join('') + '</div></details>';
  }).join('');
}
function notionsParMatiere(list, learnedView) {   // utilisé pour la recherche et la page « apprises » : plusieurs matières à la suite
  return Object.keys(MATIERES).map(function (m) {
    var ln = list.filter(function (n) { return n.mat === m; });
    return ln.length ? '<h2>' + esc(MATIERES[m][0]) + '</h2>' + notionsParCategorie(ln, learnedView) : '';
  }).join('');
}
function bibTabs(on) { var n = mesNotions(), l = n.filter(function (x) { return S.learned[x.id]; }).length; return '<div class="seg"><button class="' + (on === 'biblio' ? 'on' : '') + '" data-a="btab" data-v="biblio">À apprendre <i>' + (n.length - l) + '</i></button><button class="' + (on === 'apprises' ? 'on' : '') + '" data-a="btab" data-v="apprises">Apprises <i>' + l + '</i></button></div>'; }
V.biblio = function (mode, arg) {
  var f = V.biblio.f = V.biblio.f || { q: '', imp: '', theme: '' };
  if (mode === 'theme') f.theme = Object.prototype.hasOwnProperty.call(THEMES, arg) ? arg : ''; else if (mode !== 'keep') f.theme = '';
  if (!S.ep) S.ep = 'E7';
  fixSel();
  var qn = norm(f.q), nots = mesNotions(), learned = nots.filter(function (n) { return S.learned[n.id]; }).length;
  var base = nots.filter(function (n) { return !S.learned[n.id] && (!f.imp || n.imp >= +f.imp); });
  var head = pageHead('Bibliothèque de notions', 'Toutes les notions, rangées par épreuve et par importance. Quand tu maîtrises une notion, « J\'ai appris » la range dans l\'onglet « Apprises ».') + bibTabs('biblio') +
    '<div class="row" style="margin-bottom:1rem"><div class="bar" style="flex:1;max-width:320px"><i style="width:' + (learned / nots.length * 100) + '%"></i></div><span class="small muted">' + learned + ' apprises sur ' + nots.length + '</span>' +
    '<select id="bImp" aria-label="Filtrer par importance"><option value="">Toutes les importances</option><option value="3"' + (f.imp === '3' ? ' selected' : '') + '>Indispensables seulement</option><option value="2"' + (f.imp === '2' ? ' selected' : '') + '>Importantes et plus</option></select></div>';
  if (qn || f.theme) {   // recherche ou thème : résultats dans toutes les matières
    var res = base.filter(function (n) { return (!f.theme || n.theme === f.theme) && (!qn || norm(n.titre + ' ' + n.a + ' ' + n.cat).indexOf(qn) >= 0); });
    var autres = '';
    if (qn && qn.length >= 2) {   // recherche globale : sigles, questions d'annales et TP
      var gs = GLOSSAIRE.filter(function (g) { return norm(g[0] + ' ' + g[1]).indexOf(qn) >= 0; }).slice(0, 6);
      var qs = mesQuestions().filter(function (q) { return norm(q.texte).indexOf(qn) >= 0; }).slice(0, 6);
      var tps = S.option === 'SLAM' ? [] : TP_SISR.filter(function (x) { return norm(x[3] + ' ' + x[7]).indexOf(qn) >= 0; }).slice(0, 4);
      autres = (gs.length ? '<h3>Sigles</h3><div class="gl">' + glossList(gs) + '</div>' : '') +
        (qs.length ? '<h3>Questions d\'examen et d\'entraînement</h3><div class="card">' + qs.map(function (q) { return '<p class="small"><a href="#annales/' + q.sujet + '">' + esc(sujetLabel(SUJETS[q.sujet])) + ', ' + esc(q.num) + '</a> — ' + esc(q.texte.slice(0, 180)) + (q.texte.length > 180 ? '…' : '') + '</p>'; }).join('') + '</div>' : '') +
        (tps.length ? '<h3>TP SISR</h3><div class="card">' + tps.map(function (x) { return '<p class="small"><a target="_blank" rel="noopener" href="' + TP_SOURCES[x[1]].repo + '/blob/main/docs/' + x[4] + '/README.md">' + esc(x[3]) + '</a></p>'; }).join('') + '</div>' : '') +
        (res.length ? '<h3>Notions</h3>' : '');
    }
    if (autres) return head + '<div class="row" style="margin-bottom:1rem"><span class="tag acc">Recherche : ' + esc(f.q) + '</span><button class="btn ghost small" data-a="clearsearch">Effacer la recherche</button></div>' + autres + (res.length ? notionsParMatiere(res, false) : '');
    var pre = f.theme && THEME_STATS[f.theme] && THEME_STATS[f.theme].nq ? '<div class="card hint pre"><div><b>Avant de lire : un prétest de 3 questions ?</b><p class="small muted">Chercher la réponse avant d\'apprendre, même en se trompant, aide à mieux retenir.</p></div><button class="btn" data-a="pretest" data-v="' + f.theme + '">Faire le prétest</button></div>' : '';
    return head + pre + '<div class="row" style="margin-bottom:1rem"><span class="tag acc">' + (f.theme ? 'Thème : ' + esc(THEMES[f.theme][0]) : 'Recherche : ' + esc(f.q)) + '</span><span class="small muted">' + res.length + ' notion(s)</span><button class="btn ghost small" data-a="clearsearch">Revenir au rangement par épreuve</button></div>' +
      (res.length ? notionsParMatiere(res, false) : '<div class="card"><p class="muted">Aucune notion à apprendre ne correspond. Elle est peut-être déjà dans « Notions apprises ».</p></div>');
  }
  var ln = base.filter(function (n) { return n.mat === S.mat; });
  return head + picker({ sub: true, count: function (e, m) { return base.filter(function (n) { return MATIERES[n.mat][2] === e && (!m || n.mat === m); }).length; } }) +
    (mesQuestions().some(function (q) { return q.mats.indexOf(S.mat) >= 0; }) && !ln.some(function (n) { return S.cards[n.id]; }) ? '<div class="card hint pre"><div><b>Tu commences cette matière ?</b><p class="small muted">Fais d\'abord un prétest de 3 questions : chercher avant d\'apprendre aide à mieux retenir.</p></div><button class="btn" data-a="pretest" data-k="mat" data-v="' + S.mat + '">Faire le prétest</button></div>' : '') +
    (ERR[S.mat] ? '<details class="card errs"><summary><b>Les erreurs fréquentes en ' + esc(MATIERES[S.mat][4]) + '</b> <span class="muted small">· ' + ERR[S.mat].length + '</span></summary><div class="cols" style="margin-top:.8rem">' + erreursDe(S.mat).map(erreurItem).join('') + '</div></details>' : '') +
    '<p class="muted small" style="margin-bottom:1rem">' + esc(MATIERES[S.mat][1]) + ' Quand tu maîtrises une notion, « J\'ai appris » la retire d\'ici et la range dans « Notions apprises ».</p>' +
    (ln.length ? notionsParCategorie(ln, false) : '<div class="card"><p class="muted">Plus rien à apprendre ici avec ce filtre. Bravo.</p></div>');
};
V.apprises = function () {
  var list = mesNotions().filter(function (n) { return S.learned[n.id]; });
  return pageHead('Bibliothèque de notions', 'Tout ce que tu as marqué comme appris, par matière et catégorie. Tu peux relire une notion ou la remettre dans la liste à apprendre.') + bibTabs('apprises') +
    (list.length ? notionsParMatiere(list, true) : '<div class="card"><p class="muted">Aucune notion marquée comme apprise pour l\'instant. Dans la bibliothèque ou les flashcards, clique sur « J\'ai appris ».</p></div>');
};

/* — Thèmes à réviser — */
V.pronos = function () {
  if (!S.ep) S.ep = 'E7';
  fixSel();
  var annales = S.ep === 'E7' || S.ep === 'E4';
  var ids = Object.keys(THEMES).filter(function (id) { var m = THEMES[id][1]; return MATIERES[m][2] === S.ep && matOK(m); })
    .sort(function (a, b) { return THEME_STATS[b].ratio - THEME_STATS[a].ratio || THEME_STATS[b].nq - THEME_STATS[a].nq; });
  return '<h1>Thèmes à réviser</h1><p class="lead">Pour E7 et E4, les fréquences décrivent les sujets inclus dans l’application (métropole, Nouvelle-Calédonie et secours), filtrés selon ton option. Elles ne prédisent pas le prochain examen. Pour les autres épreuves, utilise les thèmes comme une liste de travail.</p>' +
    picker({}) +
    (annales ? '' : '<div class="card hint small"><b>Liste de travail indicative.</b> ' + esc(EPREUVES[S.ep][1]) + ' : Les thèmes sont proposés pour guider tes révisions ; aucun pourcentage de probabilité ne leur est attribué.</div>') +
    '<div class="card"><table><tr><th>Thème</th><th>Repère</th><th>' + (annales ? 'Présence dans les sujets' : 'Priorité') + '</th><th>' + (annales ? 'Sessions' : 'Questions d\'entraînement') + '</th><th></th></tr>' + ids.map(function (id) {
      var st = THEME_STATS[id], cls = st.ratio >= 0.8 ? 'i3' : st.ratio >= 0.6 ? 'i2' : '';
      var ex = mesQuestions().filter(function (q) { return q.themes.indexOf(id) >= 0; }).sort(function (a, b) { return SUJETS[b.sujet].annee - SUJETS[a.sujet].annee; }).slice(0, 3);
      return '<tr><td><details><summary><b>' + esc(THEMES[id][0]) + '</b> <span class="muted small">· ' + esc(MATIERES[THEMES[id][1]][4]) + '</span></summary>' +
        '<p class="small"><b>Question type :</b> ' + esc(THEMES[id][2]) + '</p>' +
        (st.est ? '<p class="small muted"><b>Pourquoi cette estimation :</b> ' + esc(EST[id].why) + '</p>' : '') +
        (ex.length ? '<p class="small muted">' + (st.est ? 'Questions d\'entraînement :' : 'Exemples tombés :') + '</p><ul class="small">' + ex.map(function (q) { return '<li>' + esc(sujetLabel(SUJETS[q.sujet])) + ', ' + esc(q.num) + ' : ' + esc(q.texte.slice(0, 200)) + (q.texte.length > 200 ? '…' : '') + '</li>'; }).join('') + '</ul>' : '') + '</details></td>' +
        '<td><span class="tag ' + cls + '">' + st.niveau + '</span></td><td class="n">' + (st.est ? 'Indicative' : '<div class="bar"><i style="width:' + st.ratio * 100 + '%"></i></div>' + st.n + ' sujets sur ' + st.total) + '</td><td class="n small muted">' + (st.est ? (st.nq || '—') : (st.annees.join(', ') || '—')) + '</td>' +
        '<td><div class="row">' + (st.nq ? '<a class="btn small" href="#cas/theme/' + id + '">S\'entraîner</a>' : '') + '<button class="btn ghost small" data-a="gotheme" data-v="' + id + '">Notions</button></div></td></tr>';
    }).join('') + '</table><p class="small muted" style="margin-top:.7rem">Clique sur un thème pour voir la question type et des exemples de questions.</p></div>';
};

/* — Annales — */
V.annales = function (sid, pageArg) {
  if (sid && SUJETS[sid] && SUJETS[sid].ent) {   // cas d'entraînement : documents en texte, questions et corrections
    var se = SUJETS[sid], qe = QUESTIONS.filter(function (q) { return q.sujet === sid; });
    return '<p><a href="#annales">← Tous les sujets</a></p><h1>' + esc(sujetLabel(se)) + '</h1><p class="small muted">' + (se.off ? 'Sujet officiel de l\'examen ; les corrections sont des propositions rédigées pour l\'application (pas un corrigé officiel).' : se.anc ? 'Exercices d\'un ancien sujet officiel (ancien programme), avec des corrections proposées par l\'application.' : se.mat === 'cge' || se.mat === 'anglais' ? 'Sujet d\'entraînement rédigé pour l\'application au format de l\'épreuve, pas un sujet officiel.' : 'Étude de cas d\'entraînement rédigée pour l\'application (entreprise fictive), pas un sujet officiel.') + '</p>' +
      '<div class="row" style="margin-bottom:1rem"><button class="btn" data-a="startsujet" data-id="' + sid + '">M\'interroger sur ce cas</button><button class="btn ghost" data-a="togglecorr">' + (V.annales.corr ? 'Masquer les corrections' : 'Afficher les corrections') + '</button></div>' +
      '<div class="card docbody"><h4>Contexte</h4><p>' + esc(se.contexte) + '</p>' + Object.keys(se.html).map(function (k) { return se.html[k]; }).join('') + '</div>' +
      '<h2>Questions</h2>' + qe.map(function (q) {
        return '<div class="card"><p class="qtext">Question ' + esc(q.num) + ' — ' + esc(q.texte) + '</p>' + (S.qdone[q.id] != null ? '<span class="tag good">déjà travaillée : ' + sur20(S.qdone[q.id]) + '/20</span>' : '') +
          (V.annales.corr ? '<div class="corr"><b class="small">Correction proposée</b><p style="white-space:pre-wrap">' + esc(q.corr) + '</p>' + (study ? study.trace(q) : '') + '<div class="row">' + q.themes.map(themeTag).join('') + '</div></div>' : '') + '</div>';
      }).join('');
  }
  if (sid && SUJETS[sid]) {
    var s = SUJETS[sid], qs = QUESTIONS.filter(function (q) { return q.sujet === sid; }), showC = V.annales.corr;
    var page = +pageArg || 1, last = '';
    return '<p><a href="#annales">← Tous les sujets</a></p><h1>' + esc(sujetLabel(s)) + '</h1>' +
      (s.note ? '<p class="card hint small">' + esc(s.note) + '</p>' : '') +
      '<div class="row" style="margin-bottom:1rem"><a class="btn" target="_blank" rel="noopener" href="' + s.fichier + '">Ouvrir le sujet (PDF, non corrigé)</a>' +
      '<button class="btn ghost" data-a="togglecorr">' + (showC ? 'Masquer les corrections' : 'Afficher les corrections proposées') + '</button>' +
      '<button class="btn ghost" data-a="startsujet" data-id="' + sid + '">M\'interroger sur ce sujet</button></div>' +
      '<div class="split ' + (S.layout === 'cote' ? 'cote' : 'stack rev') + '"><div>' + qs.map(function (q) {
        var grp = q.dossier || q.mission, head = (grp && grp !== last) ? '<h3>' + esc(grp) + '</h3>' : ''; last = grp || last;
        return head + '<div class="card"><p class="qtext">Question ' + esc(q.num) + ' — ' + esc(q.texte) + '</p><div class="row">' +
          '<a class="btn ghost small" href="#annales/' + sid + '/' + q.page + '">Voir p. ' + q.page + '</a>' + (S.qdone[q.id] != null ? '<span class="tag good">déjà travaillée : ' + sur20(S.qdone[q.id]) + '/20</span>' : '') + '</div>' +
          (showC ? '<div class="corr"><b class="small">Correction proposée (non officielle)</b><p>' + esc(q.corr || '—') + '</p>' + (study ? study.trace(q) : '') + '<div class="row">' + q.themes.map(themeTag).join('') + '</div></div>' : '') + '</div>';
      }).join('') + '</div><div class="pdf" id="pdf">' + pdfFrame(sid, page) + '</div></div>';
  }
  var h = '<h1>Sujets et corrections</h1><p class="lead">Les sujets officiels de métropole depuis la réforme, téléchargés depuis le Réseau Certa (licence CC BY-NC-SA). Chaque sujet s\'ouvre en PDF, non corrigé ; les corrections de l\'application sont des propositions rédigées pour réviser, car les corrigés officiels sont réservés aux enseignants.</p>';
  [['E7 Cybersécurité — option SISR', 'SISR'], ['E7 Cybersécurité — option SLAM', 'SLAM'], ['E4 CEJM (sujet propre au BTS SIO)', 'CEJM'], ['E4 CEJM — sujets des autres BTS tertiaires (même programme, pour s\'entraîner)', 'CEJM', 1]].forEach(function (g) {
    var ls = ANNALES.sujets.filter(function (s) { return s.option === g[1] && !s.autre === !g[2] && sujOK(s); });
    if (!ls.length) return;
    h += '<h2>' + g[0] + '</h2><div class="card"><table><tr><th>Session</th><th>Cas</th><th>Questions</th><th>Travaillées</th><th></th></tr>' +
      ls.sort(function (a, b) { return b.annee - a.annee; }).map(function (s) {
        var qs = QUESTIONS.filter(function (q) { return q.sujet === s.id; }), d = qs.filter(function (q) { return S.qdone[q.id] != null; }).length;
        return '<tr><td class="n">' + s.annee + '</td><td><a href="#annales/' + s.id + '">' + esc(s.cas) + '</a></td><td class="n">' + qs.length + '</td><td class="n">' + d + ' / ' + qs.length + '</td>' +
          '<td><div class="row"><a class="btn ghost small" target="_blank" rel="noopener" href="' + s.fichier + '">Sujet PDF</a><a class="btn ghost small" href="#annales/' + s.id + '">Questions et corrections</a></div></td></tr>';
      }).join('') + '</table></div>';
  });
  var ents = ENT.filter(sujOK);
  if (ents.length) h += '<h2>Études de cas d\'entraînement (épreuves sans annales)</h2><p class="small muted">Rédigées pour l\'application, sur des entreprises fictives, pour s\'entraîner à E6, E5, E3, E2 et E1. Ce ne sont pas des sujets officiels.</p><div class="card"><table><tr><th>Épreuve</th><th>Cas</th><th>Questions</th><th>Travaillées</th><th></th></tr>' +
    ents.map(function (s) {
      var qs = QUESTIONS.filter(function (q) { return q.sujet === s.id; }), d = qs.filter(function (q) { return S.qdone[q.id] != null; }).length;
      return '<tr><td>' + esc(MATIERES[s.mat][0]) + '</td><td><a href="#annales/' + s.id + '">' + esc(s.cas) + '</a></td><td class="n">' + qs.length + '</td><td class="n">' + d + ' / ' + qs.length + '</td><td><div class="row"><button class="btn ghost small" data-a="startsujet" data-id="' + s.id + '">M\'interroger</button><a class="btn ghost small" href="#annales/' + s.id + '">Documents et corrections</a></div></td></tr>';
    }).join('') + '</table></div>';
  return h + '<h2>Sources officielles</h2><div class="card"><ul>' +
    '<li><a target="_blank" rel="noopener" href="https://www.reseaucerta.org/sujet-examen/sujets-dexamen-e6-cyberscurit-des-services-informatiques/">Réseau Certa — sujets E7 Cybersécurité</a> (y compris Nouvelle-Calédonie et sujets de secours, utiles pour s\'entraîner davantage)</li>' +
    '<li><a target="_blank" rel="noopener" href="https://www.reseaucerta.org/sujets-dexamen-cejm/">Réseau Certa — sujets CEJM du BTS SIO</a> (le sujet 2026 n\'y était pas encore publié lors de la création de l\'application)</li></ul>' +
    '<p class="small muted">Pas d\'annales officielles dans l\'application pour E1, E2 et E3, ni pour E5 et E6 (épreuves orales et pratiques sans sujet écrit) : les études de cas d\'entraînement ci-dessus les remplacent.</p></div>';
};

/* — Mes notes : moyenne par matière, par épreuve et moyenne générale pondérée par les coefficients —
   Note d'une matière = 60 % études de cas + 20 % flashcards + 20 % simulateur d'oral (pondération recalculée sur ce qui existe). */
function notesMatieres() {
  var out = {};
  Object.keys(MATIERES).filter(matOK).forEach(function (m) {
    var qs = QUESTIONS.filter(function (q) { return q.mats.indexOf(m) >= 0 && S.qdone[q.id] != null && sujOK(SUJETS[q.sujet]); });
    var cas = qs.length ? qs.reduce(function (t, q) { return t + S.qdone[q.id]; }, 0) / qs.length : null;
    var f = (S.fstats || {})[m] || { ok: 0, ko: 0 }, nf = f.ok + f.ko, fl = nf ? f.ok / nf : null;
    var os = (S.ostats || {})[m], or = os && os.n ? os.sum / os.n : null;
    /* pondération : études de cas 60 %, flashcards 20 %, oral 20 % — recalculée sur les composantes disponibles */
    var exs = Object.keys(EXOS).filter(function (k) { return EXOS[k].mats.indexOf(m) >= 0 && (S.exstats || {})[k]; }).map(function (k) { return S.exstats[k]; });
    var exn = exs.reduce(function (t, s) { return t + s.n; }, 0), ex = exn ? exs.reduce(function (t, s) { return t + s.ok; }, 0) / exn : null;
    var parts = [[cas, 0.6], [fl, 0.2], [or, 0.2], [ex, 0.2]].filter(function (x) { return x[0] != null; }), w = parts.reduce(function (t, x) { return t + x[1]; }, 0);
    var note = w ? parts.reduce(function (t, x) { return t + x[0] * x[1]; }, 0) / w : null;
    var nots = NOT.filter(function (n) { return n.mat === m; });
    out[m] = { m: m, ep: MATIERES[m][2], nq: qs.length, cas: cas, nf: nf, fl: fl, or: or, no: os ? os.n : 0, note: note,
      appris: nots.filter(function (n) { return S.learned[n.id]; }).length, nnot: nots.length };
  });
  return out;
}
function notesEpreuves(nm) {
  return Object.keys(EPREUVES).map(function (ep) {
    var ms = Object.keys(nm).filter(function (m) { return nm[m].ep === ep; }), avec = ms.filter(function (m) { return nm[m].note != null; });
    return { ep: ep, coef: EPREUVES[ep][2], mats: ms, note: avec.length ? avec.reduce(function (t, m) { return t + nm[m].note; }, 0) / avec.length : null };
  }).filter(function (e) { return e.mats.length; });
}
function moyenneGenerale(ne) {
  var avec = ne.filter(function (e) { return e.note != null; }), c = avec.reduce(function (t, e) { return t + e.coef; }, 0);
  return c ? { note: avec.reduce(function (t, e) { return t + e.note * e.coef; }, 0) / c, n: avec.length, total: ne.length } : null;
}
function noteTag(x) { if (x == null) return '<span class="muted">—</span>'; var v = x * 20; return '<b class="nt ' + (v >= 14 ? 'good' : v >= 10 ? 'mid' : 'bad') + '">' + sur20(x) + '</b>'; }
V.notes = function () {
  var nm = notesMatieres(), ne = notesEpreuves(nm), mg = moyenneGenerale(ne);
  /* Priorités : matières notées, classées par points à gagner (20 − note) × coefficient ; puis matières jamais travaillées */
  var prio = Object.keys(nm).map(function (m) { return nm[m]; }).filter(function (x) { return x.note != null; })
    .sort(function (a, b) { return (1 - b.note) * EPREUVES[b.ep][2] - (1 - a.note) * EPREUVES[a.ep][2]; });
  var jamais = Object.keys(nm).filter(function (m) { return nm[m].note == null; });
  var trainBtn = function (m) {
    var ent = ENT.some(function (s) { return s.mat === m; });
    var an = m === 'sisr' ? 'SISR' : m === 'slam' ? 'SLAM' : m === 'cyber' ? (S.option || 'SISR') : (m === 'eco' || m === 'droit' || m === 'mgmt') ? 'CEJM' : '';
    var v = ent ? 'mat:' + m : an;
    return (v ? '<button class="btn small" data-a="startkind" data-v="' + v + '">Étude de cas</button>' : '') + '<button class="btn ghost small" data-a="goflash" data-v="' + m + '">Flashcards</button>';
  };
  return '<h1>Mes notes</h1><p class="lead">Tes moyennes sur 20 par matière et par épreuve, calculées à partir de tes réponses aux études de cas et examens blancs (60 %), de tes flashcards, du simulateur d\'oral et des exercices (20 % chacun) — seulement sur ce que tu as déjà fait. La moyenne générale est pondérée par les coefficients du BTS : c\'est une estimation pour t\'aider à savoir quoi travailler, pas une prédiction de ta note.</p>' +
    '<div class="grid stats"><div class="card stat"><b>' + (mg ? sur20(mg.note) + ' / 20' : '—') + '</b><span>moyenne générale estimée' + (mg ? ' (' + mg.n + ' épreuve' + (mg.n > 1 ? 's' : '') + ' sur ' + mg.total + ')' : '') + '</span></div>' +
      '<div class="card stat"><b>' + Object.keys(S.qdone).length + '</b><span>questions travaillées</span></div>' +
      '<div class="card stat"><b>' + Object.keys(nm).reduce(function (t, m) { return t + nm[m].nf; }, 0) + '</b><span>flashcards révisées</span></div></div>' +
    '<h2>Mon activité</h2><div class="card"><p class="small muted" style="margin-top:0">Série actuelle : <b>' + serie() + ' jour' + (serie() > 1 ? 's' : '') + '</b> de révision d\'affilée. Chaque case est un jour : plus elle est foncée, plus tu as travaillé.</p>' + calendrier() + '</div>' +
    '<h2>Ma progression</h2><div class="card"><div class="chips">' + [''].concat(notesEpreuves(nm).map(function (e) { return e.ep; })).map(function (e) { return '<button class="chip' + ((V.notes.f || '') === e ? ' on' : '') + '" data-a="nf" data-v="' + e + '">' + (e ? EP_COURT[e] : 'Toutes les épreuves') + '</button>'; }).join('') + '</div>' +
      '<p class="small muted" style="margin:.2rem 0 .6rem">Moyenne de tes réponses par semaine, sur 20 (la ligne pointillée marque 10).</p>' + courbe(progression(V.notes.f || '')) + '</div>' +
    '<h2>À améliorer en priorité</h2>' + (prio.length ? '<div class="card"><ol class="prio">' + prio.slice(0, 4).map(function (x) {
      return '<li><div class="row sp"><span><b>' + esc(MATIERES[x.m][0]) + '</b> — ' + noteTag(x.note) + ' / 20 · coefficient ' + EPREUVES[x.ep][2] + '<br><span class="small muted">' + (x.note < 0.5 ? 'Sous la moyenne : c\'est là que tu gagneras le plus de points.' : x.note < 0.7 ? 'Correct, encore une marge de progression intéressante.' : 'Bon niveau : à entretenir.') + '</span></span><span class="row">' + trainBtn(x.m) + '</span></div></li>';
    }).join('') + '</ol><p class="small muted">Classement : points à gagner (20 − ta note) multipliés par le coefficient de l\'épreuve.</p></div>' : '<div class="card"><p class="muted">Fais une étude de cas ou quelques flashcards : tes priorités apparaîtront ici.</p></div>') +
    (jamais.length && prio.length ? '<p class="small muted">Pas encore de note : ' + jamais.map(function (m) { return esc(MATIERES[m][0]); }).join(' · ') + '</p>' : '') +
    '<h2>Détail par épreuve et par matière</h2>' + ne.map(function (e) {
      return '<div class="card"><div class="row sp"><h3 class="eph">' + e.ep + ' — ' + esc(epTitre(e.ep)) + '</h3><span>Coef. ' + e.coef + ' · moyenne ' + noteTag(e.note) + ' / 20</span></div>' +
        '<table><tr><th>Matière</th><th>Études de cas</th><th>Flashcards</th><th>Oral</th><th>Notions apprises</th><th>Note</th><th></th></tr>' + e.mats.map(function (m) {
          var x = nm[m];
          return '<tr><td>' + esc(MATIERES[m][4]) + '</td><td class="n">' + (x.cas != null ? sur20(x.cas) + ' / 20 <span class="muted small">(' + x.nq + ' q.)</span>' : '<span class="muted">—</span>') + '</td>' +
            '<td class="n">' + (x.fl != null ? Math.round(x.fl * 100) + ' % <span class="muted small">(' + x.nf + ')</span>' : '<span class="muted">—</span>') + '</td>' +
            '<td class="n">' + (x.or != null ? sur20(x.or) + ' / 20 <span class="muted small">(' + x.no + ')</span>' : '<span class="muted">—</span>') + '</td>' +
            '<td class="n">' + x.appris + ' / ' + x.nnot + '</td><td class="n">' + noteTag(x.note) + (x.note != null ? '<div class="bar"><i style="width:' + x.note * 100 + '%"></i></div>' : '') + '</td><td><div class="row">' + trainBtn(m) + '</div></td></tr>';
        }).join('') + '</table></div>';
    }).join('') +
    '<p class="small muted">Les notes des études de cas sont celles que tu as retenues (note automatique ajustée). Une question qui touche plusieurs matières compte pour chacune.</p>';
};

/* — TP SISR — */
V.tp = function () {
  if (S.option === 'SLAM') return '<h1>TP SISR</h1><div class="card"><p>Cette rubrique concerne l\'option SISR. Tu as choisi SLAM : change d\'option en haut de la page pour l\'afficher.</p></div>';
  var f = V.tp.f = V.tp.f || { imp: '', an: '' };
  var list = TP_SISR.filter(function (t) { return (!f.imp || t[5] === +f.imp) && (!f.an || t[1] === +f.an); })
    .sort(function (a, b) { return b[5] - a[5] || b[1] - a[1] || a[2].localeCompare(b[2]); });
  var faits = TP_SISR.filter(function (t) { return S.tpdone[t[0]]; }).length;
  var chip = function (k, v, l) { return '<button class="chip' + (f[k] === v ? ' on' : '') + '" data-a="tpf" data-k="' + k + '" data-v="' + v + '">' + l + '</button>'; };
  var LBL = { 3: 'Indispensable', 2: 'Utile', 1: 'Complément' };
  return '<h1>TP SISR</h1><p class="lead">' + TP_SISR.length + ' TP du bloc 2 SISR (1re et 2e année), classés du plus utile au moins utile pour l\'examen. Ils viennent des cours publics d\'un formateur BTS SIO, gratuits et complets (consignes, explications, bilan de compétences). Le classement est un avis pour réviser : <b>Indispensable</b> = revient souvent à l\'E6 ou à l\'E7.</p>' +
    '<div class="row" style="margin-bottom:1rem"><div class="bar" style="flex:1;max-width:320px"><i style="width:' + (faits / TP_SISR.length * 100) + '%"></i></div><span class="small muted">' + faits + ' TP faits sur ' + TP_SISR.length + '</span></div>' +
    '<div class="chips">' + chip('imp', '', 'Tous') + chip('imp', '3', 'Indispensables') + chip('imp', '2', 'Utiles') + chip('imp', '1', 'Compléments') + '</div>' +
    '<div class="chips sub">' + chip('an', '', 'Les deux années') + chip('an', '2', '2e année') + chip('an', '1', '1re année') + '</div>' +
    '<div class="cols">' + list.map(function (t) {
      var src = TP_SOURCES[t[1]], url = src.repo + '/blob/main/docs/' + t[4] + '/README.md', done = S.tpdone[t[0]];
      return '<div class="card notion tp' + (done ? ' done' : '') + '"><h4>' + esc(t[3]) + '</h4><div class="row tags"><span class="tag i' + t[5] + '">' + LBL[t[5]] + '</span><span class="tag">' + t[1] + (t[1] === 1 ? 're' : 'e') + ' année · ' + t[2] + '</span>' + t[6].split(' ').map(function (e) { return '<span class="tag acc">' + e + '</span>'; }).join('') + '</div>' +
        '<p class="small">' + esc(t[7]) + '</p><div class="row"><a class="btn small" target="_blank" rel="noopener" href="' + url + '">Ouvrir le TP</a>' +
        '<button class="btn ghost small' + (done ? ' on' : '') + '" data-a="tpdone" data-id="' + t[0] + '">' + (done ? 'Fait ✓' : 'Marquer comme fait') + '</button>' +
        t[8].split(' ').filter(function (x) { return THEMES[x]; }).slice(0, 2).map(function (x) { return '<button class="btn ghost small" data-a="gotheme" data-v="' + x + '" title="Notions liées">' + esc(THEMES[x][0]) + '</button>'; }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<h2>Autres sites de TP</h2><div class="card"><ul>' + TP_AUTRES.map(function (a) { return '<li><a target="_blank" rel="noopener" href="' + a[1] + '">' + esc(a[0]) + '</a> — <span class="small">' + esc(a[2]) + '</span></li>'; }).join('') + '</ul>' +
    '<p class="small muted">Source principale : Yahn Le Prettre, <a target="_blank" rel="noopener" href="' + TP_SOURCES[1].repo + '">cours SISR 1re année</a> et <a target="_blank" rel="noopener" href="' + TP_SOURCES[2].repo + '">2e année</a>, licence CC BY-NC-SA 4.0 (usage personnel et gratuit autorisé). Les liens « Autres sites » n\'ont pas pu être vérifiés page par page.</p></div>';
};

/* — Demandes IA réutilisées — */
function iaCorrige(q, rep) {
  var s = SUJETS[q.sujet];
  return IA_INTRO + 'Tu es correcteur de l\'examen' + (s && !s.ctrl ? ' (' + sujetLabel(s) + ')' : '') + ', bienveillant mais exigeant.\n\nQuestion : ' + (q.contexte ? q.contexte + ' ' : '') + q.texte +
    (s && s.ent ? '\nContexte du cas : ' + s.contexte : '') + '\n\nMa réponse : ' + (rep || '(je n\'ai pas su répondre)') +
    '\n\nÉléments de correction (non officiels, peut-être incomplets) : ' + (q.corr || '—') +
    '\n\n1) Note ma réponse sur 20 avec un barème détaillé. 2) Dis-moi ce qui est juste, ce qui manque et ce qui est faux. 3) Rédige une réponse modèle à 20/20, telle qu\'attendue à l\'examen (structure, vocabulaire précis, justification). 4) Donne-moi un conseil de méthode pour la prochaine fois.' +
    (s && !s.ent && !s.ctrl ? ' Le sujet complet est un sujet officiel du BTS SIO : si un document te manque, dis-le plutôt que de l\'inventer.' : '');
}

/* — Carnet d'erreurs : une erreur sort du carnet après deux réussites de suite — */
function enErreur(hist) {   // hist : liste de 0/1 (ou notes 0-1) dans l'ordre ; vrai si un échec n'a pas été suivi de 2 réussites
  var last = -1; hist.forEach(function (v, i) { if (v < 0.5) last = i; });
  return last >= 0 && hist.slice(last + 1).filter(function (v) { return v >= 0.5; }).length < 2;
}
function questionsErreurs() {   // les erreurs commises avec assurance d'abord (effet d'hypercorrection)
  var sure = function (q) { var l = S.answers[q.id]; return l.some(function (a) { return a.note < 0.5 && a.conf === 1; }) ? 1 : 0; };
  return Object.keys(S.answers).map(qById).filter(function (q) { return q && enErreur(S.answers[q.id].map(function (a) { return a.note; })); }).sort(function (a, b) { return sure(b) - sure(a); });
}
function carteErreurs() {
  return Object.keys(S.fhist).filter(function (id) { return enErreur(S.fhist[id]); })
    .map(function (id) { return NOT.filter(function (n) { return n.id === id; })[0] || CTRLC[id]; }).filter(Boolean);
}
V.erreurs = function () {
  var qs = questionsErreurs(), cs = carteErreurs();
  var prompt = IA_INTRO + 'Voici mes erreurs récentes. Explique-moi simplement chaque notion que je n\'ai pas comprise, regroupe-les par thème, puis propose-moi un mini-plan de révision de 3 jours et un exercice par thème.\n\n' +
    qs.slice(0, 8).map(function (q) { var a = S.answers[q.id][S.answers[q.id].length - 1]; return '- Question : ' + q.texte.slice(0, 300) + '\n  Ma réponse : ' + (a.rep || '(rien)').slice(0, 300) + '\n  Correction : ' + q.corr.slice(0, 400); }).join('\n') +
    (cs.length ? '\n\nFlashcards ratées :\n' + cs.slice(0, 12).map(function (n) { return '- ' + n.q + ' → ' + n.a.slice(0, 200); }).join('\n') : '');
  return '<h1>Carnet d\'erreurs</h1><p class="lead">Toutes les questions où tu as eu moins de 10/20 et les flashcards où tu as répondu « pas encore » arrivent ici automatiquement. Une erreur quitte le carnet quand tu la réussis <b>deux fois de suite</b> : c\'est en retravaillant ses erreurs qu\'on progresse le plus.</p>' +
    (!qs.length && !cs.length ? '<div class="card"><p><b>Ton carnet est vide.</b></p><p class="muted">Soit tu n\'as pas encore fait d\'exercice, soit tu as corrigé toutes tes erreurs. Bravo dans ce cas !</p></div>' :
    '<div class="row" style="margin-bottom:1rem">' + (qs.length ? '<button class="btn" data-a="errq">Retravailler mes ' + qs.length + ' question(s)</button>' : '') + (cs.length ? '<a class="btn ghost" href="#flash/erreurs">Revoir mes ' + cs.length + ' flashcard(s)</a>' : '') + iaBtn('err', prompt, 'Explique-moi mes erreurs (IA)', 'big') + '</div>' +
    (qs.length ? '<h2>Questions à retravailler</h2><div class="card"><table><tr><th>Question</th><th>Dernière note</th><th></th></tr>' + qs.map(function (q) {
      var l = S.answers[q.id], a = l[l.length - 1];
      var sur = l.some(function (x) { return x.note < 0.5 && x.conf === 1; });
      return '<tr><td><span class="small muted">' + esc(sujetLabel(SUJETS[q.sujet])) + ' · ' + esc(q.num) + '</span>' + (sur ? ' <span class="tag i3" title="Tu étais sûr de toi : à revoir en priorité">erreur avec assurance</span>' : '') + '<br>' + esc(q.texte.slice(0, 160)) + (q.texte.length > 160 ? '…' : '') + '</td><td class="n">' + noteTag(a.note) + ' / 20</td><td>' + iaBtn('e' + q.id, iaCorrige(q, a.rep), 'IA') + '</td></tr>';
    }).join('') + '</table></div>' : '') +
    (cs.length ? '<h2>Flashcards à revoir</h2><div class="card"><ul class="small">' + cs.map(function (n) { return '<li><b>' + esc(n.q) + '</b> <span class="muted">— ' + esc(matLabel(n.mat)) + '</span></li>'; }).join('') + '</ul></div>' : ''));
};

/* — Examen blanc : sujet complet, chronomètre, corrections seulement après avoir rendu la copie — */
var examRes = null;   // résultat du dernier examen rendu (affiché jusqu'à ce qu'on le ferme)
function examQs(sid) { return QUESTIONS.filter(function (q) { return q.sujet === sid; }); }
function fmtTime(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s = s % 60; return (h ? h + ' h ' : '') + (m < 10 && h ? '0' : '') + m + ' min ' + (s < 10 ? '0' : '') + s + ' s'; }
V.examen = function () {
  var R = S.examRun;
  if (examRes) return viewExamRes();
  if (!R) {
    var opts = ANNALES.sujets.concat(ENT).filter(sujOK).map(function (s) { return '<option value="' + s.id + '">' + esc(sujetLabel(s)) + ' (' + examQs(s.id).length + ' questions)</option>'; }).join('');
    return '<h1>Examen blanc</h1><p class="lead">Un sujet complet, en temps limité, comme le jour J : tu ne vois les corrections qu\'après avoir rendu ta copie. Tes réponses sont enregistrées au fur et à mesure (tu peux fermer la page et reprendre).</p>' +
      '<div class="card"><div class="filters"><label>Sujet<select id="xSu">' + opts + '</select></label>' +
      '<label>Durée<select id="xDur"><option value="240">4 h (E7, E4 : durée réelle)</option><option value="120">2 h</option><option value="60" selected>1 h</option><option value="30">30 min</option></select></label>' +
      '<button class="btn" data-a="xstart">Commencer l\'examen</button></div><p class="small muted">Conseil : pour E7 et E4, choisis 4 h avec le sujet complet au moins une fois avant l\'examen. Pour les cas d\'entraînement, 1 h suffit.</p></div>' +
      (S.examHist.length ? '<h2>Mes examens blancs</h2><div class="card"><table><tr><th>Date</th><th>Sujet</th><th>Temps utilisé</th><th>Note</th></tr>' + S.examHist.slice().reverse().map(function (h) {
        return '<tr><td class="n">' + new Date(h.date).toLocaleDateString('fr-FR') + '</td><td>' + esc(h.titre) + '</td><td class="n">' + fmtTime(h.temps) + '</td><td class="n">' + noteTag(h.note / 20) + ' / 20</td></tr>'; }).join('') + '</table></div>' : '');
  }
  var s = SUJETS[R.sid], qs = examQs(R.sid), q = qs[R.i], reste = R.start + R.dur - Date.now();
  var cur = R.doc || (s.ent ? (q.utiles[0] || 'ctx') : '');
  var docs = s.ent ? '<button class="btn ghost small" data-a="xdoc" data-k="ctx">Contexte</button>' + Object.keys(s.html).map(function (k) { return '<button class="btn small ' + (cur === k ? 'on' : 'ghost') + '" data-a="xdoc" data-k="' + k + '">' + esc(k.replace('Doc ', 'Document ')) + '</button>'; }).join('')
    : '<button class="btn ghost small" data-a="xpage" data-p="' + q.page + '">Énoncé (p. ' + q.page + ')</button><button class="btn ghost small" data-a="xpage" data-p="' + (s.option === 'CEJM' ? 2 : 3) + '">Contexte</button>' + Object.keys(s.docs).map(function (k) { return '<button class="btn ghost small" data-a="xpage" data-p="' + s.docs[k] + '">' + esc(k.replace('Doc ', 'Document ')) + '</button>'; }).join('');
  return '<div class="row sp"><h1>Examen blanc — ' + esc(s.cas) + '</h1><div class="row"><span class="timer' + (reste < 600000 ? ' low' : '') + '" id="timer">' + fmtTime(reste) + '</span><button class="btn" data-a="xend">Rendre ma copie</button></div></div>' +
    '<div class="qnav">' + qs.map(function (x, i) { return '<button class="qn' + (i === R.i ? ' on' : '') + ((R.reps[x.id] || '').trim() ? ' done' : '') + '" data-a="xgo" data-v="' + i + '" title="Question ' + esc(x.num) + '">' + esc(x.num) + '</button>'; }).join('') + '</div>' +
    '<div class="split ' + (S.layout === 'cote' ? 'cote' : 'stack') + '"><div><div class="card">' +
      (s.ent && R.i === 0 ? '<div class="ctx">' + esc(s.contexte) + '</div>' : (q.dossier || q.mission ? '<p class="small muted where">' + esc(q.dossier ? q.dossier + (q.mission ? ' › ' + q.mission : '') : q.mission) + '</p>' : '')) +
      (q.contexte ? '<div class="ctx">' + esc(q.contexte) + '</div>' : '') +
      '<p class="qtext">Question ' + esc(q.num) + ' — ' + esc(q.texte) + '</p><div class="row docs">' + docs + '</div>' +
      '<textarea id="xrep" placeholder="Rédige ta réponse… (enregistrée automatiquement)">' + esc(R.reps[q.id] || '') + '</textarea>' +
      '<div class="row sp" style="margin-top:.7rem"><button class="btn ghost" data-a="xgo" data-v="' + (R.i - 1) + '"' + (R.i ? '' : ' disabled') + '>← Précédente</button><span class="small muted">' + Object.keys(R.reps).filter(function (k) { return (R.reps[k] || '').trim(); }).length + ' / ' + qs.length + ' réponses rédigées</span><button class="btn ghost" data-a="xgo" data-v="' + (R.i + 1) + '"' + (R.i + 1 < qs.length ? '' : ' disabled') + '>Suivante →</button></div>' +
    '</div></div><div class="pdf' + (s.ent ? ' txt' : '') + '" id="pdf">' + (s.ent ? docFrame(R.sid, cur) : pdfFrame(R.sid, R.page || q.page)) + '</div></div>';
};
function examRendre() {
  var R = S.examRun; if (!R) return;
  var qs = examQs(R.sid), items = qs.map(function (q) {
    var rep = (R.reps[q.id] || '').trim(), a = autoScore(q, rep);
    S.qdone[q.id] = a.score; dayCount('q');
    (S.answers[q.id] = S.answers[q.id] || []).push({ d: Date.now(), rep: rep, auto: a.score, note: a.score });
    return { q: q, rep: rep, auto: a, note: a.score, answerIndex: S.answers[q.id].length - 1 };
  });
  var note = Math.round(items.reduce(function (t, it) { return t + it.note; }, 0) / items.length * 200) / 10;
  S.examHist.push({ date: Date.now(), sid: R.sid, titre: sujetLabel(SUJETS[R.sid]), note: note, temps: Math.min(Date.now() - R.start, R.dur), n: items.length });
  S.history.push({ date: Date.now(), titre: 'Examen blanc : ' + SUJETS[R.sid].cas, n: items.length, note: note });
  examRes = { sid: R.sid, items: items, hist: S.examHist.length - 1, history: S.history.length - 1 };
  S.examRun = null; save();
}
function viewExamRes() {
  var r = examRes, h = S.examHist[r.hist], moy = r.items.reduce(function (t, it) { return t + it.note; }, 0) / r.items.length;
  return '<h1>Résultat de l\'examen blanc</h1><p class="muted">' + esc(h.titre) + ' · temps utilisé : ' + fmtTime(h.temps) + '</p>' +
    '<div class="verdict ' + (moy >= 0.7 ? 'good' : moy >= 0.5 ? 'mid' : 'bad') + '"><div class="note20">' + sur20(moy) + ' / 20</div><b>Note automatique (mots-clés). Lis chaque correction et ajuste ta note : la note de l\'examen se met à jour.</b></div>' +
    r.items.map(function (it, i) {
      return '<div class="card"><p class="qtext">Question ' + esc(it.q.num) + ' — ' + esc(it.q.texte) + '</p><div class="corr"><b class="small">Ta réponse</b><p style="white-space:pre-wrap">' + (it.rep ? esc(it.rep) : '<span class="muted">(pas de réponse)</span>') + '</p></div>' +
        '<div class="kw">' + it.auto.found.map(function (w) { return '<span class="tag good">✓ ' + esc(w) + '</span>'; }).join('') + it.auto.missing.map(function (w) { return '<span class="tag">à ajouter : ' + esc(w) + '</span>'; }).join('') + '</div>' +
        '<details><summary>Voir la correction proposée</summary><div class="corr"><p style="white-space:pre-wrap">' + esc(it.q.corr) + '</p>' + (study ? study.trace(it.q) : '') + '</div></details>' +
        '<div class="row" style="margin-top:.5rem"><span class="small muted">Ma note : <b>' + sur20(it.note) + ' / 20</b></span>' + [[0, 'Faux'], [0.25, 'Peu'], [0.5, 'Moitié'], [0.75, 'Presque'], [1, 'Tout bon']].map(function (o) { return '<button class="btn ghost small' + (Math.abs(it.note - o[0]) < 0.13 ? ' on' : '') + '" data-a="xself" data-i="' + i + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + iaBtn('x' + i, iaCorrige(it.q, it.rep), 'Corriger avec l\'IA') + '</div></div>';
    }).join('') + '<div class="row"><button class="btn" data-a="xclose">Terminer</button><a class="btn ghost" href="#erreurs">Voir mon carnet d\'erreurs</a></div>';
}

/* — Simulateur d'oral — */
var oral = null;   // { mat, i, t0, dur, fini }
function oralMats() { return ((S.reals || []).length ? ['mesreal'] : []).concat(Object.keys(window.ORAL || {}).filter(function (m) { return m !== 'mesreal' && matOK(m); })); }
/* Questions d'oral d'une « matière » ; « mesreal » = questions générées à partir des réalisations (une seule si oral.rid). */
function oralList(m) { if (m !== 'mesreal') return ORAL[m]; var rs = (S.reals || []).filter(function (r) { return !oral || !oral.rid || r.id === oral.rid; }); return [].concat.apply([], rs.map(realQuestions)); }
V.oral = function () {
  var mats = oralMats(); if (!oral || mats.indexOf(oral.mat) < 0) oral = { mat: mats[0], i: -1, dur: 120 };
  var L = oralList(oral.mat), q = oral.i >= 0 ? L[oral.i] : null, st = S.ostats[oral.mat === 'mesreal' ? realMat() : oral.mat];
  var jury = q ? IA_INTRO + 'Joue le rôle du jury de l\'épreuve ' + matLabel(oral.mat) + '. Pose-moi cette question : « ' + q[0] + ' ». Attends ma réponse (je vais l\'écrire ou la dicter), puis relance-moi avec 2 questions de suivi comme un vrai jury, une à la fois. À la fin, évalue ma prestation (contenu, justification, vocabulaire, clarté) avec une note sur 20 et 3 conseils concrets.' + (oral.mat === 'anglais' ? ' Toute la discussion doit être en anglais, et corrige mes erreurs d\'anglais à la fin.' : '') : '';
  return '<h1>Simulateur d\'oral</h1><p class="lead">Une question de jury au hasard. Réponds <b>à voix haute</b> avant la fin du chrono, comme devant le jury, puis compare avec les éléments attendus et évalue-toi. Pour un vrai dialogue avec relances, utilise le jury IA.</p>' +
    '<div class="chips">' + mats.map(function (m) { return '<button class="chip' + (m === oral.mat ? ' on' : '') + '" data-a="omat" data-v="' + m + '">' + esc(matLabel(m)) + ' <i>' + oralList(m).length + '</i></button>'; }).join('') + '</div>' +
    '<div class="row" style="margin-bottom:1rem"><label class="small muted">Temps de réponse <select id="oDur">' + [60, 120, 180, 300].map(function (d) { return '<option value="' + d + '"' + (d === oral.dur ? ' selected' : '') + '>' + d / 60 + ' min</option>'; }).join('') + '</select></label>' +
    (st && st.n ? '<span class="small muted">Ta moyenne à l\'oral ici : <b>' + sur20(st.sum / st.n) + ' / 20</b> sur ' + st.n + ' question(s)</span>' : '') + '</div>' +
    (!q ? '<div class="card"><p>Prêt ? Installe-toi, imagine le jury en face de toi.</p><button class="btn" data-a="onext">Tirer une question</button></div>' :
      '<div class="card oral"><p class="small muted">Question du jury</p><p class="oq">« ' + esc(q[0]) + ' »</p>' +
      (!oral.fini ? '<div class="row"><span class="timer" id="otimer">' + fmtTime(oral.t0 + oral.dur * 1000 - Date.now()) + '</span>' +
          (dicteeDispo() ? '<button class="btn ghost" id="micBtn" data-a="mic">🎙 Dicter ma réponse</button>' : '') + '<button class="btn" data-a="ofin">J\'ai fini de répondre</button></div>' +
          '<textarea id="orep" class="oreptxt" placeholder="' + (dicteeDispo() ? 'Parle : ta réponse s\'écrit ici toute seule. Tu peux aussi la taper.' : 'La dictée vocale marche dans Chrome ou Edge. Ici, tu peux taper tes idées principales.') + '">' + esc(oral.rep || '') + '</textarea>' +
          (dicteeDispo() ? '<p class="small muted">La dictée utilise la reconnaissance vocale du navigateur (le son est traité par Google ou Microsoft).</p>' : '') :
        (oral.rep ? '<div class="corr"><b class="small">Ta réponse</b><p style="white-space:pre-wrap">' + esc(oral.rep) + '</p></div>' : '') +
        '<div class="corr"><b class="small">Éléments attendus et conseils</b><p>' + esc(q[1]) + '</p></div>' +
        (oral.rep ? '<div class="row" style="margin:.4rem 0 .8rem">' + iaBtn('oeval', IA_INTRO + 'Tu es jury de l\'épreuve ' + matLabel(oral.mat) + '. Voici la question posée : « ' + q[0] + ' ». Voici ma réponse orale, transcrite automatiquement (il peut y avoir des erreurs de transcription) : « ' + oral.rep + ' ». Éléments attendus : ' + q[1] + '\nÉvalue ma réponse comme un jury : note sur 20, points forts, ce qui manque, la qualité de l\'expression orale (structure, vocabulaire, assurance), puis propose une réponse modèle que je pourrais dire en 2 minutes.' + (oral.mat === 'anglais' ? ' Corrige aussi mes erreurs d\'anglais.' : ''), 'Faire évaluer ma réponse par le jury IA', 'big') + '</div>' : '') +
        '<p class="small muted">Comment t\'es-tu débrouillé ?</p><div class="row">' +
        [[1, 'Bien, j\'avais l\'essentiel'], [0.5, 'Moyen, il manquait des éléments'], [0, 'À retravailler']].map(function (o) { return '<button class="btn ' + (o[0] === 1 ? '' : 'ghost') + '" data-a="oeval" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>') +
      '<div class="row" style="margin-top:1rem">' + iaBtn('jury', jury, 'Jury IA : simuler l\'oral avec relances') + '<button class="btn ghost small" data-a="onext">Autre question</button></div></div>');
};

/* — Méthode — */
V.methode = function () {
  return '<h1>Méthode de rédaction</h1><p class="lead">Comment rédiger une réponse qui rapporte tous les points, avec des exemples de réponse faible et de réponse modèle commentées. Pour n\'importe quelle autre question, le bouton « Faire corriger par l\'IA + réponse modèle » apparaît après chaque réponse dans les études de cas.</p>' +
    METHODE.map(function (m) {
      return '<h2>' + esc(m.titre) + '</h2><p>' + esc(m.intro) + '</p><div class="card"><ol class="steps">' + m.etapes.map(function (e) { return '<li><b>' + esc(e[0]) + '</b> — ' + esc(e[1]) + '</li>'; }).join('') + '</ol></div>' +
        m.exemples.map(function (x) {
          return '<div class="card"><p class="qtext">' + esc(x.q) + '</p><div class="cmp"><div class="weak"><span class="elab">Réponse faible · ' + esc(x.nf) + '</span><p style="white-space:pre-wrap">' + esc(x.faible) + '</p></div>' +
            '<div class="strong"><span class="elab">Réponse modèle · ' + esc(x.nb) + '</span><p style="white-space:pre-wrap">' + esc(x.bonne) + '</p></div></div><p class="small"><b>Pourquoi ça fait la différence :</b> ' + esc(x.pourquoi) + '</p></div>';
        }).join('');
    }).join('');
};

/* — Mes contrôles : documents du cours + dossiers de révision créés par l'IA (copier-coller, sans clé API) — */
function ctrlById(id) { return (S.ctrl || []).filter(function (c) { return c.id === id; })[0]; }
function joursAvant(date) { return daysUntil(date); }
function ctrlQs(c) { return Object.keys(CTRLQ).map(function (k) { return CTRLQ[k]; }).filter(function (q) { return q.ctrl === c.id; }); }
function ctrlCards(c) { return Object.keys(CTRLC).map(function (k) { return CTRLC[k]; }).filter(function (n) { return n.ctrl === c.id; }); }
function ctrlNote(c) {
  var qs = ctrlQs(c).filter(function (q) { return S.qdone[q.id] != null; }), fs = c.fs || { ok: 0, ko: 0 }, nf = fs.ok + fs.ko;
  var cas = qs.length ? qs.reduce(function (t, q) { return t + S.qdone[q.id]; }, 0) / qs.length : null, fl = nf ? fs.ok / nf : null;
  return cas != null && fl != null ? 0.7 * cas + 0.3 * fl : cas != null ? cas : fl;
}
/* Mini mise en forme de la fiche : lignes « # titre », « - puce », **gras**. Le texte est échappé avant. */
function miniMd(t) {
  var out = '', inList = false;
  String(t || '').split('\n').forEach(function (l) {
    var e = esc(l).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (/^\s*[-•*]\s+/.test(l)) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + e.replace(/^\s*[-•*]\s+/, '') + '</li>'; return; }
    if (inList) { out += '</ul>'; inList = false; }
    if (/^#{1,6}\s/.test(l)) out += '<h4>' + e.replace(/^#{1,6}\s/, '') + '</h4>'; else if (l.trim()) out += '<p>' + e + '</p>';
  });
  return out + (inList ? '</ul>' : '');
}
function ctrlPrompt(c, o) {
  var deja = ctrlQs(c).map(function (q) { return '- ' + q.texte; }).concat(ctrlCards(c).map(function (n) { return '- ' + n.q; }));
  var texte = (c.texte || '').trim();
  return IA_INTRO + 'Je prépare un contrôle en classe : « ' + c.titre + ' » (matière : ' + matLabel(c.mat) + (c.date ? ', le ' + new Date(c.date).toLocaleDateString('fr-FR') : '') + ').' +
    (c.consignes ? '\nChapitres et consignes du professeur : ' + c.consignes : '') +
    (texte ? '\n\nVoici mes documents de cours :\n"""\n' + texte + '\n"""' : '\n\nMes documents de cours sont joints à ce message (PDF ou photos) : base-toi uniquement sur eux.') +
    '\n\nCrée un NOUVEAU dossier de révision, niveau ' + o.niveau + ', basé uniquement sur ces documents (n\'invente pas de contenu hors programme).' +
    (deja.length ? ' Ne reprends AUCUNE de ces questions déjà travaillées, propose des angles différents :\n' + deja.slice(0, 60).join('\n') : '') +
    '\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, exactement au format :\n' +
    '{"fiche": "fiche de synthèse claire du cours, avec des titres commençant par # et des puces commençant par -", ' +
    '"flashcards": [{"q": "question", "r": "réponse courte", "explication": "explication simple", "exemple": "exemple concret", "piege": "erreur fréquente à éviter"}], ' +
    '"questions": [{"q": "question type contrôle", "motscles": ["notion attendue|synonyme", "autre notion"], "correction": "correction rédigée complète"}]}\n' +
    'Fais ' + o.nc + ' flashcards et ' + o.nq + ' questions. Pour « motscles » : 3 à 6 notions indispensables dans une bonne réponse, en minuscules, les variantes séparées par |.';
}
function parseDossier(txt) {
  var a = txt.indexOf('{'), b = txt.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('Je ne trouve pas de JSON dans le texte collé (il doit commencer par { et finir par }).');
  var d = JSON.parse(txt.slice(a, b + 1));
  if (!d || typeof d !== 'object' || Array.isArray(d) || (d.flashcards != null && !Array.isArray(d.flashcards)) || (d.questions != null && !Array.isArray(d.questions))) throw new Error('flashcards et questions doivent être des listes.');
  var cards = (d.flashcards || []).filter(function (x) { return x && typeof x.q === 'string' && typeof x.r === 'string' && x.q.trim() && x.r.trim(); }).map(function (x) { return { q: x.q, r: x.r, explication: String(x.explication || ''), exemple: String(x.exemple || ''), piege: String(x.piege || '') }; }), qs = (d.questions || []).filter(function (x) { return x && typeof x.q === 'string' && x.q.trim(); });
  if (!cards.length && !qs.length && !d.fiche) throw new Error('Le JSON ne contient ni fiche, ni flashcards, ni questions.');
  return { fiche: String(d.fiche || ''), cards: cards, qs: qs.map(function (x) { var words = x.motscles || []; if (typeof words === 'string') words = words.split(';'); if (!Array.isArray(words)) throw new Error('Les mots-clés doivent être une liste ou un texte séparé par des points-virgules.'); return { q: x.q, motscles: words.map(String).map(function (w) { return w.trim(); }).filter(Boolean), correction: String(x.correction || '') }; }) };
}
V.controles = function (id) {
  var c = id && ctrlById(id);
  if (!c) {
    var L = (S.ctrl || []).slice().sort(function (a, b) { return (a.date || '9') < (b.date || '9') ? -1 : 1; });
    return '<h1>Mes contrôles</h1><p class="lead">Pour réviser un contrôle en classe : crée le contrôle, ajoute tes documents de cours, puis demande à l\'IA (ChatGPT ou Claude, sans clé API) de fabriquer un <b>dossier de révision</b> : fiche de synthèse, flashcards et questions corrigées. Chaque nouvelle demande crée un nouveau dossier, avec des questions différentes.</p>' +
      '<div class="card"><h3 class="eph">Nouveau contrôle</h3><div class="filters" style="margin-top:.6rem"><label>Titre<input id="kT" placeholder="ex. Contrôle VLAN et routage"></label>' +
      '<label>Matière<select id="kM">' + Object.keys(MATIERES).filter(matOK).map(function (m) { return '<option value="' + m + '">' + esc(MATIERES[m][0]) + '</option>'; }).join('') + '<option value="autre">Autre matière</option></select></label>' +
      '<label>Date<input type="date" id="kD"></label><button class="btn" data-a="kadd">Créer</button></div>' +
      '<p class="small muted" style="margin:0">Un camarade t\'a envoyé un contrôle ? <label class="link">Importer un contrôle partagé<input type="file" id="kImp" accept=".json" hidden></label></p></div>' +
      (L.length ? '<div class="cols">' + L.map(function (k) {
        var j = joursAvant(k.date), n = ctrlNote(k);
        return '<a class="card tile" href="#controles/' + k.id + '"><b>' + esc(k.titre) + '</b><span>' + esc(matLabel(k.mat)) + (k.date ? ' · ' + (j > 0 ? 'dans ' + j + ' jour' + (j > 1 ? 's' : '') : j === 0 ? 'aujourd\'hui' : 'passé') : '') + '</span><span class="small">' + (k.dossiers || []).length + ' dossier(s) · ' + ctrlCards(k).length + ' flashcards · ' + ctrlQs(k).length + ' questions' + (n != null ? ' · ma note ' + sur20(n) + '/20' : '') + '</span></a>';
      }).join('') + '</div>' : '<div class="card"><p class="muted">Aucun contrôle pour l\'instant.</p></div>');
  }
  var j = joursAvant(c.date), n = ctrlNote(c), qs = ctrlQs(c), cards = ctrlCards(c), o = V.controles.o = V.controles.o || { nc: 15, nq: 6, niveau: 'contrôle (comme en classe)' };
  return '<p><a href="#controles">← Mes contrôles</a></p><div class="row sp"><h1>' + esc(c.titre) + '</h1><div class="row"><button class="btn ghost small" data-a="kexp" data-id="' + c.id + '" title="Crée un fichier à envoyer à tes camarades">Partager avec la classe</button><button class="btn ghost small" data-a="kdel" data-id="' + c.id + '">Supprimer</button></div></div>' +
    '<p class="muted">' + esc(matLabel(c.mat)) + (c.date ? ' · ' + new Date(c.date).toLocaleDateString('fr-FR') + (j > 0 ? ' (J-' + j + ')' : '') : '') + '</p>' +
    '<div class="grid stats"><div class="card stat"><b>' + (n != null ? sur20(n) + ' / 20' : '—') + '</b><span>ma note de révision</span></div><div class="card stat"><b>' + cards.length + '</b><span>flashcards</span></div><div class="card stat"><b>' + qs.length + '</b><span>questions corrigées</span></div></div>' +
    (cards.length || qs.length ? '<div class="row" style="margin-bottom:1rem">' + (cards.length ? '<a class="btn" href="#flash/ctrl/' + c.id + '">Réviser les flashcards</a>' : '') + (qs.length ? '<button class="btn" data-a="kquiz" data-id="' + c.id + '">M\'interroger (questions)</button>' : '') +
      iaBtn('koral', IA_INTRO + 'Interroge-moi à l\'oral, une question à la fois, pour préparer mon contrôle « ' + c.titre + ' » (' + matLabel(c.mat) + '). ' + (c.consignes ? 'Programme : ' + c.consignes + '. ' : '') + 'Corrige chaque réponse avec bienveillance avant de passer à la suivante, et termine par un bilan de ce que je dois revoir.' + ((c.texte || '').length < 4000 && c.texte ? '\nMon cours :\n' + c.texte : ''), 'Interroge-moi (IA)') + '</div>' : '') +
    '<h2>1. Mes documents de révision</h2><div class="card"><div class="filters"><label style="flex:1;min-width:260px">Chapitres et consignes du professeur<input id="kC" value="' + esc(c.consignes || '') + '" placeholder="ex. chapitres 3 et 4, savoir calculer un masque"></label></div>' +
      '<label class="small muted" for="kX">Contenu du cours (colle ton cours ici, ou importe des fichiers .txt / .md)</label><textarea id="kX" class="big" placeholder="Colle ici le texte de ton cours, de tes fiches, de tes exercices…">' + esc(c.texte || '') + '</textarea>' +
      '<div class="row" style="margin-top:.6rem"><button class="btn ghost" data-a="ksave" data-id="' + c.id + '">Enregistrer</button><label class="btn ghost" style="cursor:pointer">Importer des fichiers texte<input type="file" id="kF" accept=".txt,.md,.csv,.html,.htm" multiple hidden></label><span class="small muted" id="kmsg">' + (c.texte ? c.texte.length.toLocaleString('fr-FR') + ' caractères enregistrés' : '') + '</span></div>' +
      '<p class="small muted">Tes cours sont en <b>PDF ou en photos</b> ? Pas besoin de les recopier : laisse ce champ vide et joins les fichiers directement dans ChatGPT ou Claude à l\'étape 2.</p></div>' +
    '<h2>2. Créer un dossier de révision avec l\'IA</h2><div class="card"><div class="filters"><label>Flashcards<select id="kNc">' + [10, 15, 20, 30].map(function (x) { return '<option' + (x === o.nc ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' +
      '<label>Questions<select id="kNq">' + [4, 6, 10].map(function (x) { return '<option' + (x === o.nq ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' +
      '<label>Niveau<select id="kNv">' + ['facile (pour commencer)', 'contrôle (comme en classe)', 'difficile (pour viser 20)'].map(function (x) { return '<option' + (x === o.niveau ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' +
      '<button class="btn ia" data-a="kia" data-id="' + c.id + '">✦ Ouvrir ' + (S.ia === 'claude' ? 'Claude' : 'ChatGPT') + ' avec la demande</button></div>' +
      '<p class="small muted">La demande est copiée : si elle n\'apparaît pas toute seule, colle-la (Ctrl+V), ajoute tes PDF ou photos si besoin, et envoie. L\'IA répond par un bloc de texte qui commence par { : copie-le en entier.</p></div>' +
    '<h2>3. Coller la réponse de l\'IA</h2><div class="card"><textarea id="kR" placeholder="Colle ici la réponse complète de l\'IA (le bloc qui commence par { et finit par })"></textarea>' +
      '<div class="row" style="margin-top:.6rem"><button class="btn" data-a="kimp" data-id="' + c.id + '">Ajouter ce dossier</button><span class="small" id="kerr"></span></div></div>' +
    ((c.dossiers || []).length ? '<h2>Mes dossiers de révision</h2>' + c.dossiers.slice().reverse().map(function (d) {
      return '<details class="card dossier"' + (d.n === c.dossiers.length ? ' open' : '') + '><summary><b>Dossier ' + d.n + '</b> <span class="muted small">· ' + new Date(d.d).toLocaleDateString('fr-FR') + ' · ' + d.cards.length + ' flashcards · ' + d.qs.length + ' questions</span></summary>' +
        (d.fiche ? '<div class="fiche">' + miniMd(d.fiche) + '</div>' : '') +
        '<div class="row"><button class="btn ghost small" data-a="kdeld" data-id="' + c.id + '" data-n="' + d.n + '">Supprimer ce dossier</button></div></details>';
    }).join('') : '');
};

/* — Objectif du jour (accueil) : quantités adaptées au temps restant avant l'examen et aux matières faibles — */
function objectifDuJour() {
  if (S.day.d !== today()) S.day = { d: today(), flash: 0, q: 0, oral: 0 };
  var j = daysUntil(S.exam), serre = j != null && j >= 0 && j <= 30;
  var due = dueCards().length + carteErreurs().length;
  var obj = [['flash', 'flashcards', Math.max(5, Math.min(due || 10, serre ? 40 : 20)), '#flash'], ['q', 'questions d\'études de cas', serre ? 8 : 4, '#cas']];
  if (oralMats().length) obj.push(['oral', 'questions d\'oral', serre ? 4 : 2, '#oral']);
  var nm = notesMatieres(), faible = Object.keys(nm).map(function (m) { return nm[m]; }).filter(function (x) { return x.note != null; }).sort(function (a, b) { return (1 - b.note) * EPREUVES[b.ep][2] - (1 - a.note) * EPREUVES[a.ep][2]; })[0];
  var ctrls = (S.ctrl || []).filter(function (c) { var d = joursAvant(c.date); return d != null && d >= 0 && d <= 7; });
  var errs = questionsErreurs().length;
  return '<div class="card today"><div class="row sp"><h2 style="margin:0">Mon objectif du jour</h2><span class="small muted">' + (j != null ? (j > 0 ? 'J-' + j + ' avant l\'examen' + (serre ? ' : on accélère' : '') : j === 0 ? 'C’est le jour J' : 'examen passé') : '<a href="#suivi">Indique la date de ton examen</a> pour un objectif adapté') + '</span></div>' +
    '<div class="goals">' + obj.map(function (o) { var v = S.day[o[0]] || 0, ok = v >= o[2]; return '<a class="goal' + (ok ? ' ok' : '') + '" href="' + o[3] + '"><b>' + Math.min(v, o[2]) + ' / ' + o[2] + '</b><span>' + o[1] + (ok ? ' ✓' : '') + '</span><div class="bar"><i style="width:' + Math.min(100, v / o[2] * 100) + '%"></i></div></a>'; }).join('') + '</div>' +
    '<ul class="small todo"><li><a href="#planning">Voir mon planning jusqu\'à l\'examen</a></li>' + (faible ? '<li>Matière prioritaire : <b>' + esc(MATIERES[faible.m][0]) + '</b> (' + sur20(faible.note) + '/20) — <a href="#notes">voir mes notes</a></li>' : '') +
    (errs ? '<li><a href="#erreurs">' + errs + ' question(s) dans ton carnet d\'erreurs</a></li>' : '') +
    ctrls.map(function (c) { var d = joursAvant(c.date); return '<li>Contrôle <a href="#controles/' + c.id + '">' + esc(c.titre) + '</a> ' + (d ? 'dans ' + d + ' jour' + (d > 1 ? 's' : '') : 'aujourd\'hui') + '</li>'; }).join('') + '</ul></div>';
}

/* — Révision express : 10 minutes, 3 étapes (5 flashcards, 2 questions, 1 question d'oral) — */
var express = null;   // { base: compteurs du jour au départ }
function expressDone() {
  if (!express) return [false, false, false];
  var d = S.day.d === today() ? S.day : {}, b = express.base;
  return [(d.flash || 0) - b.flash >= 5, (d.q || 0) - b.q >= 2, (d.oral || 0) - b.oral >= 1];
}
function expressQs() {
  var err = questionsErreurs().filter(function (q) { return !q.ctrl; }).map(function (q) { return q.id; });
  var top = Object.keys(THEME_STATS).filter(function (t) { return THEME_STATS[t].ratio >= 0.6 && THEMES[t] && matOK(THEMES[t][1]); });
  var pool = shuffle(mesQuestions().filter(function (q) { return S.qdone[q.id] == null && q.themes.some(function (t) { return top.indexOf(t) >= 0; }); }));
  return err.slice(0, 1).concat(pool.map(function (q) { return q.id; })).slice(0, 2);
}
V.express = function () {
  if (!express) { if (S.day.d !== today()) S.day = { d: today(), flash: 0, q: 0, oral: 0 }; express = { base: { flash: S.day.flash || 0, q: S.day.q || 0, oral: S.day.oral || 0 } }; }
  var done = expressDone(), steps = [
    ['5 flashcards', 'Les cartes à revoir aujourd\'hui, les plus importantes d\'abord.', '<a class="btn" href="#flash/express">Commencer</a>'],
    ['2 questions d\'examen', 'Une erreur de ton carnet et une question sur un thème fréquent.', '<button class="btn" data-a="exq">Commencer</button>'],
    ['1 question d\'oral', 'Réponds à voix haute en 2 minutes.', '<a class="btn" href="#oral">Commencer</a>']
  ];
  if (!oralMats().length) steps.pop();
  var all = steps.every(function (s, i) { return done[i]; });
  return pageHead('Révision express', 'Dix minutes pour avancer quand tu as un petit moment : trois étapes courtes, dans l\'ordre.') +
    (all ? '<div class="verdict good"><b>Révision express terminée, bravo ! Chaque petite séance compte.</b></div>' : '') +
    '<div class="steps-x">' + steps.map(function (s, i) {
      return '<div class="card step' + (done[i] ? ' ok' : '') + '"><div class="num">' + (done[i] ? '✓' : i + 1) + '</div><div class="grow"><b>' + s[0] + '</b><p class="small muted">' + s[1] + '</p></div>' + (done[i] ? '<span class="tag good">Fait</span>' : s[2]) + '</div>';
    }).join('') + '</div><div class="row"><button class="btn ghost small" data-a="exreset">Recommencer une révision express</button></div>';
};

/* — Fiches à imprimer : une fiche par matière (notions par importance, réponse et piège) — */
V.fiches = function () {
  var mats = Object.keys(MATIERES).filter(matOK), m = V.fiches.m = mats.indexOf(V.fiches.m) >= 0 ? V.fiches.m : mats[0];
  var ln = NOT.filter(function (n) { return n.mat === m; }).sort(function (a, b) { return b.imp - a.imp; }), cats = {};
  ln.forEach(function (n) { (cats[n.cat] = cats[n.cat] || []).push(n); });
  return '<div class="noprint">' + pageHead('Fiches à imprimer', 'Une fiche par matière : les notions de la plus importante à la moins importante, avec le piège à éviter. Imprime-la ou enregistre-la en PDF.') +
    '<div class="chips">' + mats.map(function (x) { return '<button class="chip' + (x === m ? ' on' : '') + '" data-a="fichem" data-v="' + x + '">' + esc(MATIERES[x][0].replace(/^E\d · /, '')) + '</button>'; }).join('') + '</div>' +
    '<div class="row" style="margin:.4rem 0 1.2rem"><button class="btn" data-a="print">Imprimer ou enregistrer en PDF</button><span class="small muted">' + ln.length + ' notions</span></div></div>' +
    '<article class="fiche-print"><header><h2>' + esc(MATIERES[m][0]) + '</h2><p class="small muted">' + esc(MATIERES[m][1]) + '</p></header>' +
    Object.keys(cats).map(function (c) {
      return '<section><h3>' + esc(c) + '</h3>' + cats[c].map(function (n) {
        var ex = EXP[n.id];
        return '<div class="fn"><div class="fnh"><b>' + esc(n.titre) + '</b><span class="tag i' + n.imp + '">' + IMP[n.imp] + '</span></div><p>' + esc(n.a) + '</p>' + (ex ? '<p class="fnp"><b>Piège :</b> ' + esc(ex[2]) + '</p>' : '') + ((S.memo || {})[n.id] ? '<p class="fnm"><b>Ma note :</b> ' + esc(S.memo[n.id]) + '</p>' : '') + schemaHtml(n.id) + '</div>';
      }).join('') + '</section>';
    }).join('') + '<footer class="small muted">Révision BTS SIO — fiche générée le ' + new Date().toLocaleDateString('fr-FR') + '</footer></article>';
};

/* — Courbe de progression (Mes notes) : moyenne des réponses par semaine, une seule série — */
function semaine(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime(); }
function progression(ep) {
  var w = {};
  Object.keys(S.answers).forEach(function (id) {
    var q = qById(id); if (!q || q.ctrl) return;
    if (ep && !q.mats.some(function (m) { return MATIERES[m] && MATIERES[m][2] === ep; })) return;
    S.answers[id].forEach(function (a) { var k = semaine(a.d); (w[k] = w[k] || []).push(a.note); });
  });
  return Object.keys(w).map(Number).sort().slice(-12).map(function (k) { return { k: k, n: w[k].length, moy: w[k].reduce(function (t, v) { return t + v; }, 0) / w[k].length }; });
}
function courbe(pts) {
  if (pts.length < 2) return '<p class="muted small">La courbe apparaîtra après au moins deux semaines d\'entraînement' + (pts.length ? ' (cette semaine : ' + sur20(pts[0].moy) + ' / 20 sur ' + pts[0].n + ' réponse' + (pts[0].n > 1 ? 's' : '') + ').' : '.') + '</p>';
  var W = 640, H = 220, L = 34, R = 14, T = 14, B = 30, x = function (i) { return L + (W - L - R) * i / (pts.length - 1); }, y = function (v) { return T + (H - T - B) * (1 - v); };
  var lab = function (k) { return new Date(k).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
  var step = Math.ceil(pts.length / 6);
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Moyenne par semaine, de ' + sur20(pts[0].moy) + ' à ' + sur20(pts[pts.length - 1].moy) + ' sur 20">' +
    [0, 0.5, 1].map(function (v) { return '<line class="grid' + (v === 0.5 ? ' mid' : '') + '" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v * 20 + '</text>'; }).join('') +
    '<polyline class="ln" points="' + pts.map(function (p, i) { return x(i) + ',' + y(p.moy); }).join(' ') + '"/>' +
    pts.map(function (p, i) {
      var tip = 'Semaine du ' + lab(p.k) + ' : ' + sur20(p.moy) + ' / 20 (' + p.n + ' réponse' + (p.n > 1 ? 's' : '') + ')';
      return '<circle class="dot" cx="' + x(i) + '" cy="' + y(p.moy) + '" r="4"/><circle class="hit" cx="' + x(i) + '" cy="' + y(p.moy) + '" r="14" data-tip="' + esc(tip) + '"/>' +
        (i % step === 0 || i === pts.length - 1 ? '<text class="ax" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + lab(p.k) + '</text>' : '');
    }).join('') +
    '<text class="lbl" x="' + x(pts.length - 1) + '" y="' + (y(pts[pts.length - 1].moy) - 12) + '" text-anchor="end">' + sur20(pts[pts.length - 1].moy) + '</text></svg>' +
    '<details class="small"><summary>Voir les données</summary><table><tr><th>Semaine du</th><th>Réponses</th><th>Moyenne</th></tr>' + pts.map(function (p) { return '<tr><td>' + lab(p.k) + '</td><td class="n">' + p.n + '</td><td class="n">' + sur20(p.moy) + ' / 20</td></tr>'; }).join('') + '</table></details>';
}

/* — Partage d'un contrôle avec la classe : fichier .json exporté / importé — */
function ctrlExport(c) {
  var data = { type: 'bts-sio-controle', version: 1, controle: { titre: c.titre, mat: c.mat, date: c.date, consignes: c.consignes, texte: c.texte, dossiers: c.dossiers } };
  download('controle-' + c.titre.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json', JSON.stringify(data, null, 1), 'application/json');
}
function ctrlImport(txt) {
  var d = JSON.parse(txt);
  if (!d || d.type !== 'bts-sio-controle' || !d.controle || !d.controle.titre) throw new Error('ce fichier n\'est pas un contrôle partagé par l\'application.');
  var k = d.controle, c = { id: 'c' + Date.now().toString(36), titre: String(k.titre), mat: Object.prototype.hasOwnProperty.call(MATIERES, k.mat) ? k.mat : 'autre', date: k.date || '', consignes: k.consignes || '', texte: k.texte || '', fs: { ok: 0, ko: 0 },
    dossiers: (k.dossiers || []).map(function (x, i) { var parsed = parseDossier(JSON.stringify({ fiche: x.fiche || ' ', flashcards: x.cards || [], questions: x.qs || [] })); return { n: i + 1, d: x.d || Date.now(), fiche: parsed.fiche, cards: parsed.cards, qs: parsed.qs }; }) };
  readState(Object.assign({}, S, { ctrl: S.ctrl.concat([c]) })); S.ctrl.push(c); buildCtrl();
  if (!save()) { S.ctrl.pop(); buildCtrl(); throw new Error('mémoire du navigateur pleine.'); }
  return c;
}

/* — Dictée vocale (simulateur d'oral) : reconnaissance vocale de Chrome et Edge — */
var reco = null;
function dicteeDispo() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
function dictee() {
  if (reco) { reco.stop(); return; }
  var R = window.SpeechRecognition || window.webkitSpeechRecognition, base = (oral.rep || '').trim();
  reco = new R(); reco.lang = oral.mat === 'anglais' ? 'en-GB' : 'fr-FR'; reco.continuous = true; reco.interimResults = true;
  reco.onresult = function (e) {
    var fin = '', tmp = '';
    for (var i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript; else tmp += e.results[i][0].transcript; }
    oral.rep = (base ? base + ' ' : '') + fin.trim(); var t = $('#orep'); if (t) t.value = oral.rep + (tmp ? ' ' + tmp : '');
  };
  reco.onerror = function (e) { toast(e.error === 'not-allowed' ? 'Micro refusé : autorise le micro dans la barre d\'adresse du navigateur.' : 'Dictée interrompue (' + e.error + ').'); };
  reco.onend = function () { reco = null; var b = $('#micBtn'); if (b) { b.classList.remove('rec'); b.textContent = '🎙 Dicter ma réponse'; } };
  reco.start(); var b = $('#micBtn'); if (b) { b.classList.add('rec'); b.textContent = '■ Arrêter la dictée'; }
}

/* — Exercices générés à l'infini, corrigés automatiquement —
   Chaque type renvoie { titre, enonce (HTML), champs: [ [libellé, réponse attendue, fonction de normalisation] ], corr (explication) }. */
var rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
function ip2s(n) { return [n >>> 24, n >>> 16 & 255, n >>> 8 & 255, n & 255].join('.'); }
function maskOf(c) { return c ? (0xFFFFFFFF << (32 - c)) >>> 0 : 0; }
var nTxt = function (v) { return String(v).trim().toLowerCase().replace(/\s+/g, ''); };
var nNum = function (v) { var s = nTxt(v).replace(/^\//, ''); return /^\d+$/.test(s) ? String(+s) : s; };
var nBin = function (v) { var s = nTxt(v).replace(/^0b/, ''); return /^[01]+$/.test(s) ? String(parseInt(s, 2)) : '?' + s; };
var nHex = function (v) { var s = nTxt(v).replace(/^0x/, '').replace(/h$/, ''); return /^[0-9a-f]+$/.test(s) ? String(parseInt(s, 16)) : '?' + s; };
var EXOS = {
  ip: { nom: 'Sous-réseaux IPv4', mats: ['e6sisr', 'sisr', 'maths'], gen: function () {
    var c = rnd(20, 30), bases = [[10, 0, 0, 0], [172, 16, 0, 0], [192, 168, 0, 0]], b = bases[rnd(0, 2)];
    var ipn = ((b[0] << 24) >>> 0) + (b[0] === 192 ? (168 << 16) + (rnd(0, 255) << 8) + rnd(0, 255) : b[0] === 172 ? ((16 + rnd(0, 15)) << 16) + (rnd(0, 255) << 8) + rnd(0, 255) : (rnd(0, 255) << 16) + (rnd(0, 255) << 8) + rnd(0, 255));
    ipn = ipn >>> 0; var m = maskOf(c), net = (ipn & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0, h = Math.pow(2, 32 - c) - 2;
    return { titre: 'Analyse d\'une adresse', enonce: 'Un poste a l\'adresse <b>' + ip2s(ipn) + '/' + c + '</b>. Complète :', champs: [['Masque (décimal pointé)', ip2s(m), nTxt], ['Adresse du réseau', ip2s(net), nTxt], ['Adresse de diffusion', ip2s(bc), nTxt], ['Première adresse utilisable', ip2s(net + 1), nTxt], ['Dernière adresse utilisable', ip2s(bc - 1), nTxt], ['Nombre d\'hôtes utilisables', String(h), nNum]],
      corr: '/' + c + ' → ' + (32 - c) + ' bits pour les hôtes → 2^' + (32 - c) + ' − 2 = ' + h + ' hôtes. Le réseau s\'obtient avec un ET logique entre l\'adresse et le masque ' + ip2s(m) + ' ; la diffusion met tous les bits d\'hôte à 1.' };
  } },
  besoin: { nom: 'Masque selon le besoin', mats: ['e6sisr', 'maths'], gen: function () {
    var n = rnd(3, 1000), c = 32; while (Math.pow(2, 32 - c) - 2 < n) c--;
    return { titre: 'Choisir le masque', enonce: 'Un service compte <b>' + n + ' équipements</b> (passerelle comprise). Quel est le plus petit sous-réseau qui convient ?', champs: [['Préfixe CIDR (ex. 26)', String(c), nNum], ['Masque (décimal pointé)', ip2s(maskOf(c)), nTxt], ['Nombre d\'hôtes utilisables', String(Math.pow(2, 32 - c) - 2), nNum]],
      corr: 'Il faut 2^h − 2 ≥ ' + n + ' : h = ' + (32 - c) + ' bits d\'hôte donnent ' + (Math.pow(2, 32 - c) - 2) + ' adresses (' + (Math.pow(2, 31 - c) - 2) + ' avec un bit de moins, insuffisant). Préfixe = 32 − ' + (32 - c) + ' = /' + c + '.' };
  } },
  conv: { nom: 'Binaire et hexadécimal', mats: ['maths'], gen: function () {
    var v = rnd(1, 255), k = rnd(0, 2), bin = ('00000000' + v.toString(2)).slice(-8), hex = v.toString(16).toUpperCase();
    if (k === 0) return { titre: 'Décimal vers binaire et hexadécimal', enonce: 'Convertis <b>' + v + '</b> (base 10).', champs: [['En binaire (8 bits)', bin, nBin], ['En hexadécimal', hex, nHex]], corr: v + ' = ' + bin.slice(0, 4) + ' ' + bin.slice(4) + ' ; chaque groupe de 4 bits donne un chiffre hexadécimal : ' + parseInt(bin.slice(0, 4), 2).toString(16).toUpperCase() + parseInt(bin.slice(4), 2).toString(16).toUpperCase() + '.' };
    if (k === 1) return { titre: 'Binaire vers décimal', enonce: 'Convertis <b>' + bin + '</b> (base 2).', champs: [['En décimal', String(v), nNum], ['En hexadécimal', hex, nHex]], corr: bin.split('').map(function (b, i) { return b === '1' ? Math.pow(2, 7 - i) : 0; }).filter(Boolean).join(' + ') + ' = ' + v + '.' };
    return { titre: 'Hexadécimal vers décimal', enonce: 'Convertis <b>0x' + hex + '</b> (base 16).', champs: [['En décimal', String(v), nNum], ['En binaire (8 bits)', bin, nBin]], corr: (hex.length > 1 ? parseInt(hex[0], 16) + ' × 16 + ' + parseInt(hex[1], 16) : parseInt(hex, 16)) + ' = ' + v + '.' };
  } },
  arith: { nom: 'PGCD et modulo', mats: ['maths'], gen: function () {
    var a = rnd(20, 400), b = rnd(6, 150), n = rnd(3, 13), g = function (x, y) { while (y) { var r = x % y; x = y; y = r; } return x; };
    return { titre: 'Arithmétique', enonce: 'Calcule <b>PGCD(' + a + ', ' + b + ')</b> et <b>' + a + ' mod ' + n + '</b> (reste de la division de ' + a + ' par ' + n + ').', champs: [['PGCD', String(g(a, b)), nNum], ['Reste modulo ' + n, String(a % n), nNum]],
      corr: 'Euclide : on remplace (a, b) par (b, a mod b) jusqu\'à b = 0 → PGCD = ' + g(a, b) + '. ' + a + ' = ' + Math.floor(a / n) + ' × ' + n + ' + ' + (a % n) + ', donc ' + a + ' ≡ ' + (a % n) + ' [' + n + '].' };
  } },
  python: { nom: 'Python (E3)', mats: ['algo'], python: true },
  chmod: { nom: 'Droits Linux (chmod)', mats: ['e6sisr'], gen: function () {
    var o = [rnd(4, 7), rnd(0, 7), rnd(0, 7)], sym = o.map(function (d) { return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join('');
    if (rnd(0, 1)) return { titre: 'Notation symbolique vers octale', enonce: 'Un fichier a les droits <b>' + sym + '</b>. Quelle commande chmod en octal ?', champs: [['Valeur octale (ex. 750)', o.join(''), nNum]], corr: 'r = 4, w = 2, x = 1, par groupe (propriétaire, groupe, autres) : ' + o.join(' / ') + ' → chmod ' + o.join('') + '.' };
    return { titre: 'Notation octale vers symbolique', enonce: 'Quels droits donne <b>chmod ' + o.join('') + '</b> ?', champs: [['Notation symbolique (ex. rwxr-x---)', sym, nTxt]], corr: o.map(function (d) { return d + ' = ' + (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join(' ; ') + '.' };
  } }
};
var exo = null;   // { type, x: exercice généré, reps, fini }
function exoTypes() { return Object.keys(EXOS).filter(function (k) { return !EXOS[k].python && EXOS[k].mats.some(matOK); }); }
V.exos = function () {
  var types = exoTypes(); if (!exo || types.indexOf(exo.type) < 0) exo = { type: types[0] };
  if (!exo.x) { exo.x = EXOS[exo.type].gen(); exo.reps = []; exo.fini = false; }
  var x = exo.x, st = (S.exstats || {})[exo.type];
  return pageHead('Exercices', 'Des exercices générés à l\'infini et corrigés tout de suite : sous-réseaux, masques, conversions, droits Linux. Indispensables pour l\'E6 SISR, l\'E3 et les questions réseau de l\'E7.') +
    '<div class="chips">' + types.map(function (k) { var s = (S.exstats || {})[k]; return '<button class="chip' + (k === exo.type ? ' on' : '') + '" data-a="xtype" data-v="' + k + '">' + EXOS[k].nom + (s ? ' <i>' + Math.round(s.ok / s.n * 100) + ' %</i>' : '') + '</button>'; }).join('') + '</div>' +
    '<div class="card exo"><p class="small muted">' + esc(x.titre) + (st ? ' · ' + st.ok + ' réussi(s) sur ' + st.n : '') + '</p><p class="qtext">' + x.enonce + '</p><div class="exf">' +
    x.champs.map(function (c, i) {
      var ok = exo.fini && c[2](exo.reps[i] || '') === c[2](c[1]);
      return '<label>' + esc(c[0]) + '<input id="ex' + i + '" autocomplete="off" spellcheck="false" value="' + esc(exo.reps[i] || '') + '"' + (exo.fini ? ' disabled class="' + (ok ? 'okf' : 'kof') + '"' : '') + '>' + (exo.fini && !ok ? '<span class="small exa">Réponse : <b>' + esc(c[1]) + '</b></span>' : '') + '</label>';
    }).join('') + '</div>' +
    (exo.fini ? '<div class="corr"><b class="small">Explication</b><p>' + esc(x.corr) + '</p></div><div class="row"><button class="btn" data-a="xnew">Exercice suivant</button></div>'
      : '<div class="row"><button class="btn" data-a="xcheck">Vérifier</button><button class="btn ghost" data-a="xnew">Un autre</button></div>') + '</div>';
};

/* — QCM rapide : 10 questions tirées des notions (ou des sigles), 4 propositions — */
var qcm = null;
function qcmBuild(src) {
  var items = [];
  if (src === 'sigles') {
    shuffle(GLOSSAIRE).slice(0, 10).forEach(function (g) {
      var faux = shuffle(GLOSSAIRE.filter(function (h) { return h !== g; })).slice(0, 3).map(function (h) { return h[1]; });
      items.push({ q: 'Que signifie « ' + g[0] + ' » ?', ok: g[1], opts: shuffle([g[1]].concat(faux)), ex: g[2] });
    });
  } else {
    var pool = mesNotions().filter(function (n) { return MATIERES[n.mat][2] === src; });
    shuffle(pool).slice(0, 10).forEach(function (n) {
      var same = pool.filter(function (m) { return m !== n && m.mat === n.mat; }), autres = pool.filter(function (m) { return m !== n && m.mat !== n.mat; });
      var faux = shuffle(same).concat(shuffle(autres)).slice(0, 3).map(function (m) { return m.a; });
      items.push({ q: n.q, ok: n.a, opts: shuffle([n.a].concat(faux)), ex: EXP[n.id] ? EXP[n.id][0] : '', n: n });
    });
  }
  return { src: src, items: items, i: 0, rep: null, score: 0 };
}
V.qcm = function (src) {
  var eps = Object.keys(EPREUVES).filter(function (e) { return matsOf(e).length; });
  if (src && (src === 'sigles' || eps.indexOf(src) >= 0) && (!qcm || qcm.src !== src)) qcm = qcmBuild(src);
  var head = pageHead('QCM rapide', '10 questions, 4 propositions, correction immédiate. Les bonnes et mauvaises réponses comptent dans tes flashcards et ton carnet d\'erreurs.') +
    '<div class="chips">' + eps.map(function (e) { return '<a class="chip' + (qcm && qcm.src === e ? ' on' : '') + '" href="#qcm/' + e + '">' + EP_COURT[e] + '</a>'; }).join('') + '<a class="chip' + (qcm && qcm.src === 'sigles' ? ' on' : '') + '" href="#qcm/sigles">Sigles</a></div>';
  if (!qcm) return head + '<div class="card"><p class="muted">Choisis une épreuve (ou « Sigles ») pour commencer.</p></div>';
  if (qcm.i >= qcm.items.length) return head + '<div class="verdict ' + (qcm.score >= 7 ? 'good' : qcm.score >= 5 ? 'mid' : 'bad') + '"><div class="note20">' + qcm.score + ' / ' + qcm.items.length + '</div><b>' + (qcm.score >= 7 ? 'Très bien !' : qcm.score >= 5 ? 'Pas mal, encore un petit effort.' : 'Les réponses ratées sont dans ton carnet d\'erreurs : tu vas progresser vite.') + '</b></div><button class="btn" data-a="qagain">Nouveau QCM</button>';
  var it = qcm.items[qcm.i];
  return head + '<div class="narrow"><div class="row sp fmeta"><span class="small muted">Question ' + (qcm.i + 1) + ' sur ' + qcm.items.length + '</span><span class="small muted">Score : ' + qcm.score + '</span></div><div class="bar"><i style="width:' + qcm.i / qcm.items.length * 100 + '%"></i></div>' +
    '<div class="card qcmc"><p class="qtext">' + esc(it.q) + '</p><div class="opts">' + it.opts.map(function (o, k) {
      var cls = qcm.rep == null ? '' : o === it.ok ? ' good' : k === qcm.rep ? ' bad' : ' dim';
      return '<button class="opt' + cls + '" data-a="qrep" data-v="' + k + '"' + (qcm.rep != null ? ' disabled' : '') + '><span class="ol">' + 'ABCD'[k] + '</span>' + esc(o) + '</button>';
    }).join('') + '</div>' +
    (qcm.rep != null ? (it.ex ? '<div class="corr small"><b>' + (it.opts[qcm.rep] === it.ok ? 'Exact !' : 'Pas tout à fait.') + '</b> ' + esc(it.ex) + '</div>' : '') + (it.n && EXP[it.n.id] && EXP[it.n.id][1] ? '<div class="exbox small"><span class="elab">Exemple</span><p>' + esc(EXP[it.n.id][1]) + '</p></div>' : '') + '<div class="row"><button class="btn" data-a="qnext">' + (qcm.i + 1 < qcm.items.length ? 'Question suivante' : 'Voir mon score') + '</button></div>' : '') + '</div></div>';
};

/* — Glossaire des sigles — */
V.glossaire = function () {
  var f = V.glossaire.f = V.glossaire.f || { q: '', d: '' }, doms = GLOSSAIRE.map(function (g) { return g[3]; }).filter(function (d, i, a) { return a.indexOf(d) === i; }).sort();
  var L = GLOSSAIRE.filter(function (g) { return (!f.d || g[3] === f.d) && (!f.q || norm(g.join(' ')).indexOf(norm(f.q)) >= 0); }).sort(function (a, b) { return a[0].localeCompare(b[0]); });
  return pageHead('Glossaire des sigles', GLOSSAIRE.length + ' sigles du BTS SIO expliqués simplement. À l\'examen, développer un sigle et l\'expliquer en une phrase montre que tu maîtrises le vocabulaire.') +
    '<div class="row" style="margin-bottom:.8rem"><input id="gq" placeholder="Chercher un sigle ou un mot…" value="' + esc(f.q) + '" style="flex:1;max-width:360px"><a class="btn" href="#qcm/sigles">Quiz des sigles</a></div>' +
    '<div class="chips">' + [''].concat(doms).map(function (d) { return '<button class="chip' + (f.d === d ? ' on' : '') + '" data-a="gdom" data-v="' + d + '">' + (d || 'Tous') + '</button>'; }).join('') + '</div>' +
    '<div class="gl" id="glist">' + glossList(L) + '</div>';
};
function glossList(L) { return L.length ? L.map(function (g) { return '<div class="gi"><b>' + esc(g[0]) + '</b><div><span class="gd">' + esc(g[1]) + '</span><p>' + esc(g[2]) + '</p></div><span class="tag">' + esc(g[3]) + '</span></div>'; }).join('') : '<p class="muted">Aucun sigle ne correspond.</p>'; }

/* — Série de jours et calendrier d'activité — */
function dkey(d) { d = new Date(d); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function serie() { var n = 0, d = new Date(); if (!(S.days || {})[dkey(d)]) d.setDate(d.getDate() - 1); while ((S.days || {})[dkey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
function calendrier() {
  var semaines = 18, fin = new Date(); fin.setHours(0, 0, 0, 0); var debut = new Date(fin); debut.setDate(debut.getDate() - (semaines * 7 - 1) - ((fin.getDay() + 6) % 7 === 6 ? 0 : 6 - (fin.getDay() + 6) % 7));
  var max = Math.max.apply(null, [1].concat(Object.keys(S.days || {}).map(function (k) { return S.days[k]; }))), cells = '', total = 0, actifs = 0;
  for (var d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) {
    var v = (S.days || {})[dkey(d)] || 0; total += v; if (v) actifs++;
    var lvl = v ? Math.min(4, Math.ceil(v / max * 4)) : 0;
    cells += '<i class="c' + lvl + '" style="grid-row:' + ((d.getDay() + 6) % 7 + 1) + '" data-tip="' + d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' : ' + (v ? v + ' activité' + (v > 1 ? 's' : '') : 'aucune révision') + '"></i>';
  }
  return '<div class="cal">' + cells + '</div><div class="row sp small muted" style="margin-top:.5rem"><span>' + actifs + ' jour' + (actifs > 1 ? 's' : '') + ' de révision sur les ' + semaines + ' dernières semaines · ' + total + ' activités</span><span class="calk">Moins <i class="c0"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i> Plus</span></div>';
}

/* — Erreurs fréquentes par matière (data/erreurs.js) — */
var ERR = window.ERREURS || {};
function erreurItem(e) {
  return '<div class="card errf"><div class="row sp"><b>' + esc(e[0]) + '</b>' + (e[3] === 'correcteurs' ? '<span class="tag acc" title="Constat publié par des correcteurs ou une académie">signalé par des correcteurs</span>' : '') + '</div>' +
    '<p>' + esc(e[1]) + '</p><div class="exbox"><span class="elab">Exemple</span><p>' + esc(e[2]) + '</p></div></div>';
}
function erreursDe(m, n) { return (ERR[m] || []).slice(0, n || 99); }
V.erreursfreq = function () {
  var mats = Object.keys(MATIERES).filter(function (m) { return matOK(m) && ERR[m]; }), m = V.erreursfreq.m = mats.indexOf(V.erreursfreq.m) >= 0 ? V.erreursfreq.m : mats[0];
  return pageHead('Erreurs fréquentes', 'Les erreurs qui reviennent le plus souvent dans les copies et à l\'oral, matière par matière, avec un exemple faux et un exemple juste. Lis-les avant un entraînement : savoir où les autres se trompent évite de tomber dans le même piège.') +
    '<div class="chips">' + mats.map(function (x) { return '<button class="chip' + (x === m ? ' on' : '') + '" data-a="errm" data-v="' + x + '">' + esc(MATIERES[x][0].replace(/^E\d · /, '')) + ' <i>' + ERR[x].length + '</i></button>'; }).join('') + '</div>' +
    '<div class="cols">' + erreursDe(m).map(erreurItem).join('') + '</div>' +
    '<p class="small muted">Il n\'existe pas de rapport de jury national publié pour toutes les épreuves : les erreurs marquées « signalé par des correcteurs » viennent de comptes rendus d\'académies ; les autres sont les erreurs classiques relevées dans les corrigés et les méthodes.</p>';
};

/* — Exemples : pour une question, les exemples des notions liées à ses thèmes — */
function exemplesQuestion(q) {
  var ns = NOT.filter(function (n) { return n.theme && q.themes.indexOf(n.theme) >= 0 && EXP[n.id]; }).sort(function (a, b) { return b.imp - a.imp; }).slice(0, 3);
  return '<div class="exbox big"><span class="elab">Exemples pour comprendre</span>' + (ns.length ? ns.map(function (n) { return '<p><b>' + esc(n.titre) + ' :</b> ' + esc(EXP[n.id][1]) + '</p>'; }).join('') : '<p class="muted">Pas d\'exemple rédigé pour ce thème : demande-en un à l\'IA.</p>') +
    '<div class="row">' + iaBtn('qex', IA_INTRO + 'Je dois répondre à cette question d\'examen : « ' + q.texte + ' ». Sans me donner la réponse, donne-moi 2 exemples concrets et simples (vie courante et entreprise) qui m\'aident à comprendre les notions en jeu, puis une piste pour démarrer ma réponse.', 'Un exemple concret avec l\'IA') + '</div></div>';
}

/* — Maths et Python (E3) — */
var py = { tab: 'fiche', i: 0, rep: null, done: false, code: {} };
function pyStat(ok) { var st = (S.exstats = S.exstats || {}).python = S.exstats.python || { ok: 0, n: 0 }; st.n++; if (ok) st.ok++; dayCount('ex'); save(); }
function pyNormOut(s) { return String(s).split('\n').map(function (l) { return l.trim().replace(/\s+/g, ' '); }).filter(Boolean).join('\n'); }
function pyNormCode(s) { return String(s).replace(/\s+/g, '').replace(/'/g, '"').replace(/:$/, ''); }
V.python = function () {
  var tabs = [['fiche', 'Aide-mémoire'], ['affiche', 'Que va-t-il afficher ?'], ['complete', 'Complète la ligne'], ['ecrire', 'Écris la fonction'], ['epreuve', 'L\'épreuve E3']];
  var st = (S.exstats || {}).python;
  var h = pageHead('Maths et Python (E3)', 'L\'E3 « Mathématiques pour l\'informatique » est évaluée en contrôle en cours de formation (coefficient 3), avec une partie mathématiques et une partie algorithmique appliquée en Python. Ici : l\'essentiel du Python à savoir, et des exercices corrigés tout de suite.' + (st ? ' Tes résultats : ' + st.ok + ' réussi(s) sur ' + st.n + '.' : '')) +
    '<div class="seg">' + tabs.map(function (t) { return '<button class="' + (py.tab === t[0] ? 'on' : '') + '" data-a="pytab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
  if (py.tab === 'fiche') return h + '<div class="cols">' + PY_FICHE.map(function (f) { return '<div class="card"><h4 style="margin:0 0 .5rem">' + esc(f[0]) + '</h4><pre class="code">' + esc(f[1]) + '</pre><p class="small muted" style="margin:.6rem 0 0">' + esc(f[2]) + '</p></div>'; }).join('') + '</div>' +
    '<p class="small"><a href="#exos">Exercices de maths générés à l\'infini</a> (conversions, arithmétique) · <a href="#biblio" data-a="goep" data-v="E3" data-to="biblio">Notions de l\'E3</a></p>';
  if (py.tab === 'epreuve') return h + '<div class="card"><h4 style="margin-top:0">Ce que l\'on sait de l\'épreuve</h4><ul>' +
    '<li>Épreuve E3 « Mathématiques pour l\'informatique », <b>coefficient 3</b>, en <b>contrôle en cours de formation</b> : deux situations d\'évaluation organisées par ton établissement.</li>' +
    '<li>Le programme a deux parties : <b>mathématiques</b> (arithmétique, logique et algèbre de Boole, ensembles, calcul matriciel, graphes et ordonnancement, suites) et <b>algorithmique appliquée</b>, en Python.</li>' +
    '<li>Les supports de cours d\'algorithmique appliquée insistent sur la <b>justesse</b> de la solution et sur la <b>qualité</b> du code : lisibilité, indentation, commentaires.</li>' +
    '<li>Les dates, la durée et le matériel autorisé dépendent de ton établissement : <b>demande-les à ton professeur</b>.</li></ul>' +
    '<p class="small muted">Sources : documents de session publiés pour le BTS SIO (épreuve E3, coefficient 3, CCF) et supports de cours d\'algorithmique appliquée. Le référentiel officiel fait foi.</p></div>' +
    '<div class="row"><a class="btn" href="#cas">Sujets d\'entraînement E3</a><a class="btn ghost" href="#methode">Méthode pour le Python</a><a class="btn ghost" href="#erreursfreq">Erreurs fréquentes</a></div>';
  if (py.tab === 'affiche') {
    var a = PY_AFFICHE[py.i % PY_AFFICHE.length], ok = py.done && pyNormOut(py.rep) === pyNormOut(a[1]);
    return h + '<div class="card pyx"><p class="small muted">Programme ' + (py.i % PY_AFFICHE.length + 1) + ' sur ' + PY_AFFICHE.length + ' · Fais-le tourner à la main (tableau des variables) et écris exactement ce qui s\'affiche.</p><pre class="code">' + esc(a[0]) + '</pre>' +
      '<label class="small muted" for="pyrep">Ce qui s\'affiche (une ligne par print)</label><textarea id="pyrep" class="mono" spellcheck="false"' + (py.done ? ' disabled' : '') + '>' + esc(py.rep || '') + '</textarea>' +
      (py.done ? '<div class="verdict ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Exact !' : 'Pas tout à fait.') + '</b></div><div class="corr"><b class="small">Affichage attendu</b><pre class="code">' + esc(a[1]) + '</pre><p>' + esc(a[2]) + '</p></div><div class="row"><button class="btn" data-a="pynext">Programme suivant</button></div>'
        : '<div class="row" style="margin-top:.7rem"><button class="btn" data-a="pycheck">Vérifier</button><button class="btn ghost" data-a="pynext">Passer</button></div>') + '</div>';
  }
  if (py.tab === 'complete') {
    var c = PY_COMPLETE[py.i % PY_COMPLETE.length], okc = py.done && c[2].map(pyNormCode).indexOf(pyNormCode(py.rep)) >= 0;
    return h + '<div class="card pyx"><p class="small muted">Exercice ' + (py.i % PY_COMPLETE.length + 1) + ' sur ' + PY_COMPLETE.length + '</p><p class="qtext">' + esc(c[0]) + '</p><pre class="code">' + esc(c[1]) + '</pre>' +
      '<label class="small muted" for="pyrep">Ce qui remplace ____</label><input id="pyrep" class="mono" style="width:100%" autocomplete="off" spellcheck="false" value="' + esc(py.rep || '') + '"' + (py.done ? ' disabled' : '') + '>' +
      (py.done ? '<div class="verdict ' + (okc ? 'good' : 'bad') + '"><b>' + (okc ? 'Exact !' : 'Pas tout à fait.') + '</b></div><div class="corr"><b class="small">Réponse attendue</b><pre class="code">' + esc(c[2][0]) + '</pre><p>' + esc(c[3]) + '</p></div><div class="row"><button class="btn" data-a="pynext">Exercice suivant</button></div>'
        : '<div class="row" style="margin-top:.7rem"><button class="btn" data-a="pycheck">Vérifier</button><button class="btn ghost" data-a="pynext">Passer</button></div>') + '</div>';
  }
  var e = PY_ECRIRE[py.i % PY_ECRIRE.length], code = py.code[py.i % PY_ECRIRE.length] || '';
  var prompt = IA_INTRO + 'Je m\'entraîne à l\'algorithmique appliquée en Python (épreuve E3). Énoncé : ' + e[0] + '\nTests attendus :\n' + e[1] + '\n\nMon code :\n' + (code || '(je n\'ai rien écrit)') + '\n\nCorrige-moi comme un professeur : dis si mon code passe les tests (en le déroulant à la main), explique les erreurs une par une, puis propose une version corrigée, lisible et commentée. Note-moi sur 20.';
  return h + '<div class="card pyx"><p class="small muted">Fonction ' + (py.i % PY_ECRIRE.length + 1) + ' sur ' + PY_ECRIRE.length + '</p><p class="qtext">' + esc(e[0]) + '</p><p class="small muted" style="margin:0">Tests que ta fonction doit passer :</p><pre class="code">' + esc(e[1]) + '</pre>' +
    '<label class="small muted" for="pycode">Ton code (la touche Tab insère 4 espaces)</label><textarea id="pycode" class="mono big" spellcheck="false" placeholder="def ...">' + esc(code) + '</textarea>' +
    '<div class="row" style="margin-top:.7rem"><button class="btn" data-a="pybasthon">Copier et tester sur Basthon</button>' + iaBtn('pyia', prompt, 'Faire corriger par l\'IA') + '<button class="btn ghost" data-a="pysol">' + (py.done ? 'Masquer la solution' : 'Voir une solution') + '</button></div>' +
    '<p class="small muted">Basthon est l\'outil Python en ligne gratuit utilisé dans l\'Éducation nationale : ton code et les tests sont copiés, colle-les (Ctrl+V) dans la console et exécute. Si rien ne s\'affiche, tous les tests sont passés.</p>' +
    (py.done ? '<div class="corr"><b class="small">Une solution possible</b><pre class="code">' + esc(e[2]) + '</pre><p>' + esc(e[3]) + '</p><div class="row"><span class="small muted">Tu avais réussi ?</span><button class="btn small" data-a="pyself" data-v="1">Oui</button><button class="btn ghost small" data-a="pyself" data-v="0">Pas encore</button></div></div>' : '') + '</div>' +
    '<div class="row"><button class="btn ghost" data-a="pynext">Fonction suivante</button></div>';
};

/* — Mes réalisations (E5 / E6) : questions de jury générées à partir des réalisations de l'étudiant —
   S.reals = [ { id, ep: 'E5' | 'E6', titre, contexte, solution, techno, competences, difficultes, tests } ] */
var REAL_CHAMPS = [['titre', 'Titre', 'ex. Mise en place d\'un VPN WireGuard pour les nomades', 'input'], ['contexte', 'Contexte et besoin', 'Entreprise, problème à résoudre, contraintes (budget, délais, sécurité)…', 'area'],
  ['solution', 'Solution réalisée', 'Ce que tu as fait toi-même, étape par étape', 'area'], ['techno', 'Technologies et outils (séparés par des virgules)', 'ex. WireGuard, pfSense, Active Directory', 'input'],
  ['competences', 'Compétences du référentiel couvertes', 'ex. B1.4 Travailler en mode projet ; B2.1 Concevoir une solution d\'infrastructure', 'area'], ['difficultes', 'Difficultés rencontrées et solutions', 'Ce qui n\'a pas marché du premier coup et comment tu l\'as résolu', 'area'], ['tests', 'Tests et preuves', 'Comment tu as vérifié que ça marche (captures, plan de tests)', 'area']];
/* Questions spécifiques selon les technologies citées (mots-clés → questions). */
var TECH_Q = [
  [/vlan|switch|cisco|trunk/i, ['Comment un poste du VLAN invités pourrait-il atteindre vos serveurs ? Qu\'est-ce qui l\'en empêche ?', 'Ajoutez en direct un nouveau VLAN et expliquez chaque commande.']],
  [/pfsense|opnsense|stormshield|pare-feu|firewall|iptables|nftables/i, ['Montrez-moi la règle qui autorise ce flux et expliquez l\'ordre de vos règles.', 'Que se passe-t-il pour un flux qui ne correspond à aucune règle ?']],
  [/active directory|\bad\b|gpo|windows server/i, ['Pourquoi avoir créé cette OU ? Comment s\'applique votre GPO et comment le vérifiez-vous ?', 'Comment avez-vous organisé les groupes et les droits NTFS (AGDLP) ?']],
  [/dhcp|dns/i, ['Un poste n\'obtient pas d\'adresse : quelles vérifications faites-vous, dans quel ordre ?', 'Que se passe-t-il si votre serveur DNS tombe en panne ?']],
  [/vpn|wireguard|openvpn|ipsec/i, ['Pourquoi ce type de VPN plutôt qu\'un autre ? Comment l\'authentification est-elle sécurisée ?', 'Que voit un attaquant qui intercepte le trafic du tunnel ?']],
  [/glpi|ocs|ticket/i, ['Comment un utilisateur crée-t-il un ticket et comment est-il priorisé ?', 'Comment GLPI vous aide-t-il à suivre les licences ?']],
  [/zabbix|centreon|nagios|supervision|snmp/i, ['Quels indicateurs surveillez-vous et quels seuils d\'alerte avez-vous choisis ?', 'Pourquoi SNMPv3 plutôt que v2c ?']],
  [/proxmox|vmware|esxi|hyper-v|virtualbox|docker|conteneur/i, ['Pourquoi la virtualisation (ou des conteneurs) ici ? Comment sauvegardez-vous vos machines ?', 'Différence entre un instantané et une sauvegarde dans votre infrastructure ?']],
  [/haproxy|keepalived|cluster|haute disponibilit/i, ['Montrez-moi ce qui se passe quand un des serveurs tombe.', 'Où reste-t-il un point unique de défaillance ?']],
  [/sauvegarde|backup|veeam|rsync|borg/i, ['Quelle est votre fréquence de sauvegarde et quel RPO cela donne-t-il ?', 'Avez-vous testé une restauration ? Montrez-la.']],
  [/php|symfony|laravel|mvc/i, ['Montrez-moi le chemin d\'une requête dans votre code, du contrôleur à la vue.', 'Comment protégez-vous vos formulaires contre les injections SQL et les failles XSS ?']],
  [/sql|mysql|mariadb|postgres|base de donn/i, ['Présentez votre modèle de données et justifiez une association.', 'Écrivez en direct une requête qui compte les enregistrements par catégorie.']],
  [/java|c#|\.net|python|javascript|react|vue|angular|node/i, ['Expliquez une classe ou une fonction de votre code ligne par ligne.', 'Comment avez-vous testé votre code (tests unitaires) ?']],
  [/api|rest|jwt|json/i, ['Quels codes HTTP renvoie votre API et dans quels cas ?', 'Comment sécurisez-vous l\'accès à votre API ?']],
  [/git|github|gitlab/i, ['Montrez-moi votre historique Git et expliquez votre organisation en branches.']],
  [/wordpress|site|cms|référencement|seo/i, ['Comment avez-vous sécurisé le site (mises à jour, comptes, sauvegardes) ?', 'Quelles obligations légales le site respecte-t-il (mentions légales, cookies, RGPD) ?']]
];
function realQuestions(r) {
  var t1 = (r.techno || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean)[0] || 'cette solution';
  var q = [['Présentez « ' + r.titre + ' » en deux minutes : contexte, besoin, solution, résultat.', 'Contexte → besoin → solution et pourquoi → ce que tu as fait toi-même → résultat → compétences couvertes. Appuie-toi sur : ' + (r.contexte || 'ton contexte').slice(0, 160)],
    ['Pourquoi avoir choisi ' + t1 + ' plutôt qu\'une autre solution ?', 'Compare 2 ou 3 solutions (coût, sécurité, compétences, compatibilité) et justifie par le besoin.'],
    ['Qu\'avez-vous fait vous-même, concrètement ?', 'Utilise « j\'ai » et des étapes précises. Ta fiche : ' + (r.solution || '').slice(0, 160)],
    ['Quelle a été la principale difficulté et comment l\'avez-vous surmontée ?', r.difficultes ? 'Ta réponse prévue : ' + r.difficultes.slice(0, 200) : 'Prépare une difficulté réelle, la cause, la solution et ce que tu en as appris.'],
    ['Comment avez-vous vérifié que votre réalisation fonctionne ?', r.tests ? 'Tes preuves : ' + r.tests.slice(0, 200) : 'Plan de tests (attendu / obtenu), captures, démonstration en direct.'],
    ['Quelles compétences du référentiel cette réalisation couvre-t-elle ?', r.competences ? 'Tu as noté : ' + r.competences.slice(0, 200) : 'Relie chaque étape à une compétence du bloc ' + (r.ep === 'E5' ? '1' : '2') + '.'],
    ['Que feriez-vous différemment avec plus de temps ?', 'Montre du recul : sécurité, automatisation, documentation, tests.']];
  var all = [r.titre, r.techno, r.solution, r.contexte].join(' ');
  TECH_Q.forEach(function (k) { if (k[0].test(all)) k[1].forEach(function (x) { q.push([x, 'Question technique liée à ta réalisation : prépare une démonstration ou un schéma.']); }); });
  return q;
}
function realPrompt(r) {
  return IA_INTRO + 'Joue le rôle du jury de l\'épreuve ' + (r.ep === 'E5' ? 'E5 (support et mise à disposition de services)' : 'E6 (épreuve pratique)') + '. Voici ma réalisation :\n- Titre : ' + r.titre + '\n- Contexte : ' + (r.contexte || '') + '\n- Solution : ' + (r.solution || '') + '\n- Technologies : ' + (r.techno || '') + '\n- Compétences : ' + (r.competences || '') + '\n- Difficultés : ' + (r.difficultes || '') + '\n- Tests : ' + (r.tests || '') +
    '\n\nPose-moi les questions qu\'un vrai jury poserait, UNE à la fois, en attendant ma réponse : d\'abord ma présentation, puis des « pourquoi ce choix ? », puis des questions techniques précises et une demande de modification en direct. Relance quand ma réponse est floue. À la fin, note-moi sur 20 et donne 3 conseils concrets.';
}
V.realisations = function (id) {
  S.reals = S.reals || [];
  var r = id && S.reals.filter(function (x) { return x.id === id; })[0];
  if (id === 'nouvelle' || (r && V.realisations.edit === id)) {
    var v = r || { ep: 'E6' };
    return '<p><a href="#realisations">← Mes réalisations</a></p>' + pageHead(r ? 'Modifier la réalisation' : 'Nouvelle réalisation', 'Plus ta fiche est précise, plus les questions de jury seront proches de celles du vrai jury.') +
      '<div class="card"><div class="filters"><label>Épreuve<select id="rEp"><option value="E6"' + (v.ep === 'E6' ? ' selected' : '') + '>E6 — épreuve pratique</option><option value="E5"' + (v.ep === 'E5' ? ' selected' : '') + '>E5 — support et services</option></select></label></div>' +
      REAL_CHAMPS.map(function (c) { return '<label class="rf"><span>' + c[1] + '</span>' + (c[3] === 'input' ? '<input id="r_' + c[0] + '" value="' + esc(v[c[0]] || '') + '" placeholder="' + esc(c[2]) + '">' : '<textarea id="r_' + c[0] + '" placeholder="' + esc(c[2]) + '">' + esc(v[c[0]] || '') + '</textarea>') + '</label>'; }).join('') +
      '<div class="row"><button class="btn" data-a="rsave" data-id="' + (r ? r.id : '') + '">Enregistrer</button><a class="btn ghost" href="#realisations">Annuler</a></div></div>';
  }
  if (r) {
    var qs = realQuestions(r);
    return '<p><a href="#realisations">← Mes réalisations</a></p><div class="row sp"><h1>' + esc(r.titre) + '</h1><div class="row"><button class="btn ghost small" data-a="redit" data-id="' + r.id + '">Modifier</button><button class="btn ghost small" data-a="rdel" data-id="' + r.id + '">Supprimer</button></div></div>' +
      '<p class="muted">' + r.ep + (r.techno ? ' · ' + esc(r.techno) : '') + '</p>' +
      '<div class="row" style="margin-bottom:1rem"><button class="btn" data-a="roral" data-id="' + r.id + '">M\'entraîner à l\'oral sur cette réalisation</button>' + iaBtn('rjury', realPrompt(r), 'Jury IA sur cette réalisation', 'big') + '</div>' +
      '<h2>' + qs.length + ' questions que le jury peut te poser</h2><div class="card"><ol class="steps">' + qs.map(function (q) { return '<li><b>' + esc(q[0]) + '</b><br><span class="small muted">' + esc(q[1]) + '</span></li>'; }).join('') + '</ol></div>' +
      '<h2>Ma fiche</h2><div class="card">' + REAL_CHAMPS.slice(1).map(function (c) { return r[c[0]] ? '<p><b>' + c[1] + '</b><br><span style="white-space:pre-wrap">' + esc(r[c[0]]) + '</span></p>' : ''; }).join('') + '</div>';
  }
  return pageHead('Mes réalisations (E5 et E6)', 'À l\'E5 et à l\'E6, le jury t\'interroge sur TES réalisations. Décris chacune ici : l\'application en tire les questions qu\'un jury poserait (y compris des questions techniques selon les outils utilisés), et tu peux t\'entraîner à l\'oral ou avec le jury IA.') +
    '<div class="row" style="margin-bottom:1rem"><a class="btn" href="#realisations/nouvelle">Ajouter une réalisation</a></div>' +
    (S.reals.length ? '<div class="cols">' + S.reals.map(function (x) { return '<a class="card tile" href="#realisations/' + x.id + '"><span class="tag acc" style="align-self:flex-start">' + x.ep + '</span><b>' + esc(x.titre) + '</b><span>' + esc(x.techno || '') + '</span><span class="small">' + realQuestions(x).length + ' questions de jury</span></a>'; }).join('') + '</div>'
      : '<div class="card"><p><b>Aucune réalisation pour l\'instant.</b></p><p class="muted">Commence par celle que tu présenteras en premier. Il faut en général deux réalisations pour l\'E6, et le tableau de synthèse de l\'E5 en liste plusieurs.</p></div>');
};

/* — Rappel de sauvegarde : la progression vit dans le navigateur, un nettoyage peut l'effacer — */
function rappelSauvegarde() {
  var actif = Object.keys(S.answers).length + Object.keys(S.cards).length + (S.ctrl || []).length + (S.reals || []).length;
  if (actif < 5) return '';
  var depuis = S.lastBackup ? Math.floor((Date.now() - S.lastBackup) / DAY) : null;
  if ((depuis != null && depuis < 7) || (S.backupSnooze && Date.now() - S.backupSnooze < 2 * DAY)) return '';
  return '<div class="card warnc"><div><b>' + (depuis == null ? 'Tu n\'as jamais sauvegardé ta progression.' : 'Dernière sauvegarde il y a ' + depuis + ' jours.') + '</b><p class="small" style="margin:.2rem 0 0">Ta progression est stockée dans ce navigateur : effacer les données de navigation la supprimerait. Garde une copie dans un fichier (ou sur ta clé USB, ton cloud…).</p></div>' +
    '<div class="row"><button class="btn" data-a="export">Sauvegarder maintenant</button><button class="btn ghost small" data-a="snooze">Plus tard</button></div></div>';
}

/* — Planning jusqu'à l'examen : semaines, matières prioritaires (coefficient × note), examens blancs aux bons moments — */
function planning() {
  var exam = new Date((S.exam || '2027-05-11') + 'T00:00:00'), debut = new Date(semaine(Date.now())), sem = [];
  var nm = notesMatieres(), mats = Object.keys(nm).filter(function (m) { return MATIERES[m] && matOK(m); });
  var poids = {}; mats.forEach(function (m) { var n = nm[m].note == null ? 0.5 : nm[m].note; poids[m] = EPREUVES[nm[m].ep][2] * (1.2 - n); });
  var choisi = {};
  for (var d = new Date(debut), i = 0; d < exam && i < 60; d.setDate(d.getDate() + 7), i++) {
    var avant = Math.ceil((exam - d) / (7 * DAY)), focus = mats.slice().sort(function (a, b) { return poids[b] / (1 + (choisi[b] || 0)) - poids[a] / (1 + (choisi[a] || 0)); }).slice(0, avant <= 1 ? 0 : 3);
    focus.forEach(function (m) { choisi[m] = (choisi[m] || 0) + 1; });
    var jalons = [];
    if (avant === 8) jalons.push(['Examen blanc E7 (4 h)', '#examen']);
    if (avant === 7) jalons.push(['Oral blanc E6 sur tes réalisations', '#realisations']);
    if (avant === 6) jalons.push(['Examen blanc E4 CEJM (4 h)', '#examen']);
    if (avant === 5) jalons.push(['Entraînement E1 : questions sur corpus + essai (3 h)', '#cas']);
    if (avant === 4) jalons.push(['Oral blanc E5 + anglais', '#oral']);
    if (avant === 3) jalons.push(['2e examen blanc E7', '#examen']);
    if (avant === 2) jalons.push(['2e examen blanc E4 + relire le carnet d\'erreurs', '#erreurs']);
    if (avant <= 1) jalons.push(['Révisions légères : fiches, flashcards, carnet d\'erreurs, sommeil', '#fiches']);
    sem.push({ d: new Date(d), avant: avant, focus: focus, jalons: jalons });
  }
  return sem;
}
V.planning = function () {
  var sem = planning(), exam = S.exam || '2027-05-11', fait = S.planDone || {};
  return pageHead('Mon planning', 'Ton programme semaine par semaine jusqu\'à l\'examen (' + new Date(exam + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + '). Chaque semaine met l\'accent sur les matières où tu gagneras le plus de points (coefficient × marge de progression d\'après tes notes) ; les examens blancs et oraux blancs sont placés dans les dernières semaines. Il se recalcule à mesure que tes notes changent.') +
    (S.exam ? '' : '<div class="card hint small">Date d\'examen non renseignée : le planning utilise le 11 mai 2027 (début des épreuves du BTS). <a href="#suivi">Changer la date</a></div>') +
    '<div class="plan">' + sem.map(function (s, i) {
      var k = s.d.toISOString().slice(0, 10), cur = i === 0;
      return '<div class="card pw' + (cur ? ' cur' : '') + (fait[k] ? ' ok' : '') + '"><div class="row sp"><b>' + (cur ? 'Cette semaine' : 'Semaine du ' + s.d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })) + '</b><span class="small muted">J-' + Math.max(0, Math.round((new Date(exam + 'T00:00:00') - s.d) / DAY)) + '</span></div>' +
        (s.focus.length ? '<div class="row" style="margin:.4rem 0">' + s.focus.map(function (m) { return '<button class="chip" data-a="goflash" data-v="' + m + '" title="Réviser cette matière">' + esc(MATIERES[m][0].replace(/^E(\d) · /, 'E$1 ').replace(' — ', ' ')) + '</button>'; }).join('') + '</div>' : '') +
        (s.jalons.length ? '<ul class="small">' + s.jalons.map(function (j) { return '<li><a href="' + j[1] + '">' + esc(j[0]) + '</a></li>'; }).join('') + '</ul>' : '<p class="small muted" style="margin:.2rem 0">Objectif du jour chaque jour + 1 étude de cas ou QCM sur chacune de ces matières.</p>') +
        '<label class="small chk"><input type="checkbox" data-plan="' + k + '"' + (fait[k] ? ' checked' : '') + '> Semaine faite</label></div>';
    }).join('') + '</div>';
};

/* — Tests d'intrusion (pentest) : documentation, lecture d'un scan, plateformes légales (data/pentest.js) — */
V.pentest = function () {
  var P = window.PENTEST, ids = ['pentest', 'pentest-legal', 'pentest-phases', 'boites', 'vuln-scan', 'cvss', 'osint', 'durcissement', 'red-blue', 'labs'];
  return pageHead('Tests d\'intrusion (pentest)', 'Comprendre ce qu\'est un test d\'intrusion, son cadre légal, ses étapes et ce qu\'on en fait ensuite. À l\'E7, on te demande surtout d\'analyser des vulnérabilités, de lire des résultats de scan, de prioriser et de proposer des corrections.') +
    '<div class="row" style="margin-bottom:1.2rem"><button class="btn" data-a="startsujet" data-id="ENT_E7_Pentest">Étude de cas : analyser un rapport de pentest</button><button class="btn ghost" data-a="ptflash">Flashcards pentest (' + ids.length + ')</button><a class="btn ghost" href="#pentest-scan">Lire un résultat de scan</a></div>' +
    schemaHtml('pentest-phases') +
    P.sections.map(function (s) { return '<div class="card doc"><h2>' + esc(s.titre) + '</h2>' + s.html + '</div>'; }).join('') +
    '<div class="card doc"><h2>Les outils, phase par phase</h2><p class="small muted">À connaître de nom et de rôle : le jury ou le sujet peuvent en citer. À n\'utiliser que dans un cadre autorisé.</p><table><tr><th>Phase</th><th>Outil</th><th>À quoi il sert</th></tr>' + P.outils.map(function (o) { return '<tr><td>' + esc(o[0]) + '</td><td><b>' + esc(o[1]) + '</b></td><td>' + esc(o[2]) + '</td></tr>'; }).join('') + '</table></div>' +
    '<div class="card doc" id="pentest-scan"><h2>Exercice : lire un résultat de scan</h2><p>' + esc(P.scan.intro) + '</p><pre class="code">' + esc(P.scan.sortie) + '</pre>' +
      P.scan.questions.map(function (q, i) { return '<details class="more"><summary>' + (i + 1) + '. ' + esc(q[0]) + '</summary><div class="exbox"><p>' + esc(q[1]) + '</p></div></details>'; }).join('') +
      '<div class="row">' + iaBtn('ptscan', IA_INTRO + 'Voici un extrait de scan Nmap réalisé avec autorisation sur un serveur de PME, dans un exercice de révision pour l\'épreuve E7 :\n' + P.scan.sortie + '\n\nPose-moi 4 questions d\'analyse comme à l\'examen (services exposés, risques, priorités, mesures de durcissement), une à la fois, corrige chacune de mes réponses, puis donne-moi une analyse modèle. Reste sur l\'analyse défensive.', 'M\'entraîner avec l\'IA sur ce scan') + '</div></div>' +
    '<div class="card doc"><h2>S\'entraîner légalement</h2><ul>' + P.labs.map(function (l) { return '<li><b>' + (l[1] ? '<a target="_blank" rel="noopener" href="' + l[1] + '">' + esc(l[0]) + '</a>' : esc(l[0])) + '</b> — ' + esc(l[2]) + '</li>'; }).join('') + '</ul></div>';
};

/* — Organisation par grands thèmes (comme les paquets et sous-paquets d'Anki, ou les unités d'un cours) —
   Un « paquet » se désigne par : 'all' (tout), 'E7' (une épreuve), 'cyber' (une matière) ou 'cyber.2' (le 3e thème de la matière). */
function themesOf(m) { return NOT.filter(function (n) { return n.mat === m; }).map(function (n) { return n.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }); }
function deckCards(arg) {
  var L = mesNotions();
  if (!arg || arg === 'all') return L;
  if (EPREUVES[arg]) return L.filter(function (n) { return MATIERES[n.mat][2] === arg; });
  var p = String(arg).split('.'), m = p[0];
  L = L.filter(function (n) { return n.mat === m; });
  return p.length > 1 ? L.filter(function (n) { return n.cat === themesOf(m)[+p[1]]; }) : L;
}
function deckLabel(arg) {
  if (!arg || arg === 'all') return 'Toutes les matières';
  if (EPREUVES[arg]) return arg + ' · ' + epTitre(arg);
  var p = String(arg).split('.'); return MATIERES[p[0]][0] + (p.length > 1 ? ' › ' + themesOf(p[0])[+p[1]] : '');
}
function deckStats(L) {
  var now = Date.now(), s = { total: L.length, nouv: 0, revoir: 0, maitr: 0 };
  L.forEach(function (n) { var c = S.cards[n.id]; if (S.learned[n.id]) s.maitr++; else if (!c) s.nouv++; else if (c.d <= now) s.revoir++; else if (c.s >= 21) s.maitr++; });
  return s;
}
function deckDue(L) {   // à revoir d'abord, puis nouvelles, par importance
  var now = Date.now();
  return L.filter(function (n) { return !S.learned[n.id] && (!S.cards[n.id] || S.cards[n.id].d <= now); })
    .sort(function (a, b) { return (S.cards[b.id] ? 1 : 0) - (S.cards[a.id] ? 1 : 0) || b.imp - a.imp; });
}
function deckBadges(s) {
  return '<span class="dk"><i class="b-rev" title="À revoir aujourd\'hui">' + s.revoir + '</i><i class="b-new" title="Nouvelles">' + s.nouv + '</i><i class="b-ok" title="Maîtrisées">' + s.maitr + '</i></span>';
}
function deckRow(arg, titre, s, extra) {
  var a = s.revoir + s.nouv;
  return '<div class="deckrow"><span class="dn">' + titre + '</span>' + deckBadges(s) + '<span class="bar" title="' + s.maitr + ' maîtrisées sur ' + s.total + '"><i style="width:' + (s.total ? s.maitr / s.total * 100 : 0) + '%"></i></span>' +
    '<a class="btn small' + (a ? '' : ' ghost') + '" href="#flash/deck/' + arg + '">' + (a ? 'Réviser ' + Math.min(a, 20) : 'Revoir') + '</a>' + (extra || '') + '</div>';
}
function flashDecks() {
  var all = deckStats(mesNotions()), err = carteErreurs().length;
  return pageHead('Flashcards', 'Tes cartes sont rangées comme dans Anki : épreuve › matière › grand thème. Réviser une matière révise tous ses thèmes. Dans chaque paquet : <b class="t-rev">à revoir</b> aujourd\'hui, <b class="t-new">nouvelles</b>, <b class="t-ok">maîtrisées</b>.') +
    '<div class="decktop"><a class="card tile big" href="#flash/deck/all"><b>Tout réviser (mélangé)</b><span>' + (all.revoir + all.nouv) + ' cartes à voir aujourd\'hui, toutes matières alternées : la meilleure option au quotidien.</span></a>' +
      '<a class="card tile" href="#flash/express"><b>Révision express</b><span>5 cartes, pour 2 minutes</span></a>' +
      '<a class="card tile" href="#flash/erreurs"><b>Mes erreurs</b><span>' + err + ' carte(s) ratée(s) à retravailler</span></a></div>' +
    Object.keys(EPREUVES).map(function (ep) {
      var mats = matsOf(ep); if (!mats.length) return '';
      return '<section class="deckgrp"><div class="row sp"><h2>' + ep + ' · ' + esc(epTitre(ep)) + ' <small>coef. ' + EPREUVES[ep][2] + '</small></h2>' + (mats.length > 1 ? '<a class="small" href="#flash/deck/' + ep + '">Réviser toute l\'épreuve</a>' : '') + '</div>' +
        mats.map(function (m) {
          var th = themesOf(m);
          return '<details class="card deck"' + (S.deckOpen && S.deckOpen[m] ? ' open' : '') + ' data-m="' + m + '"><summary>' + deckRow(m, '<b>' + esc(MATIERES[m][4]) + '</b> <a class="small dl" href="#matiere/' + m + '">page de la matière</a>', deckStats(deckCards(m))) + '</summary>' +
            '<div class="subdecks">' + th.map(function (c, i) { return deckRow(m + '.' + i, esc(c), deckStats(deckCards(m + '.' + i))); }).join('') + '</div></details>';
        }).join('') + '</section>';
    }).join('');
}

/* — Pages « matière » (comme la page d'un cours) : thèmes avec progression, entraînement, erreurs, schémas, probables — */
V.matieres = function () {
  var nm = notesMatieres();
  return pageHead('Mes matières', 'Choisis une matière : sa page regroupe tout ce qui la concerne (thèmes, flashcards, entraînement, erreurs fréquentes, schémas, thèmes à réviser). C\'est le meilleur point de départ quand tu ne sais pas par où commencer.') +
    Object.keys(EPREUVES).map(function (ep) {
      var mats = matsOf(ep); if (!mats.length) return '';
      return '<h2>' + ep + ' · ' + esc(epTitre(ep)) + ' <small class="muted">coef. ' + EPREUVES[ep][2] + '</small></h2><div class="cols mats">' + mats.map(function (m) {
        var s = deckStats(deckCards(m)), x = nm[m];
        return '<a class="card tile" href="#matiere/' + m + '"><b>' + esc(MATIERES[m][0].replace(/^E\d · /, '')) + '</b><span>' + themesOf(m).length + ' thèmes · ' + s.total + ' notions' + (x && x.note != null ? ' · note ' + sur20(x.note) + '/20' : '') + '</span>' +
          '<span class="bar"><i style="width:' + (s.total ? s.maitr / s.total * 100 : 0) + '%"></i></span><span class="small">' + s.maitr + ' maîtrisée(s) · ' + (s.revoir + s.nouv) + ' à voir</span></a>';
      }).join('') + '</div>';
    }).join('');
};
V.matiere = function (m) {
  if (!MATIERES[m]) return V.matieres();
  var ep = MATIERES[m][2], x = notesMatieres()[m] || {}, s = deckStats(deckCards(m)), th = themesOf(m);
  var probs = Object.keys(THEMES).filter(function (id) { return THEMES[id][1] === m; }).sort(function (a, b) { return THEME_STATS[b].ratio - THEME_STATS[a].ratio; }).slice(0, 4);
  var sch = NOT.filter(function (n) { return n.mat === m && SCH[n.id]; });
  var ent = ENT.some(function (e) { return e.mat === m; }), an = m === 'sisr' ? 'SISR' : m === 'slam' ? 'SLAM' : m === 'cyber' ? (S.option || 'SISR') : (m === 'eco' || m === 'droit' || m === 'mgmt') ? 'CEJM' : '';
  var train = [];
  if (ent || an) train.push('<button class="btn" data-a="startkind" data-v="' + (ent ? 'mat:' + m : an) + '">Étude de cas</button>');
  train.push('<a class="btn ghost" href="#qcm/' + ep + '">QCM ' + ep + '</a>');
  if (Object.keys(EXOS).some(function (k) { return !EXOS[k].python && EXOS[k].mats.indexOf(m) >= 0; })) train.push('<a class="btn ghost" href="#exos">Exercices</a>');
  if (m === 'algo' || m === 'maths') train.push('<a class="btn ghost" href="#python">Maths et Python</a>');
  if ((window.ORAL || {})[m]) train.push('<a class="btn ghost" href="#oral">Simulateur d\'oral</a>');
  if (m === 'e5' || m === 'e6sisr' || m === 'e6slam') train.push('<a class="btn ghost" href="#realisations">Mes réalisations</a>');
  if (m === 'cyber') train.push('<a class="btn ghost" href="#pentest">Tests d\'intrusion</a>');
  return '<p><a href="#matieres">← Mes matières</a></p>' + pageHead(MATIERES[m][0], esc(MATIERES[m][1]) + ' · Épreuve ' + ep + ', ' + esc(EPREUVES[ep][1]) + ', coefficient ' + EPREUVES[ep][2] + '.') +
    '<div class="grid stats"><div class="card stat"><b>' + (x.note != null ? sur20(x.note) + ' / 20' : '—') + '</b><span>ma note dans cette matière</span></div>' +
      '<div class="card stat"><b>' + s.maitr + ' / ' + s.total + '</b><span>notions maîtrisées</span></div><a class="card stat tile" href="#flash/deck/' + m + '"><b>' + (s.revoir + s.nouv) + '</b><span>cartes à voir → réviser</span></a></div>' +
    '<h2>Les thèmes</h2><div class="units">' + th.map(function (c, i) {
      var L = deckCards(m + '.' + i), st = deckStats(L);
      return '<div class="card unit"><div class="row sp"><b>' + esc(c) + '</b><span class="small muted">' + st.maitr + ' / ' + st.total + ' maîtrisées</span></div><span class="bar"><i style="width:' + (st.total ? st.maitr / st.total * 100 : 0) + '%"></i></span>' +
        '<details class="more"><summary>Voir les ' + L.length + ' notions</summary><ul class="small">' + L.map(function (n) { return '<li>' + (S.learned[n.id] ? '✓ ' : '') + esc(n.titre) + (SCH[n.id] ? ' <span class="tag">schéma</span>' : '') + '</li>'; }).join('') + '</ul></details>' +
        '<div class="row"><a class="btn small" href="#flash/deck/' + m + '.' + i + '">Flashcards du thème</a><button class="btn ghost small" data-a="readtheme" data-m="' + m + '" data-c="' + esc(c) + '">Lire les fiches</button></div></div>';
    }).join('') + '</div>' +
    '<h2>S\'entraîner</h2><div class="row">' + train.join('') + '</div>' +
    (ERR[m] ? '<h2>Erreurs fréquentes</h2><div class="cols">' + erreursDe(m, 3).map(erreurItem).join('') + '</div><p class="small"><a href="#erreursfreq" data-a="errm" data-v="' + m + '">Toutes les erreurs fréquentes de la matière</a></p>' : '') +
    (probs.length ? '<h2>Thèmes à travailler</h2><div class="card"><ul>' + probs.map(function (id) { return '<li><b>' + esc(THEMES[id][0]) + '</b> — <span class="tag ' + (THEME_STATS[id].ratio >= 0.8 ? 'i3' : THEME_STATS[id].ratio >= 0.6 ? 'i2' : '') + '">' + THEME_STATS[id].niveau + '</span><br><span class="small muted">' + esc(THEMES[id][2]) + '</span></li>'; }).join('') + '</ul><a class="small" href="#pronos" data-a="goep" data-v="' + ep + '" data-to="pronos">Tous les thèmes à réviser de l\'' + ep + '</a></div>' : '') +
    (sch.length ? '<h2>Schémas</h2>' + sch.map(function (n) { return '<details class="card more"><summary>' + esc(n.titre) + '</summary>' + schemaHtml(n.id) + '</details>'; }).join('') : '');
};

/* — Mon suivi, mes réponses, export pour une IA — */
function themeMoyennes() {
  return Object.keys(THEMES).map(function (id) {
    var qs = QUESTIONS.filter(function (q) { return q.themes.indexOf(id) >= 0 && S.qdone[q.id] != null; });
    return { id: id, n: qs.length, moy: qs.length ? qs.reduce(function (t, q) { return t + S.qdone[q.id]; }, 0) / qs.length : null };
  }).filter(function (t) { return t.n; }).sort(function (a, b) { return a.moy - b.moy; });
}
function reponses() {   // toutes les réponses enregistrées, de la plus récente à la plus ancienne
  var out = [];
  Object.keys(S.answers).forEach(function (id) { var q = qById(id); if (q) S.answers[id].forEach(function (a) { out.push({ q: q, a: a }); }); });
  return out.sort(function (x, y) { return y.a.d - x.a.d; });
}
/* Fichier Markdown à donner à une IA (ChatGPT, Claude…) : consigne + moyennes par thème + chaque réponse avec énoncé et correction. */
function iaMarkdown() {
  var rs = reponses(), tm = themeMoyennes(), nots = mesNotions();
  var L = ['# Mes réponses d\'entraînement — BTS SIO (2e année)', '',
    '## Ce que je te demande', '',
    'Tu es professeur en BTS SIO et correcteur de l\'examen. Voici toutes mes réponses à des questions d\'annales (E7 Cybersécurité et E4 CEJM) et à des études de cas d\'entraînement (autres épreuves), avec pour chacune l\'énoncé, ma réponse, une correction proposée (non officielle, elle peut être incomplète) et la note que je me suis attribuée.',
    'Analyse-les et donne-moi :', '1. mes points forts, par thème ;', '2. mes points faibles, par thème, du plus grave au moins grave ;',
    '3. mes erreurs de méthode récurrentes (réponses trop courtes, pas de justification, hors sujet, vocabulaire imprécis…) ;',
    '4. un plan de révision priorisé pour les prochaines semaines ;', '5. pour mes trois plus mauvaises réponses, une réponse modèle rédigée comme à l\'examen.',
    'Si une de mes notes te paraît trop généreuse ou trop sévère, dis-le.', '',
    '## Mon profil', '', '- Option : ' + (S.option || 'non précisée'), '- Date de l\'export : ' + new Date().toLocaleDateString('fr-FR'),
    '- Date de mon épreuve : ' + (S.exam ? new Date(S.exam).toLocaleDateString('fr-FR') : 'non renseignée'),
    '- Notions marquées comme apprises : ' + nots.filter(function (n) { return S.learned[n.id]; }).length + ' sur ' + nots.length,
    '- Réponses rédigées : ' + rs.length, '',
    '## Mes moyennes par thème (de la plus faible à la plus forte)', ''];
  tm.forEach(function (t) { L.push('- ' + THEMES[t.id][0] + ' : ' + sur20(t.moy) + ' / 20 sur ' + t.n + ' question(s)'); });
  var nm = notesMatieres(), mg = moyenneGenerale(notesEpreuves(nm));
  L.push('', '## Mes notes par matière (60 % études de cas, 20 % flashcards, 20 % oral)', '');
  if (mg) L.push('- Moyenne générale estimée (pondérée par les coefficients) : ' + sur20(mg.note) + ' / 20');
  Object.keys(nm).forEach(function (m) { var x = nm[m]; if (x.note != null) L.push('- ' + MATIERES[m][0] + ' : ' + sur20(x.note) + ' / 20 (études de cas : ' + (x.cas != null ? sur20(x.cas) + ' / 20 sur ' + x.nq + ' question(s)' : 'aucune') + ' ; flashcards : ' + (x.fl != null ? Math.round(x.fl * 100) + ' % de réussite sur ' + x.nf : 'aucune') + ')'); });
  if (S.history.length) { L.push('', '## Mes études de cas terminées', ''); S.history.forEach(function (h) { L.push('- ' + new Date(h.date).toLocaleDateString('fr-FR') + ' — ' + h.titre + ' : ' + String(h.note).replace('.', ',') + ' / 20 (' + h.n + ' questions)'); }); }
  L.push('', '## Mes réponses', '');
  rs.forEach(function (r) {
    var q = r.q;
    L.push('### ' + sujetLabel(SUJETS[q.sujet]) + ' — question ' + q.num, '',
      '- Date : ' + new Date(r.a.d).toLocaleDateString('fr-FR') + ' · Note retenue : ' + sur20(r.a.note) + ' / 20 (note automatique par mots-clés : ' + sur20(r.a.auto) + ' / 20)',
      '- Thèmes : ' + q.themes.map(function (t) { return THEMES[t] ? THEMES[t][0] : t; }).join(', '), '',
      '**Énoncé :** ' + (q.contexte ? q.contexte + ' ' : '') + q.texte, '',
      '**Ma réponse :** ' + (r.a.rep || '(je n\'ai pas su répondre)'), '',
      '**Correction proposée :** ' + (q.corr || '—'), '');
  });
  return L.join('\n');
}
V.suivi = function () {
  var parT = themeMoyennes(), rs = reponses();
  return '<h1>Mon suivi</h1><p class="lead">Ta progression et toutes tes réponses sont enregistrées dans ce navigateur, sur cet ordinateur.</p>' +
    '<h2>Faire analyser mes réponses par une IA</h2><div class="card"><p>' + (rs.length ? '<b>' + rs.length + ' réponse(s) enregistrée(s).</b> ' : '<b>Aucune réponse enregistrée pour l\'instant.</b> Fais une étude de cas, chaque réponse validée sera gardée. ') +
      'Le fichier contient une consigne toute prête, tes moyennes par thème, puis chaque question avec ta réponse et la correction proposée. Donne-le à ChatGPT, Claude ou une autre IA pour connaître tes points forts, tes points faibles et un plan de révision.</p>' +
      '<div class="row"><button class="btn" data-a="iafile"' + (rs.length ? '' : ' disabled') + '>Télécharger le fichier pour l\'IA</button><button class="btn ghost" data-a="iacopy"' + (rs.length ? '' : ' disabled') + '>Copier le texte</button><span class="small muted" id="iamsg"></span></div>' +
      '<p class="small muted" style="margin-top:.6rem">Rien n\'est envoyé automatiquement : c\'est toi qui transmets le fichier à l\'IA de ton choix.</p></div>' +
    '<h2>Mes points faibles et forts</h2>' + (parT.length ? '<div class="card"><table><tr><th>Thème</th><th>Questions travaillées</th><th>Moyenne</th><th></th></tr>' + parT.map(function (t) {
      return '<tr><td>' + esc(THEMES[t.id][0]) + '</td><td class="n">' + t.n + '</td><td class="n">' + sur20(t.moy) + ' / 20</td><td><div class="bar"><i style="width:' + t.moy * 100 + '%"></i></div></td></tr>'; }).join('') + '</table></div>' : '<div class="card"><p class="muted">Fais une première étude de cas pour voir tes moyennes par thème, de la plus faible à la plus forte.</p></div>') +
    '<h2>Mes réponses enregistrées</h2>' + (rs.length ? '<div class="card">' + rs.slice(0, 60).map(function (r) {
      return '<details class="rep"><summary><span class="n">' + new Date(r.a.d).toLocaleDateString('fr-FR') + '</span> · ' + esc(SUJETS[r.q.sujet].cas) + ' ' + esc(r.q.num) + ' · <b>' + sur20(r.a.note) + ' / 20</b> <span class="muted">— ' + esc(r.q.texte.slice(0, 80)) + '…</span></summary>' +
        '<p class="small"><b>Énoncé :</b> ' + esc(r.q.texte) + '</p><div class="corr"><b class="small">Ma réponse</b><p style="white-space:pre-wrap">' + (r.a.rep ? esc(r.a.rep) : '<span class="muted">(pas de réponse)</span>') + '</p></div><div class="corr"><b class="small">Correction proposée</b><p>' + esc(r.q.corr) + '</p>' + (study ? study.trace(r.q) : '') + '</div></details>'; }).join('') +
      (rs.length > 60 ? '<p class="small muted">Les 60 plus récentes sont affichées ; le fichier pour l\'IA les contient toutes.</p>' : '') + '</div>' : '<div class="card"><p class="muted">Aucune réponse pour l\'instant.</p></div>') +
    '<h2>Historique des études de cas</h2>' + (S.history.length ? '<div class="card"><table><tr><th>Date</th><th>Entraînement</th><th>Questions</th><th>Note</th></tr>' + S.history.slice().reverse().map(function (h) {
      return '<tr><td class="n">' + new Date(h.date).toLocaleDateString('fr-FR') + '</td><td>' + esc(h.titre) + '</td><td class="n">' + h.n + '</td><td class="n">' + String(h.note).replace('.', ',') + ' / 20</td></tr>'; }).join('') + '</table></div>' : '<div class="card"><p class="muted">Aucune étude de cas terminée.</p></div>') +
    '<h2>Réglages et sauvegarde</h2><div class="card"><div class="filters"><label>Date de mon examen (objectif du jour et compte à rebours)<input type="date" id="exam" value="' + esc(S.exam) + '"></label>' +
      '<button class="btn ghost small" data-a="date27" title="Première épreuve écrite commune du BTS 2027">Utiliser le BTS 2027 (11 mai)</button>' +
      '<label>Flashcards : taux de mémorisation visé<select id="retSel">' + [[0.85, '85 % (moins de révisions)'], [0.9, '90 % (conseillé)'], [0.95, '95 % (plus de révisions)']].map(function (o) { return '<option value="' + o[0] + '"' + ((S.retention || 0.9) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>IA ouverte par les boutons ✦<select id="iaSel"><option value="chatgpt"' + (S.ia !== 'claude' ? ' selected' : '') + '>ChatGPT</option><option value="claude"' + (S.ia === 'claude' ? ' selected' : '') + '>Claude</option></select></label></div>' +
      '<p class="small muted">Calendrier officiel 2027 (BTS tertiaires) : épreuves du 11 au 21 mai 2027 ; culture générale le mardi 11 mai de 9 h à 12 h ; épreuves professionnelles écrites (dont l\'E7) les 20 et 21 mai. Vérifie ta convocation pour les dates exactes de chaque épreuve.</p>' +
      '<p class="small muted">Les boutons ✦ copient une demande et ouvrent l’IA avec ton compte, sans clé API. Au clic, une demande courte est transmise au service choisi dans l’adresse du nouvel onglet ; une demande longue doit être collée.</p>' +
    '<div class="row"><button class="btn ghost" data-a="export">Sauvegarder ma progression (fichier)</button><label class="btn ghost" style="cursor:pointer">Restaurer une sauvegarde<input type="file" id="imp" accept=".json" hidden></label><button class="btn ghost" data-a="reset">Tout remettre à zéro</button></div></div>';
};

/* ───────── 5) Routeur et actions ───────── */
function render(keepScroll) {
  var parts = (location.hash.slice(1) || 'accueil').split('/'), r = Object.prototype.hasOwnProperty.call(V, parts[0]) ? parts[0] : 'accueil';
  if (S.examRun && Date.now() >= S.examRun.start + S.examRun.dur) examRendre();
  if (r !== 'cas' && session && session.fini) session = null;
  $('#view').innerHTML = V[r](parts[1], parts[2]);
  if (curRoute !== r) navOpen = {};   // en changeant de page, on revient à « seul le groupe courant ouvert »
  curRoute = r; renderNav(); markNav();
  if (!keepScroll) { setMenu(false); window.scrollTo(0, 0); if (document.activeElement !== $('#search')) $('#view').focus({ preventScroll: true }); }
  if (study) study.afterRender(r);
  document.title = ($('#view h1') ? $('#view h1').textContent : 'Accueil') + ' · Révision BTS SIO';
}
function rerender() { var y = window.scrollY; render(true); window.scrollTo(0, y); }
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function applyTheme() { document.documentElement.dataset.theme = S.theme; $('#themeBtn').textContent = S.theme === 'dark' ? 'Thème clair' : 'Thème sombre'; $('#optSel').value = S.option; }
function nextCard() { flash.ex = false; flash.deck.splice(flash.i, 1); flash.total = Math.max(0, flash.total - 1); flash.shown = false; if (flash.i >= flash.deck.length) flash.i = 0; rerender(); }
function download(name, text, type) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}
/* Résultat d'une flashcard : historique (carnet d'erreurs), statistiques par matière ou par contrôle, compteur du jour. */
function cardResult(n, ok) {
  (S.fhist[n.id] = S.fhist[n.id] || []).push(ok); if (S.fhist[n.id].length > 10) S.fhist[n.id].shift();
  dayCount('flash');
  if (n.ctrl) { var c = ctrlById(n.ctrl); if (c) { c.fs = c.fs || { ok: 0, ko: 0 }; c.fs[ok ? 'ok' : 'ko']++; } }
  else fstat(n.mat, ok ? 'ok' : 'ko');
}
function fstat(m, k) { S.fstats = S.fstats || {}; var f = S.fstats[m] = S.fstats[m] || { ok: 0, ko: 0 }; f[k]++; }
/* Après un clic sur un document en disposition « en dessous », on fait défiler jusqu'au document. */
function showDoc() { var p = $('#pdf'); if (p && S.layout !== 'cote') p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function keepX() { var t = $('#xrep'); if (t && S.examRun) S.examRun.reps[examQs(S.examRun.sid)[S.examRun.i].id] = t.value; }
function keepK(id) { var c = ctrlById(id), x = $('#kX'), k = $('#kC'); if (!c) return; if (x) c.texte = x.value; if (k) c.consignes = k.value; }
function keepRep() { var t = $('#rep'); if (t && session) session.items[session.i].rep = t.value; }

var ACT = {
  skip: function () { setMenu(false); $('#view').focus(); },
  setoption: function (el) { S.option = el.dataset.v; flash = null; qcm = null; oral = null; exo = null; refreshThemeStats(); fixSel(); save(); applyTheme(); render(); },
  setep: function (el) { S.ep = el.dataset.v; fixSel(); save(); rerender(); },
  setmat: function (el) { S.mat = el.dataset.v; save(); rerender(); },
  goep: function (el) { S.ep = el.dataset.v; fixSel(); save(); go(el.dataset.to === 'flash' ? '#flash/deck/' + el.dataset.v : '#' + el.dataset.to); },
  gotheme: function (el) { go('#biblio/theme/' + el.dataset.v); },
  clearsearch: function () { V.biblio.f.q = ''; V.biblio.f.theme = ''; $('#search').value = ''; go('#biblio'); },
  start: function () { startSession({ ep: $('#cEp').value, sujet: $('#cSu').value, n: +$('#cN').value }); render(); },
  startsujet: function (el) { startSession({ sujet: el.dataset.id, n: 99 }); go('#cas'); },
  again: function () { session = null; go('#cas'); },
  quit: function () { if (confirm('Abandonner cette étude de cas ? Les réponses déjà validées restent enregistrées.')) { session = null; go('#cas'); } },
  pdf: function (el) { keepRep(); session.pdf = true; session.page = +el.dataset.p; rerender(); showDoc(); },
  doc: function (el) { keepRep(); session.pdf = true; session.doc = el.dataset.k; rerender(); showDoc(); },
  zoom: function (el) { keepRep(); var i = ZOOMS.indexOf(S.zoom); S.zoom = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? 0 : i) + +el.dataset.v))]; save(); rerender(); },
  layout: function () { keepRep(); S.layout = S.layout === 'cote' ? 'bas' : 'cote'; save(); rerender(); },
  fullscreen: function () { var p = $('#pdf'); if (!p) return; if (document.fullscreenElement) document.exitFullscreen(); else if (p.requestFullscreen) p.requestFullscreen(); },
  startkind: function (el) { startSession({ ep: el.dataset.v, n: 5 }); go('#cas'); },
  goflash: function (el) { flash = null; go('#flash/deck/' + el.dataset.v); },
  fall: function (el) { var L = deckCards(el.dataset.v).filter(function (n) { return !S.learned[n.id]; }); flash = { key: 'deck/' + el.dataset.v, deck: shuffle(L).slice(0, 20), i: 0, shown: false, total: L.length }; rerender(); },
  readtheme: function (el) { var m = el.dataset.m; S.ep = MATIERES[m][2]; S.mat = m; V.biblio.f = { q: '', imp: '', theme: '' }; save(); go('#biblio'); setTimeout(function () { var d = Array.prototype.filter.call(document.querySelectorAll('details.cat'), function (x) { return x.querySelector('summary').textContent.indexOf(el.dataset.c) === 0; })[0]; if (d) { d.open = true; d.scrollIntoView({ block: 'start' }); } }, 60); },
  navg: function (el) { navOpen[el.dataset.v] = !isNavOpen(el.dataset.v); renderNav(); markNav(); },
  ia: function (el) { var p = IA_PROMPTS[el.dataset.k]; if (p) iaOpen(p); },
  errq: function () { startSession({ ids: questionsErreurs().map(function (q) { return q.id; }), titre: 'Carnet d\'erreurs' }); go('#cas'); },
  xstart: function () { var sid = $('#xSu').value; if (!sid) return; S.examRun = { sid: sid, start: Date.now(), dur: +$('#xDur').value * 60000, reps: {}, i: 0, page: 0, doc: '' }; save(); render(); },
  xgo: function (el) { keepX(); var R = S.examRun, n = examQs(R.sid).length, v = +el.dataset.v; if (v < 0 || v >= n) return; R.i = v; R.page = 0; R.doc = ''; save(); render(); },
  xdoc: function (el) { keepX(); S.examRun.doc = el.dataset.k; save(); rerender(); showDoc(); },
  xpage: function (el) { keepX(); S.examRun.page = +el.dataset.p; save(); rerender(); showDoc(); },
  xend: function () { var R = S.examRun, qs = examQs(R.sid); keepX(); var vides = qs.filter(function (q) { return !(R.reps[q.id] || '').trim(); }).length;
    if (confirm('Rendre ta copie maintenant ?' + (vides ? ' ' + vides + ' question(s) sans réponse.' : '') + ' Tu verras ensuite les corrections.')) { examRendre(); render(); } },
  xself: function (el) { var it = examRes.items[+el.dataset.i], v = +el.dataset.v; it.note = v; S.qdone[it.q.id] = v; var l = S.answers[it.q.id]; if (l && l[it.answerIndex]) l[it.answerIndex].note = v;
    var h = S.examHist[examRes.hist]; h.note = Math.round(examRes.items.reduce(function (t, x) { return t + x.note; }, 0) / examRes.items.length * 200) / 10; S.history[examRes.history].note = h.note; save(); rerender(); },
  xclose: function () { examRes = null; render(); },
  omat: function (el) { oral = { mat: el.dataset.v, i: -1, dur: oral ? oral.dur : 120 }; rerender(); },
  onext: function () { if (reco) reco.stop(); oral.rep = ''; var L = oralList(oral.mat), i; do { i = Math.floor(Math.random() * L.length); } while (L.length > 1 && i === oral.i); oral.i = i; oral.t0 = Date.now(); oral.fini = false; rerender(); },
  ofin: function () { if (reco) reco.stop(); var t = $('#orep'); if (t) oral.rep = t.value.trim(); oral.fini = true; rerender(); },
  mic: function () { var t = $('#orep'); if (t) oral.rep = t.value; dictee(); },
  exq: function () { var ids = expressQs(); if (!ids.length) { toast('Aucune question disponible pour l\'instant.'); return; } startSession({ ids: ids, titre: 'Révision express' }); go('#cas'); },
  exreset: function () { express = null; rerender(); },
  fichem: function (el) { V.fiches.m = el.dataset.v; rerender(); },
  print: function () { window.print(); },
  kexp: function (el) { ctrlExport(ctrlById(el.dataset.id)); toast('Fichier téléchargé : envoie-le à tes camarades, ils l\'importent dans « Mes contrôles ».'); },
  nf: function (el) { V.notes.f = el.dataset.v; rerender(); },
  btab: function (el) { go(el.dataset.v === 'apprises' ? '#apprises' : '#biblio'); },
  oeval: function (el) { var om = oral.mat === 'mesreal' ? realMat() : oral.mat, st = S.ostats[om] = S.ostats[om] || { n: 0, sum: 0 }; st.n++; st.sum += +el.dataset.v; dayCount('oral'); save(); toast('Évaluation enregistrée.'); ACT.onext(); },
  kadd: function () { var t = $('#kT').value.trim(); if (!t) { $('#kT').focus(); return; } var c = { id: 'c' + Date.now().toString(36), titre: t, mat: $('#kM').value, date: $('#kD').value, consignes: '', texte: '', dossiers: [], fs: { ok: 0, ko: 0 } };
    readState(Object.assign({}, S, { ctrl: S.ctrl.concat([c]) })); S.ctrl.push(c); buildCtrl(); save(); go('#controles/' + c.id); },
  kdel: function (el) { if (!confirm('Supprimer ce contrôle et tous ses dossiers de révision ?')) return; S.ctrl = S.ctrl.filter(function (c) { return c.id !== el.dataset.id; }); buildCtrl(); save(); go('#controles'); },
  ksave: function (el) { keepK(el.dataset.id); toast(save() ? 'Documents enregistrés.' : 'Enregistrement impossible : le texte est sans doute trop long pour le navigateur. Garde seulement l\'essentiel ou joins tes fichiers directement dans l\'IA.'); rerender(); },
  kia: function (el) { var c = ctrlById(el.dataset.id); keepK(c.id); save(); V.controles.o = { nc: +$('#kNc').value, nq: +$('#kNq').value, niveau: $('#kNv').value }; iaOpen(ctrlPrompt(c, V.controles.o)); },
  kimp: function (el) {
    var c = ctrlById(el.dataset.id), err = $('#kerr');
    try { var d = parseDossier($('#kR').value); d.n = (c.dossiers.length ? c.dossiers[c.dossiers.length - 1].n : 0) + 1; d.d = Date.now(); c.dossiers.push(d); buildCtrl();
      if (!save()) { c.dossiers.pop(); buildCtrl(); throw new Error('mémoire du navigateur pleine : supprime un ancien dossier ou raccourcis le texte du cours.'); }
      rerender(); toast('Dossier ' + d.n + ' ajouté : ' + d.cards.length + ' flashcards, ' + d.qs.length + ' questions.');
    } catch (x) { err.className = 'small bad-t'; err.textContent = 'Impossible d\'ajouter : ' + x.message + ' Copie bien toute la réponse de l\'IA, ou redemande-lui « réponds uniquement en JSON ».'; }
  },
  kdeld: function (el) { if (!confirm('Supprimer ce dossier ?')) return; var c = ctrlById(el.dataset.id); c.dossiers = c.dossiers.filter(function (d) { return d.n !== +el.dataset.n; }); buildCtrl(); save(); rerender(); },
  kquiz: function (el) { var c = ctrlById(el.dataset.id); startSession({ ids: ctrlQs(c).map(function (q) { return q.id; }), n: 8, titre: 'Contrôle : ' + c.titre }); go('#cas'); },
  xtype: function (el) { exo = { type: el.dataset.v }; rerender(); },
  xnew: function () { exo.x = null; render(); var f = $('#ex0'); if (f) f.focus(); },
  xcheck: function () {
    exo.reps = exo.x.champs.map(function (c, i) { return $('#ex' + i).value; });
    var ok = exo.x.champs.every(function (c, i) { return c[2](exo.reps[i]) === c[2](c[1]); });
    var st = (S.exstats = S.exstats || {})[exo.type] = S.exstats[exo.type] || { ok: 0, n: 0 }; st.n++; if (ok) st.ok++;
    exo.fini = true; dayCount('ex'); save(); rerender(); toast(ok ? 'Tout est juste, bravo !' : 'Regarde les corrections en rouge et l\'explication.');
  },
  qrep: function (el) { var it = qcm.items[qcm.i], k = +el.dataset.v, ok = it.opts[k] === it.ok; qcm.rep = k; if (ok) qcm.score++; if (it.n) cardResult(it.n, ok ? 1 : 0); else dayCount('ex'); save(); rerender(); },
  qnext: function () { qcm.i++; qcm.rep = null; rerender(); },
  qagain: function () { qcm = qcmBuild(qcm.src); rerender(); },
  gdom: function (el) { V.glossaire.f.d = el.dataset.v; rerender(); },
  errm: function (el) { V.erreursfreq.m = el.dataset.v; rerender(); },
  fex: function () { flash.ex = true; rerender(); },
  qexo: function () { keepRep(); session.ex = !session.ex; rerender(); },
  date27: function () { S.exam = '2027-05-11'; save(); rerender(); toast('Date d\'examen réglée sur le mardi 11 mai 2027.'); },
  pytab: function (el) { py.tab = el.dataset.v; py.i = 0; py.rep = null; py.done = false; rerender(); },
  pynext: function () { py.i++; py.rep = null; py.done = false; rerender(); var f = $('#pyrep') || $('#pycode'); if (f) f.focus(); },
  pycheck: function () {
    py.rep = $('#pyrep').value; py.done = true;
    var ok = py.tab === 'affiche' ? pyNormOut(py.rep) === pyNormOut(PY_AFFICHE[py.i % PY_AFFICHE.length][1]) : PY_COMPLETE[py.i % PY_COMPLETE.length][2].map(pyNormCode).indexOf(pyNormCode(py.rep)) >= 0;
    pyStat(ok); rerender();
  },
  pybasthon: function () { var k = py.i % PY_ECRIRE.length, code = ($('#pycode').value || '') + '\n\n# Tests\n' + PY_ECRIRE[k][1] + '\nprint("Tous les tests sont passés")'; py.code[k] = $('#pycode').value; copyText(code); window.open('https://console.basthon.fr/', '_blank', 'noopener'); toast('Code et tests copiés : colle-les dans la console Basthon (Ctrl+V) puis exécute.'); },
  pysol: function () { var f = $('#pycode'); if (f) py.code[py.i % PY_ECRIRE.length] = f.value; py.done = !py.done; rerender(); },
  pyself: function (el) { pyStat(el.dataset.v === '1'); toast('Résultat enregistré.'); ACT.pynext(); },
  ptflash: function () { var ids = ['pentest', 'pentest-legal', 'pentest-phases', 'boites', 'vuln-scan', 'cvss', 'osint', 'durcissement', 'red-blue', 'labs']; flash = { key: 'pentest', deck: NOT.filter(function (n) { return ids.indexOf(n.id) >= 0; }), i: 0, shown: false, total: ids.length, lock: true }; go('#flash/pentest'); },
  tpf: function (el) { V.tp.f[el.dataset.k] = el.dataset.v; rerender(); },
  tpdone: function (el) { var id = el.dataset.id; if (S.tpdone[id]) delete S.tpdone[id]; else S.tpdone[id] = Date.now(); save(); rerender(); },
  togglepdf: function () { keepRep(); session.pdf = !session.pdf; rerender(); },
  valider: function () {
    var it = session.items[session.i]; it.rep = $('#rep').value.trim(); it.auto = autoScore(it.q, it.rep); it.note = it.auto.score; it.valide = true;
    S.qdone[it.q.id] = it.note; dayCount('q');
    (S.answers[it.q.id] = S.answers[it.q.id] || []).push({ d: Date.now(), rep: it.rep, auto: it.auto.score, note: it.note, conf: it.conf });
    save(); rerender();
  },
  passer: function () { $('#rep').value = ''; ACT.valider(); },
  conf: function (el) { keepRep(); var it = session.items[session.i], v = +el.dataset.v; it.conf = it.conf === v ? undefined : v; rerender(); },
  pretest: function (el) { var v = el.dataset.v; if (el.dataset.k === 'mat') startSession({ ids: mesQuestions().filter(function (q) { return q.mats.indexOf(v) >= 0; }).map(function (q) { return q.id; }), n: 3, titre: 'Prétest : ' + MATIERES[v][4], pretest: v }); else startSession({ theme: v, n: 3, pretest: true }); go('#cas'); },
  self: function (el) {
    var it = session.items[session.i], l = S.answers[it.q.id]; it.note = +el.dataset.v; S.qdone[it.q.id] = it.note;
    if (l && l.length) l[l.length - 1].note = it.note;
    save(); rerender();
  },
  suivant: function () {
    session.page = 0; session.doc = ''; session.ex = false;
    if (session.i + 1 < session.items.length) { session.i++; render(); return; }
    session.fini = true;
    var n = session.items.length, note = Math.round(session.items.reduce(function (t, it) { return t + it.note; }, 0) / n * 200) / 10;
    S.history.push({ date: Date.now(), titre: session.titre, n: n, note: note }); save(); render();
  },
  flip: function () { flash.shown = !flash.shown; rerender(); },
  fgrade: function (el) {
    var g = +el.dataset.v, n = flash.deck[flash.i]; S.cards[n.id] = nextCardState(S.cards[n.id], g); cardResult(n, g ? 1 : 0); save();
    if (g) nextCard(); else { flash.deck.push(flash.deck.splice(flash.i, 1)[0]); flash.shown = false; if (flash.i >= flash.deck.length) flash.i = 0; rerender(); }
  },
  fok: function () { ACT.fgrade({ dataset: { v: '2' } }); },
  fko: function () { ACT.fgrade({ dataset: { v: '0' } }); },
  flearn: function () { S.learned[flash.deck[flash.i].id] = Date.now(); save(); nextCard(); },
  freset: function () { mesNotions().forEach(function (n) { if (!S.ep || MATIERES[n.mat][2] === S.ep) delete S.cards[n.id]; }); save(); flash = null; render(); },
  learn: function (el) { S.learned[el.dataset.id] = Date.now(); save(); rerender(); },
  unlearn: function (el) { delete S.learned[el.dataset.id]; save(); rerender(); },
  togglecorr: function () { V.annales.corr = !V.annales.corr; rerender(); },
  iafile: function () { download('mes-reponses-bts-sio-pour-ia.md', iaMarkdown(), 'text/markdown'); $('#iamsg').textContent = 'Fichier téléchargé : glisse-le dans la conversation avec l\'IA.'; },
  iacopy: function () {
    var t = iaMarkdown(), ok = function () { $('#iamsg').textContent = 'Texte copié : colle-le dans la conversation avec l\'IA.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { $('#iamsg').textContent = 'Copie impossible ici : utilise le téléchargement.'; });
    else $('#iamsg').textContent = 'Copie impossible ici : utilise le téléchargement.';
  },
  export: function () { S.lastBackup = Date.now(); save(); download('progression-bts-sio-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(S, null, 1), 'application/json'); if (location.hash.slice(1) === '' || location.hash === '#accueil') rerender(); toast('Sauvegarde téléchargée : range le fichier en lieu sûr (clé USB, cloud).'); },
  snooze: function () { S.backupSnooze = Date.now(); save(); rerender(); },
  rsave: function (el) {
    var t = $('#r_titre').value.trim(); if (!t) { $('#r_titre').focus(); toast('Donne un titre à ta réalisation.'); return; }
    var r = el.dataset.id ? S.reals.filter(function (x) { return x.id === el.dataset.id; })[0] : { id: 'r' + Date.now().toString(36) };
    REAL_CHAMPS.forEach(function (c) { r[c[0]] = $('#r_' + c[0]).value.trim(); }); r.ep = $('#rEp').value;
    if (!el.dataset.id) S.reals.push(r); V.realisations.edit = null; save(); go('#realisations/' + r.id); return true;
  },
  redit: function (el) { V.realisations.edit = el.dataset.id; rerender(); },
  rdel: function (el) { if (!confirm('Supprimer cette réalisation ?')) return; S.reals = S.reals.filter(function (x) { return x.id !== el.dataset.id; }); save(); go('#realisations'); },
  roral: function (el) { oral = { mat: 'mesreal', rid: el.dataset.id, i: -1, dur: 120 }; go('#oral'); },
  reset: function () { if (confirm('Effacer toute ta progression (notions apprises, flashcards, notes, réponses enregistrées) ? Cette action est définitive.')) { var t = S.theme, o = S.option; S = blank(); S.theme = t; S.option = o; loadError = false; resetTransient(); buildCtrl(); refreshThemeStats(); save(); go('#accueil'); } }
};
document.addEventListener('click', function (e) {
  var navLink = e.target.closest('#nav a');
  if (navLink && navLink.getAttribute('href') === location.hash) { setMenu(false); $('#view').focus(); }
  var el = e.target.closest('[data-a]');
  if (el && ACT[el.dataset.a] && !el.disabled) { e.preventDefault(); var result = ACT[el.dataset.a](el); if (study) study.afterAction(el.dataset.a, el, result); }
});
document.addEventListener('keydown', function (e) {
  if ((e.key === ' ' || e.key === 'Enter') && e.target.matches && e.target.matches('.fcard')) { e.preventDefault(); ACT.flip(); }
  if (e.key === 'Enter' && e.target.id && /^ex\d+$/.test(e.target.id) && exo && !exo.fini) { e.preventDefault(); ACT.xcheck(); }
  if (e.key === 'Tab' && e.target.id === 'pycode') { e.preventDefault(); var ta = e.target, s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; py.code[py.i % PY_ECRIRE.length] = ta.value; ta.dispatchEvent(new Event('input', {bubbles:true})); }
  if (e.key === 'Enter' && e.target.id === 'pyrep' && e.target.tagName === 'INPUT' && !py.done) { e.preventDefault(); ACT.pycheck(); }
});
document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.id === 'optSel') { S.option = t.value; fixSel(); flash = null; qcm = null; oral = null; exo = null; refreshThemeStats(); save(); render(); }
  if (t.id === 'bImp') { V.biblio.f.imp = t.value; rerender(); }
  if (t.id === 'docSel' && t.value) { keepRep(); session.pdf = true; session.page = +t.value; rerender(); }
  if (t.id === 'cEp') { var su = $('#cSu'); su.value = ''; Array.prototype.forEach.call(su.options, function (o) { o.hidden = !!(o.value && t.value && o.dataset.k !== t.value); }); }
  if (t.id === 'exam') { S.exam = t.value; save(); }
  if (t.id === 'iaSel') { S.ia = t.value; save(); }
  if (t.id === 'retSel') { S.retention = +t.value; save(); toast('Les prochaines révisions viseront ' + Math.round(S.retention * 100) + ' % de mémorisation.'); }
  if (t.dataset && t.dataset.plan) { S.planDone = S.planDone || {}; if (t.checked) S.planDone[t.dataset.plan] = 1; else delete S.planDone[t.dataset.plan]; save(); rerender(); }
  if (t.id === 'kImp' && t.files[0]) { var fk = new FileReader(); fk.onload = function () { try { var c = ctrlImport(String(fk.result)); toast('Contrôle « ' + c.titre + ' » importé.'); go('#controles/' + c.id); } catch (x) { alert('Import impossible : ' + x.message); } }; fk.readAsText(t.files[0]); }
  if (t.id === 'oDur') { oral.dur = +t.value; if (oral.i >= 0 && !oral.fini) oral.t0 = Date.now(); rerender(); }
  if (t.id === 'kF' && t.files.length) {
    var id = location.hash.split('/')[1], c = ctrlById(id), files = Array.prototype.slice.call(t.files), done = 0;
    keepK(id);
    files.forEach(function (f) { var r = new FileReader(); r.onload = function () {
      var txt = String(r.result); if (/\.html?$/i.test(f.name)) { var d = new DOMParser().parseFromString(txt, 'text/html'); d.querySelectorAll('script,style').forEach(function (el) { el.remove(); }); txt = d.body.textContent; }
      c.texte = (c.texte ? c.texte + '\n\n' : '') + '=== ' + f.name + ' ===\n' + txt.trim();
      if (++done === files.length) { toast(save() ? files.length + ' fichier(s) importé(s).' : 'Fichiers trop volumineux pour le navigateur.'); rerender(); } }; r.readAsText(f); });
  }
  if (t.id === 'imp' && t.files[0]) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var data = JSON.parse(fr.result); if (!data || !data.learned || !data.cards) throw new Error('Ce fichier ne contient pas de progression.');
        var candidate = readState(data);
        localStorage.setItem(STORE_KEY, JSON.stringify(candidate));
        S = candidate; loadError = false; resetTransient(); buildCtrl(); if (study) study.restore(); refreshThemeStats(); fixSel(); applyTheme(); storageWarning(''); go('#suivi');
        toast('Progression restaurée, contrôles et flashcards compris.');
      } catch (x) { alert('Import annulé : ta progression actuelle est conservée. ' + x.message); }
    };
    fr.onerror = function () { alert('Lecture du fichier impossible : ta progression est conservée.'); };
    fr.readAsText(t.files[0]);
  }
});
$('#search').addEventListener('input', function () {
  if (location.hash !== '#recherche') go('#recherche'); else render(true);
});
$('#themeBtn').addEventListener('click', function () { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); });
function setMenu(open) {
  var n = $('#nav'); n.style.setProperty('--header-height', $('.top').offsetHeight + 'px'); n.classList.toggle('open', open);
  $('#menuBtn').setAttribute('aria-expanded', String(open)); $('#menuBtn').setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open); $('#view').inert = open;
}
$('#menuBtn').addEventListener('click', function () { setMenu(!$('#nav').classList.contains('open')); });
window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); else $('#nav').style.setProperty('--header-height', $('.top').offsetHeight + 'px'); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#nav').classList.contains('open')) { setMenu(false); $('#menuBtn').focus(); } });
window.addEventListener('hashchange', function () { render(); });
/* Autosauvegarde de la copie d'examen et chronomètres (examen blanc, oral). */
/* Info-bulles des graphiques (éléments avec data-tip) */
document.addEventListener('mouseover', function (e) {
  var el = e.target.closest && e.target.closest('[data-tip]'), tip = $('#tip');
  if (!el) { if (tip) tip.hidden = true; return; }
  if (!tip) { tip = document.createElement('div'); tip.id = 'tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
  var r = el.getBoundingClientRect(); tip.textContent = el.getAttribute('data-tip'); tip.hidden = false;
  tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px'; tip.style.top = (r.top - tip.offsetHeight - 6) + 'px';
});
window.addEventListener('pagehide', function () { if (S.examRun || memoBox.pending) { keepX(); save(); } });
document.addEventListener('visibilitychange', function () { if (document.hidden) { if (S.examRun || memoBox.pending) { keepX(); save(); } } else if (S.examRun && Date.now() >= S.examRun.start + S.examRun.dur) { examRendre(); render(); } });
document.addEventListener('input', function (e) {
  if (e.target.id === 'rep') keepRep();
  if (e.target.id === 'pycode') py.code[py.i % PY_ECRIRE.length] = e.target.value;
  if (e.target.classList && e.target.classList.contains('memo-t')) { S.memo = S.memo || {}; var v = e.target.value.trim(); if (v) S.memo[e.target.dataset.id] = e.target.value; else delete S.memo[e.target.dataset.id]; memoBox.pending = true; clearTimeout(memoBox.t); memoBox.t = setTimeout(save, 600); }
  if (e.target.id === 'gq') { V.glossaire.f.q = e.target.value; var f = V.glossaire.f; $('#glist').innerHTML = glossList(GLOSSAIRE.filter(function (g) { return (!f.d || g[3] === f.d) && (!f.q || norm(g.join(' ')).indexOf(norm(f.q)) >= 0); }).sort(function (a, b) { return a[0].localeCompare(b[0]); })); } if (e.target.id === 'orep' && oral) oral.rep = e.target.value; if (e.target.id === 'xrep' && S.examRun) { keepX(); clearTimeout(keepX.t); keepX.t = setTimeout(save, 800); } });
setInterval(function () {
  var t = $('#timer');
  if (S.examRun) { var r = S.examRun.start + S.examRun.dur - Date.now(); if (t) { t.textContent = fmtTime(r); t.classList.toggle('low', r < 600000); }
    if (r <= 0) { examRendre(); render(); toast('Temps écoulé : ta copie a été rendue automatiquement. Résultats dans Examen blanc.'); } }
  var o = $('#otimer');
  if (o && oral && !oral.fini) { var ro = oral.t0 + oral.dur * 1000 - Date.now(); o.textContent = ro > 0 ? fmtTime(ro) : 'Temps écoulé'; o.classList.toggle('low', ro < 20000); }
}, 1000);
/* Version téléphone hors ligne : le « service worker » ne fonctionne que si l'application est servie par un site web (pas en ouvrant le fichier). */
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () {});
study = StudyTools.install({
  V: V, ACT: ACT, $: $, esc: esc, norm: norm, pageHead: pageHead,
  state: function () { return S; }, save: save, toast: toast, go: go, rerender: rerender,
  session: function () { return session; }, setSession: function (v) { session = v; },
  flash: function () { return flash; }, setFlash: function (v) { flash = v; },
  python: function () { return py; }, setPython: function (v) { py = v; },
  cards: function () { return NOT.concat(Object.keys(CTRLC).map(function (id) { return CTRLC[id]; })); },
  subjects: SUJETS, qById: qById, autoScore: autoScore, subjectLabel: sujetLabel,
  notions: mesNotions, questions: mesQuestions, matOK: matOK, subjectOK: sujOK,
  matLabel: matLabel, notionCard: notionCard, memoBox: memoBox, dueCards: dueCards,
  errorQuestions: questionsErreurs, shuffle: shuffle, startSession: startSession, dayCount: dayCount
});
study.restore();
fixSel(); applyTheme(); render();
if (loadError) storageWarning('La progression locale est illisible ou le stockage est bloqué. Restaure une sauvegarde depuis les réglages avant de commencer.');
})();




