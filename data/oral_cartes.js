/* FLASHCARDS DE L'ORAL — les questions de jury du simulateur d'oral (data/oral.js) pour l'E5 et l'E6 (SISR et SLAM)
   rejoignent aussi les flashcards et la bibliothèque (catégorie « Questions du jury »), pour les revoir en révision espacée.
   La réponse de la carte reprend les éléments attendus du simulateur. Les questions propres à une réalisation (« ta réalisation »)
   restent dans le simulateur, car leur réponse dépend du travail de chacun. */
(function () {
var O = window.ORAL || {};
['e5', 'e6sisr', 'e6slam'].forEach(function (m) {
  (O[m] || []).forEach(function (q, i) {
    if (/ta réalisation|ton projet|votre réalisation \(/i.test(q[0])) return;
    var titre = q[0].length > 70 ? q[0].slice(0, 67).replace(/\s+\S*$/, '') + '…' : q[0];
    window.NOTIONS.push(['oral-' + m + '-' + (i + 1), m, 'Questions du jury', 2, titre, q[0], q[1], '', '']);
  });
});
})();
