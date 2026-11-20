/* SCHÉMAS DES NOTIONS CLÉS — dessinés à la main en SVG (texte + image : « double codage »).
   SCHEMAS[idNotion] = [légende, code SVG]. Affichés sous la réponse des flashcards et dans la bibliothèque.
   Les couleurs viennent du thème de l'application (classes sv-*), pour rester lisibles en clair comme en sombre.
   Petites fonctions d'aide : box(x, y, largeur, hauteur, texte principal, sous-texte, style) et arrow(x1, y1, x2, y2, étiquette, position de l'étiquette). */
(function () {
  var uid = 0;
  function box(x, y, w, h, t, sub, cls) {
    return '<rect class="sv-box ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/>' +
      '<text class="sv-t" x="' + (x + w / 2) + '" y="' + (y + (sub ? h / 2 - 3 : h / 2 + 4)) + '" text-anchor="middle">' + t + '</text>' +
      (sub ? '<text class="sv-s" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 13) + '" text-anchor="middle">' + sub + '</text>' : '');
  }
  function arrow(x1, y1, x2, y2, lab, lx, ly, anchor) {
    return '<line class="sv-a" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" marker-end="url(#svh' + uid + ')"/>' +
      (lab ? '<text class="sv-l" x="' + lx + '" y="' + ly + '" text-anchor="' + (anchor || 'middle') + '">' + lab + '</text>' : '');
  }
  function svg(w, h, body) {
    var id = ++uid;
    return '<svg class="schema" viewBox="0 0 ' + w + ' ' + h + '" role="img"><defs><marker id="svh' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="sv-ah" d="M0 0L10 5L0 10z"/></marker></defs>' + body(id) + '</svg>';
  }
  var S = {};
  S.dmz = ['Tout le trafic passe par le pare-feu : Internet n\'atteint que la DMZ, jamais directement le LAN.', svg(560, 220, function () { return '' +
    box(10, 85, 110, 50, 'Internet', 'non fiable') +
    box(215, 85, 120, 50, 'Pare-feu', 'filtre tout', 'sv-acc') +
    box(425, 15, 125, 62, 'DMZ', 'web, relais mail') +
    box(425, 143, 125, 62, 'LAN', 'postes, BDD, AD') +
    arrow(120, 110, 213, 110, '', 0, 0) +
    arrow(335, 100, 423, 52, 'autorisé : 443', 362, 62, 'end') +
    arrow(335, 120, 423, 170, 'Internet → LAN : refusé', 392, 182, 'end') +
    '<text class="sv-s" x="280" y="210" text-anchor="middle">DMZ → LAN : seulement les flux indispensables</text>'; })];
  S.vlan = ['Un trunk 802.1Q transporte plusieurs VLAN ; passer d\'un VLAN à l\'autre exige un routeur ou un pare-feu, qui filtre.', svg(560, 235, function () { return '' +
    box(205, 8, 150, 44, 'Routeur / pare-feu', 'routage inter-VLAN', 'sv-acc') +
    box(50, 98, 150, 40, 'Commutateur A') + box(360, 98, 150, 40, 'Commutateur B') +
    '<line class="sv-a sv-thick" x1="200" y1="118" x2="360" y2="118"/>' +
    '<text class="sv-l" x="280" y="110" text-anchor="middle">trunk 802.1Q</text><text class="sv-s" x="280" y="135" text-anchor="middle">VLAN 10 + 20 étiquetés</text>' +
    '<line class="sv-a sv-thick" x1="250" y1="52" x2="140" y2="98"/>' +
    box(25, 180, 90, 40, 'PC', 'VLAN 10', 'sv-v1') + box(135, 180, 90, 40, 'PC', 'VLAN 20', 'sv-v2') +
    box(335, 180, 90, 40, 'PC', 'VLAN 10', 'sv-v1') + box(445, 180, 90, 40, 'PC', 'VLAN 20', 'sv-v2') +
    '<line class="sv-a" x1="95" y1="138" x2="70" y2="180"/><line class="sv-a" x1="155" y1="138" x2="180" y2="180"/>' +
    '<line class="sv-a" x1="405" y1="138" x2="380" y2="180"/><line class="sv-a" x1="465" y1="138" x2="490" y2="180"/>'; })];
  S.mvc = ['Le contrôleur reçoit la requête, demande les données au modèle, puis les passe à la vue qui produit la page.', svg(600, 230, function () { return '' +
    box(10, 90, 120, 50, 'Navigateur', 'client') +
    box(220, 20, 140, 50, 'Contrôleur', 'reçoit, décide', 'sv-acc') +
    box(450, 20, 140, 50, 'Modèle', 'données, règles') +
    box(450, 150, 140, 50, 'Base de données', 'MySQL') +
    box(220, 150, 140, 50, 'Vue', 'gabarit HTML') +
    arrow(110, 90, 218, 55, '1 requête HTTP', 150, 58) +
    arrow(360, 45, 448, 45, '2 demande', 404, 37) +
    arrow(520, 70, 520, 148, '3 SQL', 528, 113, 'start') +
    arrow(290, 70, 290, 148, '4 données', 298, 113, 'start') +
    arrow(218, 175, 112, 140, '5 page HTML', 150, 183); })];
  S['sym-asym'] = ['Chiffrement asymétrique : on chiffre avec la clé PUBLIQUE du destinataire ; seule sa clé PRIVÉE déchiffre.', svg(620, 150, function () { return '' +
    box(5, 50, 95, 50, 'Alice', 'expéditrice') +
    box(150, 50, 140, 50, 'Chiffre avec', 'clé publique de Bob', 'sv-acc') +
    box(340, 50, 120, 50, 'Message', 'illisible en route') +
    box(510, 50, 105, 50, 'Bob', 'clé privée') +
    arrow(100, 75, 148, 75) + arrow(290, 75, 338, 75) + arrow(460, 75, 508, 75) +
    '<text class="sv-s" x="310" y="130" text-anchor="middle">Pour SIGNER, c\'est l\'inverse : l\'expéditeur utilise SA clé privée, tout le monde vérifie avec sa clé publique.</text>'; })];
  S.sauvegarde = ['Règle 3-2-1 : 3 copies, sur 2 supports différents, dont 1 hors site (idéalement hors ligne contre les rançongiciels).', svg(600, 160, function () { return '' +
    box(10, 40, 170, 62, 'Copie 1', 'serveur en production') +
    box(215, 40, 170, 62, 'Copie 2', 'autre support : NAS') +
    box(420, 40, 170, 62, 'Copie 3', 'hors site, hors ligne', 'sv-acc') +
    arrow(180, 71, 213, 71) + arrow(385, 71, 418, 71) +
    '<text class="sv-l" x="95" y="128" text-anchor="middle">3 copies</text><text class="sv-l" x="300" y="128" text-anchor="middle">2 supports</text><text class="sv-l" x="505" y="128" text-anchor="middle">1 hors site</text>' +
    '<text class="sv-s" x="300" y="152" text-anchor="middle">Et tester la restauration régulièrement : une sauvegarde jamais restaurée n\'est pas une sauvegarde.</text>'; })];
  S['8021x'] = ['802.1X : le port reste fermé tant que le serveur RADIUS n\'a pas validé l\'identité du poste.', svg(620, 170, function () { return '' +
    box(10, 55, 140, 56, 'Poste', 'supplicant') +
    box(240, 55, 150, 56, 'Commutateur / borne', 'authentificateur') +
    box(470, 55, 140, 56, 'Serveur RADIUS', 'NPS, FreeRADIUS', 'sv-acc') +
    arrow(150, 72, 238, 72, '1 identité (EAP)', 194, 64) + arrow(390, 72, 468, 72, '2 transmet', 429, 64) +
    arrow(468, 96, 392, 96, '3 oui / non', 429, 115) + arrow(238, 96, 152, 96, '4 port ouvert', 194, 115) +
    '<text class="sv-s" x="310" y="152" text-anchor="middle">Le serveur peut aussi choisir le VLAN du poste (invité, production…).</text>'; })];
  S.incident = ['Les six phases de la réponse à incident, dans l\'ordre.', svg(680, 110, function () {
    var L = [['Préparation', 'avant'], ['Identification', 'détecter'], ['Confinement', 'isoler'], ['Éradication', 'supprimer'], ['Rétablissement', 'remettre'], ['Leçons', 'améliorer']], out = '';
    L.forEach(function (p, i) { out += box(5 + i * 112, 25, 104, 54, p[0], p[1], i === 2 ? 'sv-acc' : '') + (i < 5 ? arrow(109 + i * 112, 52, 115 + i * 112, 52) : ''); });
    return out + '<text class="sv-s" x="340" y="100" text-anchor="middle">Confiner AVANT d\'éradiquer : on isole la machine du réseau, sans l\'éteindre si on veut garder des preuves.</text>'; })];
  S['e6s-annuaire'] = ['Méthode AGDLP : les droits se donnent à des groupes, jamais directement à des comptes.', svg(660, 130, function () { return '' +
    box(5, 30, 140, 56, 'Comptes (A)', 'jdupont, mmartin') +
    box(175, 30, 145, 56, 'Groupe global (G)', 'G_Comptables') +
    box(350, 30, 160, 56, 'Domaine local (DL)', 'DL_Compta_RW') +
    box(540, 30, 115, 56, 'Permission (P)', 'NTFS : Modifier', 'sv-acc') +
    arrow(145, 58, 173, 58) + arrow(320, 58, 348, 58) + arrow(510, 58, 538, 58) +
    '<text class="sv-s" x="330" y="115" text-anchor="middle">G = par métier · DL = par ressource et droit · P = sur le dossier partagé</text>'; })];
  S['e6s-routage'] = ['Le routeur choisit la route la plus précise ; en sortie vers Internet, le NAT remplace l\'adresse privée par l\'adresse publique et garde la correspondance pour le retour.', svg(640, 200, function () { return '' +
    box(5, 60, 115, 56, 'Poste', '192.168.10.25') +
    box(235, 60, 160, 56, 'Routeur + NAT', 'table de routage', 'sv-acc') +
    box(510, 60, 125, 56, 'Serveur web', '93.184.216.34') +
    arrow(120, 78, 233, 78, 'source privée', 177, 70) +
    arrow(395, 78, 508, 78, 'source : 82.64.12.5', 452, 70) +
    arrow(508, 100, 397, 100, 'réponse', 452, 118) + arrow(233, 100, 122, 100, 'rendu au poste', 177, 118) +
    '<text class="sv-s" x="320" y="160" text-anchor="middle">Table NAT : 192.168.10.25:51000 ↔ 82.64.12.5:51000</text>' +
    '<text class="sv-s" x="320" y="182" text-anchor="middle">Route choisie : la plus précise (masque le plus long), sinon la route par défaut 0.0.0.0/0</text>'; })];
  S['e6s-raid'] = ['RAID 1 copie tout sur deux disques ; RAID 5 répartit données et parité (un disque peut tomber) ; aucun RAID ne remplace une sauvegarde.', svg(640, 190, function () {
    var d = function (x, y, t, cls) { return '<rect class="sv-box ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="56" height="64" rx="6"/><text class="sv-s" x="' + (x + 28) + '" y="' + (y + 36) + '" text-anchor="middle">' + t + '</text>'; };
    return '<text class="sv-t" x="85" y="22" text-anchor="middle">RAID 1 (miroir)</text>' + d(25, 40, 'A B C') + d(90, 40, 'A B C') +
      '<text class="sv-s" x="85" y="128" text-anchor="middle">2 disques, capacité d\'1 disque</text>' +
      '<text class="sv-t" x="400" y="22" text-anchor="middle">RAID 5 (parité répartie)</text>' + d(275, 40, 'A1 B1 C1') + d(340, 40, 'A2 B2 Cp') + d(405, 40, 'A3 Bp C2') + d(470, 40, 'Ap B3 C3') +
      '<text class="sv-s" x="400" y="128" text-anchor="middle">4 disques, capacité de 3 · p = parité, tournante</text>' +
      '<text class="sv-s" x="320" y="170" text-anchor="middle">RAID 0 : vitesse sans sécurité · RAID 10 : miroirs agrégés (rapide et tolérant)</text>'; })];
  S.proxy = ['Le proxy agit pour les utilisateurs qui sortent ; le proxy inverse agit pour les serveurs que l\'on vient visiter.', svg(640, 200, function () { return '' +
    '<text class="sv-l" x="10" y="20">Proxy (sortant)</text>' +
    box(10, 30, 110, 46, 'Salariés', 'LAN') + box(200, 30, 130, 46, 'Proxy', 'filtre, journalise', 'sv-acc') + box(420, 30, 120, 46, 'Internet', 'sites web') +
    arrow(120, 53, 198, 53) + arrow(330, 53, 418, 53) +
    '<text class="sv-l" x="10" y="118">Proxy inverse (entrant)</text>' +
    box(10, 128, 110, 46, 'Visiteurs', 'Internet') + box(200, 128, 130, 46, 'Proxy inverse', 'HTTPS, répartit', 'sv-acc') + box(420, 128, 120, 46, 'Serveurs web', 'internes') +
    arrow(120, 151, 198, 151) + arrow(330, 151, 418, 151); })];
  S.vpn = ['Un VPN crée un tunnel chiffré à travers Internet : entre deux sites, ou entre un nomade et l\'entreprise.', svg(640, 190, function () { return '' +
    box(10, 30, 130, 50, 'Siège', '192.168.10.0/24') + box(500, 30, 130, 50, 'Agence', '192.168.20.0/24') +
    '<rect class="sv-box" x="230" y="25" width="180" height="60" rx="30"/><text class="sv-s" x="320" y="78" text-anchor="middle">Internet</text>' +
    '<line class="sv-a sv-thick" x1="140" y1="55" x2="500" y2="55"/><text class="sv-l" x="320" y="20" text-anchor="middle">tunnel IPsec / WireGuard (site à site)</text>' +
    box(10, 120, 130, 50, 'Télétravailleur', 'client VPN + MFA') +
    '<line class="sv-a sv-thick" x1="140" y1="145" x2="230" y2="145"/><line class="sv-a sv-thick" x1="230" y1="145" x2="230" y2="80"/>' +
    '<text class="sv-s" x="250" y="150">accès distant : comme s\'il était sur le réseau du siège</text>'; })];
  /* ───── Schémas des autres matières ───── */
  function chain(items, y, w, gap, accentIdx) {   // boîtes reliées de gauche à droite
    var out = '';
    items.forEach(function (it, i) { var x = 5 + i * (w + gap); out += box(x, y, w, 56, it[0], it[1], i === accentIdx ? 'sv-acc' : '') + (i < items.length - 1 ? arrow(x + w, y + 28, x + w + gap - 2, y + 28) : ''); });
    return out;
  }
  function cell(x, y, w, h, t, lines, cls) {   // case de tableau avec titre et lignes de texte
    return '<rect class="sv-box ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/><text class="sv-t" x="' + (x + 12) + '" y="' + (y + 22) + '">' + t + '</text>' +
      lines.map(function (l, i) { return '<text class="sv-s" x="' + (x + 12) + '" y="' + (y + 42 + i * 16) + '">' + l + '</text>'; }).join('');
  }
  // E7 tronc commun
  S.risque = ['Matrice des risques : on place chaque scénario selon sa gravité et sa vraisemblance ; on traite d\'abord ceux en haut à droite.', svg(560, 250, function () {
    var out = '', lab = ['Faible', 'Moyenne', 'Forte'];
    for (var g = 0; g < 3; g++) for (var v = 0; v < 3; v++) { var s = g + v, cls = s >= 3 ? 'sv-v2' : s === 2 ? 'sv-acc' : ''; out += '<rect class="sv-box ' + cls + '" x="' + (150 + v * 120) + '" y="' + (20 + (2 - g) * 62) + '" width="114" height="56" rx="6"/>'; }
    out += '<text class="sv-s" x="447" y="54" text-anchor="middle">à traiter en priorité</text><text class="sv-s" x="207" y="178" text-anchor="middle">à surveiller</text>';
    lab.forEach(function (l, i) { out += '<text class="sv-s" x="140" y="' + (52 + (2 - i) * 62) + '" text-anchor="end">' + l + '</text><text class="sv-s" x="' + (207 + i * 120) + '" y="222" text-anchor="middle">' + l + '</text>'; });
    return out + '<text class="sv-l" x="40" y="120" text-anchor="middle" transform="rotate(-90 40 120)">Gravité</text><text class="sv-l" x="327" y="244" text-anchor="middle">Vraisemblance</text>'; })];
  // E7 SLAM
  S.sqli = ['Injection SQL : la saisie, collée dans la requête, en change le sens. La requête préparée envoie la saisie à part : elle reste une simple valeur.', svg(640, 210, function () { return '' +
    box(5, 20, 150, 56, 'Saisie', "admin' --") + box(200, 20, 435, 56, "… WHERE login = 'admin' --' AND mdp = …", 'concaténation : le -- met la vérification du mot de passe en commentaire', 'sv-v2') +
    arrow(155, 48, 198, 48) +
    box(5, 130, 150, 56, 'Saisie', "admin' --") + box(200, 130, 435, 56, 'prepare(… WHERE login = :login) puis execute', 'requête préparée : la saisie est une valeur, jamais du code', 'sv-acc') +
    arrow(155, 158, 198, 158); })];
  S.jwt = ['Jeton JWT : délivré à la connexion, envoyé à chaque requête, vérifié par sa signature (pas de session côté serveur).', svg(640, 200, function () { return '' +
    box(10, 70, 140, 56, 'Application', 'client') + box(470, 70, 160, 56, 'API', 'vérifie la signature', 'sv-acc') +
    arrow(150, 82, 468, 82, '1 login + mot de passe', 309, 74) + arrow(468, 100, 152, 100, '2 jeton signé (exp : 15 min)', 309, 118) +
    '<text class="sv-s" x="320" y="160" text-anchor="middle">3 chaque requête : Authorization: Bearer &lt;jeton&gt; → 200, ou 401 si absent / expiré, 403 si non autorisé</text>' +
    '<text class="sv-s" x="320" y="182" text-anchor="middle">Le contenu du jeton est lisible (base64) : jamais de mot de passe dedans.</text>'; })];
  // E6 SLAM
  S['e6d-norm'] = ['Du MCD aux tables : une association 1-n devient une clé étrangère côté « n » ; une association n-n devient une table.', svg(640, 230, function () { return '' +
    cell(10, 15, 180, 70, 'Client', ['idClient (PK)', 'nom']) + cell(240, 15, 180, 70, 'Commande', ['idCommande (PK)', '#idClient (FK) ← côté n']) +
    '<text class="sv-l" x="215" y="45" text-anchor="middle">1-n</text><line class="sv-a" x1="190" y1="50" x2="238" y2="50"/>' +
    cell(10, 130, 180, 70, 'Étudiant', ['idEtudiant (PK)', 'nom']) + cell(450, 130, 180, 70, 'Cours', ['idCours (PK)', 'intitule']) +
    cell(220, 122, 200, 86, 'Inscription', ['#idEtudiant, #idCours (PK)', 'dateInscription'], 'sv-acc') +
    arrow(190, 165, 218, 165) + arrow(448, 165, 422, 165) + '<text class="sv-l" x="320" y="112" text-anchor="middle">n-n → nouvelle table</text>'; })];
  S['e6d-jointure'] = ['INNER JOIN garde les lignes qui ont une correspondance des deux côtés ; LEFT JOIN garde toutes les lignes de gauche (NULL si rien en face).', svg(640, 190, function () {
    var venn = function (cx, left, titre) { return '<circle class="sv-box' + (left ? ' sv-hi' : '') + '" cx="' + cx + '" cy="90" r="55"/><circle class="sv-box" cx="' + (cx + 70) + '" cy="90" r="55" style="fill-opacity:.5"/>' +
      '<path class="sv-box sv-hi" d="M' + (cx + 35) + ' 47.6 A55 55 0 0 1 ' + (cx + 35) + ' 132.4 A55 55 0 0 1 ' + (cx + 35) + ' 47.6z"/>' +
      '<text class="sv-s" x="' + (cx - 20) + '" y="94" text-anchor="middle">Clients</text><text class="sv-s" x="' + (cx + 92) + '" y="94" text-anchor="middle">Commandes</text><text class="sv-t" x="' + (cx + 35) + '" y="172" text-anchor="middle">' + titre + '</text>'; };
    return venn(90, false, 'INNER JOIN : la partie commune') + venn(410, true, 'LEFT JOIN : tous les clients'); })];
  // E4 Droit
  S.raisonnement = ['Le raisonnement juridique : une réponse argumentée qui applique des règles de droit aux faits du cas.', svg(680, 120, function () {
    return chain([['Faits', 'qualifiés'], ['Problème', 'de droit'], ['Règles', 'articles, principes'], ['Application', 'règle → faits'], ['Solution', 'réponse nette']], 25, 116, 20, 3) +
      '<text class="sv-s" x="340" y="108" text-anchor="middle">L\'application est l\'étape qui rapporte le plus : reprendre chaque condition de la règle avec un fait du cas.</text>'; })];
  S['resp-civile'] = ['Responsabilité civile : il faut réunir les trois conditions pour obtenir réparation.', svg(620, 130, function () {
    return box(5, 30, 160, 56, 'Fait générateur', 'faute, inexécution') + '<text class="sv-t" x="190" y="63" text-anchor="middle">+</text>' + box(215, 30, 160, 56, 'Dommage', 'certain, prouvé') +
      '<text class="sv-t" x="400" y="63" text-anchor="middle">+</text>' + box(425, 30, 190, 56, 'Lien de causalité', 'le fait a causé le dommage', 'sv-acc') +
      '<text class="sv-s" x="310" y="115" text-anchor="middle">Contractuelle (un contrat existe, art. 1231-1) ou extracontractuelle (art. 1240)</text>'; })];
  // E4 Management
  S.swot = ['SWOT : l\'interne en haut (forces, faiblesses), l\'externe en bas (opportunités, menaces).', svg(560, 250, function () { return '' +
    cell(10, 10, 265, 110, 'Forces (interne)', ['équipe experte en cybersécurité', 'clients fidèles'], 'sv-acc') + cell(285, 10, 265, 110, 'Faiblesses (interne)', ['faible notoriété', 'peu de commerciaux']) +
    cell(10, 130, 265, 110, 'Opportunités (externe)', ['obligations NIS2', 'demande en hausse'], 'sv-acc') + cell(285, 130, 265, 110, 'Menaces (externe)', ['concurrence des grands groupes', 'pénurie de techniciens']); })];
  S.porter = ['Les 5 forces de Porter mesurent l\'intensité de la concurrence dans un secteur.', svg(600, 260, function () { return '' +
    box(215, 100, 170, 60, 'Rivalité', 'entre concurrents', 'sv-acc') +
    box(215, 8, 170, 52, 'Nouveaux entrants', 'barrières à l\'entrée') + box(215, 200, 170, 52, 'Substituts', 'autres solutions') +
    box(5, 102, 160, 56, 'Fournisseurs', 'pouvoir de négociation') + box(435, 102, 160, 56, 'Clients', 'pouvoir de négociation') +
    arrow(300, 60, 300, 98) + arrow(300, 200, 300, 162) + arrow(165, 130, 213, 130) + arrow(435, 130, 387, 130); })];
  S.structures = ['Structure matricielle : chaque salarié dépend de deux responsables, son métier et son projet.', svg(600, 230, function () {
    var out = box(5, 10, 140, 44, 'Direction') + box(165, 10, 130, 44, 'Pôle Réseau') + box(310, 10, 130, 44, 'Pôle Dév') + box(455, 10, 130, 44, 'Pôle Support');
    ['Projet A', 'Projet B'].forEach(function (p, j) { out += box(5, 80 + j * 70, 140, 44, p, 'chef de projet', 'sv-acc'); [0, 1, 2].forEach(function (k) { out += '<circle class="sv-box" cx="' + (230 + k * 145) + '" cy="' + (102 + j * 70) + '" r="12"/>'; }); });
    [0, 1, 2].forEach(function (k) { out += '<line class="sv-a" x1="' + (230 + k * 145) + '" y1="54" x2="' + (230 + k * 145) + '" y2="160"/>'; });
    out += '<line class="sv-a" x1="145" y1="102" x2="520" y2="102"/><line class="sv-a" x1="145" y1="172" x2="520" y2="172"/>';
    return out + '<text class="sv-s" x="300" y="215" text-anchor="middle">Chaque point = un salarié : rattaché à un pôle (vertical) et à un projet (horizontal)</text>'; })];
  // E4 Économie
  S.plateforme = ['Une plateforme met en relation deux groupes ; plus un côté grandit, plus l\'autre est attiré (effet de réseau croisé).', svg(620, 170, function () { return '' +
    box(5, 50, 160, 60, 'Vendeurs', 'restaurants') + box(230, 50, 160, 60, 'Plateforme', 'commission', 'sv-acc') + box(455, 50, 160, 60, 'Acheteurs', 'clients') +
    arrow(165, 70, 228, 70) + arrow(228, 92, 167, 92) + arrow(390, 70, 453, 70) + arrow(453, 92, 392, 92) +
    '<text class="sv-s" x="310" y="145" text-anchor="middle">Plus de restaurants → plus de clients → encore plus de restaurants : tendance au « gagnant rafle tout »</text>'; })];
  // E3 Maths
  S.bases = ['Conversion de 172 : décomposer en puissances de 2, puis regrouper les bits par 4 pour l\'hexadécimal.', svg(620, 170, function () {
    var p = [128, 64, 32, 16, 8, 4, 2, 1], b = [1, 0, 1, 0, 1, 1, 0, 0], out = '';
    p.forEach(function (v, i) { out += '<text class="sv-s" x="' + (60 + i * 64) + '" y="22" text-anchor="middle">' + v + '</text>' + '<rect class="sv-box ' + (b[i] ? 'sv-acc' : '') + '" x="' + (36 + i * 64) + '" y="30" width="48" height="40" rx="6"/><text class="sv-t" x="' + (60 + i * 64) + '" y="56" text-anchor="middle">' + b[i] + '</text>'; });
    return out + '<text class="sv-s" x="310" y="95" text-anchor="middle">128 + 32 + 8 + 4 = 172</text>' +
      '<line class="sv-a" x1="36" y1="108" x2="276" y2="108"/><line class="sv-a" x1="292" y1="108" x2="532" y2="108"/>' +
      '<text class="sv-t" x="156" y="135" text-anchor="middle">1010 = A</text><text class="sv-t" x="412" y="135" text-anchor="middle">1100 = C</text><text class="sv-l" x="310" y="162" text-anchor="middle">172 = 1010 1100 (base 2) = AC (base 16)</text>'; })];
  S.pert = ['Ordonnancement : la date au plus tôt d\'une tâche est le MAXIMUM des fins de ses prédécesseurs ; le chemin critique n\'a aucune marge.', svg(640, 210, function () { return '' +
    box(5, 80, 90, 50, 'A (2 j)', 'début 0', 'sv-acc') + box(140, 20, 100, 50, 'B (3 j)', 'début 2', 'sv-acc') + box(140, 140, 100, 50, 'C (4 j)', 'début 2') +
    box(290, 20, 110, 50, 'D (10 j)', 'début 5', 'sv-acc') + box(450, 80, 90, 50, 'E (3 j)', 'max(6, 15) = 15', 'sv-acc') + box(570, 80, 65, 50, 'F (1 j)', '18 → 19', 'sv-acc') +
    arrow(95, 95, 138, 50) + arrow(95, 115, 138, 160) + arrow(240, 45, 288, 45) + arrow(400, 50, 448, 95) + arrow(240, 165, 448, 115) + arrow(540, 105, 568, 105) +
    '<text class="sv-s" x="320" y="205" text-anchor="middle">Chemin critique A → B → D → E → F = 19 jours · C a 9 jours de marge</text>'; })];
  // E3 Python
  S['py-trace'] = ['Faire tourner un programme à la main : une colonne par variable, une ligne par tour de boucle.', svg(600, 210, function () {
    var rows = [['avant', '—', '0'], ['tour 1', '0', '0'], ['tour 2', '1', '1'], ['tour 3', '2', '3']], out = '<text class="sv-t" x="20" y="24">s = 0</text><text class="sv-t" x="20" y="44">for i in range(3):</text><text class="sv-t" x="40" y="64">s = s + i</text><text class="sv-t" x="20" y="84">print(s)</text>';
    ['', 'i', 's'].forEach(function (h, j) { out += '<text class="sv-l" x="' + (290 + j * 100) + '" y="24" text-anchor="middle">' + h + '</text>'; });
    rows.forEach(function (r, i) { r.forEach(function (c, j) { out += '<rect class="sv-box ' + (i === 3 && j === 2 ? 'sv-acc' : '') + '" x="' + (245 + j * 100) + '" y="' + (32 + i * 38) + '" width="92" height="32" rx="5"/><text class="sv-s" x="' + (291 + j * 100) + '" y="' + (53 + i * 38) + '" text-anchor="middle">' + c + '</text>'; }); });
    return out + '<text class="sv-s" x="300" y="200" text-anchor="middle">range(3) donne 0, 1, 2 → affichage : 3</text>'; })];
  // E1 Culture générale
  S['cge-ecriture'] = ['Structure de l\'essai : une problématique, un plan, et dans chaque paragraphe un argument, un exemple précis et son explication.', svg(640, 220, function () { return '' +
    box(5, 10, 630, 40, 'Introduction : amorce · sujet · problématique · annonce du plan') +
    cell(5, 62, 205, 100, 'I. Oui…', ['argument + exemple', '+ explication']) + cell(217, 62, 205, 100, 'II. Mais…', ['argument + exemple', '+ explication']) + cell(429, 62, 206, 100, 'III. Dépassement', ['nuance, condition', '(facultatif)'], 'sv-acc') +
    box(5, 174, 630, 40, 'Conclusion : réponse nette à la problématique · ouverture'); })];
  // E2 Anglais
  S['ang-mail'] = ['La structure d\'un courriel professionnel en anglais, avec les formules toutes faites.', svg(600, 250, function () { return '' +
    cell(10, 8, 580, 44, 'Dear Ms Smith,', []) + cell(10, 58, 580, 52, 'I am writing to… / Further to your email of 3 May…', ['raison du message']) +
    cell(10, 116, 580, 52, 'We could… / Please find attached…', ['détails, propositions']) + cell(10, 174, 580, 36, 'I look forward to hearing from you.', [], 'sv-acc') +
    '<text class="sv-t" x="22" y="234">Kind regards, [Name]</text><text class="sv-s" x="590" y="234" text-anchor="end">Dear Sir or Madam → Yours faithfully</text>'; })];
  // E5
  S['e5-itil'] = ['Incident, problème, demande, changement : quatre façons de traiter ce qui arrive au service informatique.', svg(640, 230, function () { return '' +
    cell(10, 10, 300, 100, 'Incident', ['interruption ou dégradation', '→ rétablir vite (contournement)']) + cell(330, 10, 300, 100, 'Problème', ['cause d\'incidents répétés', '→ trouver et corriger la cause'], 'sv-acc') +
    cell(10, 120, 300, 100, 'Demande de service', ['besoin standard (compte, poste)', '→ traiter selon le catalogue']) + cell(330, 120, 300, 100, 'Changement', ['modification planifiée du SI', '→ tester, planifier, valider']) +
    arrow(310, 60, 328, 60); })];
  S['pentest-phases'] = ['Un test d\'intrusion avance du moins intrusif au plus intrusif, toujours dans le périmètre autorisé, et se termine par un rapport.', svg(910, 190, function () {
    var L = [['Cadrage', 'autorisation'], ['Reconnaissance', 'OSINT'], ['Scan', 'ports, services'], ['Vulnérabilités', 'CVE'], ['Exploitation', 'preuve'], ['Post-exploitation', 'impact'], ['Rapport', 'CVSS, actions']], out = '';
    L.forEach(function (p, i) { var x = 4 + i * 129; out += box(x, 40, 124, 54, p[0], p[1], i === 0 || i === 6 ? 'sv-acc' : '') + (i < 6 ? arrow(x + 124, 67, x + 128, 67) : ''); });
    out += '<line class="sv-a" x1="840" y1="96" x2="840" y2="130"/><line class="sv-a" x1="840" y1="130" x2="66" y2="130"/>' + arrow(66, 130, 66, 98);
    return out + '<text class="sv-s" x="455" y="150" text-anchor="middle">Contre-test après les corrections</text><text class="sv-s" x="455" y="178" text-anchor="middle">Sans autorisation écrite et périmètre défini : infraction (art. 323-1 du Code pénal)</text>'; })];
  window.SCHEMAS = S;
})();
