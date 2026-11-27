/* VIDÉOS DE COURS — vidéos YouTube intégrées (lecteur youtube-nocookie : rien n'est chargé avant le clic sur « Lire »).
   Aucune vidéo ni capture d'écran n'est copiée dans l'application : la vidéo reste sur la chaîne de son auteur, qui garde ses vues.
   VIDEOS : id de la notion -> [ [identifiant YouTube, titre, chaîne, début en secondes (0 = depuis le début)], … ]
            Vidéos choisies une à une (novembre 2026) parmi les chaînes éducatives francophones (Cookie connecté, IT-Connect, Formip,
            Grafikart, Hack & Dev avec Rémi, Cybermalveillance.gouv.fr, Yvan Monka, Xerfi, Jurixio…), en français sauf pour l'anglais ;
            titre et chaîne vérifiés auprès de YouTube, et seules les vidéos dont l'auteur autorise l'intégration sont gardées.
   VIDEO_CHAINES : matière -> recherches conseillées quand une notion n'a pas encore de vidéo.
   Chaque élève peut ajouter ses propres « passages » (un moment précis de la vidéo + une note) : ils sont enregistrés dans sa progression. */
window.VIDEOS = {
  "risque": [
    ["XYmA-HyGCME", "EBIOS RM : la méthode de l’ANSSI expliquée en 5 ateliers", "Phinasoft", 0]
  ],
  "ebios": [
    ["gASD6AFECzM", "EBIOS Risk Manager : comprendre la méthode de gestion des risques de l’ANSSI", "La chaine cybersécurité, PACS et PASSI", 0],
    ["XYmA-HyGCME", "EBIOS RM : la méthode de l’ANSSI expliquée en 5 ateliers", "Phinasoft", 0]
  ],
  "menace": [
    ["XvdSTFaaH1o", "Cours de Cyber Securite: Definition (Vulnerabilite, Menace, Risque, Attaque, Contre-Mesure)", "LA CYBER SECURITE POUR LES NULS", 0]
  ],
  "rgpd-principes": [
    ["Di0T9tOUd7U", "Qu'est-ce que le RGPD ? L'essentiel à savoir en 5 minutes", "CustUp", 0],
    ["8cHczlG1ZMY", "RGPD : tout comprendre en 3 min", "Captain Contrat - la plateforme des entrepreneurs", 0]
  ],
  "rgpd-dcp": [
    ["nTkiR5LQBKw", "RGPD : qu'est ce qu'une donnée à caractère personnel ?", "Debora Cohen", 0],
    ["y3OB2sb1Mi8", "RGPD : Qu'est ce qu'une donnée sensible ?", "Leto", 0]
  ],
  "rgpd-droits": [
    ["U_ZOaJdMnYA", "[RGPD] Le droit d'accès aux données à caractère personnel", "Debora Cohen", 0]
  ],
  "rgpd-violation": [
    ["Mhd9AwpU2As", "Violation de données : 72 heures pour notifier la CNIL, le chrono expliqué", "Leto", 0],
    ["MTZO4D74QJU", "Fuite de données dans une TPE : que faire, qui prévenir ?", "Elginux", 0]
  ],
  "rgpd-acteurs": [
    ["iZmnLGG6Pc8", "Les principaux acteurs du RGPD : les identifier et connaître leurs responsabilités", "Coorpacademy", 0],
    ["VVDoWvAb470", "RGPD : les acteurs des traitements", "Mon pote DPO", 0]
  ],
  "cookies": [
    ["jUXeYF7aNH0", "Internet : enfin comprendre les cookies en 3 minutes", "La Boîte info | Votre formation informatique", 0],
    ["J-1s-ONitRc", "🍪 Sécurité web : SessionID, Cookies et Authentification !", "Hafnium - Sécurité informatique", 0]
  ],
  "logs": [
    ["vp1l1DQbCr8", "#391 L'obligation de journalisation du système d'information (4/5) la délibération de la CNIL 2021", "Technique et droit du numérique", 0]
  ],
  "hachage": [
    ["pdrdUjMx3ug", "Hachage vs Chiffrement : ne fais plus jamais cette erreur", "Lionel | Analyste Concepteur Web", 0],
    ["aTe_iqpjclA", "Cryptographie V4 · Le hachage et les mots de passe", "Jimmy LEFEVRE", 0]
  ],
  "moindre-privilege": [
    ["rApg-3qBhxY", "1 20  Présentation du principe du moindre privilège", "WEWANTCODE", 0]
  ],
  "sym-asym": [
    ["_YNQcA_qzJ0", "Je t'explique le chiffrement Symétrique et Asymétrique. Et c'est très simple en fait !!!", "Hack & Dev avec Rémi", 0],
    ["Kimgcc8slMI", "Chiffrement symétrique ou asymétrique, quelle différence ?", "Digital Learning Solution", 0]
  ],
  "signature": [
    ["Sx7ZNDppxQc", "PKI - Introduction aux PKI : la cryptographie - Signature numérique", "ENI Informatique", 0],
    ["L3CGoi_4eqo", "Comprendre la signature électronique 🔑 Blockchain : enjeux et mécanismes cryptographiques", "MOOC de l'IMT", 0]
  ],
  "certificat": [
    ["-dHbXLR-Mao", "Qu'est ce qu'un certificat SSL/TLS ? | Cryptographie, PKI, Openssl", "Techno", 0],
    ["7W7WPMX7arI", "Comprendre le chiffrement SSL / TLS avec des emojis (et le HTTPS)", "Cookie connecté", 0]
  ],
  "tls": [
    ["WD5oqjZXJFo", "Comprendre le TLS Handshake 🤝", "Hack & Dev avec Rémi", 0],
    ["7W7WPMX7arI", "Comprendre le chiffrement SSL / TLS avec des emojis (et le HTTPS)", "Cookie connecté", 0]
  ],
  "phishing": [
    ["JuWSYr0m3GE", "Cybermalveillance.gouv.fr - Hameçonnage/Phishing : comment ne pas se faire avoir ?", "Cybermalveillance-gouv-fr", 0],
    ["VT-7aAid1iA", "Cybermalveillance.gouv.fr  - Comment reconnaître un message de phishing ?", "Cybermalveillance-gouv-fr", 0]
  ],
  "attaques": [
    ["VpSUSx_B8iM", "Les différents types de Cyberattaques : Tout comprendre !", "CyberUniversity", 0],
    ["k3rnKaizTgs", "Les 8 principaux types d’attaques en cybersécurité", "ROVERBA CGS", 0]
  ],
  "cve": [
    ["H_on7VL26WA", "Cybersécurité : les 3 types de vulnérabilités", "Agesys", 0],
    ["VlY1cUz8F2k", "CVE, CVSS et CWE : La différence expliquée simplement (Indispensable en Cybersécurité !)", "The Cyber Conscious", 0]
  ],
  "sauvegarde": [
    ["xtks1mM0QfI", "Sauvegarde : qu'est-ce que la règle 3-2-1 ?", "IT-Connect - Florian", 0],
    ["g2fYkPKb0vY", "La sauvegarde incrémentielle et différentielle", "IT-Connect - Florian", 0]
  ],
  "archivage": [
    ["i_t5-PFjqFw", "Sauvegarde VS Archivage : des pratiques complémentaires", "Watsoft", 0]
  ],
  "pca": [
    ["im0PoreK4e4", "Quelle est la vraie différence entre PRA et PCA ?", "Compliance Without Coma", 0],
    ["HQCkDiesWzE", "RTO, RPO et bilan d'impact | Continuité d'activité #2", "Bitdyne", 0]
  ],
  "stad": [
    ["bcJrsY2HRaY", "La première loi sur la cybercriminalité. Par Jacques Godfrain - Cercle K2", "Cercle K2", 0]
  ],
  "anssi": [
    ["OstmDZoAsNY", "L’ANSSI, le CERT, et le SOC expliqué en 3 minutes. 📜", "ACM", 0],
    ["zGVM7myTE6E", "42 règles ANSSI : L'essentiel pour tout Admin Système et Réseau", "Clemanet - Tutoriels Réseaux & Systèmes", 0]
  ],
  "pentest": [
    ["OKqyyl_lEKs", "Déroulement d'un PENTEST étape par étape | GUIDE À SUIVRE", "Michel Kartner", 0],
    ["yjhGUGDNpzE", "Les étapes du test d'intrusion web : repérage, reconnaissance et vulnérabilités", "OpenClassrooms en Français", 0]
  ],
  "pentest-legal": [
    ["R-RuzioEHg8", "Comprendre les Tests d'Intrusion en Sécurité Informatique", "OpenClassrooms en Français", 0],
    ["88qQIz_N9kQ", "PASSI : comprendre les 7 étapes d’un audit de sécurité", "La chaine cybersécurité, PACS et PASSI", 0]
  ],
  "pentest-phases": [
    ["yjhGUGDNpzE", "Les étapes du test d'intrusion web : repérage, reconnaissance et vulnérabilités", "OpenClassrooms en Français", 0],
    ["qf8y_CvKzG8", "DevTuto - Les 5 phases d'un test d'intrusion", "Dev TuTo", 0]
  ],
  "boites": [
    ["OKqyyl_lEKs", "Déroulement d'un PENTEST étape par étape | GUIDE À SUIVRE", "Michel Kartner", 0]
  ],
  "vuln-scan": [
    ["CrqonmC8-_Q", "Tutoriel Nessus - Comment utiliser un scanner de vulnérabilités ?", "Over Shell", 0],
    ["ETkNHA2O-M0", "OpenVAS : Scan de Vulnérabilité d'un serveur sous Linux Debian", "Clemanet - Tutoriels Réseaux & Systèmes", 0]
  ],
  "cvss": [
    ["VlY1cUz8F2k", "CVE, CVSS et CWE : La différence expliquée simplement (Indispensable en Cybersécurité !)", "The Cyber Conscious", 0]
  ],
  "durcissement": [
    ["zGVM7myTE6E", "42 règles ANSSI : L'essentiel pour tout Admin Système et Réseau", "Clemanet - Tutoriels Réseaux & Systèmes", 0],
    ["bu2qvgkKozY", "Comment Sécuriser un Serveur Linux : IONOS, SSH Hardening & Fail2ban", "Maxwell TB Tech", 0]
  ],
  "parefeu": [
    ["6Swt51w3EjY", "Firewall : comprendre l'essentiel en 7 minutes", "Cookie connecté", 0],
    ["0lCVOhvmmbc", "Techniques de filtrage", "CFDL_BTS_SIO", 0]
  ],
  "ports": [
    ["YSl6bordSh8", "Ports et protocoles : comprendre l'essentiel en 5 minutes", "Cookie connecté", 0],
    ["412GPLMt9tk", "Les ports réseau : Qu'est ce que c'est ? A quoi ça sert ? Comment ça fonctionne ?", "Hugo FORTIER : Tech / Tests / Vulgarisation", 0]
  ],
  "dmz": [
    ["mY-TvNXFHl0", "La DMZ expliquée en dessins", "Cookie connecté", 0],
    ["cLw-7v6Mld8", "Informatique : la notion de DMZ pour les débutants", "IT-Connect - Florian", 0]
  ],
  "portsec": [
    ["07uU30LNAsU", "Configurer Port Security en 5 Minutes pour Protéger Votre Réseau", "Formip - Certification IT", 0],
    ["bD8DzYWWg8c", "Configurer le Port Security sur un switch Cisco", "Sina-IRS", 0]
  ],
  "8021x": [
    ["eWypCjoiFbk", "Serveur AAA :  #Les5MinutesDuProfesseurAudenard", "Orange Business", 0],
    ["4PRJ9_yjYpc", "Comprendre le mode de fonctionnement du serveur AAA [RADIUS et TACACS]", "Médiateur Mukindjwa", 0]
  ],
  "wifi": [
    ["CWALplWwOKk", "WEP, WPA, WPA2... Quel est le meilleur pour ton réseau ?", "Formip - Certification IT", 0],
    ["JmCadrWt1ag", "Configuration du Portail Captif sur pfSense", "Dirtech IT", 0]
  ],
  "incident": [
    ["MEwWaePdctg", "Réponse à incident : Stratégies complètes de détection à la restauration du système", "Over Shell", 0],
    ["G-Nheqap02M", "Cyber - La réponse à incident : comment réagir en cas de crise cyber ?", "Capgemini France", 0]
  ],
  "ioc": [
    ["rkCFsG0QCF4", "Qu'est ce que les IOC - Indicateur de compromission", "Over Shell", 0]
  ],
  "ids": [
    ["bG8Xb02Lrs4", "IDS / IPS expliqués en dessins", "Cookie connecté", 0],
    ["iXn4hjS3SSs", "EDR : comprendre l'essentiel en 5 minutes", "Cookie connecté", 0],
    ["mr3M8mkWEyY", "Antivirus vs EDR vs XDR - Comprendre les Différences et Faire un Choix Éclairé", "Hack & Dev avec Rémi", 0]
  ],
  "snmp": [
    ["G7XOn2IPYQ0", "SNMP expliqué simplement pour surveiller tous tes équipements !", "Formip - Certification IT", 0]
  ],
  "ha": [
    ["V_uScneo-cs", "Formation : Loadbalacing et haute disponibilité avec Haproxy + Squid + Keepalived", "eazytraining", 0],
    ["HxQidx8lXM8", "HAPROXY - 14. Keepalived & Haute Disponibilité (vip)", "xavki", 0]
  ],
  "ad": [
    ["EScBNh0zNQU", "Protéger votre Active Directory avec Ping Castle.", "DotCybersec", 0],
    ["lray-_l3HqU", "PingCastle - La sécurisation de l'Active Directory", "Wilson ESD", 0]
  ],
  "proxy": [
    ["MpP02aZPSNQ", "Comprendre le Proxy et le Reverse Proxy en 5 minutes", "Cookie connecté", 0],
    ["_PmlQolhMqs", "Proxy et Reverse Proxy pour les débutants", "IT-Connect - Florian", 0]
  ],
  "sqli": [
    ["sIsjlfBZVzo", "#2 Comprendre l'injection SQL en 2 minutes | AppSec Academy", "Nakama", 0],
    ["L5sxOh-o3AM", "PDO en PHP : Bloquez les Injections SQL avec les Requêtes Préparées ! 🔐", "The Coding Lab", 0]
  ],
  "prepare": [
    ["0PuK-mgNS8I", "#2 PHP - UTILISER PDO POUR FAIRE UNE REQUETE PREPAREE", "TutoDev", 0],
    ["SdFANLAbsOc", "11 - Débuter en PHP - Les requêtes préparées - PDO (PHP8)", "Nouvelle Techno", 0]
  ],
  "xss": [
    ["SzWtrFUflQU", "Tout ce qu'il faut savoir sur les failles XSS en 5 minutes !!!", "Hack & Dev avec Rémi", 0],
    ["fbw_nkSlNco", "Sécuriser ses applications web : Les failles XSS", "Grafikart.fr", 0]
  ],
  "csrf": [
    ["UxmXhnrYv8k", "Tout ce qu'il faut savoir sur les failles CSRF en 5 minutes !!!", "Hack & Dev avec Rémi", 0],
    ["xsnBRYZnBUc", "Sécuriser ses applications web : Attaques CSRF", "Grafikart.fr", 0]
  ],
  "owasp": [
    ["xe9LN2w7hfE", "OWASP top 10 2021 : quelles sont les 10 vulnérabilités web les plus critiques? | exemples inclus", "Techno", 0]
  ],
  "idor": [
    ["ZLulekP-OqE", "[Sécurité Web OWASP] 🛡️ Appliquer les bonnes pratiques de contrôle d'accès", "Alphorm", 0],
    ["aVlBaxikKOQ", "Contrôle d'accès brisé - Théorie - OWASP - Piratage éthique - Cybersécurité", "Atomrace", 0]
  ],
  "transaction": [
    ["cMhyQhv_FkE", "Transactions SQL : COMMIT, ROLLBACK et ACID Expliqués Simplement ! 🚀", "The Coding Lab", 0]
  ],
  "vue": [
    ["0pe3XzbjdxA", "Apprendre et maitriser SQL : Les vues", "Grafikart.fr", 0]
  ],
  "modele": [
    ["OxJo051TMr8", "Apprendre et maitriser SQL : Schématiser avec les MCD & MLD", "Grafikart.fr", 0],
    ["FwlWAV2HmHU", "#21 Les règles de passage MCD à MLD (Règle 1) | MERISE: Cours et exercices corrigés", "Nacer RAMMI", 0]
  ],
  "jwt": [
    ["5qNfPBcogCs", "C'est quoi un JWT ?", "Kodaps - apprendre à coder", 0],
    ["S-xBAo47W58", "Tutoriel  : Découverte du JWT", "Grafikart.fr", 0]
  ],
  "http": [
    ["Ybs4qIBZHHk", "API REST : c'est quoi ? Le cours complet (verbes, codes HTTP, pièges)", "ItSkillsMaker", 0],
    ["SC4sEiBje1Q", "C'est quoi une API REST ?", "Kodaps - apprendre à coder", 0]
  ],
  "tests": [
    ["JDjZeLuT59s", "À quoi servent les tests unitaires ?", "Docstring", 0],
    ["ashfoywo9xc", "Tutoriel PHP - Tests unitaires, PHPUnit", "Grafikart.fr", 0]
  ],
  "mvc": [
    ["gs-61l4Z32M", "L'architecture MVC c'est quoi ?", "Bande de Codeurs", 0],
    ["6HKtXWq_VEU", "Le modèle MVC en PHP : routeur, contrôleur, vue, modèle et base de données", "AdServ Formation", 0]
  ],
  "raisonnement": [
    ["K9zxgSJ_uiI", "CEJM - Comment répondre en droit ? (Méthodologie)", "Ernest", 0],
    ["ZDAoGJgkrRg", "Cas pratique : comment faire le syllogisme parfait ?", "Jurixio - Les vidéos de droit", 0]
  ],
  "resp-civile": [
    ["SJDbolSoFCA", "DIFFÉRENCE entre responsabilités CONTRACTUELLE et DÉLICTUELLE 🔤", "Dictionnaire juridique en vidéo", 0],
    ["5EMagKRHPXg", "La responsabilité contractuelle : définition, conditions et effets", "Maxime Bizeau - Fiches-droit․com", 0]
  ],
  "oblig": [
    ["z8dcyVmfw4A", "Obligation de moyen et obligation de résultat (définition, exemples)", "Jurixio - Les vidéos de droit", 0],
    ["wyLEduNzUcw", "Obligation de moyens et obligation de résultat", "Madame fait du droit", 0]
  ],
  "inexecution": [
    ["UWfAmX_YZJs", "Qu'est-ce que l’Inexécution du contrat et ses sanctions ?", "FNEGE Médias", 0],
    ["m4DrNW3whBk", "Les sanctions de l’inexécution du contrat : Droit des obligations CRFPA & L2 droit", "Constance Mosnier - Cours de droit en vidéos", 0]
  ],
  "contrat-travail": [
    ["o0KfE-0c_rU", "TOUT SAVOIR SUR LES CLAUSES DU CONTRAT DE TRAVAIL POUR LE DCG", "TOUT SAVOIR DCG", 0],
    ["jm7CdwLUBBc", "Quelles sont les clauses contractuelles à mettre dans un contrat de travail ?", "Wuro", 0]
  ],
  "pi": [
    ["dCjOnXZwVbU", "Comment PROTÉGER JURIDIQUEMENT votre LOGICIEL (3 minutes pour comprendre)", "Emilie VERGNE Avocat", 0],
    ["8Z1zSweUSsY", "Les fondamentaux de la protection juridique des logiciels", "DIAG N'GROW", 0]
  ],
  "preuve": [
    ["muzVKgaFY5I", "T4C5 La preuve électronique, le contrat électronique et", "Eco-Gestion CEJM", 0],
    ["ZCzYiHLySh8", "CEJM Thème 4 Chapitre 20 : Preuve et Contrat électroniques et Contrats de prestations numériques", "Révisio Express", 0]
  ],
  "licenciement": [
    ["N-LIQDmkfCc", "Qu'est-ce qu'un licenciement pour motif personnel ?", "Lefebvre Dalloz", 0],
    ["LM3zdfxGT7Y", "Le licenciement pour motif économique - Cours de droit du travail", "Jurixio - Les vidéos de droit", 0]
  ],
  "rupture-conv": [
    ["L-SmqVKFFUE", "Rupture conventionnelle : quels sont vos droits à indemnités ?", "LE DROIT POUR MOI", 0]
  ],
  "surveillance": [
    ["FtMCOGfvjRU", "La surveillance des salariés par la vidéo - Au nom de la loi", "ANews Sécurité", 0],
    ["mzTEfDAgo7I", "La Minute RH : la vidéosurveillance en entreprise", "Com ACCIOR", 0]
  ],
  "donnees-salaries": [
    ["_sIdSY3WN18", "#36 JT du Social | L'utilisation des données de l'ordinateur professionnel du salarié", "Cabinet Flichy Grangé Avocats", 0]
  ],
  "pestel": [
    ["ELqqq7LLNoQ", "Analyse PESTEL (Exemple inclus)", "StrategeMarketing", 0],
    ["5m7UFj20k-M", "AIDE BTS MCO | Comment faire une analyse PESTEL en Management ? | CULTURE MANAGERIALE BTS", "AIDE BTS MCO | Fiches de révision du BTS MCO", 0]
  ],
  "swot": [
    ["SN7AX--FCYU", "L'analyse SWOT (exemple inclus)", "StrategeMarketing", 0],
    ["SronlIFCkks", "Comprendre l'analyse SWOT avec un exemple (FFOM)", "Dgboost", 0]
  ],
  "porter": [
    ["C49lzjjNgtY", "Les 5 forces de Porter (exemple inclus)", "StrategeMarketing", 0],
    ["kmHfyybz99o", "Comprendre les 5 forces de Porter [Philippe Gattet]", "Xerfi", 0]
  ],
  "strat-globale": [
    ["tpadxf4OMSM", "AIDE BTS MCO | Quelles sont les 4 stratégies globales ? | CULTURE MANAGERIALE BTS", "AIDE BTS MCO | Fiches de révision du BTS MCO", 0],
    ["I_h2G87ZR1w", "Stratégie : se spécialiser ou se diversifier ? [Frédéric Fréry]", "Xerfi", 0]
  ],
  "strat-domaine": [
    ["ZuPx7Ntu0tQ", "Révisions MANAGEMENT #22 - Stratégies globales et stratégies de domaine | AIDE BTS MUC | BTS MCO", "AIDE BTS MCO | Fiches de révision du BTS MCO", 0],
    ["iHLYFmKI67k", "Domaines d'Activité Stratégique (DAS), Stratégies Globales & Stratégies de Domaine - Management STMG", "Cap STMG", 0]
  ],
  "herzberg": [
    ["9ywLp_2CVls", "La théorie de Herzberg : Motivation et satisfaction au travail expliquées simplement", "Eco-Gest", 0],
    ["0WCKaD6cN-w", "La théorie des deux facteurs d'Herzberg", "L'odyssée des organisations", 0]
  ],
  "rse": [
    ["iYO8Kzl6Bjc", "Comprendre la RSE (Responsabilité Sociétale des Entreprises) en quelques minutes - part 1", "Rate A Company - la RSE avec les parties prenantes", 0],
    ["346JwwEnpPs", "Vidéo explicative : la Responsabilité Sociétale de l'Entreprise (RSE)", "La vidéo qui explique", 0]
  ],
  "structures": [
    ["Fn5kEFJodBU", "Thème 3 - Chapitre 1 : La structure de l'entreprise", "bacstmg.fr", 0],
    ["2-jZ7HH2-Fg", "Comprendre les organisations matricielles [Cathy Alegria]", "Xerfi", 0]
  ],
  "management-styles": [
    ["fCP3aR0eYhM", "AIDE BTS MCO | Quels sont les 4 styles de direction selon LIKERT ? | CULTURE MANAGERIALE BTS", "AIDE BTS MCO | Fiches de révision du BTS MCO", 0],
    ["rAj2DBi3Zu4", "LES 4 TYPES DE MANAGEMENT - Directif, Persuasif, Participatif, Délégatif", "Maher MEFTAHI", 0]
  ],
  "grh": [
    ["i5rOLxqrGTo", "GPEC : définition, mise en place et enjeux", "Julien Godefroy [Réussir Son Management]", 0],
    ["tlMJctjKK6E", "Entretien Professionnel : Présentation, Réalisation et Objectifs", "Julien Godefroy [Réussir Son Management]", 0]
  ],
  "marche": [
    ["TbecEnbZMgY", "Le fonctionnement des marchés en 2 minutes | BTS CEJM", "Educform31", 0],
    ["V9pqff5u91Q", "CEJM - Le marché - Comment ça fonctionne ? Loi de l'offre et de la demande (avec un exemple)", "Ernest", 0]
  ],
  "plateforme": [
    ["6ckYsr7Pc3M", "Comprendre : les effets de réseau [Philippe Gattet]", "Xerfi", 0],
    ["pdQlYaJ9x8o", "Comprendre les stratégies de marché biface [Philippe Gattet]", "Xerfi", 0]
  ],
  "asymetrie": [
    ["hJPPDf5vKgU", "Le marché est défaillant en présence d'asymétries d'information", "Les SES en vidéos", 0],
    ["ePYBL1QI54M", "L’ASYMÉTRIE D’INFORMATION - LEELOO", "Leeloo", 0]
  ],
  "concurrence": [
    ["gMZH3gXZ6hk", "Droit de la concurrence | Entente, position dominante et concurrence déloyale", "Risques & Méthodes", 0],
    ["oJcCYzRbpV4", "Un abus de position dominante, c'est quoi ? (définition, aide, lexique, tuto, explication)", "Infonet", 0]
  ],
  "financement": [
    ["M-anRXL9RGs", "CEJM - Th3 Chap7 : Le financement de l'entreprise", "Frédéric Mesny", 0],
    ["17qHqAc0N4A", "Le financement de l'entreprise en 3 minutes | BTS CEJM", "Educform31", 0]
  ],
  "innovation": [
    ["yhIdXwd3CKs", "SCHUMPETER, L'ENTREPRENEUR ET LA DESTRUCTION CREATRICE | DME", "Draw my economy", 0],
    ["3T1nxpW-fDQ", "T'as Capté ? - Episode 21 : La destruction créatrice", "Cité de l'Économie (Citéco)", 0]
  ],
  "numerique-emploi": [
    ["arJYCSSznEE", "🤖 Robots et emplois : faut-il avoir peur de l’automatisation ? | Le vrai impact sur nos emplois", "les amis de la Techno-sciences", 0],
    ["qO3EqKtDZAk", "L'automatisation va-t-elle prendre votre emploi ?", "ZDNet.fr", 0]
  ],
  "bases": [
    ["FLXZKfkGNUo", "la numération: les conversion entre les différentes bases BTS SIO", "Barakah ", 0],
    ["jU49zvp6Rsg", "Conversion entre Base Binaire et Hexadécimale", "Mathrix", 0]
  ],
  "bool": [
    ["C5z_EWnMjOI", "L'algèbre de Boole - SI - 1ère - Les Bons Profs", "Les Bons Profs", 0],
    ["mxjkr1oLKMw", "Théorèmes de Boole et lois de De Morgan - Algèbre de Boole", "Mohamed Chiny", 0]
  ],
  "congruence": [
    ["DGz1aeaLUBU", "CONGRUENCES EN BTS SIO.", "Saïd Chermak", 0],
    ["BTCsGN6xwXg", "Utiliser les congruences - Terminale - Maths expertes", "Yvan Monka", 0]
  ],
  "matrices": [
    ["yRBCx3uxN9A", "Déterminer la matrice d'adjacence (graphe orienté) - Terminale - Maths expertes", "Yvan Monka", 0],
    ["CjcYCtHF29A", "Comment déterminer la matrice d'adjacence d'un graphe ?", "Mathemax", 0]
  ],
  "karnaugh": [
    ["2tULBk6V9ZE", "Tableaux de Karnaugh - simplification d'expression en algèbre de Boole", "Méthode Maths", 0],
    ["3eS4EYZiaow", "Systèmes numériques : Tableaux de Karnaugh. Simplification des équations logiques", "Eric Peronnin", 0]
  ],
  "predicats": [
    ["a5_9_38MGBY", "Implications, réciproques et contraposées - Maths - MPSI 1ère année - Les Bons Profs", "Les Bons Profs SUP", 0],
    ["BarDPiPP_EU", "Quantificateur • Négation d'une proposition • nier ∀ quel que soit ∃ il existe ⇒ implication • MPSI", "jaicompris Maths", 0]
  ],
  "premiers": [
    ["2bIK1KkQ1k0", "Déterminer le PGCD et le PPCM par décomposition - Terminale - Maths expertes", "Yvan Monka", 0],
    ["NGrAFTa1TFA", "Comment DÉCOMPOSER UN NOMBRE en FACTEURS PREMIERS ? ✅ Troisième", "Paul Olivier", 0]
  ],
  "rsa": [
    ["PmKrQf7B0oM", "CODER / DÉCODER à l'aide d'un CHIFFREMENT AFFINE - Terminale - Maths expertes", "Yvan Monka", 0],
    ["Pl4FaV5GZvc", "Déterminer un inverse modulo n - Terminale - Maths expertes", "Yvan Monka", 0]
  ],
  "calcmat": [
    ["ZOtgQxB5NXI", "Calculer le produit de deux matrices carrées - Terminale - Maths expertes", "Yvan Monka", 0],
    ["6s-xmyjLpIM", "Cours: savoir calculer le produit de 2 matrices et connaitre les propriétés - Spé maths - IMPORTANT", "jaicompris Maths", 0]
  ],
  "graphes": [
    ["T91KQQ1vpvY", "Comment modéliser une situation avec un graphe orienté ?", "Mathemax", 0],
    ["apwUCIOJ25U", "REPRÉSENTER UN GRAPHE : Matrice adjacente, successeurs et prédécesseurs - Terminale NSI", "NOVELCLASS", 0]
  ],
  "suites": [
    ["05UHsy9G4M4", "LE COURS : Suites arithmétiques, suites géométriques - Première", "Yvan Monka", 0],
    ["rdSxmqatY1g", "5 minutes avant ton contrôle - Fiche sur les suites", "Hedacademy", 0]
  ],
  "algo": [
    ["i_imOJ9Vw0U", "Utiliser les boucles - Tutoriel Python #4/7", "Yvan Monka", 0],
    ["BrknhzrHm8w", "APPRENDRE LE PYTHON #5 ? LES BOUCLES", "Graven - Développement", 0]
  ],
  "py-types": [
    ["HNDHYFJ1W0M", "STR, INT, FLOAT : tout sur la conversion de types en Python !", "Ingénieur IA", 0]
  ],
  "py-cond": [
    ["5K2lwktygt4", "cours python • if elif else • condition • programmation • tutoriel • lycée", "jaicompris Maths", 0]
  ],
  "py-boucles": [
    ["i_imOJ9Vw0U", "Utiliser les boucles - Tutoriel Python #4/7", "Yvan Monka", 0],
    ["4AY3YiduC14", "cours python • boucle for ... in range(...) • programmation • tutoriel • lycée", "jaicompris Maths", 0]
  ],
  "py-dict": [
    ["a10AeJ_o-44", "Python : Les dictionnaires", "Docstring", 0],
    ["0pgYBjW1OVM", "Apprendre le Python #11 - Les Dictionnaires", "Graven - Développement", 0]
  ],
  "py-fonctions": [
    ["qquR6IeN_FQ", "Les fonctions en Python pour débutants | def, return et exercices", "CodeAndProd", 0],
    ["RxEswYUgbLI", "Les 4 DIFFÉRENCES entre print et return en Python", "Captain Carré", 0]
  ],
  "py-algos": [
    ["ts8V166auSI", "Comment écrire l'algorithme d'Euclide en Python ?", "Mathemax", 0],
    ["GRspofhTrfQ", "Appliquer l'algorithme d'Euclide (Version collège) - Tale Maths expertes", "Yvan Monka", 0]
  ],
  "py-trace": [
    ["ZLNhqxUlM68", "Algorithmique - Traces Algorithmes #Algo07", "Loïc & Julien", 0]
  ],
  "cge-epreuve": [
    ["0ULH_7m6tgA", "[BTS - CGE] Méthode du Corpus : Comment Réussir l’Exercice 1de CGE - Le Corpus en 4 Étapes", "Tarik Le Formateur", 0],
    ["lGJi4as-KkE", "[BTS - CGE] Méthode de l'Essai : Comment Réussir l’Exercice2 de CGE - L'Essai PARTIE 1", "Tarik Le Formateur", 0]
  ],
  "cge-synthese": [
    ["0ULH_7m6tgA", "[BTS - CGE] Méthode du Corpus : Comment Réussir l’Exercice 1de CGE - Le Corpus en 4 Étapes", "Tarik Le Formateur", 0]
  ],
  "cge-intro": [
    ["uLuoQl0X37A", "Méthode d'analyse de photos", "Genaro Bardy", 0],
    ["gVia6YYSe6k", "LE CADRAGE ET LA COMPOSITION DE L'IMAGE - Théorie Photo & Cinéma", "CINEASTUCES", 0]
  ],
  "cge-ecriture": [
    ["lGJi4as-KkE", "[BTS - CGE] Méthode de l'Essai : Comment Réussir l’Exercice2 de CGE - L'Essai PARTIE 1", "Tarik Le Formateur", 0],
    ["ckaDXDnYlU8", "CGE L'essai argumenté", "Florent Castronovo", 0]
  ],
  "cge-refs": [
    ["17PL0lYEJFI", "Comment savoir si quelque chose est vrai ? | Le vrai du faux — Épisode 1", "Le Micro de Samuel", 0],
    ["OlJS7tVEw1Y", "Le faux peut-il dire la vérité ?  Episode 3 - Le vrai du faux", "Le Micro de Samuel", 0]
  ],
  "cge-langue": [
    ["0YBfoK7li3c", "CES, SES ou C'EST ? | Ne te trompe plus entre ces homophones grammaticaux !", "Français avec Pierre", 0],
    ["F3hQH2oUYOI", "Homophones ce se", "Ben Explique", 0]
  ],
  "cge-theme": [
    ["zBST0qa9eXw", "BTS Culture Générale et Expression 2027 : Le vrai du faux #CGE #BTS.mp4", "Ystor", 0],
    ["B9Lsreo9its", "Pourquoi le faux peut-il nous convaincre ? | Le vrai du faux — Épisode 2", "Le Micro de Samuel", 0],
    ["LKMgjMv0Ap8", "POURQUOI FABRIQUONS-NOUS DU FAUX ?Le vrai du faux — Épisode 4", "Le Micro de Samuel", 0]
  ],
  "ang-epreuve": [
    ["MnuUKMBd9wA", "Oral d'anglais en BTS : 5 conseils indispensables", "Quentin", 0],
    ["VIBd455QRnQ", "Réussir l'oral d'anglais en BTS (+ 3 erreurs à éviter)", "Quentin", 0]
  ],
  "ang-cr": [
    ["hj8kOZdwRf0", "BTS TERTIAIRE T’Épreuve écrite d’anglais  partie 1 Compréhension compte rendu Anglais Français", "Edouard Tesfighting", 0],
    ["mxXg_snyXjY", "Méthodologie de la compréhension écrite - Anglais - Terminale - Les Bons Profs", "Les Bons Profs", 0]
  ],
  "ang-mail": [
    ["gjqmdcThcns", "21 Phrases For Formal Emails - Business English (FREE E-phrasebook)", "Derek Callan - English for Professionals", 0],
    ["3Tu1jN65slw", "How to write professional emails in English", "English with Alex · engVid", 0]
  ],
  "ang-vocab1": [
    ["VYtCLC3hKXE", "Cybersecurity Vocabulary | Essential  Cybersecurity Terms Explained", "InfoZillien", 0],
    ["S0yY-3rAge8", "What is cybersecurity? Learn cybersecurity in English with real-life examples! 🔐 Ep 1", "English for Cybersecurity", 0]
  ],
  "ang-vocab2": [
    ["ZbrdJRMCJ5w", "Apprenez Facilement Le Vocabulaire Technique Anglais", "KodjoEnglish", 0]
  ],
  "ang-liens": [
    ["zDNr4a1YmNo", "Les mots de liaison les plus courants en anglais", "Léa English", 0],
    ["WgCidbjHsBE", "Les Mots de Liaisons en Anglais : Le Cours Complet", "ISpeakSpokeSpoken", 0]
  ],
  "ang-oral": [
    ["MnuUKMBd9wA", "Oral d'anglais en BTS : 5 conseils indispensables", "Quentin", 0]
  ],
  "ang-temps": [
    ["IOfawFMpahw", "Present perfect or past simple tense?", "Perfect English Grammar", 0],
    ["VY5nh_-1phQ", "'I've done' or 'I did'? Ask BBC Learning English", "BBC Learning English", 0]
  ],
  "ang-phrasal": [
    ["RTAwB-5Fv48", "💻 Technology: Phrasal verbs with Georgie", "BBC Learning English", 0],
    ["DBoXPBMVcBY", "Tech Phrasal Verbs for Real Life: Log In, Back Up and More (Phrasal Verb Series, Part 6)", "LEARN ENGLISH FAST English Snacks with Amber", 0]
  ],
  "ang-opinion": [
    ["I5l7e6oW-GM", "Phrases for expressing an opinion", "British Council | LearnEnglish Teens", 0],
    ["LmDOQbwwlhw", "How to Express Your Opinion in English", "Learn English with Bob the Canadian", 0]
  ],
  "ang-describe": [
    ["4lxA7lo9GLU", "How to talk about charts and graphs in English (advanced English lessons)", "Skyrocket English ", 0],
    ["tApPdt_Y8jE", "DESCRIBING GRAPHS IN ENGLISH 📊 | Great for IELTS, TOEFL, or Business Presentations", "Interactive English", 0]
  ],
  "ang-vocab3": [
    ["7CCaA8lfJkU", "Dealing with IT support - 44 - English at Work deals with your computer crisis!", "BBC Learning English", 0]
  ],
  "e5-epreuve": [
    ["XypYgI-9XBY", "Réussir l'épreuve E5 du BTS SIO : Simulation de la Phase 1 en 10 minutes chrono !", "M. LEBOURGEOIS Fabien", 0],
    ["guQCXl2C58A", "BTS SIO : épreuve E5", "E mds", 0]
  ],
  "e5-portfolio": [
    ["lbYF-10Fcjs", "Video Epreuve E5   portefeuille de compétences", "Jean-Maxime Riedel", 0],
    ["XypYgI-9XBY", "Réussir l'épreuve E5 du BTS SIO : Simulation de la Phase 1 en 10 minutes chrono !", "M. LEBOURGEOIS Fabien", 0]
  ],
  "e5-bloc1": [
    ["guQCXl2C58A", "BTS SIO : épreuve E5", "E mds", 0]
  ],
  "e5-patrimoine": [
    ["6ewwzRXsYKA", "Tout savoir sur GLPI (Gestionnaire Libre de Parc Informatique) #glpi #components #monitoring #ticket", "Leonel Awouma", 0],
    ["Z7A2YUP492U", "05-09 Inventaire GLPI", "GLPI Start to Pro & architecture des ordinateurs", 0]
  ],
  "e5-itil": [
    ["h_qtXWAs5PE", "ITIL : comprendre la différence entre incidents et problèmes", "Thibault Carrier", 0],
    ["jTOTX7YEp14", "Bonnes pratiques ITIL et la gestion des incidents", "C2", 0]
  ],
  "e5-projet": [
    ["fFuEBet16fk", "MÉTHODES AGILES : TOUT COMPRENDRE EN 5 MINUTES", "Le chef de projet", 0],
    ["anZcEIQlpoY", "SCRUM La méthode agile en 10 minutes (Projet agile)", "StrategeMarketing", 0]
  ],
  "e5-veille": [
    ["LZd33n8w_ts", "Pourquoi et comment faire sa veille informatique / technologique ?", "Tech2Tech - Mikaël", 0]
  ],
  "e5-ticket": [
    ["uC2X-BmnNYA", "Gestion des Tickets GLPI", "GLPI Start to Pro & architecture des ordinateurs", 0],
    ["WJKM2sOrC5s", "06-04 Configurer les Niveaux de Services (SLA & SLO) pour une gestion des tickets optimisée (GLPI )", "GLPI Start to Pro & architecture des ordinateurs", 0]
  ],
  "e5-service": [
    ["nfNG2LfxbbA", "Recette utilisateur : 5 étapes pour préparer vos tests d’acceptance", "Best Of Business Analyst", 0]
  ],
  "e5-presence": [
    ["ksgXnRQGoJ4", "Référencement naturel et E-reputation", "Confédération Nationale du Tourisme Maroc - CNT", 0],
    ["0MaOVW__mfc", "🏆 E-RÉPUTATION : comment se mettre GOOGLE dans la POCHE ? ❤️ 1, 2, 3 moteur ! #06", "Eskimoz", 0]
  ],
  "e6s-epreuve": [
    ["Aa1amn9zxUM", "BTS SIO : épreuve E6", "E mds", 0],
    ["9KGk8EazifI", "🚀 Comment RÉUSSIR son ÉPREUVE E6 🚀", "Etudiant Informatique", 0]
  ],
  "e6s-services": [
    ["yH9UvkeAz-I", "Comprendre le DHCP en 3 minutes", "Cookie connecté", 0],
    ["qzWdzAvfBoo", "Comprendre le DNS en 5 minutes", "Cookie connecté", 0]
  ],
  "e6s-virtu": [
    ["4J_00mQ5BAs", "Comprendre la virtualisation en 7 minutes", "Cookie connecté", 0],
    ["YlrdJK6EbEM", "Virtualisation : les hyperviseurs de type 1 et de type 2", "IT-Connect - Florian", 0],
    ["aN4PCILrbBg", "La vraie différence entre une machine virtuelle et un conteneur.", "cocadmin", 0]
  ],
  "e6s-raid": [
    ["WqGeTOt6A0Q", "Comprendre le RAID en 5 minutes", "Cookie connecté", 0],
    ["b142jwXW9NA", "RAID expliqué simplement pour protéger tes fichiers !", "Formip - Certification IT", 0]
  ],
  "e6s-annuaire": [
    ["nhW-0qZzjy4", "Comprendre l'Active Directory en 7 minutes", "Cookie connecté", 0],
    ["EB6IYcVqQSI", "Active Directory : Qu'est-ce qu'une stratégie de groupe / GPO ?", "IT-Connect - Florian", 0]
  ],
  "e6d-epreuve": [
    ["N-0-aqJ_988", "L'EPREUVE PRATIQUE E6 AU BTS SIO OPTION SLAM", "Formation", 0],
    ["Aa1amn9zxUM", "BTS SIO : épreuve E6", "E mds", 0]
  ],
  "e6d-poo": [
    ["gABYMZbfGok", "La Programmation Orientée Objet expliquée en 5 minutes", "Bande de Codeurs", 0],
    ["zirWzDy2yM4", "Héritage et Polymorphisme, Programmation Orienté Objet.", "philogeo tics", 0]
  ],
  "e6d-uml": [
    ["8VMMu-vcF60", "UML - Diagrammes de classes - 1. Classes et associations", "Delphine Longuet", 0],
    ["GC5BdRve38A", "UML - Cas d'utilisation - 1. Diagrammes de cas d'utilisation", "Delphine Longuet", 0]
  ],
  "e6d-norm": [
    ["58T-ILX-hks", "#17 Les 3 formes normales | MERISE: Cours et exercices corrigés", "Nacer RAMMI", 0],
    ["FwlWAV2HmHU", "#21 Les règles de passage MCD à MLD (Règle 1) | MERISE: Cours et exercices corrigés", "Nacer RAMMI", 0]
  ],
  "e6d-jointure": [
    ["s5hXALXyv1I", "Utiliser INNER JOIN & LEFT OUTER JOIN dans une requête SQL", "Antoine Moulin", 0]
  ],
  "e6d-git": [
    ["gp_k0UVOYMw", "LES BASES DE GIT (tuto débutant)", "Graven - Développement", 0],
    ["iZ55m9ieSCo", "Git - Comprendre le système de branches en 7 minutes (tutoriel complet pour débutant)", "Guillaume Dev • Développement web", 0]
  ],
  "dicp": [
    ["ZZuvwwNqAvI", "La Triade CIA : Renseignement ou Sécurité ?", "Formip - Certification IT", 0],
    ["KRnbOoww1pE", "MasterClass Cybersécurité Partie 1 : Disponibilité, Intégrité, Confidentialité et Traçabilités", "Yelentic", 0]
  ],
  "mdp-politique": [
    ["sG9LtCBQWs8", "Cybermalveillance.gouv.fr - Pourquoi et comment gérer ses mots de passe ?", "Cybermalveillance-gouv-fr", 0],
    ["62EMdrFqX-o", "Pensez cybersécurité | Créez un mot de passe robuste", "Centre de la sécurité des télécommunications", 0]
  ],
  "mfa": [
    ["4GQxevlvFG8", "Qu'est-ce que la double authentification ?", "Cybermalveillance-gouv-fr", 0],
    ["j3hsSNvw32M", "Comment les Hackers CONTOURNENT la Double Authentification (2FA) par SMS ?", "Parlons Cyber", 0]
  ],
  "rancon": [
    ["aO4TgkWPu4Y", "La sécurité numérique, ça se prépare - les rançongiciels", "Cybermalveillance-gouv-fr", 0],
    ["U0fSWq6Zuu0", "Rançongiciels : comment ils piratent nos ordinateurs", "Le Monde", 0]
  ],
  "charte": [
    ["lky112FpZsw", "Charte informatique : pourquoi est-elle essentielle en entreprise ?", "Olfeo TV", 0],
    ["w0e9fHH8UNo", "Charte informatique - Décryptage", "Eurécia", 0]
  ],
  "osint": [
    ["AZvLBSlwCgo", "OSINT : Comment démarrer ? | Deviens bon en renseignements, Episode 1", "Techno", 0],
    ["i4PmAPVgxFE", "L'OSINT c'est du renseignement et on t'explique comment ça marche", "Konbini", 0]
  ],
  "vlan": [
    ["Eh9INNkMM4I", "VLAN : comprendre l'essentiel en 5 minutes", "Cookie connecté", 0],
    ["8cT3gHDKtqw", "VLAN : Le secret de la segmentation réseau révélé !", "Formip - Certification IT", 0],
    ["UjAPnPaEOkE", "Le routage inter-VLAN expliqué : faire communiquer vos VLANs | Finger In The Net", "Finger In The Net", 0]
  ],
  "l2": [
    ["6SVVgYlKYgo", "Comprendre l'attaque ARP spoofing en 10 minutes chrono !", "Formip - Certification IT", 0],
    ["16VO0wc8HfM", "💻 La faille du protocole ARP et les Attaques Man-in-the-middle.", "Hafnium - Sécurité informatique", 0]
  ],
  "vpn": [
    ["z0406rZQWfU", "Les VPN pour les débutants", "IT-Connect - Florian", 0],
    ["IWss3sGV4mI", "Comment FONCTIONNE un VPN ?", "Enissay ✔️", 0]
  ],
  "ecommerce": [
    ["mUKmL-d1MNY", "Comment fonctionne le droit de rétractation de 14 jours ?", "Campus Région du numérique", 0],
    ["ZahhBBIj4Oo", "Consomag: \"Le droit de rétractation en toutes circonstances?\"", "ConsoMag", 0]
  ],
  "changement": [
    ["soMfXmf5GGU", "Réussir une conduite du changement [4 principes clés]", "Best Of Business Analyst", 0],
    ["olD1RX29W7I", "Conduite du Changement : Le Guide Complet pour Réussir (Modèles Kotter, Lewin, ADKAR)", "ACADEMY CARREFOURDUWEB", 0]
  ],
  "statuts": [
    ["1Uts-yOEaVg", "Dessine-moi l'éco : quel statut juridique pour une entreprise ?", "Dessine-moi l'éco", 0],
    ["3Gi61VmGOMA", "Les différences entre SAS et SARL", "Nathan ROTHMAN", 0]
  ],
  "ensembles": [
    ["hWkIwXXEECc", "Arrangement, permutation, combinaison... : lequel choisir ? - Terminale", "Yvan Monka", 0],
    ["_ip2dV_BUTM", "Utiliser les combinaisons pour dénombrer - Terminale", "Yvan Monka", 0]
  ],
  "pert": [
    ["xAidvykSNXo", "Les clés de la réussite - Le graphe PERT", "Objectif BTS Hachette", 0],
    ["_OZeJG-UMGw", "Le réseau Pert : une méthode d'ordonnancement | Gestion de projet", "5 minutes pour réussir", 0]
  ],
  "cge-biblio": [
    ["zBST0qa9eXw", "BTS Culture Générale et Expression 2027 : Le vrai du faux #CGE #BTS.mp4", "Ystor", 0]
  ],
  "cge-notions27": [
    ["17PL0lYEJFI", "Comment savoir si quelque chose est vrai ? | Le vrai du faux — Épisode 1", "Le Micro de Samuel", 0]
  ],
  "e6s-ip": [
    ["77UpQCuVVUY", "Comprendre les masques de sous-réseau en 5 minutes !", "Formip - Certification IT", 0],
    ["nYPtY-14M88", "Subnetting IPv4 : Comprendre le découpage en 25 minutes", "Formip - Certification IT", 0]
  ],
  "e6s-routage": [
    ["jq3SLuhIyPI", "Comprendre le NAT / PAT en 7 minutes", "Cookie connecté", 0],
    ["pS5zp9eBeq8", "Réseau : le NAT et le PAT pour les débutants", "IT-Connect - Florian", 0]
  ],
  "e6s-scripts": [
    ["oGmLu2k_s9I", "Initiation à la Création de Scripts : Guide Complet pour Débutants", "Formip - Certification IT", 0],
    ["PIJIzePX8_M", "Powershell : Comment démarrer RAPIDEMENT (C'est très simple)", "Techno", 0]
  ],
  "e6d-archi": [
    ["mTNeYrJP-k0", "Informatique de gestion - l'architecture client-serveur : L'architecture 3 tiers", "Performance Éducation", 0],
    ["1B92-94eB-A", "Schéma d'architecture 3 tiers", "Manu Pavy", 0]
  ],
  "e6d-qualite": [
    ["o2nwLSKhhHo", "Qu'est-ce que la dette technique ? - Scrum Life 54", "Scrum Life - Lean, Agile, Kanban", 0],
    ["FS8kXM5AQfw", "Codez Plus Vite et Mieux : Améliorez votre code pas à pas (Guide Refactoring complet pour débutants)", "Codeur Senior", 0]
  ]
};
window.VIDEO_CHAINES = {
  'cyber': ['Cookie connecté', 'Cybermalveillance.gouv.fr'], 'sisr': ['Cookie connecté', 'IT-Connect', 'Formip'], 'slam': ['Grafikart', 'Hack & Dev avec Rémi'],
  'droit': ['Jurixio', 'CEJM BTS'], 'mgmt': ['Xerfi', 'CEJM BTS'], 'eco': ['Xerfi', 'CEJM BTS'], 'maths': ['Yvan Monka', 'BTS SIO maths'], 'algo': ['Yvan Monka Python', 'Docstring Python'],
  'cge': ['BTS culture générale'], 'anglais': ['BBC Learning English', 'BTS anglais'], 'e5': ['BTS SIO E5'], 'e6sisr': ['IT-Connect', 'BTS SIO E6 SISR'], 'e6slam': ['Grafikart', 'BTS SIO E6 SLAM']
};
