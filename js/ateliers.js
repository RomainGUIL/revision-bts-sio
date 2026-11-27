/* Révision BTS SIO — ateliers d'écriture (adaptés de Révision Brevet) :
   - essai de culture générale (E1, thème 2027 « Le vrai du faux ») : pistes, plan, brouillon enregistré, liste de relecture, correction par l'IA ;
   - raisonnement juridique de CEJM (E4) : cas pratiques, vérification des notions attendues, méthode en cinq étapes.
   Module branché par js/app.js (window.PlusModules) ; données : data/ateliers.js. Progression dans S.plus (red, dev). */
(function () {
'use strict';
(window.PlusModules = window.PlusModules || []).push(function (E) {
  var V = E.V, ACT = E.ACT, esc = E.esc, norm = E.norm, $ = E.$;
  function P() { var S = E.state(); if (!S.plus || typeof S.plus !== 'object') S.plus = {}; ['red', 'dev'].forEach(function (k) { if (!S.plus[k] || typeof S.plus[k] !== 'object' || Array.isArray(S.plus[k])) S.plus[k] = {}; }); return S.plus; }
  function quest(k, n) { if (window.PlusJeu) window.PlusJeu.quest(k, n); }
  function addNav(group, items, after) {
    var g = E.NAV.filter(function (x) { return x[0] === group; })[0]; if (!g) return;
    items.forEach(function (it) { if (g[1].some(function (x) { return x[0] === it[0]; })) return; var i = g[1].map(function (x) { return x[0]; }).indexOf(after); if (i >= 0) { g[1].splice(i + 1, 0, it); after = it[0]; } else g[1].push(it); });
  }
  addNav('S\'entraîner', [['redaction', 'Essai de CGE (E1)'], ['juridique', 'Raisonnement juridique (E4)']], 'francais');
  Object.assign(E.ICO, {
    redaction: 'M6 3h9l4 4v14H6z M9 10h7 M9 14h7 M9 18h4',
    juridique: 'M12 3v18 M5 7h14 M7 7l-3 7a3 3 0 0 0 6 0z M17 7l-3 7a3 3 0 0 0 6 0z M8 21h8'
  });
  function mots(t) { return (String(t).match(/[A-Za-zÀ-ÖØ-öø-ÿœŒ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿœŒ0-9]+)*/g) || []).length; }

  /* ───── 1) Essai de culture générale ───── */
  var RD = window.ESSAIS_CGE || [];
  var CHECK = ['Mon introduction amène le sujet, pose la question et annonce le plan.', 'Chaque partie défend une idée, avec un argument et un exemple précis (œuvre, auteur, date, fait d\'actualité).', 'J\'utilise des exemples variés : littérature, art, actualité, documents du corpus, expérience personnelle.', 'Je nuance : je ne réponds pas seulement « oui » ou « non ».', 'Ma conclusion répond clairement à la question et ouvre le débat.', 'J\'ai vérifié les accords, les homophones et la ponctuation.', 'J\'ai utilisé des connecteurs logiques variés (en effet, cependant, ainsi…).'];
  V.redaction = function (id) {
    var st = P().red, it = id && RD.filter(function (x) { return x.id === id; })[0];
    if (!it) return E.pageHead('Essai de culture générale', 'L\'épreuve de culture générale et expression (E1) comporte un <b>essai</b> sur le thème national : « Le vrai du faux » en 2027. Choisis un sujet, appuie-toi sur les pistes et le plan, écris ton essai (il est enregistré automatiquement), vérifie-le avec la liste, puis fais-le corriger par l\'IA si tu le souhaites.') +
      '<div class="cols">' + RD.map(function (x) { var d = st[x.id]; return '<div class="card"><p class="small"><b>' + esc(x.sujet) + '</b></p>' + (d && d.t ? '<p class="small muted">Brouillon : ' + mots(d.t) + ' mots</p>' : '') + '<a class="btn small" href="#redaction/' + x.id + '">' + (d && d.t ? 'Continuer' : 'Écrire') + '</a></div>'; }).join('') + '</div>' +
      '<div class="card"><h4>Méthode de l\'essai</h4><ul class="small"><li>Analyser le sujet : définir les mots clés, repérer le problème posé.</li><li>Chercher des arguments et des exemples (œuvres étudiées, documents du corpus, actualité, culture personnelle).</li><li>Construire un plan en deux ou trois parties, avec une nuance.</li><li>Rédiger l\'introduction et la conclusion au brouillon, puis relire la langue.</li></ul></div>';
    var d = st[it.id] || { t: '', c: {} }, n = mots(d.t);
    return '<p class="crumbs"><a href="#redaction">Essai de CGE</a></p>' + E.pageHead('Sujet d\'essai', esc(it.sujet)) +
      '<div class="cols"><div class="card"><h4>Pistes</h4><ul class="small">' + it.pistes.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div><div class="card"><h4>Plan possible</h4><ol class="small">' + it.plan.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div></div>' +
      '<textarea id="redtxt" class="big" data-id="' + it.id + '" placeholder="Écris ton essai ici. Il est enregistré automatiquement dans ce navigateur.">' + esc(d.t) + '</textarea>' +
      '<p class="small muted" id="redcnt">' + n + ' mots · environ ' + Math.round(n / 11) + ' lignes manuscrites</p>' +
      '<div class="card"><h4>Avant de rendre</h4>' + CHECK.map(function (c, i) { return '<label class="chk small" style="display:flex;gap:.5rem;margin:.25rem 0"><input type="checkbox" class="redck" data-id="' + it.id + '" data-i="' + i + '"' + ((d.c || {})[i] ? ' checked' : '') + '> ' + esc(c) + '</label>'; }).join('') + '</div>' +
      '<div class="row"><button class="btn ia" data-a="redia" data-id="' + it.id + '">✦ Faire corriger par l\'IA</button><a class="btn ghost" href="#redaction">Autres sujets</a></div>' +
      '<p class="small muted">Le bouton copie ton texte avec une consigne de correction et ouvre l\'IA choisie dans les réglages. Rien n\'est envoyé sans ton clic.</p>';
  };
  ACT.redia = function (el) {
    var it = RD.filter(function (x) { return x.id === el.dataset.id; })[0], d = P().red[it.id] || { t: '' };
    if (mots(d.t) < 60) { E.toast('Écris au moins quelques paragraphes avant de demander une correction.'); return; }
    var prompt = E.IA_INTRO + 'Corrige mon essai de culture générale et expression (BTS, thème « Le vrai du faux ») comme un correcteur, sur 10 points : compréhension du sujet, argumentation et exemples, organisation, maîtrise de la langue. Donne une note indicative, mes 3 points forts, mes 3 priorités d\'amélioration et la liste de mes erreurs de langue corrigées. Ne réécris pas tout le texte.\n\nSujet : ' + it.sujet + '\n\nMon essai :\n' + d.t;
    E.iaBtn('redia', prompt, 'IA'); ACT.ia({ dataset: { k: 'redia' } });
  };

  /* ───── 2) Raisonnement juridique (CEJM) ───── */
  var CJ = window.CAS_JURIDIQUES || [];
  function attendus(it) { return it.attendus.map(function (g) { return [].concat.apply([], g.map(function (k) { return k.split('|'); })); }); }
  function verif(it, t) { var n = norm(t); return attendus(it).map(function (g) { return g.some(function (k) { return n.indexOf(norm(k)) >= 0; }); }); }
  V.juridique = function (id) {
    var st = P().dev, it = id && CJ.filter(function (x) { return x.id === id; })[0];
    if (!it) return E.pageHead('Raisonnement juridique (CEJM)', 'En CEJM, on demande souvent d\'analyser une situation juridique : <b>qualifier les faits, poser le problème juridique, citer la règle de droit, l\'appliquer aux faits, conclure</b>. Rédige ta réponse : l\'application vérifie la présence des notions attendues, puis montre un raisonnement possible.') +
      '<div class="cols">' + CJ.map(function (x) { var d = st[x.id]; return '<div class="card"><span class="tag acc">' + esc(x.theme) + '</span><p class="small"><b>' + esc(x.question) + '</b></p>' + (d && d.best != null ? '<span class="tag ' + (d.best >= x.attendus.length * .8 ? 'good' : '') + '">Notions : ' + d.best + ' / ' + x.attendus.length + '</span> ' : '') + '<a class="btn small" href="#juridique/' + x.id + '">' + (d && d.t ? 'Continuer' : 'Résoudre') + '</a></div>'; }).join('') + '</div>' +
      '<div class="card"><h4>La méthode en cinq étapes</h4><ol class="small"><li>Qualifier les faits : les présenter avec les mots du droit (salarié, consommateur, responsable de traitement…).</li><li>Poser le problème juridique sous forme de question générale.</li><li>Énoncer la règle de droit (article, principe, jurisprudence).</li><li>Appliquer la règle aux faits du cas.</li><li>Conclure en répondant à la question.</li></ol></div>';
    var d = st[it.id] || { t: '' }, ok = verif(it, d.t), n = mots(d.t), show = V.juridique.show === it.id;
    return '<p class="crumbs"><a href="#juridique">Raisonnement juridique</a> › ' + esc(it.theme) + '</p>' + E.pageHead(it.theme, esc(it.question)) +
      '<div class="card"><p class="eyebrow">Les faits</p><p>' + esc(it.faits) + '</p></div>' +
      '<textarea id="devtxt" class="big" data-id="' + it.id + '" placeholder="Qualification des faits, problème juridique, règle de droit, application, conclusion… (enregistré automatiquement)">' + esc(d.t) + '</textarea>' +
      '<p class="small muted" id="devcnt">' + n + ' mots</p>' +
      '<div class="row"><button class="btn" data-a="jurverif" data-id="' + it.id + '">Vérifier mon raisonnement</button><button class="btn ia" data-a="juria" data-id="' + it.id + '">✦ Faire corriger par l\'IA</button><a class="btn ghost" href="#juridique">Autres cas</a></div>' +
      (show ? '<div class="card"><h4>Notions attendues : ' + ok.filter(Boolean).length + ' / ' + ok.length + '</h4><div class="row">' + it.attendus.map(function (g, i) { return '<span class="tag ' + (ok[i] ? 'good' : 'bad') + '">' + (ok[i] ? '✓ ' : '✗ ') + esc(String(g[0]).split('|')[0]) + '</span>'; }).join(' ') + '</div><p class="small muted">Vérification automatique des mots du droit : elle ne juge pas la qualité du raisonnement.</p>' +
        '<h4>Un raisonnement possible</h4><ol class="small">' + it.plan.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' : '');
  };
  ACT.jurverif = function (el) {
    var it = CJ.filter(function (x) { return x.id === el.dataset.id; })[0], d = P().dev[it.id] || { t: '' };
    if (mots(d.t) < 25) { E.toast('Rédige d\'abord ton raisonnement (au moins quelques phrases).'); return; }
    var n = verif(it, d.t).filter(Boolean).length; d.best = Math.max(d.best || 0, n); P().dev[it.id] = d;
    V.juridique.show = it.id; E.dayCount('q'); quest('jur'); E.save(); E.rerender();
  };
  ACT.juria = function (el) {
    var it = CJ.filter(function (x) { return x.id === el.dataset.id; })[0], d = P().dev[it.id] || { t: '' };
    if (mots(d.t) < 25) { E.toast('Rédige d\'abord ton raisonnement.'); return; }
    var prompt = E.IA_INTRO + 'Corrige mon raisonnement juridique de CEJM (BTS) : qualification des faits, problème juridique, règle de droit exacte, application aux faits, conclusion. Signale toute règle fausse ou imprécise, donne une note indicative sur 20 et ce qu\'il faut améliorer, sans tout réécrire.\n\nFaits : ' + it.faits + '\nQuestion : ' + it.question + '\n\nMa réponse :\n' + d.t;
    E.iaBtn('juria', prompt, 'IA'); ACT.ia({ dataset: { k: 'juria' } });
  };

  /* Saisie : enregistrement automatique des textes */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'redtxt' || t.id === 'devtxt') {
      var box = t.id === 'redtxt' ? P().red : P().dev, d = box[t.dataset.id] = box[t.dataset.id] || { t: '' }; d.t = t.value.slice(0, 20000);
      var n = mots(d.t), c = $(t.id === 'redtxt' ? '#redcnt' : '#devcnt'); if (c) c.textContent = n + ' mots' + (t.id === 'redtxt' ? ' · environ ' + Math.round(n / 11) + ' lignes manuscrites' : '');
      clearTimeout(V.redaction.t); V.redaction.t = setTimeout(E.save, 700);
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'ficheSch') { V.fiches.sch = t.checked; E.rerender(); return; }   // fiches à imprimer : avec ou sans les schémas
    if (!t.classList || !t.classList.contains('redck')) return;
    var d = P().red[t.dataset.id] = P().red[t.dataset.id] || { t: '' }; d.c = d.c || {}; if (t.checked) d.c[t.dataset.i] = 1; else delete d.c[t.dataset.i]; E.save();
  });
});
})();
