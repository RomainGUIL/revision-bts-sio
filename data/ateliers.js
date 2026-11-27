/* ATELIERS D'ÉCRITURE ET DONNÉES DES JEUX — écrits pour l'application (adaptés de Révision Brevet).
   ESSAIS_CGE      : sujets d'essai de culture générale (E1), thème national 2027 « Le vrai du faux » ; pistes et plan, sans corrigé type.
   CAS_JURIDIQUES  : cas pratiques de CEJM (E4) à résoudre avec la méthode du raisonnement juridique ; les mots attendus servent
                     à vérifier que les notions essentielles sont citées (ils ne remplacent pas la lecture d'un professeur).
   PORTS           : [port, protocole, rôle] — ports par défaut attribués par l'IANA.
   OSI_EXEMPLES    : [élément, couche du modèle OSI, explication]. */
window.ESSAIS_CGE = [
  { id: 'c1', sujet: 'À l\'heure des réseaux sociaux, est-il encore possible de distinguer le vrai du faux ?',
    pistes: ['Les difficultés : vitesse de circulation, bulles de filtres, contenus truqués (images, vidéos générées par IA).', 'Les moyens : vérification des sources, recoupement, médias de vérification, éducation aux médias.', 'La responsabilité de chacun : ne pas partager sans vérifier, garder son esprit critique.'],
    plan: ['Introduction : définir le vrai et le faux, poser la question, annoncer le plan.', 'I. Un brouillage réel : rumeurs, infox, hypertrucages (deepfakes).', 'II. Mais des outils pour distinguer : sources, recoupement, esprit critique.', 'Conclusion : réponse nuancée et ouverture.'] },
  { id: 'c2', sujet: 'Faut-il toujours dire la vérité ?',
    pistes: ['La vérité comme exigence morale et condition de la confiance.', 'Le débat entre Kant (« Sur un prétendu droit de mentir par humanité », 1797) et Benjamin Constant.', 'Le mensonge par délicatesse ou pour protéger ; les limites (secret professionnel, vie privée).'],
    plan: ['Introduction.', 'I. La vérité, fondement de la confiance et de la vie en société.', 'II. Des situations où la vérité peut blesser ou mettre en danger.', 'Conclusion : la vérité comme principe, à exercer avec discernement.'] },
  { id: 'c3', sujet: 'Une image peut-elle être une preuve ?',
    pistes: ['La photographie a longtemps été vue comme un témoignage fidèle (photojournalisme).', 'Retouche, cadrage, mise en scène, images générées par IA : l\'image peut tromper.', 'Magritte, « La Trahison des images » (« Ceci n\'est pas une pipe », 1929) : une image n\'est pas la chose.'],
    plan: ['Introduction.', 'I. L\'image, un témoignage puissant.', 'II. Une image se construit et peut se truquer.', 'III. Une preuve à condition d\'en vérifier l\'origine et le contexte.', 'Conclusion.'] },
  { id: 'c4', sujet: 'La fiction peut-elle dire quelque chose de vrai ?',
    pistes: ['Le roman invente des faits mais dit des vérités sur l\'humain (sentiments, sociétés).', 'Orwell, 1984 (1949) : une fiction qui éclaire la surveillance et la manipulation de l\'information.', 'Les limites : confusion entre fiction et réalité, fausses informations présentées comme vraies.'],
    plan: ['Introduction.', 'I. La fiction ne prétend pas dire les faits.', 'II. Elle révèle pourtant des vérités sur le monde et sur nous.', 'Conclusion.'] },
  { id: 'c5', sujet: 'Les intelligences artificielles rendent-elles le vrai et le faux impossibles à distinguer ?',
    pistes: ['Textes, voix et images générés de façon très réaliste ; « hallucinations » des modèles de langage.', 'Les réponses : marquage des contenus générés, détection, réglementation européenne (règlement sur l\'IA).', 'Le rôle de l\'esprit critique et des compétences numériques.'],
    plan: ['Introduction.', 'I. Une capacité inédite à produire du faux crédible.', 'II. Des réponses techniques, juridiques et éducatives.', 'Conclusion : un défi, pas une fatalité.'] },
  { id: 'c6', sujet: 'Doit-on se méfier des apparences ?',
    pistes: ['Molière, Tartuffe (1664-1669) : l\'hypocrite qui trompe par l\'apparence de la dévotion.', 'Le monde du travail : image professionnelle, réseaux sociaux, CV embellis.', 'Les apparences disent aussi quelque chose de vrai : premières impressions, codes sociaux.'],
    plan: ['Introduction.', 'I. Les apparences peuvent tromper.', 'II. Elles ne sont pas toujours trompeuses.', 'Conclusion.'] },
  { id: 'c7', sujet: 'Le mensonge peut-il être utile ?',
    pistes: ['Les mensonges qui protègent (période de guerre, faux papiers de la Résistance).', 'Le mensonge qui manipule : propagande, publicité trompeuse, escroqueries en ligne (hameçonnage).', 'Le coût du mensonge : perte de confiance, sanctions juridiques (pratiques commerciales trompeuses).'],
    plan: ['Introduction.', 'I. Des mensonges qui servent ou protègent.', 'II. Des mensonges qui détruisent la confiance.', 'Conclusion.'] },
  { id: 'c8', sujet: 'Peut-on faire confiance aux chiffres ?',
    pistes: ['Les chiffres semblent objectifs et vérifiables.', 'Mais ils se choisissent et se présentent (graphiques à échelle trompeuse, moyennes qui cachent les écarts).', 'Comprendre leur source et leur méthode de calcul.'],
    plan: ['Introduction.', 'I. Les chiffres, une apparence d\'objectivité.', 'II. Des chiffres qu\'on peut orienter.', 'III. Lire les chiffres avec méthode.', 'Conclusion.'] }
];

