/* Révision BTS SIO — pages ajoutées : vidéos de cours (avec « mes passages »), orthographe et conjugaison (pour la CGE),
   simulateur de note du BTS. JavaScript pur, aucune dépendance. Adapté de l'application Révision Brevet.
   Branché par js/app.js (PlusTools.install) avant le premier affichage ; les données viennent de data/videos.js,
   data/francais.js et data/frise.js. Progression enregistrée dans S.plus (comprise dans la sauvegarde). */
(function () {
'use strict';
function install(E) {
  var V = E.V, ACT = E.ACT, esc = E.esc, norm = E.norm, $ = E.$, shuffle = E.shuffle, pick = E.pick;
  function P() {   // état propre aux nouvelles pages, réparé s'il est incomplet
    var S = E.state(); if (!S.plus || typeof S.plus !== 'object' || Array.isArray(S.plus)) S.plus = {};
    var p = S.plus;
    ['pass', 'dict', 'frise', 'simu', 'fr'].forEach(function (k) { if (!p[k] || typeof p[k] !== 'object' || Array.isArray(p[k])) p[k] = {}; });
    return p;
  }
  var VIDEOS = window.VIDEOS || {}, CHAINES = window.VIDEO_CHAINES || {};
  var NOTS = E.notions;   // fonction : notions affichées

  /* ───── Menu ───── */
  function addNav(group, items, after) {
    var g = E.NAV.filter(function (x) { return x[0] === group; })[0]; if (!g) return;
    items.forEach(function (it) {
      if (g[1].some(function (x) { return x[0] === it[0]; })) return;
      var i = after ? g[1].map(function (x) { return x[0]; }).indexOf(after) : -1;
      if (i >= 0) { g[1].splice(i + 1, 0, it); after = it[0]; } else g[1].push(it);
    });
  }
  addNav('Cours et fiches', [['videos', 'Vidéos de cours']], 'biblio');
  addNav('S\'entraîner', [['francais', 'Orthographe (CGE)']], 'ecoute');
  addNav('Organisation', [['simulateur', 'Simulateur de note']], 'notes');
  Object.assign(E.ICO, {
    videos: 'M3 5h18v14H3z M10 9l5 3-5 3z',
    francais: 'M4 20 10 4h1l6 16 M6.5 14h9 M17 8h4 M19 6v4',
    simulateur: 'M5 3h14v18H5z M8 7h8 M8 11h2 M12 11h2 M16 11h0 M8 15h2 M12 15h2 M8 18h6'
  });

  /* ───── 1) Vidéos de cours ───── */
  function fmtT(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function parseT(t) { var m = /^\s*(?:(\d+)\s*[:h]\s*)?(\d{1,2})\s*[:m']\s*(\d{1,2})\s*s?\s*$|^\s*(\d+)\s*$/.exec(t || ''); if (!m) return null; return m[4] != null ? +m[4] : (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]); }
  var vk = 0;
  function videoBox(v, nid) {
    var id = v[0], key = 'v' + (vk++), pass = (P().pass[id] || []).slice().sort(function (a, b) { return a[0] - b[0]; });
    return '<div class="vcard card"><div class="vhead"><b>' + esc(v[1]) + '</b><span class="tag acc">' + esc(v[2]) + '</span></div>' +
      '<div class="vfac" id="' + key + '"><button class="vplay" data-a="vplay" data-v="' + esc(id) + '" data-k="' + key + '" data-s="' + (v[3] || 0) + '" aria-label="Lire la vidéo ici : ' + esc(v[1]) + '">' +
        '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg" alt="" loading="lazy"><span class="vbtn">▶ Lire ici</span></button></div>' +
      '<div class="row small"><a class="btn ghost small" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '">Ouvrir sur YouTube</a>' +
        '<span class="muted">La vidéo reste sur la chaîne de son auteur. Rien n\'est chargé avant le clic.</span></div>' +
      '<details class="vpass"' + (pass.length ? ' open' : '') + '><summary>Mes passages' + (pass.length ? ' (' + pass.length + ')' : '') + '</summary>' +
        (pass.length ? '<ul class="vplist">' + pass.map(function (p, i) { return '<li><button class="btn small" data-a="vplay" data-v="' + esc(id) + '" data-k="' + key + '" data-s="' + p[0] + '">▶ ' + fmtT(p[0]) + '</button> <span>' + esc(p[1]) + '</span> <button class="btn ghost small" data-a="vpdel" data-v="' + esc(id) + '" data-i="' + i + '" aria-label="Supprimer ce passage">✕</button></li>'; }).join('') + '</ul>' : '<p class="small muted">Note le moment exact où le prof explique ce dont tu as besoin (par exemple 3:25), puis relance la vidéo directement à ce passage.</p>') +
        '<div class="row"><input class="vp-t" id="vpt-' + key + '" placeholder="3:25" inputmode="numeric" style="width:6.5rem" aria-label="Moment de la vidéo (minutes:secondes)"><input id="vpn-' + key + '" placeholder="Ce que montre ce passage" style="flex:1;min-width:160px" aria-label="Note sur le passage"><button class="btn small" data-a="vpadd" data-v="' + esc(id) + '" data-k="' + key + '">Ajouter le passage</button></div>' +
      '</details></div>';
  }
  function rechercheLinks(n) {
    var ch = CHAINES[n.mat] || [], q = n.video || n.titre;
    return '<div class="row">' + ch.map(function (c) { return '<a class="btn ghost small" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(c + ' ' + q) + '">▶ ' + esc(c) + '</a>'; }).join('') +
      (n.video ? '<a class="btn ghost small" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(n.video) + '">▶ Toutes les vidéos</a>' : '') + '</div>';
  }
  V.videos = function (nid) {
    vk = 0;
    var all = NOTS(), n = nid && all.filter(function (x) { return x.id === nid; })[0];
    if (n) {
      var vs = VIDEOS[n.id] || [];
      return '<p class="crumbs"><a href="#videos">Vidéos de cours</a> › ' + esc(E.matLabel(n.mat)) + '</p>' + E.pageHead(n.titre, esc(n.a)) +
        (E.SCH[n.id] ? E.schemaHtml(n.id) : '') + (E.EXP[n.id] ? E.explication(E.EXP[n.id]) : '') +
        (vs.length ? '<h2>Les vidéos du cours</h2><div class="vgrid">' + vs.map(function (v) { return videoBox(v, n.id); }).join('') + '</div>' : '') +
        '<h2>' + (vs.length ? 'Chercher d\'autres explications' : 'Trouver une vidéo') + '</h2><div class="card">' + rechercheLinks(n) + '</div>' +
        '<div class="row"><a class="btn ghost" href="#biblio">Bibliothèque de notions</a>' + (n.theme ? '<a class="btn ghost" href="#cas/theme/' + esc(n.theme) + '">S\'entraîner sur ce thème</a>' : '') + '</div>';
    }
    var f = V.videos.f = V.videos.f || { m: 'maths' }, mats = Object.keys(E.MATIERES).filter(function (m) { return all.some(function (x) { return x.mat === m; }); });
    if (mats.indexOf(f.m) < 0) f.m = mats[0];
    var L = all.filter(function (x) { return x.mat === f.m; }).sort(function (a, b) { return (VIDEOS[b.id] ? 1 : 0) - (VIDEOS[a.id] ? 1 : 0) || b.imp - a.imp; });
    var nb = Object.keys(VIDEOS).reduce(function (s, k) { return s + VIDEOS[k].length; }, 0);
    return E.pageHead('Vidéos de cours', nb + ' vidéos de cours vérifiées, choisies une à une pour les notions du BTS SIO (cybersécurité, réseaux, développement, CEJM, maths, anglais, culture générale), avec un schéma et une explication pour chaque notion. Ajoute tes propres « passages » pour retrouver le moment exact d\'une explication.') +
      '<div class="chips">' + mats.map(function (m) { var c = all.filter(function (x) { return x.mat === m && VIDEOS[x.id]; }).length; return '<button class="chip' + (f.m === m ? ' on' : '') + '" data-a="vmat" data-v="' + m + '">' + esc(E.MATIERES[m][4] || E.MATIERES[m][0]) + (c ? '<i>' + c + '</i>' : '') + '</button>'; }).join('') + '</div>' +
      '<div class="cols">' + L.map(function (x) {
        var vs = VIDEOS[x.id] || [];
        return '<div class="card"><h4><a href="#videos/' + x.id + '">' + esc(x.titre) + '</a></h4><div class="row tags"><span class="tag i' + x.imp + '">' + E.IMP[x.imp] + '</span>' + (vs.length ? '<span class="tag good">' + vs.length + ' vidéo' + (vs.length > 1 ? 's' : '') + '</span>' : '') + (E.SCH[x.id] ? '<span class="tag">schéma</span>' : '') + '</div>' +
          (vs.length ? '<ul class="small">' + vs.map(function (v) { return '<li>' + esc(v[1]) + ' <span class="muted">— ' + esc(v[2]) + '</span></li>'; }).join('') + '</ul><a class="btn small" href="#videos/' + x.id + '">▶ Regarder</a>' : '<p class="small muted">Pas encore de vidéo choisie : schéma, explication et recherche ciblée.</p><a class="btn ghost small" href="#videos/' + x.id + '">Voir la fiche</a>') + '</div>';
      }).join('') + '</div>';
  };
  ACT.vmat = function (el) { V.videos.f.m = el.dataset.v; E.rerender(); };
  ACT.vplay = function (el) {
    var box = document.getElementById(el.dataset.k), id = el.dataset.v, s = Math.max(0, +el.dataset.s || 0);
    if (!box || !/^[\w-]{11}$/.test(id)) return;
    box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0&autoplay=1' + (s ? '&start=' + s : '') + '" title="Vidéo de cours" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  ACT.vpadd = function (el) {
    var k = el.dataset.k, t = parseT(($('#vpt-' + k) || {}).value), note = (($('#vpn-' + k) || {}).value || '').trim();
    if (t == null) { E.toast('Écris le moment sous la forme minutes:secondes, par exemple 3:25.'); return; }
    var p = P().pass; (p[el.dataset.v] = p[el.dataset.v] || []).push([t, note.slice(0, 160) || 'Passage à revoir']); E.save(); E.rerender(); E.toast('Passage enregistré à ' + fmtT(t) + '.');
  };
  ACT.vpdel = function (el) { var L = (P().pass[el.dataset.v] || []).slice().sort(function (a, b) { return a[0] - b[0]; }); L.splice(+el.dataset.i, 1); if (L.length) P().pass[el.dataset.v] = L; else delete P().pass[el.dataset.v]; E.save(); E.rerender(); };

  /* Outils de comparaison mot à mot (orthographe et réécriture) */
  function tokens(s) { return (String(s).replace(/[’`]/g, '\'').match(/[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ0-9]+(?:['-][A-Za-zÀ-ÖØ-öø-ÿœŒæÆ0-9]+)*'?|[.,;:!?«»]/g) || []); }
  function aligner(a, b) {   // distance d'édition mot à mot (Levenshtein) avec chemin, pour montrer chaque erreur
    var n = a.length, m = b.length, D = [], i, j;
    for (i = 0; i <= n; i++) { D[i] = [i]; } for (j = 1; j <= m; j++) D[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    var ops = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { ops.push([a[i - 1] === b[j - 1] ? 'ok' : 'sub', a[i - 1], b[j - 1]]); i--; j--; }
      else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { ops.push(['del', a[i - 1], '']); i--; }
      else { ops.push(['ins', '', b[j - 1]]); j--; }
    }
    return ops.reverse();
  }
  function opsHtml(ops) {   // texte corrigé : barré = ce qui a été écrit, surligné = la bonne forme
    return ops.map(function (o) {
      var tk = o[1] || o[2], sp = /^[.,)»]$/.test(tk) ? '' : ' ', h;   // pas d'espace avant le point et la virgule
      if (o[0] === 'ok') h = esc(o[1]);
      else if (o[0] === 'sub') h = '<del title="Tu as écrit">' + esc(o[2]) + '</del><ins title="Correction">' + esc(o[1]) + '</ins>';
      else if (o[0] === 'del') h = '<ins title="Oublié">' + esc(o[1]) + '</ins>';
      else h = '<del title="En trop">' + esc(o[2]) + '</del>';
      return sp + h;
    }).join('');
  }

  /* ───── 3) Exercices de français : conjugaison, homophones, accords du participe passé ───── */
  var PERS = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
  var TEMPS = { pres: 'présent', imp: 'imparfait', ps: 'passé simple', fut: 'futur simple', cond: 'conditionnel présent', subj: 'subjonctif présent', pc: 'passé composé' };
  var END = { imp: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'], fut: ['ai', 'as', 'a', 'ons', 'ez', 'ont'], cond: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'] };
  function verbes() {
    var L = [];
    Object.keys(window.VERBES_REG || {}).forEach(function (g) { window.VERBES_REG[g].forEach(function (v) { var p = v.split(':'); L.push({ inf: p[0], g: g, aux: p[1] || 'avoir' }); }); });
    Object.keys(window.VERBES_IRR || {}).forEach(function (v) { L.push({ inf: v, g: 'irr', aux: window.VERBES_IRR[v][6] }); });
    return L;
  }
  function conj(V0, t) {
    var inf = V0.inf, r = inf.slice(0, -2), list;
    function doux(rad, e) { if (/^[aâoô]/.test(e)) { if (/ger$/.test(inf)) return rad + 'e'; if (/cer$/.test(inf)) return rad.slice(0, -1) + 'ç'; } return rad; }
    if (V0.g === 'irr') {
      var I = window.VERBES_IRR[inf];
      if (t === 'pres') list = I[0].split(' '); else if (t === 'ps') list = I[2].split(' '); else if (t === 'subj') list = I[4].split(' ');
      else if (t === 'imp') list = END.imp.map(function (e) { return I[1] + e; }); else if (t === 'fut' || t === 'cond') list = END[t].map(function (e) { return I[3] + e; });
    } else if (V0.g === '1') {
      var E1 = { pres: ['e', 'es', 'e', 'ons', 'ez', 'ent'], imp: END.imp, ps: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'], subj: ['e', 'es', 'e', 'ions', 'iez', 'ent'] };
      if (E1[t]) list = E1[t].map(function (e) { return doux(r, e) + e; }); else if (t === 'fut' || t === 'cond') list = END[t].map(function (e) { return inf + e; });
    } else {
      var E2 = { pres: ['is', 'is', 'it', 'issons', 'issez', 'issent'], imp: END.imp.map(function (e) { return 'iss' + e; }), ps: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'], subj: ['isse', 'isses', 'isse', 'issions', 'issiez', 'issent'] };
      if (E2[t]) list = E2[t].map(function (e) { return r + e; }); else if (t === 'fut' || t === 'cond') list = END[t].map(function (e) { return inf + e; });
    }
    if (t === 'pc') {
      var pp = V0.g === 'irr' ? window.VERBES_IRR[inf][5] : V0.g === '1' ? r + 'é' : r + 'i', etre = V0.aux === 'être';
      var aux = etre ? ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] : ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
      return aux.map(function (a, i) { if (!etre) return [a + ' ' + pp]; var pl = i >= 3; return (pl ? [pp + 's', pp + 'es'] : [pp, pp + 'e']).concat(i === 4 ? [pp, pp + 'e'] : []).map(function (x) { return a + ' ' + x; }); });
    }
    return list.map(function (x) { return [x]; });
  }
  function pron(i, forme, t) { var p = i === 0 && /^[aeiouyéèêâîôûh]/i.test(forme) ? 'j\'' : PERS[i] + ' '; return (t === 'subj' ? (i === 2 || i === 5 ? 'qu\'' : 'que ') : '') + p; }
  function nettoie(s) { return norm(s).replace(/\s+/g, ' ').trim(); }
  function sansPronom(s) { return String(s).toLowerCase().replace(/[’`]/g, '\'').replace(/\s+/g, ' ').trim().replace(/^(que |qu')/, '').replace(/^(je |j'|tu |il |elle |on |nous |vous |ils |elles )/, '').trim(); }
  var frx = null;
  function nouvelleQ(type) {
    if (type === 'conj') {
      var f = V.francais.f, L = verbes().filter(function (v) { return !f.grp || (f.grp === 'irr' ? v.g === 'irr' : v.g !== 'irr'); }), v = pick(L);
      var tps = f.tps ? [f.tps] : Object.keys(TEMPS), t = pick(tps), i = Math.floor(Math.random() * 6);
      return { type: type, v: v, t: t, i: i, ok: conj(v, t)[i], rep: '', fait: false };
    }
    var bank = type === 'homo' ? window.HOMOPHONES : window.ACCORDS_PP, b = pick(bank);
    return { type: type, b: b, opts: shuffle([b[1]].concat(b[2].split('|'))), fait: false, choix: null };
  }
  V.francais = function () {
    var f = V.francais.f = V.francais.f || { type: 'conj', tps: '', grp: '' }, st = P().fr;
    if (!frx || frx.type !== f.type) frx = nouvelleQ(f.type);
    var sc = st[f.type] || { n: 0, ok: 0 };
    var tabs = '<div class="seg">' + [['conj', 'Conjugaison'], ['homo', 'Homophones'], ['pp', 'Accord du participe passé']].map(function (x) { return '<button class="' + (f.type === x[0] ? 'on' : '') + '" data-a="frtype" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var q = frx, body;
    if (q.type === 'conj') {
      var forme0 = q.ok[0], tableau = '';
      if (q.fait) tableau = '<details class="more"' + (q.juste ? '' : ' open') + '><summary>Voir toute la conjugaison de « ' + esc(q.v.inf) + ' » au ' + TEMPS[q.t] + '</summary><table class="small">' + conj(q.v, q.t).map(function (x, i) { return '<tr><td class="muted">' + esc(pron(i, x[0], q.t)) + '</td><td><b>' + esc(x[0]) + '</b>' + (x.length > 1 ? ' <span class="muted">(ou ' + esc(x.slice(1).join(', ')) + ')</span>' : '') + '</td></tr>'; }).join('') + '</table></details>';
      body = '<div class="filters small"><label>Temps <select id="frtps"><option value="">Tous les temps</option>' + Object.keys(TEMPS).map(function (k) { return '<option value="' + k + '"' + (f.tps === k ? ' selected' : '') + '>' + TEMPS[k] + '</option>'; }).join('') + '</select></label>' +
        '<label>Verbes <select id="frgrp"><option value="">Tous</option><option value="reg"' + (f.grp === 'reg' ? ' selected' : '') + '>1er et 2e groupes</option><option value="irr"' + (f.grp === 'irr' ? ' selected' : '') + '>Irréguliers (être, avoir, faire…)</option></select></label></div>' +
        '<div class="card frq"><p class="eyebrow">' + esc(TEMPS[q.t]) + (q.v.g === 'irr' ? ' · verbe irrégulier' : ' · ' + q.v.g + (q.v.g === '1' ? 'er' : 'e') + ' groupe') + '</p>' +
        '<p class="frbig">Conjugue <b>« ' + esc(q.v.inf) + ' »</b> au <b>' + esc(TEMPS[q.t]) + '</b> avec <b>' + esc(pron(q.i, forme0, q.t).trim()) + '</b></p>' +
        '<div class="row"><span class="frpron">' + esc(pron(q.i, forme0, q.t)) + '</span><input id="frrep" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(q.rep) + '"' + (q.fait ? ' disabled' : '') + ' style="flex:1;min-width:180px" aria-label="Ta réponse"><button class="btn" data-a="frcheck"' + (q.fait ? ' disabled' : '') + '>Vérifier</button></div>' +
        (q.fait ? '<div class="verdict ' + (q.juste ? 'good' : q.presque ? 'mid' : 'bad') + '"><b>' + (q.juste ? 'Juste !' : q.presque ? 'Presque : attention aux accents.' : 'Pas tout à fait.') + '</b> ' + esc(pron(q.i, forme0, q.t)) + '<b>' + esc(forme0) + '</b>' + (q.ok.length > 1 ? ' (ou ' + esc(q.ok.slice(1).join(', ')) + ')' : '') + astuce(q) + '</div>' + tableau : '') + '</div>';
    } else {
      body = '<div class="card frq"><p class="frbig">' + esc(q.b[0]).replace('___', '<span class="frblank">' + (q.fait ? esc(q.b[1]) : '……') + '</span>') + '</p>' +
        '<div class="row">' + q.opts.map(function (o) { var c = q.fait ? (o === q.b[1] ? ' on' : o === q.choix ? ' rec' : '') : ''; return '<button class="btn ghost' + c + '" data-a="frchoix" data-v="' + esc(o) + '"' + (q.fait ? ' disabled' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' +
        (q.fait ? '<div class="verdict ' + (q.choix === q.b[1] ? 'good' : 'bad') + '"><b>' + (q.choix === q.b[1] ? 'Juste !' : 'Réponse : ' + esc(q.b[1])) + '</b> — ' + esc(q.b[3]) + '</div>' : '') + '</div>';
    }
    return E.pageHead('Orthographe et conjugaison', 'En culture générale et expression (E1), la maîtrise de la langue compte dans la note de la synthèse et de l\'essai ; elle compte aussi dans les études de cas et le portfolio. Homophones, accords du participe passé et conjugaison : exercices tirés au hasard, sans fin.') + tabs +
      '<p class="small muted" style="margin-top:.6rem">Score : <b>' + sc.ok + ' / ' + sc.n + '</b>' + (sc.n ? ' (' + Math.round(sc.ok / sc.n * 100) + ' %)' : '') + '</p>' + body +
      '<div class="row"><button class="btn" data-a="frnext"' + (q.fait ? '' : ' data-skip="1"') + '>' + (q.fait ? 'Question suivante →' : 'Passer') + '</button><a class="btn ghost" href="#redaction">Écrire un essai</a></div>';
  };
  function astuce(q) {
    var t = { ps: ' — Passé simple : 1er groupe en -ai, -as, -a, -âmes, -âtes, -èrent ; 2e groupe en -is, -is, -it…', imp: ' — Imparfait : radical du « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient.', fut: ' — Futur : infinitif (ou radical irrégulier) + -ai, -as, -a, -ons, -ez, -ont.', cond: ' — Conditionnel : radical du futur + terminaisons de l\'imparfait (-ais, -ais, -ait…).', subj: ' — Subjonctif : « que » + radical du « ils » au présent + -e, -es, -e, -ions, -iez, -ent (sauf irréguliers).', pc: q.v.aux === 'être' ? ' — Avec l\'auxiliaire être, le participe s\'accorde avec le sujet.' : ' — Avec avoir, le participe ne s\'accorde pas avec le sujet.', pres: '' }[q.t];
    return '<span class="small">' + esc(t || '') + '</span>';
  }
  function frScore(ok) { var st = P().fr, k = frx.type; st[k] = st[k] || { n: 0, ok: 0 }; st[k].n++; if (ok) st[k].ok++; E.dayCount('q'); if (ok && window.PlusJeu) window.PlusJeu.quest('fr'); E.save(); }
  ACT.frtype = function (el) { V.francais.f.type = el.dataset.v; frx = null; E.rerender(); };
  ACT.frnext = function () { frx = nouvelleQ(V.francais.f.type); E.rerender(); var i = $('#frrep'); if (i) i.focus(); };
  ACT.frcheck = function () {
    var q = frx, v = ($('#frrep') || {}).value || ''; if (!v.trim()) { E.toast('Écris ta réponse.'); return; }
    q.rep = v; var r = sansPronom(v), exact = q.ok.some(function (x) { return x.toLowerCase() === r; }), proche = !exact && q.ok.some(function (x) { return nettoie(x) === nettoie(r); });
    q.fait = true; q.juste = exact; q.presque = proche; frScore(exact); E.rerender(); var b = document.querySelector('[data-a="frnext"]'); if (b) b.focus();
  };
  ACT.frchoix = function (el) { var q = frx; if (q.fait) return; q.choix = el.dataset.v; q.fait = true; frScore(q.choix === q.b[1]); E.rerender(); var b = document.querySelector('[data-a="frnext"]'); if (b) b.focus(); };

  /* ───── 4) Simulateur de note du BTS SIO ───── */
  var EPS = Object.keys(E.EPREUVES).sort();
  function num(v) { if (v === '' || v == null) return null; var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? Math.max(0, Math.min(20, x)) : null; }
  function f2(x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); }
  function calcSimu(s) {
    var tw = 0, t = 0, manque = [], totW = 0;
    EPS.forEach(function (k) { var v = num(s[k]), w = E.EPREUVES[k][2]; totW += w; if (v == null) manque.push(k); else { tw += w; t += v * w; } });
    var fac = num(s.fac), bonus = fac != null && fac > 10 ? (fac - 10) : 0;   // épreuve facultative : seuls les points au-dessus de 10 comptent
    var moy = tw ? (t + bonus) / tw : null;
    return { moy: moy, manque: manque, tw: tw, t: t, totW: totW, bonus: bonus };
  }
  function simuRes(R) {
    var s = P().simu, h = '';
    if (R.moy == null) return '<p class="muted">Indique au moins une note d\'épreuve.</p>';
    h += '<div class="verdict ' + (R.moy >= 12 ? 'good' : R.moy >= 10 ? 'mid' : 'bad') + '"><b>' + f2(R.moy) + ' / 20 — ' + (R.moy >= 10 ? 'Admis' : 'Non admis') + '</b>' + (R.manque.length ? ' <span class="small">(moyenne provisoire, sans : ' + R.manque.join(', ') + ')</span>' : '') + '</div>';
    h += '<p class="small">Total : ' + f2(R.t) + (R.bonus ? ' + ' + f2(R.bonus) + ' (épreuve facultative)' : '') + ' points sur ' + R.tw * 20 + ' (coefficients : ' + R.tw + ').</p>';
    if (R.manque.length) {
      var reste = R.totW - R.tw, besoin = (10 * R.totW - R.t - R.bonus) / reste;
      h += '<h4>Pour obtenir 10 / 20</h4><p class="small">Il te faut en moyenne <b>' + (besoin <= 0 ? 'rien de plus : c\'est déjà acquis' : besoin > 20 ? 'plus de 20 : impossible' : f2(besoin) + ' / 20') + '</b> aux épreuves restantes (' + R.manque.join(', ') + ').</p>';
    }
    return h;
  }
  V.simulateur = function () {
    var s = P().simu, R = calcSimu(s);
    return E.pageHead('Simulateur de note du BTS', 'Le BTS est obtenu avec une <b>moyenne générale d\'au moins 10 / 20</b>, calculée avec les coefficients de chaque épreuve (il n\'y a pas de mention). Une épreuve facultative ne compte que pour les points au-dessus de 10.') +
      '<div class="cols"><div class="card"><h4>Mes notes</h4><div class="filters simu">' +
        EPS.map(function (k) { return '<label>' + k + ' · ' + esc(E.EPREUVES[k][0]) + ' <span class="muted small">(coefficient ' + E.EPREUVES[k][2] + ')</span><input class="simu-in" data-k="' + k + '" inputmode="decimal" placeholder="sur 20" value="' + esc(s[k] || '') + '"></label>'; }).join('') +
        '<label>Épreuve facultative (langue vivante B, mathématiques approfondies…) <span class="muted small">(seuls les points au-dessus de 10 comptent)</span><input class="simu-in" data-k="fac" inputmode="decimal" placeholder="facultatif" value="' + esc(s.fac || '') + '"></label>' +
      '</div><div class="row"><button class="btn ghost small" data-a="simureset">Effacer</button></div></div>' +
      '<div class="card" id="simures">' + simuRes(R) + '</div></div>' +
      '<p class="small muted">Calcul indicatif. Une absence à une épreuve empêche la délivrance du diplôme. Les règles exactes (épreuves facultatives, sous-épreuves de l\'E2, CCF de l\'E3) sont précisées par le règlement d\'examen et ta convocation.</p>';
  };
  function majSimu() { var box = $('#simures'); if (box) box.innerHTML = simuRes(calcSimu(P().simu)); }
  ACT.simureset = function () { P().simu = {}; E.save(); E.rerender(); };

  /* ───── 5) Nouveautés sur l'accueil ───── */
  var accueil0 = V.accueil;
  V.accueil = function (a, b) {
    var h = accueil0(a, b), add = '<h2>Nouveau dans l\'application</h2><div class="grid">' +
      [['videos', 'Vidéos de cours', 'Une vidéo vérifiée par notion, schémas et « mes passages »'], ['redaction', 'Essai de CGE', 'Sujets « Le vrai du faux », plan, relecture, correction par l\'IA'], ['juridique', 'Raisonnement juridique', 'Cas pratiques de CEJM avec vérification des notions'], ['francais', 'Orthographe', 'Homophones, accords, conjugaison pour la CGE'], ['progres', 'Défis et badges', 'Points, défis du jour, bilan de la semaine'], ['simulateur', 'Simulateur de note', 'Moyenne pondérée des 7 épreuves']]
        .map(function (x) { return '<a class="card tile" href="#' + x[0] + '">' + E.ico(x[0]) + '<b>' + x[1] + '</b><span class="small muted">' + x[2] + '</span></a>'; }).join('') + '</div>';
    return h + add;
  };

  /* Miniature indisponible (hors ligne, réseau filtré) : on la retire, le bouton « Lire ici » reste. */
  document.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && t.closest && t.closest('.vplay')) t.remove(); }, true);

  /* ───── Champs de saisie ───── */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('simu-in')) { var s = P().simu, v = t.value.trim(); if (v) s[t.dataset.k] = v.slice(0, 6); else delete s[t.dataset.k]; clearTimeout(majSimu.t); majSimu.t = setTimeout(E.save, 500); majSimu(); }
    if (t.id === 'frrep' && frx) frx.rep = t.value;
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'frtps') { V.francais.f.tps = t.value; frx = null; E.rerender(); }
    if (t.id === 'frgrp') { V.francais.f.grp = t.value; frx = null; E.rerender(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'frrep' && frx && !frx.fait) { e.preventDefault(); ACT.frcheck(); }
  });
  window.PlusFR = { conj: conj, verbes: verbes, pron: pron, TEMPS: TEMPS, tokens: tokens, aligner: aligner, opsHtml: opsHtml };
  return { conj: conj, verbes: verbes, tokens: tokens, aligner: aligner, calcSimu: calcSimu };
}
window.PlusTools = { install: install };
})();
