/* Sessions persistantes, suivi des corrections, écoute, recherche et préparation hors ligne.
   Aucune dépendance externe. Les textes et fichiers audio sont livrés avec l'application. */
(function () {
'use strict';
function blank() { return { caseDraft: null, flashDraft: null, forms: {}, reviews: {}, listening: {}, guide: null, last: null, focus: false, python: null }; }
function validate(s) {
  function ok(v) { if (!v) throw new Error('Données de séance invalides.'); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function str(v) { return typeof v === 'string'; }
  function num(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0; }
  function bool(v) { return typeof v === 'boolean'; }
  function map(v, check) { ok(obj(v)); Object.keys(v).forEach(function (k) { ok(check(v[k], k)); }); }
  ok(obj(s)); var out = Object.assign(blank(), s);
  ok(bool(out.focus));
  if (out.last) ok(obj(out.last) && /^#[a-z]+(?:\/[a-zA-Z0-9_.%#-]+)*$/.test(out.last.route) && str(out.last.label));
  if (out.caseDraft) {
    var c = out.caseDraft; ok(obj(c) && str(c.titre) && str(c.theme) && str(c.pretest) && bool(c.pdf) && num(c.page) && str(c.doc));
    ok(Array.isArray(c.items) && c.items.length > 0 && Number.isInteger(c.i) && c.i >= 0 && c.i < c.items.length);
    c.items.forEach(function (x) { ok(obj(x) && str(x.id) && str(x.rep) && bool(x.valide) && num(x.note) && x.note <= 1 && (x.conf == null || x.conf === 0 || x.conf === 1)); });
  }
  if (out.flashDraft) { var f = out.flashDraft; ok(obj(f) && str(f.key) && Array.isArray(f.ids) && f.ids.every(str) && Number.isInteger(f.i) && f.i >= 0 && f.i < f.ids.length && num(f.total) && bool(f.shown)); }
  map(out.forms, function (v, k) { ok(/^#(?:controles|realisations)\/[a-zA-Z0-9_-]+$/.test(k)); map(v, function (t, id) { return /^(?:kX|kC|kR|r_[a-z]+|rEp)$/.test(id) && str(t); }); return true; });
  map(out.reviews, function (v) { return obj(v) && ['todo','self','flag'].indexOf(v.status) >= 0 && str(v.note) && num(v.updated); });
  map(out.listening, function (v) { return obj(v) && Array.isArray(v.answers) && v.answers.every(str) && bool(v.revealed) && num(v.position) && ['', 'again','ok'].indexOf(v.level) >= 0; });
  if (out.guide) { var g = out.guide; ok(obj(g) && [15,30].indexOf(g.minutes) >= 0 && Number.isInteger(g.step) && g.step >= 0 && g.step <= 3 && num(g.started) && Array.isArray(g.cards) && g.cards.every(str) && Array.isArray(g.questions) && g.questions.every(str) && str(g.audio) && num(g.cardsDone)); }
  if (out.python) { var p = out.python; ok(obj(p) && ['fiche','affiche','complete','ecrire','epreuve'].indexOf(p.tab) >= 0 && Number.isInteger(p.i) && p.i >= 0 && (p.rep === null || str(p.rep)) && bool(p.done)); map(p.code, str); }
  return out;
}
function install(E) {
  var V = E.V, A = E.ACT, esc = E.esc, $ = E.$, pending = false, timer = 0, restoring = false;
  var searchFilter = 'all', reviewFilter = 'priority', offline = { ready: {}, checked: false, busy: false, message: '' };
  function state() { return E.state().study; }
  function lesson(id) { return (window.LISTENING || []).filter(function (x) { return x.id === id; })[0]; }
  function cardById(id) { return E.cards().filter(function (n) { return n.id === id; })[0]; }
  function remember(route, label) { state().last = { route: route, label: label }; }
  function capture() {
    if (restoring) return false;
    var s = state(), before = JSON.stringify([s.caseDraft, s.flashDraft, s.python]), c = E.session(), f = E.flash();
    s.caseDraft = c && !c.fini && c.items.length ? { titre: c.titre, theme: c.theme || '', pretest: c.pretest || '', i: c.i, pdf: !!c.pdf, page: c.page || 0, doc: c.doc || '', guide: !!c.guide,
      items: c.items.map(function (it) { return { id: it.q.id, rep: it.rep || '', valide: !!it.valide, note: it.note || 0, conf: it.conf == null ? null : it.conf }; }) } : null;
    s.flashDraft = f && f.deck.length ? { key: f.key, ids: f.deck.map(function (n) { return n.id; }), i: f.i, total: f.total, shown: !!f.shown } : null;
    var py = E.python(); s.python = py && (Object.keys(py.code).length || py.tab !== 'fiche') ? JSON.parse(JSON.stringify(py)) : null;
    return before !== JSON.stringify([s.caseDraft, s.flashDraft, s.python]);
  }
  function restore() {
    restoring = true; var repaired = false;
    try {
      var s = state(), c = s.caseDraft, f = s.flashDraft;
      if (c && c.items.every(function (it) { return E.qById(it.id); })) E.setSession(Object.assign({}, c, { fini: false, items: c.items.map(function (it) { var q = E.qById(it.id); return Object.assign({}, it, { q: q, auto: E.autoScore(q, it.rep) }); }) }));
      else { E.setSession(null); if (c) { s.caseDraft = null; E.toast('Le brouillon utilisait un contenu supprimé. Les réponses déjà validées restent dans le suivi.'); } }
      if (f && f.ids.every(cardById)) E.setFlash({ key: f.key, deck: f.ids.map(cardById), i: f.i, total: f.total, shown: f.shown });
      else { E.setFlash(null); s.flashDraft = null; }
      if (s.python) E.setPython(JSON.parse(JSON.stringify(s.python)));
      if (s.guide && (!lesson(s.guide.audio) || !s.guide.cards.every(cardById) || !s.guide.questions.length || !s.guide.questions.every(E.qById))) {
        s.guide = null; repaired = true;
        if (E.flash() && E.flash().key === 'guide') E.setFlash(null);
        if (E.session() && E.session().guide) E.setSession(null);
        E.toast('La séance utilisait un contenu supprimé. Prépare une nouvelle séance ; tes résultats restent enregistrés.');
      }
    } finally { restoring = false; }
    if (repaired) E.save();
  }
  function cancelPending() { clearTimeout(timer); pending = false; }
  function flush() { if (!pending) return; clearTimeout(timer); pending = false; var saved=E.save(); var status = $('#draftStatus'); if (status) status.textContent = saved ? 'Brouillon enregistré dans ce navigateur' : 'Enregistrement impossible : exporte ta progression'; }
  function queueSave() { pending = true; clearTimeout(timer); timer = setTimeout(flush, 450); var status = $('#draftStatus'); if (status) status.textContent = 'Enregistrement…'; }
  function sourceLinks(q) {
    var s = E.subjects[q.sujet]; if (!s) return '';
    if (s.ctrl) return '<a href="#controles/' + esc(s.ctrl) + '">Cours et dossier du contrôle</a>';
    if (s.ent) return '<a href="#annales/' + esc(s.id) + '">Lire les documents de ce cas</a>';
    var links = ['<a target="_blank" rel="noopener" href="' + esc(s.fichier) + '#page=' + q.page + '">Énoncé · p. ' + q.page + '</a>'];
    (q.utiles || []).forEach(function (d) { if (s.docs[d]) links.push('<a target="_blank" rel="noopener" href="' + esc(s.fichier) + '#page=' + s.docs[d] + '">' + esc(d) + ' · p. ' + s.docs[d] + '</a>'); });
    return links.join(' · ');
  }
  function trace(q) {
    var r = state().reviews[q.id] || { status: 'todo', note: '' }, label = {todo:'À vérifier', self:'Relu par moi', flag:'À discuter'}[r.status];
    return '<details class="trace"' + (r.status !== 'todo' || r.note ? ' open' : '') + '><summary><span class="tag ' + (r.status === 'self' ? 'good' : 'i2') + '">' + label + '</span> Sources et relecture</summary>' +
      '<p class="small">Correction pédagogique non officielle. Un sujet officiel ne valide pas automatiquement sa correction.</p><p class="small">' + sourceLinks(q) + '</p>' +
      (/^Méthode\s*:/i.test(q.corr) ? '<p class="small bad-t">Cette réponse donne surtout une démarche : confronte les valeurs et conclusions aux documents.</p>' : '') +
      '<p class="small muted">Compare la réponse aux documents, vérifie le raisonnement et note la référence utilisée. « Relu par moi » reste ton appréciation personnelle.</p>' +
      '<label class="rf"><span>Ma référence, ma remarque ou la question à poser</span><textarea class="review-note" data-id="' + esc(q.id) + '" placeholder="Ex. : document B2, page 8 ; pourquoi cette conclusion ?">' + esc(r.note) + '</textarea></label><div class="row">' +
      [['todo','À vérifier'],['self','Relu par moi'],['flag','À discuter']].map(function (x) { return '<button class="btn ghost small' + (r.status === x[0] ? ' on' : '') + '" data-a="review" data-id="' + esc(q.id) + '" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></details>';
  }
  function resumeTarget() {
    var s = state(), last = s.last;
    if (last && ((last.route === '#cas' && s.caseDraft) || (last.route.indexOf('#flash/') === 0 && s.flashDraft) || (last.route === '#examen' && E.state().examRun) || s.forms[last.route] || (last.route === '#python' && s.python) || (last.route.indexOf('#ecoute/') === 0 && s.listening[last.route.split('/')[1]]) || (last.route === '#seance' && s.guide))) return last;
    if (E.state().examRun) return {route:'#examen',label:'Examen blanc en cours'};
    if (s.guide && s.guide.step < 3) return {route:'#seance',label:'Séance guidée en cours'};
    if (s.caseDraft) return {route:'#cas',label:s.caseDraft.titre};
    if (s.flashDraft) return {route:'#flash/' + s.flashDraft.key,label:'Paquet de flashcards'};
    var keys = Object.keys(s.forms); if (keys.length) return {route:keys[keys.length - 1],label:'Brouillon personnel'};
    return null;
  }
  function home() {
    var t = resumeTarget();
    return (t ? '<section class="card resume-card"><div><p class="eyebrow">EN COURS</p><b>' + esc(t.label) + '</b><p class="small muted">Tes réponses et ta place sont conservées sur cet appareil.</p></div><button class="btn" data-a="resume">Reprendre où j’en étais →</button></section>' : '') +
      '<div class="study-shortcuts"><a class="card tile" href="#seance"><b>Une séance guidée</b><span>10, 15 ou 30 minutes, un parcours en 3 étapes</span></a><a class="card tile" href="#ecoute"><b>Comprendre l’anglais</b><span>4 écoutes avec transcription et correction</span></a></div>';
  }
  V.seance = function () {
    var g = state().guide;
    var head = E.pageHead('Ma séance guidée', 'Un parcours court en trois étapes : des cartes, des questions ciblées, puis une question d’oral (express) ou une écoute en anglais. Les durées sont indicatives : prends le temps de comprendre.');
    if (!g) return head + '<div class="cols"><div class="card"><h2>Express · 10 minutes</h2><p>5 cartes, 2 questions et une question d’oral.</p><a class="btn" href="#express">Commencer 10 minutes</a></div><div class="card"><h2>Un petit pas · 15 minutes</h2><p>5 cartes, 2 questions et une écoute.</p><button class="btn" data-a="guideStart" data-v="15">Commencer 15 minutes</button></div><div class="card"><h2>Un travail approfondi · 30 minutes</h2><p>10 cartes, 4 questions et une écoute.</p><button class="btn" data-a="guideStart" data-v="30">Commencer 30 minutes</button></div></div>';
    var steps = [['Mémoriser',g.cards.length + ' cartes, puis passage à la suite'],['Comprendre',g.questions.length + ' questions, erreurs prioritaires'],['Écouter',lesson(g.audio).title]];
    return head + (g.step === 3 ? '<div class="verdict good"><b>Séance terminée !</b><p>' + g.cardsDone + ' cartes travaillées, ' + g.questions.length + ' questions et une écoute.</p><a class="btn" href="#erreurs">Ce que je dois encore revoir</a></div>' : '') +
      '<ol class="guided-steps">' + steps.map(function (x, i) { return '<li class="card' + (g.step === i ? ' current' : '') + '"><span class="step-number">' + (g.step > i ? '✓' : i + 1) + '</span><div><b>' + x[0] + '</b><p class="muted small">' + esc(x[1]) + '</p></div><span class="tag">' + (g.step > i ? 'Terminé' : g.step === i ? 'En cours' : 'À venir') + '</span></li>'; }).join('') + '</ol>' +
      '<div class="row">' + (g.step < 3 ? '<button class="btn" data-a="guideNext">Continuer l’étape ' + (g.step + 1) + ' →</button>' : '') + '<button class="btn ghost" data-a="guideReset">' + (g.step === 3 ? 'Préparer une autre séance' : 'Arrêter cette séance') + '</button></div>';
  };
  function audioState(id) { return state().listening[id] || (state().listening[id] = {answers:lesson(id).questions.map(function () { return ''; }), revealed:false, position:0, level:''}); }
  V.ecoute = function (id) {
    var l = lesson(id), head = E.pageHead('Anglais · compréhension orale', 'Écoute sans lire le texte, prends des notes, puis réponds en français ou en anglais. Les scénarios sont originaux ; la voix américaine est synthétique. Ce sont des exercices, pas des sujets officiels.');
    if (!l) return head + '<div class="cols">' + LISTENING.map(function (x) { var a = state().listening[x.id]; return '<a class="card tile" href="#ecoute/' + x.id + '"><span class="tag">' + x.seconds + ' secondes · ' + esc(x.level) + '</span><h2>' + esc(x.title) + '</h2><p>3 questions · transcription après l’écoute</p><span>' + (a && a.level ? (a.level === 'ok' ? 'Compris ✓' : 'À reprendre') : a ? 'En cours' : 'À découvrir') + '</span></a>'; }).join('') + '</div>';
    var a = audioState(id);
    return head + '<p><a href="#ecoute">← Toutes les écoutes</a></p><section class="card listening"><p class="eyebrow">' + esc(l.level) + ' · ' + l.seconds + ' S</p><h2>' + esc(l.title) + '</h2>' +
      '<audio id="lessonAudio" data-id="' + id + '" controls preload="metadata" aria-label="Écouter ' + esc(l.title) + '" src="' + l.audio + '"></audio><p class="small muted">Voix de synthèse · fichier inclus. Réécoute autant que nécessaire.</p>' +
      '<label class="audio-speed">Vitesse <select id="audioSpeed"><option value="0.8">0,8×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option></select></label><p id="audioError" class="bad-t small" role="status"></p></section>' +
      l.questions.map(function (q, i) { return '<section class="card"><label class="rf"><span>' + (i + 1) + '. ' + esc(q.q) + '</span><textarea class="listen-answer" data-id="' + id + '" data-i="' + i + '" placeholder="Ce que j’ai compris…">' + esc(a.answers[i] || '') + '</textarea></label>' + (a.revealed ? '<div class="corr"><b>Réponse attendue</b><p>' + esc(q.answer) + '</p><p class="small" lang="en">Repère entendu : “' + esc(q.evidence) + '”</p></div>' : '') + '</section>'; }).join('') +
      (a.revealed ? '<section class="card"><h2>Transcription</h2><p lang="en">' + esc(l.transcript) + '</p><h3>Vocabulaire utile</h3><dl class="vocabulary">' + l.vocabulary.map(function (x) { return '<div><dt lang="en">' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl><p>Après comparaison avec tes réponses :</p><div class="row"><button class="btn" data-a="listenGrade" data-id="' + id + '" data-v="ok">J’ai compris l’essentiel</button><button class="btn ghost" data-a="listenGrade" data-id="' + id + '" data-v="again">À reprendre</button><button class="btn ghost" data-a="listenReset" data-id="' + id + '">Nouvel essai</button></div>' + (a.level ? '<p class="small good-t">Auto-évaluation enregistrée.</p>' : '') + '</section>' : '<button class="btn" data-a="listenReveal" data-id="' + id + '">Comparer mes réponses et lire la transcription</button>');
  };
  V.question = function (id) {
    try { id = decodeURIComponent(id || ''); } catch (e) { id = ''; }
    var q = E.qById(id); if (!q) return E.pageHead('Question introuvable', 'Ce contenu a peut-être été supprimé.') + '<a href="#annales">Consulter les sujets</a>';
    return E.pageHead('Question ' + q.num, esc(E.subjectLabel(E.subjects[q.sujet]))) + '<section class="card"><p class="qtext">' + esc(q.texte) + '</p><p class="small">' + sourceLinks(q) + '</p><button class="btn" data-a="practiceQuestion" data-id="' + esc(q.id) + '">M’entraîner sur cette question</button><details class="more"><summary>Lire la correction proposée</summary><p>' + esc(q.corr) + '</p>' + trace(q) + '</details></section>' + E.memoBox(q.id, 'Mes notes sur cette question');
  };
  V.notion = function (id) { var n = cardById(id); if (!n) return E.pageHead('Notion introuvable'); var html=E.notionCard(n,!!E.state().learned[id]); return E.pageHead(n.titre,esc(E.matLabel(n.mat))) + html + (html.indexOf('class="memo"')<0 ? E.memoBox(id,'Ma note personnelle') : ''); };
  V.relecture = function () {
    var qs = E.questions().filter(function (q) { var r = state().reviews[q.id]; return reviewFilter === 'flag' ? r && r.status === 'flag' : reviewFilter === 'self' ? r && r.status === 'self' : /^Méthode\s*:/i.test(q.corr) && (!r || r.status !== 'self'); });
    return E.pageHead('Relire les corrections', 'Retrouve les réponses à vérifier dans les documents et les questions à poser à ton professeur. Tes statuts de relecture sont personnels.') +
      '<div class="chips">' + [['priority','Méthodes à vérifier'],['flag','À discuter'],['self','Relues par moi']].map(function (x) { return '<button class="chip' + (reviewFilter === x[0] ? ' on' : '') + '" data-a="reviewFilter" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><p class="small muted">' + qs.length + ' question(s)</p>' +
      (qs.length ? qs.map(function (q) { return '<article class="card"><p class="small muted">' + esc(E.subjectLabel(E.subjects[q.sujet])) + '</p><a href="#question/' + encodeURIComponent(q.id) + '"><b>' + esc(q.num + ' — ' + q.texte) + '</b></a>' + trace(q) + '</article>'; }).join('') : '<div class="card">Aucune question dans cette sélection.</div>');
  };
  function searchResults(query) {
    var q = E.norm(query.trim()), out = [], s = E.state(); if (q.length < 2) return out;
    function add(type, title, body, href) { if (E.norm(title + ' ' + body).indexOf(q) >= 0) out.push({type:type,title:title,body:body,href:href}); }
    E.notions().forEach(function (n) { add(s.learned[n.id] ? 'Apprises' : 'Notions', n.titre, n.a, '#notion/' + n.id); });
    Object.keys(s.memo).forEach(function (id) { var n = cardById(id), x = E.qById(id); if ((n && E.matOK(n.mat)) || (x && E.subjectOK(E.subjects[x.sujet]))) add('Notes', n ? n.titre : x.texte, s.memo[id], n ? '#notion/' + id : '#question/' + encodeURIComponent(id)); });
    Object.keys(state().reviews).forEach(function (id) { var x=E.qById(id); if(x && E.subjectOK(E.subjects[x.sujet])) add('Notes',x.texte,state().reviews[id].note,'#question/'+encodeURIComponent(id)); });
    s.ctrl.forEach(function (c) { add('Contrôles',c.titre,(c.texte || '') + '\n' + (c.consignes || '') + '\n' + c.dossiers.map(function (d) { return d.fiche + ' ' + d.cards.map(function (x) { return x.q + ' ' + x.r; }).join(' ') + ' ' + d.qs.map(function (x) { return x.q + ' ' + x.correction; }).join(' '); }).join(' '),'#controles/' + c.id); });
    s.reals.forEach(function (r) { add('Réalisations',r.titre,Object.keys(r).map(function (k) { return r[k]; }).join(' '),'#realisations/' + r.id); });
    E.questions().forEach(function (x) { add('Questions',x.num + ' — ' + E.subjectLabel(E.subjects[x.sujet]),x.texte,'#question/' + encodeURIComponent(x.id)); });
    (window.GLOSSAIRE || []).forEach(function (g) { add('Sigles',g[0] + ' — ' + g[1],g[2],'#glossaire'); });
    (s.quiz || []).forEach(function (z) { add('Mes quiz', z.titre || 'Quiz sans titre', z.qs.map(function (x) { return x.q + ' ' + x.opts.join(' ') + ' ' + x.ex; }).join(' '), '#quiz/' + z.id); });
    Object.keys(window.ORAL || {}).forEach(function (m) { if (E.matOK(m)) ORAL[m].forEach(function (x) { add('Oral', x[0], x[1], '#oral'); }); });
    return out;
  }
  V.recherche = function () {
    var q = $('#search').value, results = searchResults(q), filtered = results.filter(function (r) { return searchFilter === 'all' || r.type === searchFilter; });
    var categories = ['all','Notions','Apprises','Notes','Contrôles','Mes quiz','Réalisations','Questions','Oral','Sigles'];
    return E.pageHead('Rechercher dans mes révisions', 'Cours, notions apprises, notes, questions d\'examen et d\'oral, sigles, contrôles, quiz et réalisations.') + '<div class="chips">' + categories.map(function (c) { return '<button class="chip' + (searchFilter === c ? ' on' : '') + '" data-a="searchFilter" data-v="' + c + '">' + (c === 'all' ? 'Tout' : c) + '</button>'; }).join('') + '</div>' +
      (q.trim().length < 2 ? '<div class="card">Écris au moins deux caractères dans la recherche en haut de page.</div>' : '<p class="muted" role="status">' + filtered.length + ' résultat(s) pour « ' + esc(q) + ' »' + (filtered.length > 60 ? ' · 60 premiers affichés, précise ta recherche.' : '') + '</p>' + filtered.slice(0,60).map(function (r) { var i = E.norm(r.body).indexOf(E.norm(q)), start = Math.max(0,i-60); return '<article class="card search-result"><span class="tag">' + r.type + '</span><h2><a href="' + r.href + '">' + esc(r.title) + '</a></h2><p>' + (start ? '…' : '') + esc(r.body.slice(start,start+260)) + (r.body.length > start+260 ? '…' : '') + '</p></article>'; }).join('') + (!filtered.length ? '<div class="card">Aucun résultat. Essaie un autre mot ou le filtre « Tout ».</div>' : ''));
  };
  function scopeURL() { return new URL('./', location.href).href; }
  function assetCache() { return 'bts-sio-assets:' + scopeURL(); }
  function canCache() { return /^https?:/.test(location.protocol) && window.isSecureContext && 'caches' in window && 'serviceWorker' in navigator; }
  async function scanOffline() {
    if (!canCache()) return; offline.message = '';
    try { var c = await caches.open(assetCache()); var keys = await c.keys(); offline.ready = {}; keys.forEach(function (r) { offline.ready[r.url] = true; }); offline.checked = true; }
    catch (e) { offline.message = 'Le navigateur refuse l’accès au stockage hors ligne.'; }
    if (location.hash === '#horsligne') E.rerender();
  }
  V.horsligne = function () {
    var local = location.protocol === 'file:';
    return E.pageHead('Préparer le hors-ligne', 'Sélectionne les sujets et écoutes à emporter. Une disponibilité affichée correspond au cache de ce navigateur, pas à une synchronisation.') +
      (!canCache() ? '<div class="card hint">' + (local ? 'Tu utilises le dossier local : les PDF et les audios sont déjà fournis avec l’application. La préparation du cache concerne uniquement la version hébergée en HTTPS.' : 'La préparation nécessite un site HTTPS et un navigateur autorisant le stockage hors ligne.') + '</div>' :
      '<div class="card"><div class="row"><button class="btn" data-a="prepareOffline"' + (offline.busy ? ' disabled' : '') + '>Préparer la sélection</button><button class="btn ghost" data-a="scanOffline"' + (offline.busy ? ' disabled' : '') + '>Vérifier les fichiers disponibles</button></div><p class="small muted">Les fichiers sélectionnés seront téléchargés. Le navigateur peut libérer son cache : vérifie-le avant de partir.</p><p id="offlineMessage" role="status">' + esc(offline.message || (offline.checked ? 'Disponibilité vérifiée.' : 'Clique sur « Vérifier » pour lire l’état du cache.')) + '</p></div>') +
      '<div class="offline-list">' + (window.OFFLINE_FILES || []).map(function (f) { var ready = !!offline.ready[new URL(f.path,scopeURL()).href]; return '<label class="card offline-file"><input type="checkbox" class="offline-select" value="' + esc(f.path) + '"' + (!canCache() || offline.busy ? ' disabled' : '') + '><span><b>' + esc(f.title) + '</b><small>' + f.kind + ' · ' + (f.bytes / 1048576).toFixed(1).replace('.',',') + ' Mo</small></span><span class="tag ' + (ready || local ? 'good' : '') + '">' + (local ? 'Dans le dossier' : ready ? 'Disponible hors ligne' : offline.checked ? 'À préparer' : 'Non vérifié') + '</span></label>'; }).join('') + '</div>';
  };
  A.prepareOffline = async function () {
    if (!canCache() || offline.busy) return;
    var files = Array.prototype.map.call(document.querySelectorAll('.offline-select:checked'),function (x) { return x.value; }).filter(function (p) { return OFFLINE_FILES.some(function (f) { return f.path === p; }); });
    if (!files.length) { E.toast('Sélectionne au moins un PDF ou un audio.'); return; }
    offline.busy = true; offline.message = 'Préparation…'; E.rerender(); var failed = [], completed = 0;
    try {
      var registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) throw new Error('L’installation hors ligne est encore en cours. Recharge la page puis réessaie.');
      var cache = await caches.open(assetCache());
      for (var i=0;i<files.length;i++) {
        try { var url = new URL(files[i],scopeURL()).href; var response = await fetch(url); if (response.status !== 200) throw new Error('Réponse incomplète'); await cache.put(url,response); completed++; }
        catch (e) { failed.push(files[i]); }
        var el = $('#offlineMessage'); if (el) el.textContent = (i+1) + ' / ' + files.length + ' fichiers traités';
      }
      offline.message = completed + ' fichier(s) prêt(s).' + (failed.length ? ' ' + failed.length + ' échec(s) : vérifie la connexion et l’espace disponible, puis réessaie.' : '');
    } catch (e) { offline.message = e.message || 'Préparation impossible.'; }
    finally { offline.busy = false; var message = offline.message; await scanOffline(); offline.message = message; if (location.hash === '#horsligne') E.rerender(); else E.toast(message); }
  };
  A.scanOffline = scanOffline;
  A.resume = function () { var t = resumeTarget(); if (!t) return; var values = state().forms[t.route]; if (values && values.r_titre != null && t.route !== '#realisations/nouvelle') V.realisations.edit = t.route.split('/')[1]; E.go(t.route); };
  A.focus = function () { state().focus = !state().focus; E.save(); E.rerender(); };
  A.review = function (el) { var id = el.dataset.id; if (!E.qById(id) || ['todo','self','flag'].indexOf(el.dataset.v) < 0) return; var r = state().reviews[id] || {note:''}; r.status = el.dataset.v; r.updated = Date.now(); state().reviews[id] = r; E.save(); E.rerender(); };
  A.reviewFilter = function (el) { reviewFilter = el.dataset.v; E.rerender(); };
  A.searchFilter = function (el) { searchFilter = el.dataset.v; E.rerender(); };
  A.practiceQuestion = function (el) { if (E.session() && !E.session().fini && !confirm('Remplacer l’étude de cas en cours par cette question ?')) return; E.startSession({ids:[el.dataset.id],n:1,titre:'Entraînement ciblé'}); E.go('#cas'); };
  A.guideStart = function (el) {
    var minutes = Number(el.dataset.v); if ([15,30].indexOf(minutes)<0) return;
    if ((E.session() && !E.session().fini || E.flash() && E.flash().deck.length) && !confirm('La séance remplacera le cas et le paquet de cartes en cours. Les réponses déjà validées restent enregistrées. Continuer ?')) return;
    var cards = E.dueCards().slice(0,minutes === 15 ? 5 : 10), questions = E.errorQuestions().concat(E.shuffle(E.questions()));
    var ids = questions.map(function (q) { return q.id; }).filter(function (id,i,a) { return a.indexOf(id)===i; }).slice(0,minutes === 15 ? 2 : 4);
    var audio = LISTENING.find(function (x) { return !state().listening[x.id] || state().listening[x.id].level !== 'ok'; }) || LISTENING[0];
    state().guide = {minutes:minutes,step:cards.length ? 0 : 1,started:Date.now(),cards:cards.map(function (n) { return n.id; }),questions:ids,audio:audio.id,cardsDone:0};
    E.setSession(null); E.setFlash(null); E.save(); A.guideNext();
  };
  A.guideNext = function () {
    var g = state().guide; if (!g) return;
    if (g.step === 0) { if (!E.flash() || E.flash().key !== 'guide') E.setFlash({key:'guide',deck:g.cards.map(cardById).filter(Boolean),i:0,total:g.cards.length,shown:false}); E.go('#flash/guide'); }
    else if (g.step === 1) { if (!E.session() || !E.session().guide || E.session().fini) { E.startSession({ids:g.questions,n:g.questions.length,titre:'Séance guidée · questions ciblées'}); E.session().guide = true; } E.go('#cas'); }
    else if (g.step === 2) E.go('#ecoute/' + g.audio);
    else E.go('#seance');
  };
  A.guideReset = function () { if (state().guide && state().guide.step < 3 && !confirm('Arrêter cette séance ? Les résultats déjà enregistrés sont conservés.')) return; state().guide = null; if (E.flash() && E.flash().key === 'guide') E.setFlash(null); if (E.session() && E.session().guide) E.setSession(null); E.save(); E.go('#seance'); };
  A.listenReveal = function (el) { audioState(el.dataset.id).revealed = true; E.save(); E.rerender(); };
  A.listenGrade = function (el) { var a = audioState(el.dataset.id); if (!a.level) E.dayCount('ex'); a.level = el.dataset.v; var g = state().guide; if (g && g.step === 2 && g.audio === el.dataset.id) g.step = 3; E.save(); if (g && g.step === 3) E.go('#seance'); else E.rerender(); };
  A.listenReset = function (el) { if (!confirm('Effacer tes réponses à cette écoute pour recommencer ?')) return; delete state().listening[el.dataset.id]; E.save(); E.rerender(); };
  function afterAction(name, el, result) {
    var g = state().guide;
    if (g && g.step === 0 && ['fgrade','flearn'].indexOf(name)>=0 && E.flash() && E.flash().key === 'guide') {
      if (name === 'flearn' || Number(el.dataset.v)>0) g.cardsDone++;
      if (!E.flash().deck.length) { g.step = 1; E.setFlash(null); E.save(); E.go('#seance'); }
    }
    if (g && g.step === 1 && name === 'suivant' && E.session() && E.session().guide && E.session().fini) { g.step = 2; E.save(); E.go('#seance'); }
    if (name === 'rsave' && result === true) delete state().forms['#realisations/' + (el.dataset.id || 'nouvelle')];
    if (name === 'kdel' && !E.state().ctrl.some(function (c) { return c.id === el.dataset.id; })) delete state().forms['#controles/' + el.dataset.id];
    if (name === 'rdel' && !E.state().reals.some(function (r) { return r.id === el.dataset.id; })) delete state().forms['#realisations/' + el.dataset.id];
    if (name !== 'prepareOffline' && name !== 'scanOffline') E.save();
  }
  function afterRender(route) {
    var path = location.hash || '#accueil', s = state(), values = s.forms[path];
    if (values) Object.keys(values).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = values[id]; });
    var active = ['cas','flash','examen','oral','chrono','exos','python','ecoute'].indexOf(route)>=0;
    document.body.classList.toggle('focus-mode',s.focus && active);
    if (active) {
      var bar = document.createElement('div'); bar.className = 'study-toolbar';
      bar.innerHTML = '<a class="small" href="#accueil">← Tableau de bord</a><span class="small muted" id="draftStatus">' + (['cas','examen','ecoute','python'].indexOf(route)>=0 ? 'Brouillons sauvegardés sur cet appareil' : '') + '</span><button class="btn ghost small" data-a="focus" aria-pressed="' + s.focus + '">' + (s.focus ? 'Quitter la concentration' : 'Mode concentration') + '</button>';
      $('#view').prepend(bar);
    }
    if (s.guide && s.guide.step < 3 && active) { var banner=document.createElement('p');banner.className='guide-banner';banner.innerHTML='<a href="#seance">Ma séance · étape ' + (s.guide.step+1) + '/3</a>';$('#view').prepend(banner); }
    if (route === 'cas' && E.session() && !E.session().fini) remember('#cas',E.session().titre);
    if (route === 'flash' && E.flash() && E.flash().deck.length && path !== '#flash') remember('#flash/' + E.flash().key,'Mon paquet de flashcards');
    if (route === 'examen' && E.state().examRun) remember('#examen','Examen blanc en cours');
    if (route === 'ecoute' && lesson(path.split('/')[1])) remember(path,lesson(path.split('/')[1]).title);
    var audio = $('#lessonAudio');
    if (audio) {
      var a = audioState(audio.dataset.id);
      audio.addEventListener('loadedmetadata',function () { if (Number.isFinite(audio.duration)) audio.currentTime=Math.min(a.position,Math.max(0,audio.duration-.1)); });
      audio.addEventListener('timeupdate',function () { if (Math.abs(a.position-audio.currentTime)>=2) { a.position=audio.currentTime;queueSave(); } });
      audio.addEventListener('pause',function () { a.position=Number.isFinite(audio.currentTime)?audio.currentTime:0;queueSave(); });
      audio.addEventListener('error',function () { var e=$('#audioError'); if(e)e.textContent='Audio indisponible : vérifie que le dossier audio est présent ou prépare cette écoute hors ligne.'; });
      $('#audioSpeed').addEventListener('change',function (e) { audio.playbackRate=Number(e.target.value); });
    }
    if (capture() || active) E.save();
  }
  document.addEventListener('input',function (e) {
    var t=e.target, path=location.hash;
    if (t.classList.contains('review-note')) { var r=state().reviews[t.dataset.id] || {status:'todo',updated:0};r.note=t.value;r.updated=Date.now();state().reviews[t.dataset.id]=r;queueSave(); }
    if (t.classList.contains('listen-answer')) { audioState(t.dataset.id).answers[Number(t.dataset.i)]=t.value;queueSave(); }
    if (/^#(?:controles|realisations)\/[a-zA-Z0-9_-]+$/.test(path) && /^(?:kX|kC|kR|r_[a-z]+|rEp)$/.test(t.id)) { (state().forms[path] || (state().forms[path]={}))[t.id]=t.value;remember(path,'Brouillon · ' + (path.indexOf('#controles')===0?'mon contrôle':'ma réalisation'));queueSave(); }
    if (['rep','pycode','pyrep'].indexOf(t.id)>=0) { if(t.id==='pyrep') E.python().rep=t.value; if(path==='#python')remember(path,'Mon exercice Python');queueSave(); }
  });
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',function () { if(document.hidden)flush(); });
  document.addEventListener('keydown',function (e) { if(e.key==='Escape' && state().focus){state().focus=false;E.save();E.rerender();} });
  return { capture:capture, restore:restore, cancelPending:cancelPending, flush:flush, afterRender:afterRender, afterAction:afterAction, trace:trace, home:home, searchResults:searchResults, resumeTarget:resumeTarget, scanOffline:scanOffline };
}
window.StudyTools = {blank:blank,validate:validate,install:install};
})();