window.CAS_JURIDIQUES = [
  { id: 'j1', theme: 'Contrat de travail', faits: 'Lina est embauchée en CDI comme technicienne support avec une période d\'essai de deux mois. Après trois semaines, l\'employeur met fin à la période d\'essai sans donner de motif, en respectant le délai de prévenance. Lina estime ne pas avoir pu montrer ses compétences.',
    question: 'L\'employeur pouvait-il rompre la période d\'essai sans motif ?',
    attendus: [['periode d\'essai'], ['rompre|rupture|libre'], ['sans motif|sans justification|pas de motif'], ['delai de prevenance|prevenance'], ['abus|abusive|competences'], ['code du travail']],
    plan: ['Faits qualifiés : un salarié en CDI, une rupture pendant la période d\'essai à l\'initiative de l\'employeur.', 'Problème juridique : la rupture de la période d\'essai doit-elle être motivée ?', 'Règle : pendant la période d\'essai, chaque partie peut rompre le contrat librement, sans motif ni indemnité, en respectant un délai de prévenance (Code du travail) ; la rupture ne doit pas être abusive, c\'est-à-dire sans lien avec les compétences du salarié.', 'Application : l\'employeur a respecté le délai de prévenance ; rien n\'indique un motif étranger aux compétences.', 'Solution : la rupture est en principe valable.'] },
  { id: 'j2', theme: 'Clause de non-concurrence', faits: 'Hugo, développeur dans une ESN de Lyon, démissionne. Son contrat contient une clause qui lui interdit de travailler pour un concurrent pendant cinq ans dans toute la France, sans aucune contrepartie financière.',
    question: 'Cette clause de non-concurrence est-elle valable ?',
    attendus: [['clause de non-concurrence|non-concurrence'], ['interets legitimes|interet legitime'], ['limitee dans le temps|duree'], ['espace|geographique'], ['contrepartie financiere|contrepartie'], ['nulle|nullite|pas valable|non valable']],
    plan: ['Faits qualifiés : une clause de non-concurrence dans un contrat de travail.', 'Problème juridique : à quelles conditions une clause de non-concurrence est-elle valable ?', 'Règle (jurisprudence de la Cour de cassation, 2002) : conditions cumulatives : protéger les intérêts légitimes de l\'entreprise, être limitée dans le temps et dans l\'espace, tenir compte des spécificités de l\'emploi, prévoir une contrepartie financière.', 'Application : pas de contrepartie financière, durée et zone très larges.', 'Solution : la clause est nulle ; Hugo peut travailler pour un concurrent.'] },
  { id: 'j3', theme: 'Données personnelles (RGPD)', faits: 'Une boutique en ligne collecte l\'adresse, la date de naissance et l\'historique d\'achat de ses clients. Elle revend ces données à des partenaires publicitaires sans en informer les clients. Une cliente demande la suppression de ses données.',
    question: 'L\'entreprise respecte-t-elle le RGPD ? Quels sont les droits de la cliente ?',
    attendus: [['donnees personnelles|donnee a caractere personnel'], ['responsable de traitement|responsable du traitement'], ['base legale|consentement|licite'], ['information|transparence|informer'], ['effacement|suppression|droit a l\'oubli'], ['cnil'], ['sanction|amende|4 %|20 millions']],
    plan: ['Faits qualifiés : un responsable de traitement qui traite des données personnelles et les cède à des tiers.', 'Problème juridique : le traitement est-il licite, et quels droits peut exercer la personne concernée ?', 'Règle : le RGPD exige une base légale (par exemple le consentement), une information des personnes, la limitation des finalités ; il donne des droits d\'accès, de rectification, d\'opposition et d\'effacement. La CNIL contrôle et peut infliger des amendes jusqu\'à 20 millions d\'euros ou 4 % du chiffre d\'affaires annuel mondial.', 'Application : cession sans information ni consentement : traitement illicite.', 'Solution : la cliente peut obtenir l\'effacement et saisir la CNIL ; l\'entreprise s\'expose à une sanction.'] },
  { id: 'j4', theme: 'Violation de données', faits: 'Un cabinet comptable découvre qu\'un pirate a volé le fichier de ses clients (noms, adresses, numéros de compte bancaire) après une attaque par hameçonnage. Le gérant préfère ne rien dire pour protéger l\'image du cabinet.',
    question: 'Quelles obligations le cabinet doit-il respecter après cette violation de données ?',
    attendus: [['violation de donnees'], ['notifier|notification'], ['cnil'], ['72 heures|72 h'], ['informer les personnes|personnes concernees'], ['securite|article 32|mesures techniques']],
    plan: ['Faits qualifiés : une violation de données personnelles chez un responsable de traitement.', 'Problème juridique : le responsable de traitement doit-il signaler cette violation ?', 'Règle : le RGPD impose de garantir la sécurité des données (article 32) et de notifier la violation à la CNIL dans les 72 heures (article 33) ; si le risque est élevé, il faut aussi informer les personnes concernées (article 34).', 'Application : des données bancaires ont été volées : risque élevé.', 'Solution : le cabinet doit notifier la CNIL sous 72 heures et informer ses clients ; se taire l\'expose à une sanction.'] },
  { id: 'j5', theme: 'Inexécution du contrat', faits: 'Une PME commande à un prestataire un site de vente en ligne livrable le 1er mars. Au 1er mai, rien n\'est livré malgré une relance. La PME a perdu ses ventes du printemps.',
    question: 'La PME peut-elle obtenir réparation du préjudice subi ?',
    attendus: [['inexecution|n\'a pas execute'], ['responsabilite contractuelle'], ['mise en demeure'], ['dommage|prejudice'], ['lien de causalite|causalite'], ['dommages-interets|dommages et interets|reparation'], ['1231']],
    plan: ['Faits qualifiés : un contrat de prestation non exécuté dans le délai prévu.', 'Problème juridique : le prestataire engage-t-il sa responsabilité contractuelle ?', 'Règle : le débiteur qui n\'exécute pas son obligation doit réparer le préjudice causé (article 1231-1 du Code civil), après mise en demeure ; il faut une inexécution, un dommage et un lien de causalité.', 'Application : retard de deux mois, perte de ventes liée au retard.', 'Solution : la PME peut demander des dommages-intérêts, voire la résolution du contrat.'] },
  { id: 'j6', theme: 'Vices du consentement', faits: 'Un vendeur assure à une association qu\'un logiciel de gestion est « conforme au RGPD et mis à jour chaque mois ». Après la signature, l\'association découvre que l\'éditeur a cessé les mises à jour depuis deux ans, ce que le vendeur savait.',
    question: 'L\'association peut-elle obtenir l\'annulation du contrat ?',
    attendus: [['consentement'], ['vice|vices du consentement'], ['dol|manoeuvre|mensonge'], ['nullite|annulation'], ['intentionnel|savait|volontaire'], ['1130|1137']],
    plan: ['Faits qualifiés : un contractant trompé par une affirmation mensongère de l\'autre partie.', 'Problème juridique : le consentement de l\'association a-t-il été vicié ?', 'Règle : le consentement doit être libre et éclairé ; l\'erreur, le dol et la violence le vicient (article 1130 du Code civil). Le dol est une manœuvre ou un mensonge intentionnel qui a déterminé le consentement (article 1137).', 'Application : mensonge volontaire sur une qualité déterminante.', 'Solution : nullité du contrat pour dol, et éventuellement des dommages-intérêts.'] },
  { id: 'j7', theme: 'Propriété du logiciel', faits: 'Pendant ses heures de travail, Yanis, développeur salarié, crée un logiciel de planification pour son entreprise. Après son départ, il veut le vendre à une autre société en affirmant en être l\'auteur.',
    question: 'À qui appartiennent les droits sur ce logiciel ?',
    attendus: [['logiciel'], ['droit d\'auteur|propriete intellectuelle'], ['salarie|dans l\'exercice de ses fonctions|fonctions'], ['employeur'], ['droits patrimoniaux|patrimoniaux|exploitation'], ['l113-9|code de la propriete intellectuelle']],
    plan: ['Faits qualifiés : un logiciel créé par un salarié dans l\'exercice de ses fonctions.', 'Problème juridique : le salarié est-il titulaire des droits d\'exploitation ?', 'Règle : les droits patrimoniaux sur un logiciel créé par un salarié dans l\'exercice de ses fonctions sont dévolus à l\'employeur (article L113-9 du Code de la propriété intellectuelle).', 'Application : création pendant le travail, pour l\'entreprise.', 'Solution : les droits appartiennent à l\'employeur ; Yanis ne peut pas vendre le logiciel.'] },
  { id: 'j8', theme: 'Vente à distance', faits: 'Un particulier achète un ordinateur portable sur un site marchand. Six jours après la livraison, il change d\'avis et veut le renvoyer. Le site refuse : « les ventes sont fermes ».',
    question: 'Le consommateur peut-il renvoyer l\'ordinateur ?',
    attendus: [['consommateur'], ['vente a distance|contrat a distance'], ['retractation'], ['14 jours|quatorze jours'], ['sans motif|sans justification'], ['remboursement|rembourser']],
    plan: ['Faits qualifiés : un contrat conclu à distance entre un professionnel et un consommateur.', 'Problème juridique : le consommateur dispose-t-il d\'un droit de rétractation ?', 'Règle : le Code de la consommation accorde au consommateur un délai de rétractation de 14 jours pour un contrat à distance, sans motif ; le professionnel rembourse dans les 14 jours suivant la rétractation.', 'Application : six jours après la livraison, le délai n\'est pas écoulé.', 'Solution : le consommateur peut se rétracter ; la clause « ventes fermes » ne lui est pas opposable.'] }
];

