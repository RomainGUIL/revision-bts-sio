/* AGRANDIR LES SCHÉMAS — un clic (ou Entrée) sur un schéma l'ouvre en grand par-dessus la page.
   Fermeture : bouton ✕, touche Échap ou clic en dehors du schéma. Boutons − / + pour zoomer ; sur téléphone,
   le schéma garde une taille lisible et on le fait défiler du doigt. Fonctionne pour tous les schémas
   (figure.schema-f), quelle que soit la page, sans toucher aux données. */
(function () {
  var box = null, zoom = 1, base = 0, retour = null;

  function largeurNaturelle(svg) {
    var vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    return vb.length === 4 && vb[2] > 0 ? vb[2] : 700;
  }
  function appliquer() {
    var svg = box && box.querySelector('svg'); if (!svg) return;
    svg.style.width = Math.round(base * zoom) + 'px';
    box.querySelector('.zoom-niv').textContent = Math.round(zoom * 100) + ' %';
    var zone = box.querySelector('.zoom-zone'), aide = box.querySelector('.zoom-aide');
    aide.hidden = !(zone.scrollWidth > zone.clientWidth + 4 || zone.scrollHeight > zone.clientHeight + 4);
  }
  function fermer() {
    if (!box) return;
    box.remove(); box = null; document.body.classList.remove('zoom-ouvert');
    if (retour && retour.focus) retour.focus();
  }
  function ouvrir(fig) {
    var svg = fig.querySelector('svg'); if (!svg) return;
    fermer(); retour = fig;
    /* Copie avec des identifiants uniques (flèches) : sinon elles pointeraient vers l'original, parfois masqué. */
    var html = svg.outerHTML;
    (html.match(/ id="[^"]+"/g) || []).forEach(function (m) {
      var id = m.slice(5, -1), nv = id + '-zoom';
      html = html.split('id="' + id + '"').join('id="' + nv + '"').split('#' + id + ')').join('#' + nv + ')').split('"#' + id + '"').join('"#' + nv + '"');
    });
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var clone = tmp.firstElementChild;
    clone.removeAttribute('width'); clone.removeAttribute('height');
    var cap = fig.querySelector('figcaption'), titre = cap ? cap.textContent : 'Schéma';
    box = document.createElement('div');
    box.className = 'zoom-fond'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', titre);
    box.innerHTML = '<div class="zoom-barre"><b class="zoom-titre"></b><span class="zoom-btns">' +
      '<button type="button" class="zoom-b" data-z="-" aria-label="Réduire">−</button><span class="zoom-niv">100 %</span>' +
      '<button type="button" class="zoom-b" data-z="+" aria-label="Agrandir">+</button>' +
      '<button type="button" class="zoom-b" data-z="0" aria-label="Taille d\'origine">⟲</button>' +
      '<button type="button" class="zoom-b zoom-x" data-z="x" aria-label="Fermer">✕</button></span></div>' +
      '<p class="zoom-aide" hidden>↔ Fais glisser pour voir tout le schéma (ou tourne le téléphone).</p><div class="zoom-zone"><div class="zoom-carte"></div></div>';
    box.querySelector('.zoom-titre').textContent = titre;
    box.querySelector('.zoom-carte').appendChild(clone);
    document.body.appendChild(box); document.body.classList.add('zoom-ouvert');
    /* Taille de départ : remplir l'écran sans dépasser 1,8 × la taille prévue ; jamais moins que la taille prévue
       (sur téléphone, on fait défiler plutôt que de rendre le texte minuscule). */
    var nat = largeurNaturelle(clone), vb = (clone.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    var ratio = vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? vb[3] / vb[2] : .6;
    var dispoL = Math.max(280, window.innerWidth - 110), dispoH = Math.max(200, window.innerHeight - 150);
    base = Math.max(Math.min(nat * 1.8, dispoL, dispoH / ratio, 1400), Math.min(nat, 900, window.innerWidth < 700 ? nat : dispoL));
    zoom = 1; appliquer();
    box.querySelector('.zoom-x').focus();
  }

  document.addEventListener('click', function (e) {
    if (box) {
      var b = e.target.closest && e.target.closest('.zoom-b');
      if (b) {
        var z = b.getAttribute('data-z');
        if (z === 'x') fermer();
        else { zoom = z === '+' ? Math.min(3, zoom + .25) : z === '-' ? Math.max(.5, zoom - .25) : 1; appliquer(); }
        return;
      }
      if (!e.target.closest('.zoom-carte') && !e.target.closest('.zoom-barre')) fermer();
      return;
    }
    var fig = e.target.closest && e.target.closest('figure.schema-f');
    if (fig && !e.target.closest('a, button, input, textarea, select')) ouvrir(fig);
  });
  document.addEventListener('keydown', function (e) {
    if (box && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermer(); return; }
    if (box && (e.key === '+' || e.key === '=')) { zoom = Math.min(3, zoom + .25); appliquer(); return; }
    if (box && e.key === '-') { zoom = Math.max(.5, zoom - .25); appliquer(); return; }
    if (!box && (e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('figure.schema-f')) { e.preventDefault(); ouvrir(e.target); }
  }, true);
  window.addEventListener('hashchange', fermer);

  /* Rend chaque schéma atteignable au clavier et annoncé comme agrandissable. */
  function marquer() {
    document.querySelectorAll('figure.schema-f:not([data-zoom])').forEach(function (f) {
      f.setAttribute('data-zoom', '1'); f.setAttribute('tabindex', '0'); f.setAttribute('role', 'button');
      f.setAttribute('title', 'Cliquer pour agrandir le schéma');
      var cap = f.querySelector('figcaption'); f.setAttribute('aria-label', 'Agrandir le schéma : ' + (cap ? cap.textContent : ''));
    });
  }
  if (window.MutationObserver) new MutationObserver(marquer).observe(document.documentElement, { childList: true, subtree: true });
  marquer();
})();
