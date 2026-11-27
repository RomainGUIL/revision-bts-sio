/* SCHÉMAS SUPPLÉMENTAIRES — dessinés pour l'application (SVG, aucune image extérieure), sur le modèle de Révision Brevet.
   S'ajoutent à window.SCHEMAS (data/schemas.js) sans remplacer un schéma existant. Couleurs : classes sv-* du thème. */
(function () {
'use strict';
function svg(w, h, body, label) { return '<svg class="schema" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">' + body + '</svg>'; }
function t(x, y, s, c, a) { return '<text class="' + (c || 'sv-t') + '" x="' + x + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + s + '</text>'; }
function tm(x, y, s, c) { return t(x, y, s, c, 'middle'); }
function box(x, y, w, h, c, r) { return '<rect class="sv-box' + (c ? ' ' + c : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r == null ? 8 : r) + '"/>'; }
function ln(x1, y1, x2, y2, c) { return '<line class="sv-a' + (c ? ' ' + c : '') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; }
function circ(x, y, r, c) { return '<circle class="' + (c || 'sv-box') + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; }
function arr(x1, y1, x2, y2, c) {
  var a = Math.atan2(y2 - y1, x2 - x1), L = 9, W = 4.5, bx = x2 - L * Math.cos(a), by = y2 - L * Math.sin(a);
  var p = [x2, y2, bx + W * Math.sin(a), by - W * Math.cos(a), bx - W * Math.sin(a), by + W * Math.cos(a)].map(function (v) { return Math.round(v * 10) / 10; });
  return ln(x1, y1, bx, by, c) + '<polygon class="sv-ah" points="' + p.join(',') + '"/>';
}
function bx(x, y, w, h, title, sub, c) {   // sub === '' : du texte est ajouté dessous, le titre se place en haut
  var ty = sub ? y + h / 2 - 3 : sub === '' ? y + Math.min(h / 2 + 5, 24) : y + h / 2 + 5;
  return box(x, y, w, h, c) + tm(x + w / 2, ty, title) + (sub ? tm(x + w / 2, y + h / 2 + 14, sub, 'sv-s') : '');
}
function chaine(items, y, w, h, gap, x0, cls) { var x = x0 || 10; return items.map(function (s, i) { var r = bx(x, y, w, h, s[0], s[1] || '', s[2] || cls || 'sv-acc') + (i < items.length - 1 ? arr(x + w + 2, y + h / 2, x + w + gap - 2, y + h / 2) : ''); x += w + gap; return r; }).join(''); }
function grille(x, y, cw, ch, rows, entete) {   // tableau simple : première ligne en en-tête
  return rows.map(function (r, i) { return r.map(function (c, j) { return box(x + j * cw, y + i * ch, cw, ch, i === 0 && entete ? 'sv-hi' : '', 0) + tm(x + j * cw + cw / 2, y + i * ch + ch / 2 + 4, c, i === 0 && entete ? 'sv-t' : 'sv-l'); }).join(''); }).join('');
}
var S = {};

/* ───── Sécurité et RGPD ───── */
S['dicp'] = ['Les quatre critères de sécurité (DICP) : on évalue chaque bien (données, service) selon le besoin de disponibilité, d\'intégrité, de confidentialité et de preuve.',
  svg(700, 200, [['Disponibilité', 'accessible quand il faut', 'Sauvegarde, redondance, PRA'], ['Intégrité', 'non modifié sans droit', 'Hachage, signature, contrôle d\'accès'], ['Confidentialité', 'lu par les seuls autorisés', 'Chiffrement, authentification'], ['Preuve', 'traçabilité, non-répudiation', 'Journalisation, signature']].map(function (c, i) {
    var m = c[2].split(', '); return bx(10 + i * 172, 20, 162, 70, c[0], c[1], i % 2 ? 'sv-v2' : 'sv-acc') + tm(91 + i * 172, 116, 'Exemples de mesures :', 'sv-s') + tm(91 + i * 172, 134, m.slice(0, 2).join(', '), 'sv-l') + tm(91 + i * 172, 152, m.slice(2).join(', '), 'sv-l'); }).join('') +
    t(10, 180, 'Chaque critère reçoit un niveau de besoin (par exemple de 1 à 4) ; l\'analyse de risques en déduit les mesures prioritaires.', 'sv-s'), 'Critères DICP')];

S['rgpd-principes'] = ['Les principes du RGPD (article 5) : tout traitement de données personnelles doit les respecter, et le responsable de traitement doit pouvoir le démontrer.',
  svg(700, 240, [['Licéité, loyauté, transparence', 'base légale, personnes informées'], ['Limitation des finalités', 'un but précis et légitime'], ['Minimisation', 'seulement les données nécessaires'], ['Exactitude', 'données tenues à jour'], ['Limitation de la conservation', 'durée définie, puis suppression'], ['Intégrité et confidentialité', 'sécurité des données']].map(function (c, i) {
    var x = 10 + (i % 3) * 228, y = 15 + Math.floor(i / 3) * 80; return bx(x, y, 218, 66, c[0], c[1], 'sv-acc'); }).join('') +
    bx(10, 180, 674, 44, 'Responsabilité (accountability) : registre des traitements, analyses d\'impact, preuves de conformité', '', 'sv-hi'), 'Principes du RGPD')];

S['rgpd-droits'] = ['Les droits des personnes concernées : le responsable de traitement doit répondre dans un délai d\'un mois (prolongeable dans certains cas).',
  svg(700, 200, [['Accès', 'art. 15'], ['Rectification', 'art. 16'], ['Effacement', 'art. 17'], ['Limitation', 'art. 18'], ['Portabilité', 'art. 20'], ['Opposition', 'art. 21']].map(function (c, i) {
    return bx(10 + i * 114, 30, 104, 60, c[0], c[1], i % 2 ? 'sv-v2' : 'sv-acc'); }).join('') +
    t(10, 130, 'La personne exerce ses droits auprès du responsable de traitement (ou du délégué à la protection des données, DPO).', 'sv-l') +
    t(10, 156, 'En cas de refus ou d\'absence de réponse : réclamation auprès de la CNIL.', 'sv-l'), 'Droits des personnes')];

S['rgpd-violation'] = ['Violation de données : documenter toujours, notifier la CNIL sous 72 heures s\'il existe un risque, informer les personnes si le risque est élevé.',
  svg(700, 190, chaine([['Violation détectée', 'perte, vol, accès illicite', 'sv-v2'], ['Registre interne', 'toujours (art. 33.5)'], ['Notification CNIL', 'sous 72 h si risque (art. 33)', 'sv-hi'], ['Informer les personnes', 'si risque élevé (art. 34)']], 30, 152, 70, 18, 10) +
    t(10, 140, 'Le délai de 72 heures court à partir du moment où le responsable de traitement a connaissance de la violation.', 'sv-s') +
    t(10, 162, 'En parallèle : contenir l\'incident, corriger la faille, conserver les preuves (journaux).', 'sv-s'), 'Gestion d\'une violation de données')];

S['hachage'] = ['Stocker un mot de passe : on ne garde que son empreinte, calculée avec un sel aléatoire par un algorithme lent (bcrypt, Argon2). Le hachage est irréversible, contrairement au chiffrement.',
  svg(700, 180, chaine([['Mot de passe', '« Soleil2026! »'], ['+ sel aléatoire', 'propre à chaque compte', 'sv-v2'], ['Fonction de hachage', 'bcrypt, Argon2', 'sv-hi'], ['Empreinte stockée', '$2y$12$…']], 30, 150, 70, 26, 10) +
    t(10, 140, 'À la connexion : on hache le mot de passe saisi avec le même sel et on compare les empreintes.', 'sv-l') +
    t(10, 162, 'Le sel rend inutiles les tables précalculées (« rainbow tables ») ; MD5 et SHA-1 seuls sont trop rapides et à proscrire.', 'sv-s'), 'Hachage d\'un mot de passe avec sel')];

S['mfa'] = ['L\'authentification forte combine au moins deux facteurs de natures différentes : ce que je sais, ce que je possède, ce que je suis.',
  svg(700, 180, [['Ce que je sais', 'mot de passe, code PIN'], ['Ce que je possède', 'téléphone, clé de sécurité'], ['Ce que je suis', 'empreinte, visage']].map(function (c, i) {
    return bx(20 + i * 225, 30, 205, 70, c[0], c[1], i === 1 ? 'sv-hi' : 'sv-acc'); }).join('') +
    t(20, 135, 'Deux mots de passe = un seul facteur (deux fois « ce que je sais ») : ce n\'est pas de la double authentification.', 'sv-l') +
    t(20, 160, 'Le code par SMS est moins sûr qu\'une application d\'authentification ou une clé physique (risque de détournement de la ligne).', 'sv-s'), 'Facteurs d\'authentification')];

S['signature'] = ['Signature électronique : l\'émetteur chiffre l\'empreinte du message avec sa clé privée ; le destinataire la vérifie avec la clé publique de l\'émetteur. Elle garantit l\'intégrité et l\'origine.',
  svg(700, 200, t(10, 22, 'Émetteur', 'sv-t') + chaine([['Message'], ['Empreinte', 'hachage'], ['Signature', 'chiffrée avec la clé privée', 'sv-hi']], 32, 170, 56, 30, 10) +
    t(10, 120, 'Destinataire', 'sv-t') + chaine([['Message reçu', 'recalcule l\'empreinte'], ['Signature déchiffrée', 'clé publique de l\'émetteur', 'sv-v2'], ['Comparaison', 'identiques = authentique', 'sv-hi']], 130, 170, 56, 30, 10), 'Signature électronique')];

S['certificat'] = ['Un certificat lie une clé publique à une identité (un nom de domaine) ; il est signé par une autorité de certification. Le navigateur remonte la chaîne jusqu\'à une autorité racine de confiance.',
  svg(700, 200, chaine([['AC racine', 'dans le magasin de confiance', 'sv-hi'], ['AC intermédiaire', 'signée par la racine'], ['Certificat du site', 'www.exemple.fr + clé publique', 'sv-v2']], 30, 200, 64, 30, 10) +
    t(10, 130, 'Le navigateur vérifie : la signature de chaque maillon, la date de validité, le nom de domaine, la révocation.', 'sv-l') +
    t(10, 156, 'Un certificat auto-signé n\'est pas reconnu par les navigateurs : il provoque une alerte de sécurité.', 'sv-s'), 'Chaîne de certification')];

S['phishing'] = ['Reconnaître un message d\'hameçonnage : il crée l\'urgence, imite une organisation connue et pousse à cliquer ou à donner des informations.',
  svg(700, 200, box(10, 10, 360, 180, 'sv-acc') + t(26, 40, 'De : service-client@banque-securite.co') + t(26, 66, 'Objet : URGENT – compte suspendu', 'sv-l') + t(26, 94, 'Votre compte sera bloqué sous 24 h.', 'sv-s') + t(26, 112, 'Confirmez vos identifiants ici :', 'sv-s') + box(26, 124, 200, 28, 'sv-hi', 6) + tm(126, 143, 'www.banque-verif.xyz', 'sv-s') +
    [['Adresse d\'expéditeur douteuse', 40], ['Urgence, menace', 72], ['Lien vers un autre domaine', 104], ['Demande d\'identifiants', 136], ['Réflexe : ne pas cliquer, signaler', 168]].map(function (e) { return t(400, e[1], '• ' + e[0], 'sv-l'); }).join(''), 'Signes d\'un hameçonnage')];

S['stad'] = ['Les atteintes aux systèmes de traitement automatisé de données (STAD) sont des délits du Code pénal (articles 323-1 et suivants, issus de la loi Godfrain de 1988).',
  svg(700, 210, [['Art. 323-1', 'accès ou maintien frauduleux dans tout ou partie d\'un STAD'], ['Art. 323-2', 'entrave au fonctionnement (ex. : déni de service)'], ['Art. 323-3', 'introduire, modifier ou supprimer des données'], ['Art. 323-3-1', 'détenir ou fournir des outils d\'attaque sans motif légitime']].map(function (c, i) {
    var x = 10 + (i % 2) * 345, y = 10 + Math.floor(i / 2) * 66; return box(x, y, 335, 56, i % 2 ? 'sv-v2' : 'sv-acc') + t(x + 14, y + 24, c[0]) + t(x + 14, y + 44, c[1], 'sv-s'); }).join('') +
    t(10, 168, 'Un test d\'intrusion n\'est légal qu\'avec l\'autorisation écrite du propriétaire du système', 'sv-l') + t(10, 190, '(convention d\'audit précisant le périmètre et les dates).', 'sv-l'), 'Infractions informatiques')];

/* ───── Réseau (SISR) ───── */
S['parefeu'] = ['Un pare-feu lit ses règles de haut en bas et applique la première qui correspond ; la dernière règle refuse tout ce qui n\'a pas été autorisé.',
  svg(700, 230, grille(10, 10, 112, 30, [['N°', 'Source', 'Destination', 'Port', 'Action', ''], ['1', 'LAN', 'DMZ web', 'TCP 443', 'Autoriser', ''], ['2', 'Internet', 'DMZ web', 'TCP 443', 'Autoriser', ''], ['3', 'Admin', 'Serveurs', 'TCP 22', 'Autoriser', ''], ['4', 'Tous', 'Tous', 'Tous', 'Refuser', '']].map(function (r) { return r.slice(0, 5); }), true) +
    t(10, 190, 'Ordre des règles : de la plus précise à la plus générale. Règle finale : refus par défaut.', 'sv-l') +
    t(10, 212, 'Principe du moindre privilège : n\'ouvrir que les flux nécessaires, dans un seul sens si possible.', 'sv-s'), 'Table de filtrage')];

S['e6s-ip'] = ['Découper un réseau : le masque indique la partie réseau. Exemple : 192.168.10.0/26 donne 4 sous-réseaux de 64 adresses (62 machines chacun).',
  svg(700, 230, grille(10, 10, 168, 30, [['Sous-réseau', 'Première adresse', 'Dernière adresse', 'Diffusion'], ['192.168.10.0', '192.168.10.1', '192.168.10.62', '192.168.10.63'], ['192.168.10.64', '192.168.10.65', '192.168.10.126', '192.168.10.127'], ['192.168.10.128', '192.168.10.129', '192.168.10.190', '192.168.10.191'], ['192.168.10.192', '192.168.10.193', '192.168.10.254', '192.168.10.255']], true) +
    t(10, 186, '/26 = 255.255.255.192 ; 32 − 26 = 6 bits pour les hôtes : 2⁶ = 64 adresses, 64 − 2 = 62 machines.', 'sv-l') +
    t(10, 210, 'La première adresse identifie le réseau, la dernière sert à la diffusion (broadcast) : elles ne sont pas attribuées.', 'sv-s'), 'Découpage en sous-réseaux')];

S['e6s-services'] = ['DHCP attribue automatiquement la configuration IP en quatre échanges (DORA) ; DNS traduit un nom de domaine en adresse IP.',
  svg(700, 230, t(10, 22, 'DHCP (UDP 67/68)', 'sv-t') + chaine([['Discover', 'client → diffusion'], ['Offer', 'serveur → client', 'sv-v2'], ['Request', 'client → diffusion'], ['Ack', 'serveur → client', 'sv-v2']], 32, 150, 52, 26, 10) +
    t(10, 122, 'DNS (UDP 53)', 'sv-t') + chaine([['Poste', 'www.exemple.fr ?'], ['Serveur DNS local', 'cache ou requête'], ['Serveurs racine, .fr', 'puis celui du domaine', 'sv-v2'], ['Réponse', 'adresse IP (type A)', 'sv-hi']], 132, 150, 56, 26, 10) +
    t(10, 222, 'Le DHCP fournit aussi le masque, la passerelle par défaut et les serveurs DNS.', 'sv-s'), 'DHCP et DNS')];

/* ───── Développement (SLAM) ───── */
S['xss'] = ['Faille XSS : une donnée saisie par un utilisateur est affichée telle quelle dans la page et le navigateur exécute le script injecté.',
  svg(700, 210, chaine([['Attaquant', 'commentaire piégé', 'sv-v2'], ['Site vulnérable', 'affiche sans échapper'], ['Victime', 'exécute le script', 'sv-v2'], ['Conséquence', 'vol de session', 'sv-hi']], 25, 152, 70, 18, 10) +
    t(10, 135, 'Stockée : le script est enregistré (commentaire, profil). Réfléchie : il est dans un lien piégé.', 'sv-l') +
    t(10, 162, 'Parade : échapper toute sortie (htmlspecialchars en PHP), valider les entrées, politique CSP,', 'sv-l') + t(10, 184, 'cookies HttpOnly pour qu\'un script ne puisse pas les lire.', 'sv-l'), 'Mécanisme d\'une faille XSS')];

S['prepare'] = ['Requête préparée : la requête et les données sont envoyées séparément au serveur SQL, ce qui empêche l\'injection.',
  svg(700, 210, box(10, 10, 330, 120, 'sv-v2') + t(24, 36, 'À éviter : concaténation') + t(24, 64, '"SELECT * FROM user', 'sv-s') + t(24, 82, ' WHERE login = \'" . $login . "\'"', 'sv-s') + t(24, 112, 'Avec  \' OR \'1\'=\'1  : tous les comptes !', 'sv-l') +
    box(360, 10, 330, 120, 'sv-acc') + t(374, 36, 'Correct : requête préparée') + t(374, 64, '$req = $pdo->prepare(\'SELECT * FROM user', 'sv-s') + t(374, 82, ' WHERE login = :login\');', 'sv-s') + t(374, 102, '$req->execute([\'login\' => $login]);', 'sv-s') +
    t(10, 162, 'La donnée est toujours traitée comme une valeur, jamais comme du code SQL.', 'sv-l') + t(10, 186, 'Compléter par : compte SQL aux droits limités, validation des entrées.', 'sv-s'), 'Requête préparée contre injection SQL')];

S['owasp'] = ['L\'OWASP Top 10 (édition 2021) classe les risques de sécurité les plus critiques des applications web.',
  svg(700, 250, ['A01 Contrôle d\'accès défaillant', 'A02 Défaillances cryptographiques', 'A03 Injection (SQL, XSS…)', 'A04 Conception non sécurisée', 'A05 Mauvaise configuration de sécurité', 'A06 Composants vulnérables ou obsolètes', 'A07 Identification et authentification', 'A08 Intégrité des logiciels et des données', 'A09 Journalisation et surveillance insuffisantes', 'A10 Falsification de requête côté serveur (SSRF)'].map(function (s, i) {
    var x = 10 + (i % 2) * 345, y = 10 + Math.floor(i / 2) * 46; return box(x, y, 335, 38, i < 3 ? 'sv-hi' : 'sv-acc', 6) + t(x + 12, y + 24, s, 'sv-l'); }).join(''), 'OWASP Top 10 2021')];

S['groupby'] = ['Regrouper et filtrer : WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après le calcul.',
  svg(700, 200, box(10, 10, 680, 110, 'sv-acc') + t(26, 38, 'SELECT idClient, COUNT(*) AS nb, SUM(montant) AS total') + t(26, 60, 'FROM commande', 'sv-t') + t(26, 82, 'WHERE annee = 2026', 'sv-t') + t(26, 104, 'GROUP BY idClient HAVING SUM(montant) > 500;', 'sv-t') +
    t(10, 150, 'Ordre d\'exécution : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.', 'sv-l') +
    t(10, 176, 'Toute colonne du SELECT qui n\'est pas dans une fonction d\'agrégat doit figurer dans le GROUP BY.', 'sv-s'), 'GROUP BY et HAVING')];

S['grant'] = ['Gérer les droits d\'un compte SQL : créer un utilisateur dédié à l\'application et ne lui donner que les droits nécessaires (moindre privilège).',
  svg(700, 200, box(10, 10, 680, 120, 'sv-acc') + t(26, 38, 'CREATE USER \'appli\'@\'localhost\' IDENTIFIED BY \'MotDePasseSolide\';', 'sv-l') +
    t(26, 66, 'GRANT SELECT, INSERT, UPDATE ON boutique.commande TO \'appli\'@\'localhost\';', 'sv-l') + t(26, 94, 'REVOKE UPDATE ON boutique.commande FROM \'appli\'@\'localhost\';', 'sv-l') + t(26, 118, 'SHOW GRANTS FOR \'appli\'@\'localhost\';', 'sv-s') +
    t(10, 162, 'Jamais de compte root pour l\'application ; un compte par application ; pas de droit DROP ni GRANT.', 'sv-l'), 'Droits SQL')];

S['e6d-poo'] = ['Les piliers de la programmation objet : encapsulation, héritage, polymorphisme et abstraction.',
  svg(700, 230, box(250, 10, 200, 86, 'sv-hi') + tm(350, 32, 'Employe (abstraite)') + tm(350, 54, '- nom : string', 'sv-s') + tm(350, 72, '+ getSalaire() : float', 'sv-s') + tm(350, 88, 'attributs privés', 'sv-s') +
    box(80, 140, 200, 60, 'sv-acc') + tm(180, 164, 'Technicien') + tm(180, 184, 'getSalaire() redéfinie', 'sv-s') + box(420, 140, 200, 60, 'sv-acc') + tm(520, 164, 'Developpeur') + tm(520, 184, 'getSalaire() redéfinie', 'sv-s') +
    arr(180, 140, 300, 98) + arr(520, 140, 400, 98) + tm(350, 128, 'héritage (« est un »)', 'sv-s') +
    t(10, 222, 'Encapsulation : attributs privés + accesseurs. Polymorphisme : même méthode, comportement différent selon la classe.', 'sv-s'), 'Programmation objet')];

/* ───── Droit et gestion ───── */
S['oblig'] = ['Obligation de moyens ou de résultat : elle détermine ce que le client doit prouver pour engager la responsabilité du prestataire.',
  svg(700, 170, bx(10, 20, 330, 120, 'Obligation de moyens', '', 'sv-acc') + t(26, 74, 'Faire tout son possible (diligence).', 'sv-l') + t(26, 96, 'Le client doit prouver une faute.', 'sv-l') + t(26, 118, 'Ex. : maintenance, conseil, dépannage.', 'sv-s') +
    bx(360, 20, 330, 120, 'Obligation de résultat', '', 'sv-v2') + t(376, 74, 'Atteindre le résultat promis.', 'sv-l') + t(376, 96, 'L\'absence de résultat suffit (faute présumée).', 'sv-l') + t(376, 118, 'Ex. : livrer à la date, disponibilité garantie.', 'sv-s'), 'Obligation de moyens et de résultat')];

S['licenciement'] = ['La procédure de licenciement pour motif personnel : il faut une cause réelle et sérieuse, et respecter les étapes et les délais.',
  svg(700, 190, chaine([['Convocation', 'lettre recommandée'], ['Entretien préalable', '≥ 5 jours ouvrables après', 'sv-v2'], ['Notification', '≥ 2 jours ouvrables après', 'sv-hi'], ['Préavis, indemnités', 'sauf faute grave']], 30, 152, 74, 18, 10) +
    t(10, 130, 'Convocation par lettre recommandée ou remise en main propre ; notification par lettre recommandée.', 'sv-s') + t(10, 150, 'La lettre fixe les limites du litige : les motifs doivent y être énoncés précisément.', 'sv-l') +
    t(10, 172, 'Sans cause réelle et sérieuse : indemnités fixées par le juge (barème du Code du travail).', 'sv-s'), 'Procédure de licenciement')];

S['pestel'] = ['L\'analyse PESTEL étudie le macro-environnement de l\'entreprise : les facteurs qu\'elle ne contrôle pas, mais qui créent des opportunités ou des menaces.',
  svg(700, 170, [['P', 'Politique', 'stabilité, aides publiques'], ['E', 'Économique', 'croissance, inflation'], ['S', 'Socioculturel', 'modes de vie, démographie'], ['T', 'Technologique', 'IA, cloud, cybersécurité'], ['E', 'Écologique', 'climat, sobriété numérique'], ['L', 'Légal', 'RGPD, droit du travail']].map(function (c, i) {
    return box(10 + i * 114, 20, 104, 120, i % 2 ? 'sv-v2' : 'sv-acc') + tm(62 + i * 114, 60, c[0]) + tm(62 + i * 114, 86, c[1], 'sv-l') + tm(62 + i * 114, 110, c[2].split(', ')[0], 'sv-s') + tm(62 + i * 114, 126, c[2].split(', ')[1] || '', 'sv-s'); }).join(''), 'Analyse PESTEL')];

S['strat-globale'] = ['Les stratégies globales concernent l\'ensemble de l\'entreprise : sur quels métiers se positionner et comment les organiser.',
  svg(700, 180, [['Spécialisation', 'un seul métier'], ['Diversification', 'plusieurs métiers'], ['Intégration', 'amont, aval, concurrents'], ['Externalisation', 'confier à un prestataire']].map(function (c, i) {
    return bx(10 + i * 172, 30, 162, 74, c[0], c[1], i % 2 ? 'sv-v2' : 'sv-acc'); }).join('') +
    t(10, 140, 'À distinguer des stratégies de domaine (sur un marché) : domination par les coûts, différenciation, focalisation.', 'sv-s'), 'Stratégies globales')];

S['marche'] = ['Le marché : l\'offre augmente avec le prix, la demande diminue ; le prix d\'équilibre égalise les quantités offertes et demandées.',
  svg(700, 230, ln(60, 200, 340, 200) + ln(60, 200, 60, 20) + arr(330, 200, 346, 200) + arr(60, 30, 60, 14) + t(350, 214, 'Quantité', 'sv-s') + t(68, 18, 'Prix', 'sv-s') +
    ln(80, 180, 320, 40, 'sv-thick') + t(300, 36, 'Offre', 'sv-l') + ln(80, 40, 320, 180) + t(286, 196, 'Demande', 'sv-l') +
    '<line class="sv-a" stroke-dasharray="4 4" x1="200" y1="110" x2="200" y2="200"/><line class="sv-a" stroke-dasharray="4 4" x1="200" y1="110" x2="60" y2="110"/>' + circ(200, 110, 5, 'sv-ah') +
    t(14, 114, 'Prix', 'sv-s') + t(14, 128, 'd\'équilibre', 'sv-s') + box(390, 30, 300, 160, 'sv-acc') + t(406, 58, 'Structures de marché') + t(406, 86, 'Concurrence : nombreux offreurs', 'sv-l') + t(406, 110, 'Oligopole : quelques offreurs', 'sv-l') + t(406, 134, 'Monopole : un seul offreur', 'sv-l') + t(406, 166, 'Analyser : acteurs, offre, demande, prix', 'sv-s'), 'Offre, demande et équilibre')];

/* ───── Maths et algorithmique ───── */
S['bool'] = ['Algèbre de Boole : ET (produit), OU (somme), NON (complément), et les lois de De Morgan pour transformer une négation.',
  svg(700, 220, grille(10, 10, 60, 30, [['a', 'b', 'a.b', 'a+b', 'a⊕b'], ['0', '0', '0', '0', '0'], ['0', '1', '0', '1', '1'], ['1', '0', '0', '1', '1'], ['1', '1', '1', '1', '0']], true) +
    box(330, 10, 360, 150, 'sv-acc') + t(346, 40, 'Lois de De Morgan') + t(346, 70, 'non(a.b) = non a + non b', 'sv-l') + t(346, 96, 'non(a + b) = non a . non b', 'sv-l') +
    t(346, 128, 'Autres : a + a.b = a ; a + non a = 1 ;', 'sv-s') + t(346, 146, 'a . non a = 0 ; a + 1 = 1', 'sv-s') + t(10, 200, '⊕ : OU exclusif (vrai si exactement une des deux variables vaut 1).', 'sv-s'), 'Tables de vérité et De Morgan')];

S['karnaugh'] = ['Tableau de Karnaugh : on range les colonnes dans l\'ordre de Gray (une seule variable change d\'une case à la voisine) et on regroupe les 1 par blocs de 1, 2, 4 ou 8.',
  svg(700, 200, grille(60, 30, 70, 40, [['a \\ bc', '00', '01', '11', '10'], ['0', '0', '0', '1', '1'], ['1', '0', '0', '1', '1']], true) +
    '<rect class="sv-a sv-thick" x="273" y="73" width="134" height="74" rx="10" fill="none"/>' +
    box(440, 30, 250, 140, 'sv-acc') + t(456, 60, 'Groupe de 4 cases :') + t(456, 86, 'a et c changent, b vaut 1', 'sv-l') + t(456, 112, 'donc F = b', 'sv-t') + t(456, 136, 'Plus le groupe est grand,', 'sv-s') + t(456, 150, 'plus l\'expression est simple.', 'sv-s') +
    t(10, 192, 'Ordre de Gray des colonnes : 00, 01, 11, 10.', 'sv-s'), 'Tableau de Karnaugh')];

S['calcmat'] = ['Produit de deux matrices : le coefficient ligne i, colonne j est la somme des produits de la ligne i de la première par la colonne j de la seconde.',
  svg(700, 170, grille(20, 40, 50, 40, [['1', '2'], ['3', '4']]) + tm(140, 84, '×', 'sv-t') + grille(160, 40, 50, 40, [['5', '6'], ['7', '8']]) + tm(280, 84, '=', 'sv-t') + grille(300, 40, 60, 40, [['19', '22'], ['43', '50']]) +
    box(440, 30, 250, 110, 'sv-acc') + t(456, 58, '1 × 5 + 2 × 7 = 19', 'sv-l') + t(456, 80, '1 × 6 + 2 × 8 = 22', 'sv-l') + t(456, 102, '3 × 5 + 4 × 7 = 43', 'sv-l') + t(456, 124, '3 × 6 + 4 × 8 = 50', 'sv-l') +
    t(20, 150, 'En général, A × B ≠ B × A : le produit n\'est pas commutatif.', 'sv-s'), 'Produit de matrices')];

S['graphes'] = ['Un graphe orienté : des sommets reliés par des arcs. Les niveaux se trouvent en retirant pas à pas les sommets sans prédécesseur.',
  svg(700, 210, circ(60, 100, 22, 'sv-box sv-hi') + tm(60, 105, 'A') + circ(200, 50, 22, 'sv-box sv-acc') + tm(200, 55, 'B') + circ(200, 150, 22, 'sv-box sv-acc') + tm(200, 155, 'C') + circ(340, 100, 22, 'sv-box sv-v2') + tm(340, 105, 'D') +
    arr(80, 90, 178, 58) + arr(80, 110, 178, 142) + arr(220, 58, 318, 92) + arr(220, 142, 318, 108) + arr(200, 72, 200, 128) +
    box(400, 20, 290, 160, 'sv-acc') + t(416, 46, 'Niveau 0 : A (aucun prédécesseur)') + t(416, 72, 'Niveau 1 : B', 'sv-l') + t(416, 96, 'Niveau 2 : C (prédécesseurs A et B)', 'sv-l') + t(416, 120, 'Niveau 3 : D', 'sv-l') +
    t(416, 150, 'Matrice d\'adjacence : 1 en ligne i,', 'sv-s') + t(416, 166, 'colonne j s\'il existe un arc i → j.', 'sv-s'), 'Graphe orienté et niveaux')];

S['py-boucles'] = ['Deux boucles en Python : for quand on connaît le nombre de tours, while quand on répète tant qu\'une condition est vraie.',
  svg(700, 180, box(10, 10, 330, 120, 'sv-acc') + t(26, 36, 'Boucle for') + t(26, 62, 'for i in range(1, 6):', 'sv-l') + t(46, 84, 'print(i * i)', 'sv-l') + t(26, 114, 'affiche 1, 4, 9, 16, 25', 'sv-s') +
    box(360, 10, 330, 120, 'sv-v2') + t(376, 36, 'Boucle while') + t(376, 62, 'n = 100', 'sv-l') + t(376, 82, 'while n > 1:', 'sv-l') + t(396, 102, 'n = n // 2', 'sv-l') + t(376, 122, 'n vaut 50, 25, 12, 6, 3, 1', 'sv-s') +
    t(10, 162, 'range(1, 6) va de 1 à 5 : la borne de fin est exclue. Avec while, vérifier que la condition finit par devenir fausse.', 'sv-s'), 'Boucles for et while')];

/* ───── Épreuves (CGE, E5) ───── */
S['cge-epreuve'] = ['L\'épreuve de culture générale et expression (E1) : écrit de 3 heures, sur le thème national de l\'année (« Le vrai du faux » en 2027).',
  svg(700, 170, bx(10, 20, 330, 110, 'Questions sur un corpus', '', 'sv-acc') + t(26, 74, '10 points', 'sv-l') + t(26, 96, 'Comprendre et confronter des documents', 'sv-s') + t(26, 114, '(textes, images, données).', 'sv-s') +
    bx(360, 20, 330, 110, 'Essai', '', 'sv-v2') + t(376, 74, '10 points', 'sv-l') + t(376, 96, 'Répondre à une question en argumentant', 'sv-s') + t(376, 114, 'avec des exemples personnels et culturels.', 'sv-s') +
    t(10, 158, 'La maîtrise de la langue est évaluée dans les deux parties.', 'sv-s'), 'Déroulé de l\'épreuve E1')];

S['e5-epreuve'] = ['L\'épreuve E5 : un oral de 40 minutes sans préparation, appuyé sur le portfolio et le tableau de synthèse.',
  svg(700, 160, chaine([['Exposé', 'environ 10 min : parcours et réalisations'], ['Entretien', 'environ 30 min : réalisations, bloc 1', 'sv-hi']], 30, 320, 70, 24, 10) +
    t(10, 140, 'Le jury vérifie la couverture des compétences du bloc 1 et la qualité des preuves (documentation, captures, code).', 'sv-s'), 'Déroulé de l\'épreuve E5')];

S['e5-ticket'] = ['Traiter une demande d\'assistance : la priorité d\'un ticket se déduit de son impact (combien de personnes ou de services touchés) et de son urgence.',
  svg(700, 210, grille(10, 10, 120, 36, [['Impact \\ Urgence', 'Haute', 'Moyenne', 'Basse'], ['Élevé', 'Critique', 'Haute', 'Moyenne'], ['Moyen', 'Haute', 'Moyenne', 'Basse'], ['Faible', 'Moyenne', 'Basse', 'Planifiée']], true) +
    box(510, 10, 180, 144, 'sv-acc') + t(524, 36, 'Cycle du ticket') + t(524, 60, '1. Enregistrer', 'sv-l') + t(524, 80, '2. Qualifier, prioriser', 'sv-l') + t(524, 100, '3. Diagnostiquer, escalader', 'sv-l') + t(524, 120, '4. Résoudre, documenter', 'sv-l') + t(524, 140, '5. Clôturer avec l\'utilisateur', 'sv-l') +
    t(10, 190, 'Exemple de matrice : chaque organisation définit la sienne dans son contrat de service (SLA).', 'sv-s'), 'Priorité d\'un ticket')];

window.SCHEMAS = window.SCHEMAS || {};
Object.keys(S).forEach(function (k) { if (!window.SCHEMAS[k]) window.SCHEMAS[k] = S[k]; });
})();