window.PORTS = [
  [20, 'FTP (données)', 'transfert des données en FTP'], [21, 'FTP', 'commandes du transfert de fichiers'], [22, 'SSH', 'administration à distance chiffrée, SFTP'],
  [23, 'Telnet', 'administration à distance non chiffrée (à proscrire)'], [25, 'SMTP', 'envoi de courriel entre serveurs'], [53, 'DNS', 'résolution de noms'],
  [67, 'DHCP (serveur)', 'attribution automatique d\'adresses IP'], [80, 'HTTP', 'web non chiffré'], [88, 'Kerberos', 'authentification (Active Directory)'],
  [110, 'POP3', 'relève de courriel'], [123, 'NTP', 'synchronisation de l\'heure'], [143, 'IMAP', 'consultation de courriel'], [161, 'SNMP', 'supervision des équipements'],
  [389, 'LDAP', 'annuaire'], [443, 'HTTPS', 'web chiffré par TLS'], [445, 'SMB', 'partage de fichiers Windows'], [514, 'Syslog', 'journalisation centralisée'],
  [587, 'SMTP (soumission)', 'envoi de courriel par un client authentifié'], [636, 'LDAPS', 'annuaire chiffré'], [993, 'IMAPS', 'IMAP chiffré'], [995, 'POP3S', 'POP3 chiffré'],
  [1194, 'OpenVPN', 'réseau privé virtuel'], [3306, 'MySQL / MariaDB', 'base de données'], [3389, 'RDP', 'bureau à distance Windows'], [5432, 'PostgreSQL', 'base de données']
];

