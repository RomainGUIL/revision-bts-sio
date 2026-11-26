/* TP DU RÉSEAU CERTA (rubrique « Côté labo ») — sélection écrite à la main pour la page « TP SISR et SLAM ».
   Source : https://www.reseaucerta.org/ressources/cote-labo/ (Réseau Certa, ministère de l'Éducation nationale, licence CC BY-NC-SA 4.0).
   Les consignes et fichiers des élèves sont en téléchargement libre sur la page de chaque TP ; les corrigés sont réservés aux enseignants.
   L'application ne recopie aucun fichier : elle renvoie vers la page du TP. Chaque lien a été vérifié (page existante, fichiers élèves accessibles
   sans compte) en novembre 2026. Écartés : les TP réservés aux comptes connectés (ex. « Attaque MITM d'un service SSH ») et les technologies
   abandonnées (jQuery Mobile, Windows Phone, AngularJS, Delphi, VB…).
   TP_CERTA : [id, option ('SISR' ou 'SLAM'), titre, adresse de la page (après reseaucerta.org/), année de publication (0 = non indiquée),
               intérêt (3 = indispensable, 2 = utile, 1 = complément), épreuves visées, pourquoi ce classement, thèmes de l'application liés] */
window.TP_CERTA = [
/* ── SLAM ── */
["c-owasp1", "SLAM", "OWASP 1 : les injections SQL (plateforme Mutillidae)", "owasp-activit-1-les-injections-sql", 2017, 3, "E7", "L'injection SQL est le thème le plus fréquent de l'E7 SLAM : tu réalises l'attaque puis tu lis le code corrigé.", "injection"],
["c-owasp2", "SLAM", "OWASP 2 : authentification et gestion des sessions", "owasp-activit-2-authentification-et-gestion-des-sessions", 2018, 3, "E7", "Sessions, cookies et mots de passe : questions classiques de l'E7 SLAM.", "auth mdp"],
["c-owasp3", "SLAM", "OWASP 3 : vulnérabilités de type XSS", "owasp-activit-3-vulnrabilits-de-type-xss", 2020, 3, "E7", "XSS et échappement de l'affichage : tombe très souvent en SLAM.", "xss"],
["c-owasp4", "SLAM", "OWASP 4 : brèche sur des informations confidentielles", "owasp-activit-4-brche-sur-des-informations-confidentielles", 2020, 2, "E7", "Fuite de données et contrôle d'accès côté serveur (IDOR), lien direct avec le RGPD.", "auth rgpd"],
["c-owasp5", "SLAM", "OWASP 5 : sécurisation des applications web", "owasp-activit-5-scurisation-des-applications-web", 2022, 2, "E7", "Corriger une application vulnérable : le réflexe attendu dans les réponses de l'E7.", "injection xss"],
["c-owasp6", "SLAM", "OWASP 6 : inclusion de fichiers locaux et distants", "owasp-activit-6-inclusion-de-fichiers-locaux-et-distants", 2023, 2, "E7", "Faille moins fréquente à l'examen, mais elle entraîne à valider toutes les entrées.", "injection"],
["c-owasp7", "SLAM", "OWASP 7 : défauts de configuration du chiffrement", "owasp-activit-7-dfauts-de-configurations-de-chiffrement", 2023, 2, "E7", "HTTPS, certificats et stockage des mots de passe : notions présentes dans de nombreux sujets.", "crypto mdp"],
["c-owasp8", "SLAM", "OWASP 8 : sécurisation des applications web (SSRF)", "owasp-activit-8-scurisation-des-applications-web", 2024, 1, "E7", "Faille plus avancée : à faire après les activités 1 à 5.", "injection"],
["c-owasp9", "SLAM", "OWASP 9 : sécuriser l'authentification d'une application web", "owasp-activite-9-securisation-des-applications-web-vulnerabilites", 2025, 3, "E7", "Le plus récent de la série, centré sur l'authentification : très proche des sujets actuels.", "auth mdp"],
["c-mvc", "SLAM", "Découverte du modèle MVC et de l'accès aux données en PHP", "dcouverte-du-patron-de-conception-mvc-et-de-laccs-aux-donnes-dans-une-application-web-en-php", 2016, 3, "E6", "L'architecture de la plupart des réalisations E6 SLAM ; le jury demande souvent de l'expliquer.", "code"],
["c-mysql", "SLAM", "Exploitation d'une base de données MySQL (données de l'ANSES)", "exploitation-dune-base-de-donnes-mysql", 2016, 2, "E6 E7", "Entraînement aux requêtes SQL sur de vraies données.", "sqlreq"],
["c-cicd", "SLAM", "Labo CI/CD avec Docker, Git et Jenkins", "labo-cicd-docker-git-jenkins", 2023, 2, "E6", "Tests et déploiement automatiques : un plus apprécié dans une réalisation E6.", "code"],
["c-git", "SLAM", "Utilisation de Git", "utilisation-de-git", 2021, 2, "E6 E5", "Versionner ses réalisations ; le jury regarde souvent l'historique des commits.", "code"],
["c-rgpd", "SLAM", "Mise en conformité au RGPD d'un site de vente en ligne", "mise-en-conformit-au-rgpd-dun-site-de-vente-en-ligne", 2021, 2, "E7", "Le RGPD est présent dans presque tous les sujets E7 (TP écrit pour d'autres BTS tertiaires, utilisable tel quel).", "rgpd"],
["c-kali1", "SLAM", "Kali Linux pour la cybersécurité (v1, contexte Box to Bed)", "utilisation-de-la-distribution-kali-dans-le-cadre-du-bloc-3-sur-la-cyberscurit-v1-contexte-box-to-bed", 2021, 1, "E7", "Découvrir les outils d'audit côté développeur ; complément des activités OWASP.", "injection"],
/* ── SISR ── */
["c-wazuh", "SISR", "Déployer un SIEM-XDR avec Wazuh", "deploiement-dun-siem-xdr-avec-wazuh", 2025, 3, "E7 E6", "Supervision, journaux centralisés et détection : thèmes très fréquents de l'E7 SISR.", "logs supervision"],
["c-bastion", "SISR", "Bastion d'administration des serveurs (Guacamole ou Wallix)", "deploiement-dune-solution-de-bastion-pour-ladministration-des-serveurs-avec-guacamole-ou-wallix", 2026, 3, "E7 E6", "Tracer et contrôler les accès administrateurs : solution souvent attendue dans les sujets récents.", "auth logs"],
["c-mfa-piv", "SISR", "Authentification forte par carte à puce (PIV) dans un domaine Windows", "authentification-multifacteur-forte-smartcard-piv-dans-un-domaine-windows", 2026, 2, "E7 E6", "MFA, certificats et GPO dans Active Directory : réalisation E6 solide.", "auth ad"],
["c-mfa", "SISR", "Authentification multifacteur", "authentification-multifacteur", 2024, 3, "E7", "Limites du mot de passe et MFA : question classique de l'E7.", "auth mdp"],
["c-messagerie", "SISR", "Messagerie sécurisée interne", "messagerie-securisee-interne", 2026, 2, "E6 E7", "Serveur de messagerie et chiffrement des échanges.", "crypto"],
["c-protocoles", "SISR", "Sécuriser les protocoles réseau : évaluer POP et SSH", "securisation-des-protocoles-reseaux-activite-1", 2025, 2, "E7", "Protocoles en clair et chiffrés : justification attendue dans les réponses E7.", "crypto filtrage"],
["c-cisco", "SISR", "Sécurisation d'un commutateur Cisco", "scurisation-dun-commutateur-cisco", 2024, 3, "E7 E6", "Port-security, VLAN et accès d'administration : thème « sécurité des commutateurs » de l'E7 SISR.", "switch archi"],
["c-utm", "SISR", "Mettre en œuvre un équipement de gestion unifiée des menaces (UTM)", "mise-en-uvre-dun-quipement-de-gestion-unifie-des-menaces-informatiques", 2023, 3, "E7 E6", "Pare-feu, filtrage et DMZ : thème central de l'E7 SISR.", "filtrage archi"],
["c-rancon", "SISR", "Simulation d'un rançongiciel avec PSRansom", "simulation-du-fonctionnement-dun-rancongiciel-ransomware-avec-psransom", 2025, 3, "E7", "Comprendre un rançongiciel pour justifier sauvegardes et contre-mesures.", "rancon sauvegarde"],
["c-sudo", "SISR", "Délégation de droits avec sudo et risques de contournement", "delegation-de-droits-avec-loutil-sudo-tentative-de-contournement-de-la-politique-de-securite", 2025, 2, "E7 E6", "Moindre privilège sous Linux.", "auth"],
["c-kali3", "SISR", "Kali Linux pour la cybersécurité (v3, laboratoires Docker)", "utilisation-de-la-distribution-kali-dans-le-cadre-du-bloc-3-sur-la-cyberscurit-avec-les-laboratoires-sur-docker-v3", 2026, 2, "E7", "Audit et test d'intrusion encadrés, en complément de la page « Tests d'intrusion ».", "malware incident"],
["c-docker", "SISR", "Déployer des services avec Docker et Docker Compose", "dploiement-de-services-avec-docker-et-docker-compose", 2024, 2, "E6", "Conteneurs : de plus en plus présents dans les réalisations E6.", "dispo"],
["c-8021x", "SISR", "Authentification réseau 802.1X", "authentification-reseau-8021x", 2014, 2, "E7 E6", "Ancien mais toujours au programme : contrôle d'accès au réseau avec RADIUS.", "auth wifi"],
["c-vrf", "SISR", "Routage virtuel avec VRF", "routage-virtuel-avec-vrf", 2018, 1, "E6", "Complément réseau avancé.", "archi"],
["c-nextcloud", "SISR", "Installation et sécurisation de Nextcloud", "ct-labo-installation-et-scurisation-de-nextcloud", 0, 1, "E6", "Exemple complet d'installation et de durcissement d'un service web.", "sauvegarde"]
];
