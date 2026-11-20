/* TP SISR — liste écrite à la main, rubrique « TP SISR » de l'application.
   Source principale : les cours publics de Yahn Le Prettre, formateur BTS SIO (licence CC BY-NC-SA 4.0) :
     1re année : https://github.com/YahnLP/bts1-sio-sisr-bloc2   ·   2e année : https://github.com/YahnLP/bts2-sio-sisr-bloc2
   Chaque lien a été vérifié (page existante) lors de la création de la liste.
   TP_SISR : [id, année (1 ou 2), séance, titre, chemin du TP dans le dépôt, intérêt (3 = indispensable, 2 = utile, 1 = complément),
              épreuves visées, pourquoi ce classement, thèmes de l'application liés (séparés par des espaces)]
   L'intérêt est un avis rédigé pour réviser : 3 = ce qui revient le plus souvent à l'E6 (réalisations, questions du jury) ou à l'E7 SISR. */
window.TP_SOURCES = {
  1: { nom: "BTS SIO SISR 1re année — bloc 2", repo: "https://github.com/YahnLP/bts1-sio-sisr-bloc2", site: "https://yahnlp.github.io/bts1-sio-sisr-bloc2/" },
  2: { nom: "BTS SIO SISR 2e année — bloc 2", repo: "https://github.com/YahnLP/bts2-sio-sisr-bloc2", site: "https://yahnlp.github.io/bts2-sio-sisr-bloc2/" }
};
window.TP_SISR = [
/* ── 2e année ── */
["b2s12", 2, "S12", "Haute disponibilité et répartition de charge (HAProxy, Keepalived)", "phase-3-exploiter-superviser/S12-haute-disponibilite-charge", 3, "E6 E7", "Supprimer un point unique de défaillance : thème qui tombe très souvent à l'E7 SISR et réalisation E6 très appréciée.", "ha dispo s-ha"],
["b2s10", 2, "S10", "VPN entre deux sites et accès distant sécurisé (WireGuard, OpenVPN, IPsec)", "phase-2-deployer-automatiser/S10-vpn-acces-distant", 3, "E6 E7", "Les sujets parlent souvent de plusieurs sites ou de télétravail ; réalisation E6 classique.", "s-vpn archi"],
["b2s11", 2, "S11", "Supervision avancée, alertes et journaux centralisés (Zabbix, syslog)", "phase-3-exploiter-superviser/S11-supervision-avancee", 3, "E6 E7", "Supervision et centralisation des journaux = thèmes très présents à l'E7 (CaledoBank, SA Blanca…).", "supervision logs s-supervision"],
["b2s06", 2, "S06", "Virtualisation : hyperviseurs, instantanés, réseau virtuel", "phase-2-deployer-automatiser/S06-virtualisation", 3, "E6", "Toutes tes maquettes E6 tournent sur un hyperviseur : le jury questionne souvent les instantanés et le réseau virtuel.", "s-virtu"],
["b2s05", 2, "S05", "Continuité et reprise d'activité (PCA, PRA, RTO, RPO)", "phase-1-reprendre-concevoir/S05-continuite-reprise-activite", 3, "E7 E6", "Sauvegarde, RPO/RTO et reprise après rançongiciel : questions récurrentes à l'E7.", "sauvegarde rancon s-ha"],
["b2s09", 2, "S09", "Scripts d'exploitation (Bash, PowerShell, cron)", "phase-2-deployer-automatiser/S09-scripts-exploitation", 2, "E6", "Un script dans une réalisation fait bonne impression ; le jury peut te demander de le modifier.", "s-scripts"],
["b2s08", 2, "S08", "Gestion des configurations et automatisation (Ansible)", "phase-2-deployer-automatiser/S08-configurations-ansible", 2, "E6", "Montre que tu sais automatiser ; moins attendu que les services de base mais valorisant.", "s-scripts"],
["b2s13", 2, "S13", "Dépannage et gestion des incidents d'infrastructure", "phase-3-exploiter-superviser/S13-depannage-incidents", 2, "E6 E5", "Le jury E6 peut te demander de dépanner en direct : méthode de diagnostic indispensable.", "incident e5-incidents"],
["b2s07", 2, "S07", "Déploiement automatisé de postes et de serveurs", "phase-2-deployer-automatiser/S07-deploiement-automatise", 2, "E6 E5", "Utile pour la compétence « mettre à disposition un service » et pour les parcs de postes.", "e5-service"],
["b2s14", 2, "S14", "Un service sous contrat, de bout en bout (niveaux de service)", "phase-3-exploiter-superviser/S14-service-sous-contrat", 2, "E6 E5", "Engagements de service (SLA), qualité de service : vocabulaire utile à l'oral.", "e5-incidents"],
["b2s15", 2, "S15", "Cadrer une réalisation pour l'épreuve E6", "phase-4-realisations-e6/S15-cadrer-realisation-e6", 3, "E6", "Directement la préparation de l'épreuve : à faire absolument avant de finaliser ton dossier.", ""],
["b2s16", 2, "S16", "Réalisation 1 : mise en œuvre et preuves", "phase-4-realisations-e6/S16-realisation-1", 3, "E6", "Comment documenter et prouver ta réalisation (captures, tests) : c'est ce que le jury évalue.", ""],
["b2s17", 2, "S17", "Réalisation 2 et matrice de couverture", "phase-4-realisations-e6/S17-realisation-2-couverture", 3, "E6", "Vérifier que tes deux réalisations couvrent toutes les compétences du bloc 2.", ""],
["b2s18", 2, "S18", "Dossier numérique et entraînement à l'épreuve", "phase-4-realisations-e6/S18-dossier-numerique-oral", 3, "E6", "Entraînement à l'oral E6.", ""],
["b2s19", 2, "S19", "Épreuve blanche E6", "phase-4-realisations-e6/S19-epreuve-blanche-e6", 3, "E6", "La meilleure répétition avant le jour J.", ""],
["b2s01", 2, "S01", "Reprendre la main : révisions rapides et auto-diagnostic", "phase-1-reprendre-concevoir/S01-revisions-et-diagnostic", 2, "E6", "Bon test de rentrée pour voir ce qu'il faut revoir de 1re année.", "s-reseau s-services"],
["b2s02", 2, "S02", "Cahier des charges, expression des besoins, contrat de prestation", "phase-1-reprendre-concevoir/S02-cahier-des-charges-contrat", 1, "E6 E4", "Utile pour présenter le contexte d'une réalisation ; recoupe le droit des contrats de CEJM.", "contrat"],
["b2s03", 2, "S03", "Coût de possession, éthique et environnement", "phase-1-reprendre-concevoir/S03-cout-ethique-environnement", 1, "E6 E4", "Complément : coût total de possession et numérique responsable (lien avec la RSE).", "rse"],
["b2s04", 2, "S04", "Qualité de service : mesurer et prioriser", "phase-1-reprendre-concevoir/S04-qualite-de-service", 1, "E5 E6", "Complément sur les indicateurs et la priorisation des demandes.", "e5-incidents"],
/* ── 1re année (bases à maîtriser pour l'E6 et l'E7) ── */
["b1s15", 1, "S15", "Pare-feu, NAT, DMZ et transfert de fichiers sécurisé", "phase-3-services/S15-pare-feu-dmz-protocoles", 3, "E7 E6", "Règles de filtrage et DMZ : questions quasi systématiques en E7 SISR.", "filtrage archi s-routage"],
["b1s06", 1, "S06", "VLAN, trunk 802.1Q et utilisateurs Linux", "phase-2-reseau/S06-vlan-trunk", 3, "E6 E7", "La segmentation par VLAN est partout, en E6 comme en E7.", "archi switch s-reseau"],
["b1s09", 1, "S09", "Routage inter-VLAN, relais DHCP et TP intégré", "phase-2-reseau/S09-inter-vlan-relais-dhcp", 3, "E6", "Le relais DHCP entre VLAN est un dépannage classique demandé par le jury.", "s-reseau s-services s-routage"],
["b1s10", 1, "S10", "Windows Server et Active Directory", "phase-3-services/S10-active-directory", 3, "E6 E7", "AD est au cœur des réalisations Windows et de l'E7 (durcissement, PingCastle).", "ad s-ad"],
["b1s11", 1, "S11", "Stratégies de groupe (GPO) et DNS intégré à Active Directory", "phase-3-services/S11-gpo-dns-windows", 3, "E6", "Créer une GPO en direct est une demande fréquente du jury.", "s-ad s-services"],
["b1s12", 1, "S12", "DHCP Windows, partages de fichiers (NTFS) et DFS", "phase-3-services/S12-dhcp-windows-ntfs-dfs", 3, "E6", "Droits NTFS et partages : à maîtriser parfaitement (méthode AGDLP).", "s-ad s-services"],
["b1s16", 1, "S16", "Supervision, sauvegarde et haute disponibilité", "phase-4-securiser-presenter/S16-supervision-sauvegarde-ha", 3, "E7 E6", "Les trois piliers de l'exploitation sécurisée, très présents à l'E7.", "supervision sauvegarde ha s-ha"],
["b1s07", 1, "S07", "Routage statique et service DHCP", "phase-2-reseau/S07-routage-statique-dhcp", 2, "E6", "Bases indispensables pour comprendre le chemin des paquets.", "s-routage s-services"],
["b1s08", 1, "S08", "Service DNS (Bind9) et Spanning Tree Protocol", "phase-2-reseau/S08-dns-stp", 2, "E6", "DNS sous Linux : utile si tes réalisations sont sous Debian.", "s-services"],
["b1s13", 1, "S13", "Scripts Bash, serveur LAMP, administration à distance (SSH) et cron", "phase-3-services/S13-bash-lamp-ssh", 2, "E6", "SSH, cron et LAMP servent dans beaucoup de maquettes.", "s-scripts"],
["b1s14", 1, "S14", "PowerShell, Active Directory en masse et IPv6", "phase-3-services/S14-powershell-ipv6", 2, "E6", "Création de comptes en masse depuis un CSV : un script très apprécié à l'oral.", "s-scripts s-ad"],
["b1s17", 1, "S17", "Projet : l'infrastructure de la PME SimIO", "phase-4-securiser-presenter/S17-projet-pme", 2, "E6", "Projet complet qui peut servir de base à une réalisation.", "s-reseau"],
["b1s18", 1, "S18", "Tests, dossier d'architecture technique (DAT) et fiche de réalisation", "phase-4-securiser-presenter/S18-dossier-architecture", 2, "E6", "Apprendre à documenter : le DAT et la fiche de réalisation sont évalués.", ""],
["b1s04", 1, "S04", "Adressage IPv4, ARP, ICMP, configuration IP et premiers pas sous Linux", "phase-1-fondamentaux/S04-adressage-ipv4", 2, "E6 E3", "Calcul de sous-réseaux : demandé à l'E6 et lié aux maths (binaire).", "s-reseau m-bases"],
["b1s05", 1, "S05", "Commutation, ligne de commande Cisco et commandes Linux", "phase-1-fondamentaux/S05-commutation-cisco", 2, "E6 E7", "Commandes Cisco utiles pour la sécurité des commutateurs en E7.", "switch"],
["b1s03", 1, "S03", "Les fondamentaux du réseau : modèle OSI, TCP/IP, diagnostic", "phase-1-fondamentaux/S03-bases-reseau", 1, "E6", "Bases ; à revoir seulement si tu as des lacunes.", "s-reseau"],
["b1s02", 1, "S02", "Système d'exploitation, comptes utilisateurs et permissions NTFS", "phase-1-fondamentaux/S02-systeme-comptes-ntfs", 1, "E6", "Bases ; les permissions NTFS sont reprises en S12.", "s-ad"],
["b1s01", 1, "S01", "Matériel du PC, serveurs, connectique et BIOS/UEFI", "phase-1-fondamentaux/S01-materiel-et-serveurs", 1, "E5", "Peu interrogé en 2e année.", "e5-parc"],
["b1s19", 1, "S19", "Épreuve blanche E6 et bilan de fin d'année", "phase-4-securiser-presenter/S19-epreuve-blanche-e6", 2, "E6", "Une épreuve blanche supplémentaire pour s'entraîner.", ""]
];
/* Autres sites trouvés lors des recherches : non vérifiés page par page depuis l'application (accès bloqué au moment de la création). */
window.TP_AUTRES = [
  ["siocours — Les cours du BTS SIO (lycées de Nouvelle-Aquitaine)", "https://siocours.lycees.nouvelle-aquitaine.pro/doku.php/bloc2/accueil", "Cours et activités du bloc 2 classés par compétence (B2.1, B2.2, B2.3), avec des éléments de correction."],
  ["Site de M.-P. Delamare — Bloc 2 orienté système, 2e année", "http://mariepascal.delamare.free.fr/rubrique.php3?id_rubrique=38", "Cours et TP de 2e année : répartition de charge HAProxy, cluster web actif-passif…"],
  ["Lycée Chevrollier — Protocoles, services et outils SISR (PDF)", "https://chevrollier.paysdelaloire.e-lyco.fr/wp-content/uploads/sites/14/2023/07/SISR-Protocoles-services-outils.pdf", "Liste des protocoles, services et outils étudiés en SISR : pratique pour vérifier qu'il ne te manque rien."],
  ["Réussir mon BTS SIO — guide cybersécurité infrastructure", "https://www.reussirmonbtssio.com/guides/cybersecurite-infra", "Exercices corrigés, dont VPN (IPsec, OpenVPN, WireGuard) sous pfSense."],
  ["Réseau Certa — rubrique « Côté labo »", "https://www.reseaucerta.org/", "Le site de référence des enseignants de BTS SIO : nombreux TP « Côté labo » et contextes (GSB, M2L…)."]
];
