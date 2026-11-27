/* Révision BTS SIO (adapté de Révision Brevet) — côté ludique : niveaux et points d'expérience, défis du jour, badges, série avec joker,
   pendu des sigles, jeu des paires (ports, sigles, couches OSI), minuteur de concentration, nouvelles sources du quiz chrono (solo et en classe).
   Principes retenus des études sur la ludification (voir README) : récompenser la réussite plutôt que le temps passé,
   peu de badges et liés à de vrais progrès, des défis courts liés aux révisions, une série qui pardonne un jour manqué,
   aucun classement public. Les points sont recalculés à partir de la progression : rien ne peut être « gonflé ». */
(function () {
'use strict';
(window.PlusModules = window.PlusModules || []).push(function (E) {
  var V = E.V, ACT = E.ACT, esc = E.esc, norm = E.norm, $ = E.$, shuffle = E.shuffle, pick = E.pick;
  function P() {
    var S = E.state(); if (!S.plus || typeof S.plus !== 'object') S.plus = {};
    var j = S.plus.jeu; if (!j || typeof j !== 'object' || Array.isArray(j)) j = S.plus.jeu = {};
    ['tot', 'badges', 'defis', 'jour', 'rec'].forEach(function (k) { if (!j[k] || typeof j[k] !== 'object' || Array.isArray(j[k])) j[k] = {}; });
    return j;
  }
  function today() { return E.dkey(new Date()); }
  function addNav(group, items, after) {
    var g = E.NAV.filter(function (x) { return x[0] === group; })[0]; if (!g) return;
    items.forEach(function (it) { if (g[1].some(function (x) { return x[0] === it[0]; })) return; var i = g[1].map(function (x) { return x[0]; }).indexOf(after); if (i >= 0) { g[1].splice(i + 1, 0, it); after = it[0]; } else g[1].push(it); });
  }
  addNav('', [['progres', 'Défis et badges']], 'accueil');
  E.NAV.splice(3, 0, ['Jeux', [['pendu', 'Pendu des sigles'], ['paires', 'Jeu des paires'], ['chrono', 'Quiz chrono (QCM)']]]);
  E.NAV.forEach(function (g) { if (g[0] === 'S\'entraîner') g[1] = g[1].filter(function (x) { return x[0] !== 'chrono'; }); });
  addNav('Organisation', [['minuteur', 'Minuteur de concentration']], 'planning');
  Object.assign(E.ICO, {
    progres: 'M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z',
    pendu: 'M4 21h10 M7 21V3h8v3 M15 9a2 2 0 1 0 0 .01',
    paires: 'M3 4h8v8H3z M13 12h8v8h-8z M11 8h4v4',
    minuteur: 'M12 8v5l3 2 M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M9 2h6'
  });

  /* ───── Points d'expérience (XP), calculés à partir de la progression réelle ───── */
  function sum(o, f) { return Object.keys(o || {}).reduce(function (s, k) { return s + (f(o[k]) || 0); }, 0); }
  function stats() {
    var S = E.state(), p = S.plus || {}, j = P(), t = j.tot;
    var rep = sum(S.answers, function (a) { return a.length; }), repNote = sum(S.answers, function (a) { return a.reduce(function (s, x) { return s + (x.note || 0); }, 0); });
    var o = {
      flashOk: sum(S.fstats, function (x) { return x.ok; }), appris: Object.keys(S.learned || {}).length, reponses: rep, repNote: repNote,
      exosOk: sum(S.exstats, function (x) { return x.ok; }), oral: sum(S.ostats, function (x) { return x.n; }), blancs: (S.examHist || []).length,
      tp: Object.keys(S.tpdone || {}).length, frOk: sum(p.fr, function (x) { return x.ok; }),
      pendu: t.pendu || 0, paires: t.paires || 0, pomo: t.pomo || 0, jur: t.jur || 0, defis: Object.keys(j.defis).length,
      jurMax: Math.max.apply(null, [0].concat(Object.keys(p.dev || {}).map(function (k) { var d = p.dev[k], it = (window.CAS_JURIDIQUES || []).filter(function (c) { return c.id === k; })[0]; return d && d.best != null && it ? d.best / it.attendus.length : 0; }))),
      redac: sum(p.red, function (d) { return d && d.t && d.t.split(/\s+/).length >= 300 ? 1 : 0; })
    };
    o.xp = Math.round(o.flashOk * 2 + o.appris * 5 + o.reponses * 4 + o.repNote * 6 + o.exosOk * 3 + o.oral * 3 + o.blancs * 30 + o.tp * 15 + o.frOk * 2 +
      o.pendu * 8 + o.paires * 10 + o.pomo * 10 + o.jur * 15 + o.redac * 40 + o.defis * 30);
    return o;
  }
  var NIVEAUX = ['Curieux', 'Apprenti', 'Explorateur', 'Studieux', 'Méthodique', 'Solide', 'Expert', 'Brillant', 'Excellence', 'Prêt pour le BTS'];
  function niveau(xp) { var L = 0; while (50 * (L + 1) * (L + 2) <= xp) L++; var bas = 50 * L * (L + 1), haut = 50 * (L + 1) * (L + 2); return { n: L + 1, nom: NIVEAUX[Math.min(L, NIVEAUX.length - 1)], bas: bas, haut: haut, pct: (xp - bas) / (haut - bas) }; }

  /* ───── Série avec joker : un jour manqué par semaine ne casse pas la série ───── */
  function serieJoker() {
    var D = E.state().days || {}, d = new Date(), n = 0, dernierJoker = -99, i = 0;
    if (!D[E.dkey(d)]) d.setDate(d.getDate() - 1);
    for (; i < 2000; i++) {
      if (D[E.dkey(d)]) n++;
      else { var veille = new Date(d); veille.setDate(veille.getDate() - 1); if (n > 0 && i - dernierJoker >= 7 && D[E.dkey(veille)]) dernierJoker = i; else break; }
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  /* ───── Badges (peu nombreux, chacun lié à un vrai progrès) ───── */
  var BADGES = [
    ['debut', '🌱', 'Premier pas', 'Faire une première activité', function (o, s) { return [s.jours, 1]; }],
    ['serie3', '🔥', 'Lancé', '3 jours de révision d\'affilée', function (o, s) { return [s.serie, 3]; }],
    ['serie7', '🔥', 'Régulier', '7 jours d\'affilée (joker compris)', function (o, s) { return [s.serie, 7]; }],
    ['serie30', '🏅', 'Marathonien', '30 jours d\'affilée (joker compris)', function (o, s) { return [s.serie, 30]; }],
    ['flash100', '🧠', 'Mémoire d\'éléphant', '100 flashcards réussies', function (o) { return [o.flashOk, 100]; }],
    ['notions60', '📚', 'Bibliothécaire', '60 notions apprises', function (o) { return [o.appris, 60]; }],
    ['cas30', '📝', 'Études de cas', '30 questions d\'études de cas traitées', function (o) { return [o.reponses, 30]; }],
    ['blanc', '⏳', 'Examen blanc', 'Terminer un examen blanc', function (o) { return [o.blancs, 1]; }],
    ['oral10', '🎤', 'Orateur', '10 questions d\'oral travaillées', function (o) { return [o.oral, 10]; }],
    ['tp5', '🛠️', 'Praticien', '5 TP marqués comme faits', function (o) { return [o.tp, 5]; }],
    ['jur', '⚖️', 'Juriste', '80 % des notions attendues dans un cas de CEJM', function (o) { return [o.jurMax >= 0.8 ? 1 : 0, 1]; }],
    ['redac', '📖', 'Plume', 'Un essai de CGE de 300 mots ou plus', function (o) { return [o.redac, 1]; }],
    ['fr50', '🔤', 'Orthographe', '50 exercices d\'orthographe réussis', function (o) { return [o.frOk, 50]; }],
    ['pomo', '⏱️', 'Concentré', '4 sessions de concentration', function (o) { return [o.pomo, 4]; }],
    ['defis', '🎯', 'Défi relevé', '7 défis du jour complétés', function (o) { return [o.defis, 7]; }],
    ['niv5', '🚀', 'Niveau 5', 'Atteindre le niveau 5', function (o) { return [niveau(o.xp).n, 5]; }]
  ];
  function badgesEtat() { var o = stats(), s = { serie: serieJoker(), jours: Object.keys(E.state().days || {}).length }; return BADGES.map(function (b) { var v = b[4](o, s); return { b: b, v: Math.min(v[0], v[1]), max: v[1], ok: v[0] >= v[1] }; }); }
  function verifierBadges() {
    var j = P(), neufs = badgesEtat().filter(function (x) { return x.ok && !j.badges[x.b[0]]; });
    neufs.forEach(function (x) { j.badges[x.b[0]] = Date.now(); });
    if (neufs.length) { E.save(); E.toast('Nouveau badge : ' + neufs.map(function (x) { return x.b[1] + ' ' + x.b[2]; }).join(', ') + ' !'); setTimeout(confettis, 0); }
  }

  /* ───── Défis du jour : toujours des flashcards + deux défis tirés selon la date ───── */
  var POOL = [['cas', 3, 'Répondre à 3 questions d\'étude de cas', '#cas'], ['oral', 1, 'Travailler une question d\'oral', '#oral'], ['fr', 10, 'Réussir 10 exercices d\'orthographe', '#francais'],
    ['pendu', 1, 'Gagner une partie de pendu', '#pendu'], ['paires', 1, 'Terminer un jeu des paires', '#paires'], ['pomo', 1, 'Faire une session de concentration', '#minuteur'],
    ['jur', 1, 'Vérifier un cas de raisonnement juridique', '#juridique'], ['exo', 5, 'Faire 5 exercices (réseau, SQL, maths)', '#exos']];
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function defis() {
    var d = today(), h = hash(d), a = POOL[h % POOL.length], b = POOL[(h >>> 8) % POOL.length]; if (b === a) b = POOL[(POOL.indexOf(a) + 3) % POOL.length];
    var j = P(); if (j.jour.d !== d) j.jour = { d: d, c: {} };
    var S = E.state(), flash = S.day && S.day.d === dayStr() ? S.day.flash || 0 : 0;
    return [['flash', 10, 'Revoir 10 flashcards', '#flash']].concat([a, b]).map(function (q) { var jour = S.day && S.day.d === dayStr() ? S.day : {}, v = q[0] === 'flash' ? flash : q[0] === 'cas' ? jour.q || 0 : q[0] === 'oral' ? jour.oral || 0 : q[0] === 'exo' ? jour.ex || 0 : (j.jour.c[q[0]] || 0); return { k: q[0], cible: q[1], label: q[2], href: q[3], v: Math.min(v, q[1]), ok: v >= q[1] }; });
  }
  function dayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function verifierDefis() {
    var j = P(), L = defis(), d = today();
    if (L.every(function (q) { return q.ok; }) && !j.defis[d]) { j.defis[d] = 1; E.save(); E.toast('Les 3 défis du jour sont relevés, bravo ! +30 points'); setTimeout(confettis, 0); }
  }
  function quest(k, n) {
    var j = P(), d = today(); if (j.jour.d !== d) j.jour = { d: d, c: {} };
    j.jour.c[k] = (j.jour.c[k] || 0) + (n || 1); j.tot[k] = (j.tot[k] || 0) + (n || 1);
    E.save(); verifierDefis(); verifierBadges();
  }
  window.PlusJeu = { quest: quest };

  /* ───── Confettis (désactivés si l'élève a demandé moins d'animations) ───── */
  function confettis() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!document.body || !document.body.appendChild) return;
    var c = document.createElement('div'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
    var cols = ['#1d4ed8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
    for (var i = 0; i < 70; i++) { var s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = cols[i % cols.length]; s.style.animationDelay = Math.random() * .6 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.4 + 's'; s.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; c.appendChild(s); }
    document.body.appendChild(c); setTimeout(function () { c.remove(); }, 3800);
  }

  /* ───── Carte « niveau et défis » sur l'accueil, page « Défis et badges » ───── */
  function carteNiveau(complet) {
    var o = stats(), N = niveau(o.xp), D = defis(), sj = serieJoker();
    return '<div class="card niveau"><div class="row sp"><div><p class="eyebrow">Niveau ' + N.n + ' · ' + esc(N.nom) + '</p><b class="nxp">' + o.xp + ' points</b> <span class="small muted">— encore ' + (N.haut - o.xp) + ' pour le niveau ' + (N.n + 1) + '</span></div><span class="tag acc" title="Un jour manqué par semaine ne casse pas la série">🔥 ' + sj + ' jour' + (sj > 1 ? 's' : '') + ' (joker compris)</span></div>' +
      '<div class="bar"><i style="width:' + Math.round(N.pct * 100) + '%"></i></div>' +
      '<p class="eyebrow" style="margin-top:.9rem">Défis du jour</p><div class="defis">' + D.map(function (q) { return '<a class="defi' + (q.ok ? ' ok' : '') + '" href="' + q.href + '"><b>' + (q.ok ? '✓' : q.v + ' / ' + q.cible) + '</b><span>' + esc(q.label) + '</span></a>'; }).join('') + '</div>' +
      (complet ? '' : '<div class="row" style="margin-top:.6rem"><a class="btn ghost small" href="#progres">Mes badges et mes points</a></div>') + '</div>';
  }
  var accueil0 = V.accueil;
  V.accueil = function (a, b) { var h = accueil0(a, b), i = h.indexOf('</section>'); return i >= 0 ? h.slice(0, i + 10) + carteNiveau() + h.slice(i + 10) : carteNiveau() + h; };
  V.progres = function () {
    verifierBadges();
    var o = stats(), B = badgesEtat(), nb = B.filter(function (x) { return x.ok; }).length;
    var src = [['Flashcards réussies', o.flashOk, 2], ['Notions apprises', o.appris, 5], ['Questions d\'études de cas', o.reponses, '4 + note'], ['Exercices réussis', o.exosOk, 3], ['Questions d\'oral', o.oral, 3], ['Examens blancs', o.blancs, 30], ['TP faits', o.tp, 15], ['Orthographe réussie', o.frOk, 2], ['Cas juridiques vérifiés', o.jur, 15], ['Essais de 300 mots', o.redac, 40], ['Pendus gagnés', o.pendu, 8], ['Jeux des paires', o.paires, 10], ['Sessions de concentration', o.pomo, 10], ['Défis du jour complétés', o.defis, 30]];
    return E.pageHead('Défis et badges', 'Tes points viennent de ce que tu <b>réussis</b> (flashcards sues, bonnes réponses aux études de cas, exercices…), pas du temps passé. Trois défis courts chaque jour, des badges pour les vrais progrès, et une série qui pardonne un jour manqué par semaine.') +
      carteNiveau(true) +
      '<h2>Badges : ' + nb + ' / ' + B.length + '</h2><div class="badges">' + B.map(function (x) { return '<div class="badge' + (x.ok ? ' ok' : '') + '"><span class="bi" aria-hidden="true">' + x.b[1] + '</span><b>' + esc(x.b[2]) + '</b><span class="small muted">' + esc(x.b[3]) + '</span>' + (x.ok ? '<span class="tag good">obtenu</span>' : '<div class="bar"><i style="width:' + Math.round(x.v / x.max * 100) + '%"></i></div><span class="small muted">' + x.v + ' / ' + x.max + '</span>') + '</div>'; }).join('') + '</div>' +
      '<h2>D\'où viennent mes points</h2><div class="card"><table class="small"><tr><th>Activité</th><th>Total</th><th>Points</th></tr>' + src.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="n">' + Math.round(r[1] * 10) / 10 + '</td><td class="n">× ' + r[2] + '</td></tr>'; }).join('') + '</table></div>';
  };

  /* ───── Pendu du lexique ───── */
  var pe = null;
  function motsPendu() { return (window.GLOSSAIRE || []).filter(function (g) { return /^[A-Za-zÀ-ÖØ-öø-ÿœŒ-]{3,16}$/.test(g[0]); }); }
  function lettre(c) { return norm(c).replace(/œ/g, 'oe').toUpperCase(); }
  V.pendu = function () {
    var L = motsPendu(), j = P();
    if (!pe) pe = { g: pick(L), essais: [], fin: false };
    var mot = pe.g[0], lettres = mot.split('');
    var fautes = pe.essais.filter(function (l) { return !lettres.some(function (c) { return lettre(c).indexOf(l) >= 0; }); }).length, vies = 7 - fautes;
    var indice = pe.g[1].replace(new RegExp(mot, 'ig'), '…');
    return E.pageHead('Pendu des sigles', 'Retrouve les sigles du glossaire (réseau, sécurité, développement, droit) à partir de leur signification. Bon pour les QCM, les études de cas et l\'oral.') +
      '<div class="card frq"><div class="row sp"><span class="eyebrow">' + esc(pe.g[3]) + '</span><span class="vies" aria-label="' + vies + ' vies">' + '♥'.repeat(Math.max(0, vies)) + '<span class="muted">' + '♡'.repeat(Math.min(7, fautes)) + '</span></span></div>' +
      '<p class="frbig"><b>Indice :</b> ' + esc(indice) + '</p>' + (pe.g[2] ? '<p class="small muted">' + esc(String(pe.g[2]).replace(new RegExp(mot, 'ig'), '…')) + '</p>' : '') +
      '<p class="pmot" aria-live="polite">' + lettres.map(function (c) { return /[A-Za-zÀ-ÿœŒ]/.test(c) ? '<span>' + (lettre(c).split('').every(function (x) { return pe.essais.indexOf(x) >= 0; }) || pe.fin ? esc(c.toUpperCase()) : '&nbsp;') + '</span>' : '<span class="sep">' + esc(c) + '</span>'; }).join('') + '</p>' +
      (pe.fin ? '<div class="verdict ' + (pe.gagne ? 'good' : 'bad') + '"><b>' + (pe.gagne ? 'Gagné !' : 'Perdu…') + '</b> ' + esc(pe.g[0]) + ' : ' + esc(pe.g[1]) + '. ' + esc(pe.g[2]) + '</div><div class="row"><button class="btn" data-a="pnew">Nouveau mot</button></div>'
        : '<div class="clavier">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l) { var u = pe.essais.indexOf(l) >= 0, bon = u && lettres.some(function (c) { return lettre(c).indexOf(l) >= 0; }); return '<button class="btn ghost small' + (u ? (bon ? ' on' : ' rec') : '') + '" data-a="plet" data-v="' + l + '"' + (u ? ' disabled' : '') + '>' + l + '</button>'; }).join('') + '</div><p class="small muted">Tu peux aussi taper les lettres au clavier. Les accents ne comptent pas.</p>') +
      '</div><p class="small muted">Parties gagnées : ' + (j.tot.pendu || 0) + '</p>';
  };
  function pJouer(l) {
    if (!pe || pe.fin || pe.essais.indexOf(l) >= 0) return;
    pe.essais.push(l);
    var lettres = pe.g[0].split(''), trouve = lettres.every(function (c) { return !/[A-Za-zÀ-ÿœŒ]/.test(c) || lettre(c).split('').every(function (x) { return pe.essais.indexOf(x) >= 0; }); });
    var fautes = pe.essais.filter(function (x) { return !lettres.some(function (c) { return lettre(c).indexOf(x) >= 0; }); }).length;
    if (trouve) { pe.fin = true; pe.gagne = true; quest('pendu'); E.dayCount('q'); }
    else if (fautes >= 7) { pe.fin = true; pe.gagne = false; E.save(); }
    E.rerender();
  }
  ACT.plet = function (el) { pJouer(el.dataset.v); };
  ACT.pnew = function () { pe = null; E.rerender(); };
  document.addEventListener('keydown', function (e) { if (E.curRoute() === 'pendu' && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !(e.target.matches && e.target.matches('input,textarea'))) pJouer(e.key.toUpperCase()); });

  /* ───── Jeu des paires : ports et protocoles, sigles, couches du modèle OSI ───── */
  var pa = null, PA_MODES = { ports: 'Ports et protocoles', sigles: 'Sigles', osi: 'Couches OSI' };
  function paJeu(mode) {
    if (mode === 'ports') return (window.PORTS || []).map(function (x) { return [x, String(x[0]), x[1]]; });
    if (mode === 'osi') return (window.OSI_EXEMPLES || []).map(function (x) { return [x, x[0], x[1]]; });
    return (window.GLOSSAIRE || []).filter(function (g) { return g[0].length <= 12 && g[1].length <= 60; }).map(function (g) { return [g, g[0], g[1]]; });
  }
  function paNouveau(mode) {
    mode = mode || (pa && pa.mode) || 'ports';
    var R = paJeu(mode), sel = [];
    shuffle(R).forEach(function (r) { if (sel.length < 6 && sel.every(function (x) { return x[1] !== r[1] && x[2] !== r[2]; })) sel.push(r); });
    pa = { mode: mode, sel: sel, dates: shuffle(sel.map(function (r, i) { return i; })), evs: shuffle(sel.map(function (r, i) { return i; })), ok: {}, choix: null, err: 0, t0: Date.now(), fin: 0, faux: null };
  }
  V.paires = function () {
    if (!pa) paNouveau('ports');
    var j = P(), best = (j.rec.paires || {})[pa.mode];
    var col = function (L, type) { return L.map(function (i) { var r = pa.sel[i], fait = pa.ok[i], ch = pa.choix && pa.choix[0] === type && pa.choix[1] === i, fx = pa.faux && pa.faux[0] === type && pa.faux[1] === i; return '<button class="btn ghost pa' + (fait ? ' good-b' : '') + (ch ? ' on' : '') + (fx ? ' rec' : '') + '" data-a="paclic" data-t="' + type + '" data-v="' + i + '"' + (fait ? ' disabled' : '') + '>' + esc(type === 'd' ? r[1] : r[2]) + '</button>'; }).join(''); };
    return E.pageHead('Jeu des paires', 'Associe chaque élément de gauche à celui de droite le plus vite possible, avec le moins d\'erreurs : ports et protocoles (E6 SISR, E7), sigles du glossaire, couches du modèle OSI.') +
      '<div class="seg">' + Object.keys(PA_MODES).map(function (m) { return '<button class="' + (pa.mode === m ? 'on' : '') + '" data-a="pamode" data-v="' + m + '">' + PA_MODES[m] + '</button>'; }).join('') + '</div>' +
      '<p class="small muted" style="margin-top:.6rem">' + (best ? 'Record : ' + best + ' s' : 'Pas encore de record') + ' · erreurs : ' + pa.err + '</p>' +
      (pa.fin ? '<div class="verdict ' + (pa.err === 0 ? 'good' : pa.err <= 3 ? 'mid' : 'bad') + '"><b>Terminé en ' + Math.round((pa.fin - pa.t0) / 1000) + ' s avec ' + pa.err + ' erreur' + (pa.err > 1 ? 's' : '') + '.</b>' + (pa.record ? ' Nouveau record !' : '') + '</div><div class="row"><button class="btn" data-a="panew">Rejouer</button><a class="btn ghost" href="#glossaire">Revoir le glossaire</a></div>' : '') +
      '<div class="pacols"><div>' + col(pa.dates, 'd') + '</div><div>' + col(pa.evs, 'e') + '</div></div>';
  };
  ACT.pamode = function (el) { paNouveau(el.dataset.v); E.rerender(); };
  ACT.panew = function () { paNouveau(); E.rerender(); };
  ACT.paclic = function (el) {
    var t = el.dataset.t, i = +el.dataset.v; pa.faux = null;
    if (!pa.choix || pa.choix[0] === t) { pa.choix = [t, i]; E.rerender(); return; }
    if (pa.choix[1] === i) { pa.ok[i] = 1; } else { pa.err++; pa.faux = [t, i]; }
    pa.choix = null;
    if (Object.keys(pa.ok).length === pa.sel.length) {
      pa.fin = Date.now(); var s = Math.round((pa.fin - pa.t0) / 1000) + pa.err * 5, j = P();
      if (typeof j.rec.paires !== 'object' || !j.rec.paires) j.rec.paires = {};
      if (!j.rec.paires[pa.mode] || s < j.rec.paires[pa.mode]) { j.rec.paires[pa.mode] = s; pa.record = true; }
      quest('paires'); E.dayCount('q');
    }
    E.rerender();
  };

  /* ───── Minuteur de concentration (méthode Pomodoro) ───── */
  var pm = null, MODES = [[25, 5, '25 min de travail, 5 min de pause'], [45, 10, '45 min de travail, 10 min de pause'], [15, 3, '15 min de travail, 3 min de pause']];
  function mmss(ms) { ms = Math.max(0, ms); var s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  V.minuteur = function () {
    var j = P(), m = pm ? pm.m : (V.minuteur.m || 0), rest = pm ? (pm.pause ? pm.rest : pm.fin - Date.now()) : MODES[m][0] * 60000;
    return E.pageHead('Minuteur de concentration', 'Travailler par blocs courts, sans téléphone ni notifications, puis faire une vraie pause : c\'est la méthode « Pomodoro ». Pendant le travail, choisis une seule tâche (une fiche, une série de flashcards, un dossier d\'étude de cas).') +
      '<div class="card pomo"><div class="seg">' + MODES.map(function (x, i) { return '<button class="' + (m === i ? 'on' : '') + '" data-a="pmmode" data-v="' + i + '"' + (pm ? ' disabled' : '') + '>' + x[0] + ' / ' + x[1] + '</button>'; }).join('') + '</div>' +
      '<p class="eyebrow" style="margin-top:1rem">' + (pm ? (pm.phase === 'travail' ? 'Travail' : 'Pause') : 'Prêt') + '</p><div class="pomot" id="pomot">' + mmss(rest) + '</div>' +
      '<div class="row center">' + (!pm ? '<button class="btn big" data-a="pmgo">Démarrer</button>' : '<button class="btn" data-a="pmpause">' + (pm.pause ? 'Reprendre' : 'Pause') + '</button><button class="btn ghost" data-a="pmstop">Arrêter</button>') + '</div>' +
      '<p class="small muted center-t">' + esc(MODES[m][2]) + ' · sessions terminées : ' + (j.tot.pomo || 0) + '</p></div>' +
      '<div class="card"><h4>Idées de tâches pour une session</h4><ul class="small"><li>20 flashcards en retard, puis une série d\'exercices de sous-réseaux.</li><li>Une partie de dossier d\'étude de cas E7 et sa correction.</li><li>Un cas de raisonnement juridique de CEJM.</li><li>Un plan d\'essai de CGE sur « Le vrai du faux ».</li></ul></div>';
  };
  function bip() { try { var C = window.AudioContext || window.webkitAudioContext; if (!C) return; var c = new C(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(c.destination); o.start(); setTimeout(function () { o.stop(); c.close(); }, 350); } catch (e) {} }
  ACT.pmmode = function (el) { V.minuteur.m = +el.dataset.v; E.rerender(); };
  ACT.pmgo = function () { var m = V.minuteur.m || 0; pm = { m: m, phase: 'travail', fin: Date.now() + MODES[m][0] * 60000, pause: false }; pmTick(); E.rerender(); pill(); };
  ACT.pmpause = function () { if (!pm) return; if (pm.pause) { pm.fin = Date.now() + pm.rest; pm.pause = false; } else { pm.rest = pm.fin - Date.now(); pm.pause = true; } E.rerender(); };
  ACT.pmstop = function () { pm = null; E.rerender(); pill(); };
  function pill() {
    var el = document.getElementById('pomopill');
    if (!pm || E.curRoute() === 'minuteur') { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('a'); el.id = 'pomopill'; el.href = '#minuteur'; document.body.appendChild(el); }
    el.textContent = (pm.phase === 'travail' ? '⏱ Travail ' : '☕ Pause ') + mmss(pm.pause ? pm.rest : pm.fin - Date.now());
  }
  /* Le minuteur ne tourne que pendant une session (pas de tâche de fond inutile). */
  var pmTimer = null;
  function pmTick() { if (!pmTimer) pmTimer = setInterval(pmStep, 1000); }
  function pmStep() {
    if (!pm) { clearInterval(pmTimer); pmTimer = null; return; }
    if (pm.pause) return;
    var r = pm.fin - Date.now(), t = document.getElementById('pomot'); if (t) t.textContent = mmss(r); pill();
    if (r > 0) return;
    bip();
    if (pm.phase === 'travail') { quest('pomo'); E.dayCount('q'); pm.phase = 'pause'; pm.fin = Date.now() + MODES[pm.m][1] * 60000; E.toast('Session terminée, bravo ! Pause de ' + MODES[pm.m][1] + ' minutes.'); }
    else { pm = null; E.toast('Pause terminée. Prêt pour une nouvelle session ?'); }
    if (E.curRoute() === 'minuteur') E.rerender(); pill();
  }
  window.addEventListener('hashchange', function () { setTimeout(function () { pill(); verifierBadges(); }, 0); });

  /* ───── Bilan de la semaine : ce qui est su, ce qui est fragile, quoi réviser ensuite ───── */
  function bilanSemaine() {
    var S = E.state(), now = Date.now(), J7 = now - 7 * 86400000, NOT = E.allNotions();
    var jours = 0, activites = 0;
    for (var i = 0; i < 7; i++) { var d = new Date(now - i * 86400000), v = (S.days || {})[E.dkey(d)] || 0; if (v) jours++; activites += v; }
    var revues = Object.keys(S.cards || {}).filter(function (id) { return (S.cards[id].last || 0) >= J7; });
    var parId = {}; NOT.forEach(function (n) { parId[n.id] = n; });
    var fragiles = Object.keys(S.cards || {}).filter(function (id) { var c = S.cards[id]; return parId[id] && !S.learned[id] && c.n && ((c.lapses || 0) > 0 || (c.s || 0) < 3); })
      .map(function (id) { return parId[id]; }).sort(function (a, b) { return b.imp - a.imp || (S.cards[b.id].lapses || 0) - (S.cards[a.id].lapses || 0); });
    var solides = NOT.filter(function (n) { var c = (S.cards || {})[n.id]; return S.learned[n.id] || c && (c.s || 0) >= 21; }).length;
    var rep = [], th = {}, C = window.CORRECTIONS || {}, T = window.THEMES_PLUS || window.THEMES || {};
    Object.keys(S.answers || {}).forEach(function (id) {
      var p = id.split('#'), corr = C[p[0]] && C[p[0]][p[1]];
      (S.answers[id] || []).forEach(function (a) {
        if (a.d < J7) return; rep.push(a.note);
        if (corr) corr[0].split(' ').forEach(function (t) { if (!t) return; th[t] = th[t] || { n: 0, s: 0 }; th[t].n++; th[t].s += a.note; });
      });
    });
    var moy = rep.length ? rep.reduce(function (a, b) { return a + b; }, 0) / rep.length : null;
    var faibles = Object.keys(th).map(function (t) { return { t: t, m: th[t].s / th[t].n, n: th[t].n }; }).filter(function (x) { return x.m < 0.6; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 3);
    var jamais = NOT.filter(function (n) { return n.imp === 3 && !(S.cards || {})[n.id] && !S.learned[n.id]; }).slice(0, 3);
    var conseils = [];
    if (jours < 4) conseils.push('Viser au moins 4 jours de révision la semaine prochaine, même 15 minutes : la régularité compte plus que la durée.');
    fragiles.slice(0, 3).forEach(function (n) { conseils.push('Revoir « ' + n.titre + ' » (' + E.matLabel(n.mat) + ') : notion encore fragile.'); });
    faibles.forEach(function (x) { conseils.push('Retravailler le thème « ' + ((T[x.t] || [x.t])[0]) + ' » : moyenne de ' + E.sur20(x.m) + ' / 20 cette semaine.'); });
    jamais.forEach(function (n) { conseils.push('Découvrir « ' + n.titre + ' » (indispensable, jamais révisé).'); });
    if (!conseils.length) conseils.push('Très bonne semaine : continue avec les défis du jour et un sujet complet en conditions d\'examen.');
    return { jours: jours, activites: activites, revues: revues.length, fragiles: fragiles, solides: solides, total: NOT.length, rep: rep.length, moy: moy, conseils: conseils.slice(0, 6) };
  }
  function bilanHtml() {
    var b = bilanSemaine();
    return '<h2>Bilan des 7 derniers jours</h2><div class="card"><div class="grid stats">' +
      [[b.jours + ' / 7', 'jours de révision'], [b.revues, 'flashcards revues'], [b.rep ? b.rep + (b.moy != null ? ' · ' + E.sur20(b.moy) + '/20' : '') : '0', 'questions d\'études de cas'], [b.solides + ' / ' + b.total, 'notions solides']]
        .map(function (x) { return '<div class="stat"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>' +
      (b.fragiles.length ? '<p class="small"><b>Encore fragile :</b> ' + b.fragiles.slice(0, 6).map(function (n) { return esc(n.titre); }).join(', ') + (b.fragiles.length > 6 ? '…' : '') + '</p>' : '') +
      '<h4>À réviser ensuite</h4><ol class="small">' + b.conseils.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>' +
      '<div class="row"><button class="btn ghost small" data-a="bilancopie">Copier le bilan (pour un parent ou un professeur)</button></div></div>';
  }
  ACT.bilancopie = function () {
    var b = bilanSemaine(), t = 'Bilan de révision du BTS SIO — 7 derniers jours\n' + b.jours + ' jours de révision sur 7 ; ' + b.revues + ' flashcards revues ; ' + b.rep + ' questions d\'études de cas' + (b.moy != null ? ' (moyenne ' + E.sur20(b.moy) + ' / 20)' : '') + ' ; ' + b.solides + ' notions solides sur ' + b.total + '.\nÀ réviser ensuite :\n- ' + b.conseils.join('\n- ');
    try { navigator.clipboard.writeText(t).then(function () { E.toast('Bilan copié.'); }, function () { E.toast('Copie impossible : sélectionne le texte à la main.'); }); } catch (e) { E.toast('Copie impossible dans ce navigateur.'); }
  };
  var progres0 = V.progres;
  V.progres = function (a, b) { var h = progres0(a, b), i = h.indexOf('<h2>Badges'); return i >= 0 ? h.slice(0, i) + bilanHtml() + h.slice(i) : h + bilanHtml(); };

  /* ───── Installer l'application sur le téléphone ou l'ordinateur (application web, fonctionne hors ligne) ───── */
  var invite = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); invite = e; if (E.curRoute() === 'accueil') E.rerender(); });
  window.addEventListener('appinstalled', function () { invite = null; E.toast('Application installée : elle s\'ouvre maintenant depuis l\'écran d\'accueil.'); });
  function installee() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function carteInstall() {
    if (installee() || !/^https?:/.test(location.protocol)) return '';
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!invite && !ios) return '';
    return '<div class="card install"><div class="row sp"><div><b>Installer Révision Brevet</b><p class="small muted" style="margin:.2rem 0 0">Une icône sur l\'écran d\'accueil, en plein écran, et utilisable sans connexion.</p></div>' +
      (invite ? '<button class="btn" data-a="installer">Installer</button>' : '<p class="small" style="margin:0">Sur iPhone : touche <b>Partager</b> puis <b>Sur l\'écran d\'accueil</b>.</p>') + '</div></div>';
  }
  ACT.installer = function () { if (!invite) return; invite.prompt(); invite.userChoice.then(function () { invite = null; E.rerender(); }); };
  var accueil1 = V.accueil;
  V.accueil = function (a, b) { var h = accueil1(a, b), c = carteInstall(); if (!c) return h; var i = h.indexOf('<div class="card niveau"'); return i >= 0 ? h.slice(0, i) + c + h.slice(i) : c + h; };

  /* ───── Nouvelles sources du quiz chrono (solo et partie à plusieurs, pour jouer en classe) ───── */
  function qcmDe(q, ok, faux, ex) { var o = [ok]; faux.forEach(function (f) { if (o.length < 4 && f != null && o.indexOf(String(f)) < 0) o.push(String(f)); }); return { q: q, ok: ok, opts: shuffle(o), ex: ex }; }
  var F = function (x) { return window.PlusAuto ? window.PlusAuto.fmt(x) : String(x); };
  window.KH_EXTRA = {
    xports: ['Ports et protocoles', function () {
      var L = window.PORTS || [];
      return shuffle(L).slice(0, 10).map(function (x, i) {
        if (i % 2) return qcmDe('Quel est le port par défaut de ' + x[1] + ' ?', String(x[0]), shuffle(L.filter(function (y) { return y !== x; })).map(function (y) { return String(y[0]); }), x[1] + ' : port ' + x[0] + ' (' + x[2] + ').');
        return qcmDe('Quel protocole utilise par défaut le port ' + x[0] + ' ?', x[1], shuffle(L.filter(function (y) { return y !== x; })).map(function (y) { return y[1]; }), 'Port ' + x[0] + ' : ' + x[1] + ' (' + x[2] + ').');
      });
    }],
    xosi: ['Couches du modèle OSI', function () {
      var L = window.OSI_EXEMPLES || [], C = ['1 · Physique', '2 · Liaison de données', '3 · Réseau', '4 · Transport', '5 · Session', '6 · Présentation', '7 · Application'];
      return shuffle(L).slice(0, 10).map(function (x) { return qcmDe('À quelle couche du modèle OSI appartient : ' + x[0] + ' ?', x[1], shuffle(C.filter(function (c) { return c !== x[1]; })), x[0] + ' : couche ' + x[1] + '. ' + x[2]); });
    }],
    xhomo: ['Orthographe : homophones', function () { return shuffle(window.HOMOPHONES || []).slice(0, 10).map(function (h) { return qcmDe(h[0].replace('___', '……'), h[1], h[2].split('|'), h[3]); }); }],
    xpp: ['Orthographe : accords du participe passé', function () { return shuffle(window.ACCORDS_PP || []).slice(0, 10).map(function (h) { return qcmDe(h[0].replace('___', '……'), h[1], h[2].split('|'), h[3]); }); }]
  };
});
})();
