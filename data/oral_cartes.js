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

/* QCM du quiz chrono pour ces cartes (même format que data/qcm.js : [niveau, question, bonne réponse, 3 pièges]). */
Object.assign(window.QCM = window.QCM || {}, {
'oral-e5-1': [1, "À l'oral, la présentation de son parcours doit surtout…", "Être brève, structurée et annoncer ce qui va être montré", "Réciter le portfolio mot pour mot", "Durer le plus longtemps possible", "Lister toutes les technologies vues en cours"],
'oral-e5-2': [2, "Dans le portfolio, qu'est-ce qui relie les réalisations aux compétences ?", "Le tableau de synthèse du bloc 1", "La page de présentation personnelle", "La rubrique de veille technologique", "Le CV joint en annexe"],
'oral-e5-4': [2, "Face à « Internet ne marche plus », quelle démarche adopter ?", "Qualifier la demande puis tester du plus simple au plus complexe", "Réinstaller tout de suite le système du poste", "Redémarrer le serveur principal par précaution", "Changer le câble réseau sans poser de question"],
'oral-e5-5': [2, "Quelle est la différence entre un incident et un problème (ITIL) ?", "Un problème est la cause racine d'incidents répétés", "Un problème est un incident signalé par un client", "Un incident concerne le matériel, un problème le logiciel", "Un incident est toujours plus grave qu'un problème"],
'oral-e5-6': [2, "Sur quels critères prioriser un ticket ?", "L'impact et l'urgence", "L'ordre d'arrivée uniquement", "L'ancienneté de l'utilisateur", "La facilité de résolution"],
'oral-e5-7': [1, "À quoi sert un outil comme GLPI dans la gestion du parc ?", "Inventorier matériels, logiciels et licences et suivre leur cycle de vie", "Filtrer le trafic entre le réseau interne et Internet", "Sauvegarder automatiquement les postes", "Héberger le site web de l'entreprise"],
'oral-e5-8': [2, "Comment vérifier le respect des licences logicielles ?", "Comparer l'inventaire des installations aux licences achetées", "Désactiver toutes les mises à jour des logiciels", "Demander à chaque utilisateur ce qu'il a installé", "Vérifier les factures d'électricité des postes"],
'oral-e5-9': [1, "Quelle source est la plus fiable pour une veille en cybersécurité ?", "Les bulletins du CERT-FR et de l'ANSSI", "Un forum anonyme sans modération", "Une publicité pour un antivirus", "Une vidéo virale sans auteur identifié"],
'oral-e5-10': [2, "Pour justifier un sujet de veille, le jury attend surtout…", "Un lien avec l'option ou l'entreprise et des évolutions précises", "Le sujet le plus populaire sur les réseaux sociaux", "Un sujet sans rapport avec l'informatique", "Le nombre d'articles lus, sans analyse"],
'oral-e5-12': [2, "Quelle étape vient avant de mettre un nouveau service à disposition ?", "La recette : tests et validation avec les utilisateurs", "La suppression de l'ancien service sans prévenir", "La mise en production un vendredi soir", "La désactivation du support utilisateur"],
'oral-e5-13': [2, "Quelle obligation concerne la présence en ligne d'une entreprise ?", "Mentions légales et consentement aux cookies", "Publier les mots de passe des administrateurs", "Être présente sur tous les réseaux sociaux", "Afficher les adresses IP des visiteurs"],
'oral-e5-14': [2, "Quelle mesure sécurise un poste avant sa remise à l'utilisateur ?", "Un compte utilisateur sans droits d'administrateur", "Le pare-feu désactivé pour éviter les blocages", "Un mot de passe administrateur commun à tous", "Les mises à jour automatiques coupées"],
'oral-e5-16': [1, "À « Qu'auriez-vous fait différemment ? », la meilleure réponse…", "Cite une difficulté, ce qu'on en a appris et l'amélioration envisagée", "Affirme que tout était parfait", "Rejette la faute sur le tuteur de stage", "Évite de répondre et change de sujet"],
'oral-e5-17': [1, "Quel moyen permet de développer ses compétences professionnelles ?", "Un MOOC ou une certification, comme SecNumacadémie de l'ANSSI", "Arrêter la veille après l'examen", "Ne garder aucune trace de ses réalisations", "Attendre que l'employeur décide de tout"],
'oral-e5-18': [2, "Un utilisateur refuse la nouvelle procédure de mot de passe : que faire d'abord ?", "Écouter et expliquer les risques, en rappelant la charte", "Bloquer son compte sans explication", "Lui donner une dérogation définitive", "Changer son mot de passe à son insu"],
'oral-e6sisr-2': [2, "Comment justifier le choix d'une solution technique devant le jury ?", "Comparer plusieurs solutions selon le besoin, le coût et la sécurité", "Dire que c'est la solution vue en cours", "Choisir la solution la plus chère", "Dire que c'est la seule qui existe"],
'oral-e6sisr-3': [3, "Le serveur DHCP est sur un autre VLAN : que faut-il configurer ?", "Un relais DHCP (ip helper) sur l'interface du nouveau VLAN", "Un second serveur DNS dans le VLAN", "Le NAT sur le port du switch", "Une adresse IP fixe sur tous les postes"],
'oral-e6sisr-4': [2, "Un poste ne joint pas le serveur : par quoi commencer ?", "Le lien et la configuration IP, puis un ping de la passerelle", "La réinstallation du serveur", "La modification des règles de pare-feu au hasard", "Le remplacement du switch"],
'oral-e6sisr-5': [2, "Que répondre à « Que se passe-t-il si ce serveur tombe en panne ? »", "Identifier le point unique de défaillance et proposer une redondance", "Dire que cela n'arrive jamais", "Proposer d'éteindre le serveur la nuit", "Répondre que l'utilisateur doit patienter"],
'oral-e6sisr-6': [3, "Où se configure le mappage d'un lecteur réseau par GPO ?", "Configuration utilisateur > Préférences > Mappages de lecteurs", "Configuration ordinateur > Paramètres de sécurité > Pare-feu", "Dans le serveur DHCP, option 6", "Dans les propriétés de la carte réseau"],
'oral-e6sisr-7': [2, "Quel mécanisme remplace l'adresse privée par l'adresse publique vers Internet ?", "Le NAT", "Le DHCP", "Le VLAN", "Le DNS"],
'oral-e6sisr-8': [2, "Que dit la règle de sauvegarde 3-2-1 ?", "3 copies, sur 2 supports différents, dont 1 hors site", "3 sauvegardes par jour, 2 par semaine, 1 par mois", "3 serveurs, 2 disques, 1 administrateur", "3 restaurations testées par an"],
'oral-e6sisr-9': [2, "Règle pour n'autoriser que le web vers le serveur de la DMZ ?", "TCP 80 et 443 vers le serveur, puis refus par défaut", "Tous les ports vers le serveur, sans règle de refus", "UDP 53 vers le serveur uniquement", "TCP 22 et 3389 vers toute la DMZ"],
'oral-e6sisr-10': [2, "Quelle version de SNMP choisir pour superviser de façon sécurisée ?", "SNMPv3, qui authentifie et chiffre", "SNMPv1, la plus simple", "SNMPv2c avec la communauté « public »", "Aucune : SNMP ne sert pas à la supervision"],
'oral-e6sisr-12': [2, "Quelle différence entre une machine virtuelle et un conteneur ?", "Le conteneur partage le noyau de l'hôte ; la VM a son propre système", "La VM est plus légère et démarre plus vite", "Le conteneur exige un hyperviseur de type 1", "Il n'y a aucune différence d'isolement"],
'oral-e6sisr-13': [1, "Quel protocole utiliser pour administrer un équipement à distance ?", "SSH", "Telnet", "FTP", "HTTP"],
'oral-e6sisr-14': [1, "Que contient un plan de tests ?", "Le résultat attendu, le résultat obtenu et les preuves", "Uniquement la liste du matériel acheté", "Les mots de passe des équipements", "Le planning des congés de l'équipe"],
'oral-e6sisr-15': [2, "Quel masque pour un réseau de 50 postes (sans gaspiller) ?", "/26 (255.255.255.192), 62 adresses utilisables", "/27 (255.255.255.224), 30 adresses utilisables", "/24 (255.255.255.0), 254 adresses utilisables", "/28 (255.255.255.240), 14 adresses utilisables"],
'oral-e6sisr-16': [2, "Les noms internes ne se résolvent plus : quelle vérification faire ?", "Le serveur DNS distribué aux postes (option DHCP 6) et la zone", "La vitesse du lien Internet", "La version du navigateur web", "Le fond d'écran imposé par GPO"],
'oral-e6sisr-17': [1, "Comment un nomade accède-t-il aux ressources internes en sécurité ?", "Par un VPN avec une authentification forte", "En ouvrant les partages réseau sur Internet", "Par le Wi-Fi invité de l'entreprise", "En envoyant les fichiers par courriel personnel"],
'oral-e6slam-2': [1, "Dans une architecture MVC, quel rôle joue le contrôleur ?", "Recevoir la requête, appeler le modèle et choisir la vue", "Stocker les données dans la base", "Afficher la page HTML", "Chiffrer les mots de passe"],
'oral-e6slam-3': [2, "Ajouter un champ jusqu'à la base : par quoi commencer côté SQL ?", "ALTER TABLE … ADD la nouvelle colonne", "DROP TABLE puis recréer la table", "UPDATE de toutes les lignes existantes", "GRANT ALL sur la table"],
'oral-e6slam-4': [1, "Quelle protection est la plus efficace contre l'injection SQL ?", "Les requêtes préparées avec paramètres liés", "Masquer les messages d'erreur", "Un mot de passe complexe pour la base", "Le protocole HTTPS"],
'oral-e6slam-5': [2, "Comment stocker les mots de passe en PHP ?", "password_hash (bcrypt ou Argon2) puis password_verify", "md5 du mot de passe", "Chiffrement réversible avec une clé dans le code", "En clair dans une table protégée"],
'oral-e6slam-6': [2, "Quelle clause filtre les clients ayant plus de 3 commandes ?", "HAVING COUNT(*) > 3 après le GROUP BY", "WHERE COUNT(*) > 3", "ORDER BY COUNT(*) > 3", "LIMIT 3"],
'oral-e6slam-8': [3, "Qu'est-ce qui distingue une interface d'une classe abstraite ?", "Une classe peut implémenter plusieurs interfaces", "Une interface peut être instanciée", "Une classe abstraite ne contient aucun code", "Une interface hérite toujours d'une classe"],
'oral-e6slam-9': [2, "À quoi servent les tests de non-régression ?", "Vérifier qu'une modification ne casse pas l'existant", "Mesurer la vitesse du serveur", "Tester l'ergonomie avec des utilisateurs", "Remplacer la documentation"],
'oral-e6slam-10': [1, "Avec Git, comment développer une fonctionnalité proprement ?", "Dans une branche dédiée, fusionnée après validation", "Directement sur le serveur de production", "Avec un seul commit à la fin du projet", "En copiant le dossier avec la date dans le nom"],
'oral-e6slam-11': [2, "Comment empêcher de voir les données d'un autre en changeant l'id dans l'URL ?", "Vérifier côté serveur que l'objet appartient à l'utilisateur connecté", "Masquer l'identifiant dans un champ caché", "Encoder l'identifiant en base 64", "Désactiver le bouton « Retour » du navigateur"],
'oral-e6slam-12': [2, "Quelle mesure protège contre le XSS ?", "Échapper les données à l'affichage (htmlspecialchars)", "Utiliser des requêtes préparées uniquement", "Hacher les mots de passe", "Limiter le nombre de connexions"],
'oral-e6slam-13': [2, "Pourquoi créer une table d'association ?", "Pour une association plusieurs-à-plusieurs entre deux entités", "Pour une association un-à-un", "Pour stocker les mots de passe à part", "Pour remplacer les clés primaires"],
'oral-e6slam-14': [2, "Quelle différence entre les codes HTTP 401 et 403 ?", "401 : non authentifié ; 403 : authentifié mais non autorisé", "401 : ressource introuvable ; 403 : erreur serveur", "401 : requête réussie ; 403 : ressource créée", "Aucune, ce sont deux noms du même code"],
'oral-e6slam-15': [2, "Où placer les secrets (mot de passe de la base) en production ?", "Dans des variables d'environnement, hors du code et du dépôt Git", "En dur dans le code source versionné", "Dans un commentaire de la page d'accueil", "Dans le fichier README du projet"],
'oral-e6slam-16': [1, "À « Qu'amélioreriez-vous ? », que montrer au jury ?", "Un recul critique : tests, sécurité ou ergonomie à renforcer", "Que l'application est parfaite", "Que le sujet était mal choisi par l'entreprise", "Que le temps manquait, sans plus de détail"]
});