window.OSI_EXEMPLES = [
  ['un câble à paires torsadées ou une fibre optique', '1 · Physique', 'La couche physique transmet les bits sous forme de signaux.'],
  ['un concentrateur (hub)', '1 · Physique', 'Il répète le signal sur tous ses ports, sans lire les adresses.'],
  ['une adresse MAC', '2 · Liaison de données', 'Elle identifie une carte réseau sur le réseau local.'],
  ['un commutateur (switch) de niveau 2', '2 · Liaison de données', 'Il oriente les trames grâce aux adresses MAC.'],
  ['un VLAN (norme 802.1Q)', '2 · Liaison de données', 'Le marquage 802.1Q ajoute un identifiant de VLAN dans la trame Ethernet.'],
  ['le protocole Ethernet', '2 · Liaison de données', 'Il définit le format des trames sur le réseau local.'],
  ['une adresse IP', '3 · Réseau', 'Elle permet d\'acheminer les paquets d\'un réseau à l\'autre.'],
  ['un routeur', '3 · Réseau', 'Il relie des réseaux différents en lisant les adresses IP.'],
  ['le protocole ICMP (commande ping)', '3 · Réseau', 'ICMP transporte les messages de contrôle et d\'erreur d\'IP.'],
  ['le protocole TCP', '4 · Transport', 'Il assure un transport fiable, avec connexion et accusés de réception.'],
  ['le protocole UDP', '4 · Transport', 'Il assure un transport rapide, sans connexion ni garantie de livraison.'],
  ['un numéro de port', '4 · Transport', 'Il identifie l\'application destinataire sur la machine.'],
  ['le protocole HTTP', '7 · Application', 'C\'est le protocole du web, utilisé par les applications.'],
  ['le protocole DNS', '7 · Application', 'Il traduit les noms de domaine en adresses IP.'],
  ['le protocole SMTP', '7 · Application', 'Il sert à l\'envoi des courriels.'],
  ['le protocole DHCP', '7 · Application', 'Il distribue automatiquement la configuration IP.']
];