/* Réponse courte au dos de la carte (même rôle que data/flash.js). */
Object.assign(window.FLASH_SIMPLE = window.FLASH_SIMPLE || {}, {
'oral-e5-1': "Deux minutes, sans lire : formation, entreprise, missions, projet, puis ce que tu vas montrer.",
'oral-e5-2': "Présentation, parcours, réalisations, veille, compétences ; le tableau de synthèse relie chaque réalisation au bloc 1.",
'oral-e5-4': "Qualifier (ticket, qui est touché), tester du plus simple au plus complexe (lien, ipconfig, ping, nslookup), résoudre, informer, clôturer.",
'oral-e5-5': "Incident : service à rétablir vite. Problème : cause racine d'incidents répétés.",
'oral-e5-6': "Impact × urgence : ce qui bloque un service passe avant une demande individuelle, dans le respect des SLA.",
'oral-e5-7': "Inventaire outillé (GLPI, OCS), suivi matériels, logiciels, licences et cycle de vie jusqu'au recyclage.",
'oral-e5-8': "Comparer installations et licences achetées (GLPI), puis désinstaller ou acheter.",
'oral-e5-9': "Un sujet précis, des sources fiables (CERT-FR, ANSSI), des outils (RSS, alertes), et ce que tu en as tiré.",
'oral-e5-10': "Lien avec ton option ou ton entreprise, évolutions récentes précises, ton analyse.",
'oral-e5-12': "Recette, documentation, communication, accompagnement, support, mesure de satisfaction.",
'oral-e5-13': "Site, réseaux sociaux, référencement, e-réputation, conformité légale, et ta contribution.",
'oral-e5-14': "Mises à jour, antivirus, compte sans droits admin, chiffrement, domaine et GPO, inventaire.",
'oral-e5-16': "Une difficulté réelle, ce que tu en as appris, ce que tu améliorerais.",
'oral-e5-17': "Veille, MOOC ou certifications, portfolio à jour, projet après le BTS.",
'oral-e5-18': "Écouter, expliquer les risques, rappeler la charte, aider (gestionnaire de mots de passe), escalader si besoin.",
'oral-e6sisr-2': "Comparer 2 ou 3 solutions (coût, sécurité, compétences) et justifier par le besoin.",
'oral-e6sisr-3': "VLAN sur le switch et le trunk, interface sur le routeur, étendue DHCP, relais si besoin, test.",
'oral-e6sisr-4': "Par couches : lien, ipconfig, ping passerelle puis serveur, DNS, pare-feu, service à l'écoute.",
'oral-e6sisr-5': "Point unique de défaillance : impact, redondance, sauvegarde et restauration.",
'oral-e6sisr-6': "Préférences utilisateur > Mappages de lecteurs, liée à l'OU Comptabilité ; gpupdate, gpresult.",
'oral-e6sisr-7': "Poste, switch, passerelle, filtrage, NAT vers l'adresse publique, FAI ; retour par la table NAT.",
'oral-e6sisr-8': "Outil, fréquence, rétention, règle 3-2-1, RPO/RTO et restauration testée.",
'oral-e6sisr-9': "TCP 80/443 vers l'IP du serveur, autoriser ; refus par défaut en dessous.",
'oral-e6sisr-10': "Zabbix ou Centreon, SNMPv3, indicateurs, seuils et alertes.",
'oral-e6sisr-12': "VM : système complet, isolement fort. Conteneur : noyau partagé, léger.",
'oral-e6sisr-13': "SSH, comptes nominatifs, clés ou mots de passe forts, réseau d'administration, journaux.",
'oral-e6sisr-14': "Plan de tests (attendu, obtenu, preuves) et documentation technique.",
'oral-e6sisr-15': "51 adresses nécessaires : /26 (255.255.255.192), 62 utilisables.",
'oral-e6sisr-16': "Service DNS, DNS des postes (option 6), zone, redirecteurs, nslookup.",
'oral-e6sisr-17': "VPN d'accès distant avec MFA, accès filtré et journalisé.",
'oral-e6slam-2': "Client, serveur et base ; MVC ; accès aux données par PDO ou ORM.",
'oral-e6slam-3': "ALTER TABLE, classe, vue, contrôleur avec validation, requête préparée, test.",
'oral-e6slam-4': "Requêtes préparées partout, compte SQL limité, exemple de code.",
'oral-e6slam-5': "password_hash et password_verify (bcrypt, Argon2), sel intégré.",
'oral-e6slam-6': "GROUP BY client HAVING COUNT(*) > 3.",
'oral-e6slam-8': "Abstraite : code commun, héritage simple. Interface : contrat, plusieurs possibles.",
'oral-e6slam-9': "Tests unitaires, fonctionnels, cas limites et non-régression.",
'oral-e6slam-10': "Dépôt distant, branche par fonctionnalité, commits clairs, fusion.",
'oral-e6slam-11': "Vérifier côté serveur que l'objet appartient à l'utilisateur, sinon 403.",
'oral-e6slam-12': "Échapper à l'affichage, valider les entrées, HttpOnly, CSP.",
'oral-e6slam-13': "Cardinalités, clés ; table d'association pour un plusieurs-à-plusieurs.",
'oral-e6slam-14': "200, 201, 204, 400, 401 (non authentifié), 403 (interdit), 404, 500.",
'oral-e6slam-15': "Serveur web, code depuis Git, secrets en variables d'environnement, HTTPS, sauvegarde.",
'oral-e6slam-16': "Recul critique : tests, sécurité, ergonomie, performances, documentation."
});
