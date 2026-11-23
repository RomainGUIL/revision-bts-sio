/* ERREURS FRÉQUENTES PAR MATIÈRE — écrites à la main.
   ERREURS[matière] = [ [l'erreur, pourquoi c'est un problème et quoi faire, exemple « faux → juste », source] ]
   source : "correcteurs" = constat publié par des correcteurs ou une académie (voir POUR_RELECTURE.md) ; "" = erreur classique relevée dans les corrigés et les méthodes.
   Aucun rapport de jury national n'est publié pour l'E7 : ces listes ne prétendent pas être officielles. */
window.ERREURS = {
cyber: [
  ["Confondre scan de vulnérabilités et test d'intrusion", "Le scan liste automatiquement des failles possibles ; le test d'intrusion, mené par un humain, prouve qu'elles sont exploitables et en mesure l'impact.", "Faux : « Le scan Nessus est un test d'intrusion. » → Juste : « Le scan identifie des vulnérabilités potentielles ; un test d'intrusion confirmerait leur exploitabilité. »", ""],
  ["Oublier l'autorisation dans un test d'intrusion", "Sans autorisation écrite et périmètre défini, tester un système est une infraction (art. 323-1 du Code pénal).", "Juste : « Avant le test : contrat, autorisation signée, règles d'engagement (périmètre, dates, techniques interdites). »", ""],
  ["Citer un critère DICP sans l'expliquer dans le cas", "Écrire « confidentialité » ne rapporte presque rien : il faut dire quelle information, pour qui, et pourquoi elle est touchée.", "Faux : « La confidentialité est touchée. » → Juste : « La confidentialité des dossiers clients est atteinte : l'attaquant a pu lire les données personnelles stockées sur le serveur exposé. »", ""],
  ["Confondre hachage et chiffrement", "Le hachage est à sens unique (mots de passe) ; le chiffrement est réversible avec une clé (données à relire).", "Faux : « On chiffre les mots de passe en MD5. » → Juste : « On stocke une empreinte hachée et salée (bcrypt) ; MD5 est trop rapide et vulnérable. »", ""],
  ["Proposer des mesures vagues ou génériques", "« Mettre un antivirus » ou « sensibiliser » sans préciser comment ni pourquoi ne répond pas au cas.", "Faux : « Il faut améliorer la sécurité. » → Juste : « Activer le MFA sur le VPN, car le document montre que les identifiants ont été volés par hameçonnage. »", ""],
  ["Oublier le cadre juridique", "Dès que des données personnelles sont en jeu, le RGPD (et la CNIL) est attendu : obligations, délai de 72 h, droits des personnes.", "Faux : réponse purement technique sur une fuite de données → Juste : ajouter « notification à la CNIL sous 72 h et inscription au registre des violations ».", ""],
  ["Ne pas s'appuyer sur les documents", "Le correcteur attend que tu cites le document (« Document B2 ») et ses éléments précis (IP, dates, lignes de journal).", "Faux : « On voit une attaque. » → Juste : « Le document A1.2 montre 3 000 échecs de connexion SSH depuis 185.x.x.x en 5 minutes. »", ""],
  ["Confondre sauvegarde, archivage et RAID", "Le RAID protège d'une panne de disque, pas d'une suppression ou d'un rançongiciel ; l'archivage est une conservation longue durée.", "Faux : « Les données sont protégées car le serveur est en RAID 5. » → Juste : « Le RAID 5 ne remplace pas une sauvegarde hors ligne testée. »", ""]
],
sisr: [
  ["Inverser source et destination dans une règle de pare-feu", "Le port de destination est celui du service visé ; le port source est presque toujours quelconque.", "Faux : source 443 → destination any → Juste : source any, destination 172.16.0.10, port destination 443/TCP, autoriser.", ""],
  ["Oublier la règle de refus par défaut", "Une liste de règles d'autorisation sans « tout le reste est refusé » laisse passer le reste du trafic.", "Juste : terminer par « any → any : refuser » et le justifier par le principe du moindre privilège.", ""],
  ["Mal ordonner les règles", "Les règles sont lues de haut en bas : une règle large placée en premier masque les suivantes.", "Faux : « LAN → any : autoriser » placé avant « LAN → DMZ 3306 : refuser ». → Juste : les règles les plus précises d'abord.", ""],
  ["Confondre IDS et IPS", "Un IDS détecte et alerte ; un IPS, placé en coupure, bloque.", "Faux : « L'IDS bloque l'attaque. » → Juste : « Pour bloquer, il faut un IPS placé en coupure du flux. »", ""],
  ["Doubler un serveur en oubliant les autres points uniques de défaillance", "Deux serveurs derrière un seul répartiteur, un seul switch ou une seule alimentation : le SPOF existe toujours.", "Juste : « Doubler aussi le répartiteur (Keepalived, IP virtuelle) et répartir les VM sur deux hôtes. »", ""],
  ["Donner une commande sans l'expliquer", "Le correcteur veut savoir ce que fait chaque commande et pourquoi elle répond au besoin.", "Faux : « switchport port-security » seul → Juste : la commande + « limite à une adresse MAC autorisée sur le port, coupe le port en cas de violation ».", ""]
],
slam: [
  ["Croire qu'échapper les apostrophes suffit contre l'injection SQL", "La réponse attendue est la requête préparée, qui sépare le code SQL des données.", "Faux : « On ajoute addslashes(). » → Juste : « $stmt = $pdo->prepare('… WHERE login = :login'); $stmt->execute(['login' => $login]); »", ""],
  ["Corriger une XSS à la saisie au lieu de l'affichage", "La parade principale est l'échappement à l'affichage (htmlspecialchars), pour toutes les données.", "Juste : « echo htmlspecialchars($commentaire); » et cookie de session HttpOnly en complément.", ""],
  ["Confondre 401 et 403", "401 : pas authentifié (pas de jeton valide). 403 : authentifié mais pas autorisé.", "Faux : « L'utilisateur connecté qui veut supprimer la ressource d'un autre reçoit 401. » → Juste : 403.", ""],
  ["Mettre une condition sur un agrégat dans WHERE", "WHERE filtre les lignes avant le regroupement ; une condition sur COUNT ou SUM va dans HAVING.", "Faux : « WHERE COUNT(*) > 5 » → Juste : « GROUP BY idSite HAVING COUNT(*) > 5 »", ""],
  ["Faire le contrôle d'accès seulement dans l'interface", "Cacher un bouton ne protège rien : le contrôle doit être fait côté serveur (IDOR).", "Juste : « WHERE id = :id AND idClient = :idClientConnecte » dans la requête du serveur.", ""],
  ["Oublier OLD/NEW ou BEFORE/AFTER dans un déclencheur", "En INSERT il n'y a pas d'OLD ; pour bloquer une opération il faut BEFORE et SIGNAL.", "Juste : « BEFORE UPDATE … IF NEW.prix < 0 THEN SIGNAL SQLSTATE '45000' … »", ""]
],
e6sisr: [
  ["Oublier les 2 adresses réservées dans le calcul d'hôtes", "L'adresse du réseau et la diffusion ne sont pas utilisables : 2^n − 2.", "Faux : « Un /27 permet 32 postes. » → Juste : « 30 hôtes, et la passerelle en utilise un. »", ""],
  ["Oublier le relais DHCP entre VLAN", "Le DHCP fonctionne par diffusion, qui ne traverse pas un routeur.", "Juste : « Configurer un relais DHCP (ip helper-address) sur l'interface du VLAN. »", ""],
  ["Lier une GPO à un groupe", "Une GPO se lie à un site, un domaine ou une OU ; un groupe ne sert qu'au filtrage de sécurité.", "Faux : « On applique la GPO au groupe Comptables. » → Juste : « On la lie à l'OU Comptabilité (filtrage par groupe si besoin). »", ""],
  ["Donner des droits NTFS directement aux utilisateurs", "C'est ingérable et contraire à la méthode AGDLP attendue.", "Juste : « Comptes dans G_Comptables, membre de DL_Compta_RW, qui reçoit Modifier. »", ""],
  ["Ne pas savoir justifier ses choix à l'oral", "Le jury demande presque toujours « pourquoi cette solution plutôt qu'une autre ? ».", "Juste : « J'ai choisi WireGuard plutôt qu'OpenVPN : plus simple à configurer, plus performant, et suffisant pour 15 nomades. »", ""]
],
e6slam: [
  ["Écrire du SQL dans la vue", "En MVC, la vue affiche seulement ; l'accès aux données est dans le modèle.", "Juste : le contrôleur appelle $modele->getPrets(), puis passe le résultat à la vue.", ""],
  ["Mettre les attributs en public", "Cela casse l'encapsulation ; le jury le remarque tout de suite.", "Juste : « private float $prix; » avec getPrix() et setPrix() qui vérifie que le prix est positif.", ""],
  ["Ne pas connaître son propre code", "Le jury choisit une ligne de tes réalisations et demande ce qu'elle fait.", "Juste : relire chaque fichier de tes réalisations et savoir expliquer chaque méthode.", ""],
  ["Mettre la clé étrangère du mauvais côté", "Dans une association 1-n, la clé étrangère va du côté « plusieurs ».", "Faux : Client(…, #idCommande) → Juste : Commande(idCommande, date, #idClient).", ""],
  ["Des messages de commit inutiles", "« modif » ou « test » ne disent rien de l'historique.", "Juste : « Ajoute la validation du numéro de téléphone dans le formulaire client ».", ""]
],
e5: [
  ["Confondre incident et problème", "L'incident se rétablit vite ; le problème est la cause racine d'incidents répétés.", "Faux : « L'imprimante plante tous les lundis : incident. » → Juste : « Problème (incidents récurrents), à analyser pour trouver la cause. »", ""],
  ["Un tableau de synthèse qui ne couvre pas toutes les compétences", "Chaque compétence du bloc 1 doit être couverte au moins une fois.", "Juste : vérifier ligne par ligne, notamment « organiser son développement professionnel » (veille, portfolio).", ""],
  ["Un sujet de veille trop large", "« La cybersécurité » est impossible à défendre en détail.", "Juste : « Les rançongiciels visant les collectivités en 2026 : modes d'attaque et parades. »", ""],
  ["Lire ses notes ou réciter", "Le jury évalue ta capacité à expliquer et à échanger.", "Juste : un plan de quelques mots-clés, et des exemples concrets tirés de ton stage.", ""],
  ["Ne pas pouvoir montrer une réalisation", "Maquette éteinte, accès perdu : prévoir des captures ou une courte vidéo en secours.", "Juste : un dossier « preuves » avec captures datées pour chaque réalisation.", ""]
],
droit: [
  ["Raconter les faits sans les qualifier juridiquement", "Les correcteurs reprochent souvent de recopier l'histoire au lieu de dire qui est qui juridiquement.", "Faux : « M. Martin a été viré parce qu'il a utilisé son téléphone. » → Juste : « Le salarié a fait l'objet d'un licenciement pour faute ; l'employeur s'appuie sur une preuve issue de la vidéosurveillance. »", "correcteurs"],
  ["Donner une solution sans argument juridique", "Les correcteurs n'exigent plus un syllogisme rigide, mais attendent une réponse argumentée, fondée sur des règles de droit, avec une solution cohérente.", "Faux : « Oui, il a le droit. » → Juste : « Selon l'article 1231-1 du Code civil… or ici… donc le client peut obtenir des dommages et intérêts. »", "correcteurs"],
  ["Confondre obligation de moyens et de résultat", "La différence porte sur la preuve de la faute.", "Juste : « Livrer à une date fixée est une obligation de résultat : le client n'a pas à prouver une faute. »", ""],
  ["Oublier la contrepartie financière de la clause de non-concurrence", "Sans indemnité, la clause est nulle.", "Juste : vérifier les 4 conditions (intérêt de l'entreprise, limite dans le temps, dans l'espace, contrepartie financière).", ""],
  ["Croire que tout logiciel d'un prestataire appartient au client", "Pour un salarié, les droits vont à l'employeur ; pour un freelance, il faut une cession écrite.", "Juste : « Sans clause de cession dans le contrat, le prestataire reste titulaire des droits d'auteur. »", ""]
],
mgmt: [
  ["Utiliser le mauvais outil d'analyse", "Les correcteurs signalent des candidats qui utilisent les 5 forces de Porter quand on demande le macro-environnement (PESTEL).", "Juste : environnement général → PESTEL ; intensité concurrentielle d'un secteur → Porter ; interne + externe → SWOT.", "correcteurs"],
  ["Mettre une opportunité dans les forces", "Les forces et faiblesses sont internes ; opportunités et menaces viennent de l'extérieur.", "Faux : « Force : la demande en cybersécurité augmente. » → Juste : c'est une opportunité.", ""],
  ["Nommer une stratégie sans la justifier par les annexes", "Une définition + des preuves chiffrées tirées des annexes sont attendues.", "Juste : « Différenciation : l'annexe 3 montre un hébergement certifié SecNumCloud, facturé 20 % plus cher. »", ""],
  ["Présenter le salaire comme un facteur de motivation (Herzberg)", "Pour Herzberg, le salaire est un facteur d'hygiène : il évite l'insatisfaction mais ne motive pas durablement.", "Juste : « Pour motiver, l'entreprise mise sur la reconnaissance, l'autonomie et l'intérêt des missions. »", ""]
],
eco: [
  ["Analyser un marché sans les chiffres des annexes", "Offre, demande, prix, évolution : chaque élément doit s'appuyer sur un chiffre.", "Juste : « La demande progresse de 12 % par an (annexe 2) ; l'offre est concentrée entre trois acteurs (oligopole). »", ""],
  ["Croire qu'être dominant est interdit", "Seul l'abus de position dominante est sanctionné.", "Juste : « Être leader est légal ; vendre à perte pour éliminer un concurrent est un abus. »", ""],
  ["Ne donner que les avantages d'un mode de financement", "On attend avantages et inconvénients, en lien avec la situation de l'entreprise.", "Juste : « La levée de fonds n'est pas à rembourser mais dilue le pouvoir des fondateurs. »", ""],
  ["Oublier un des deux côtés d'une plateforme", "Une plateforme crée de la valeur pour les deux groupes qu'elle met en relation.", "Juste : « Pour les restaurants : nouveaux clients ; pour les clients : choix et livraison ; effet de réseau croisé. »", ""]
],
maths: [
  ["Oublier les zéros en conversion binaire", "Un octet s'écrit sur 8 bits ; les zéros à gauche et au milieu comptent.", "Faux : 5 = 101, donc dans un masque « 101 » → Juste : 0000 0101.", ""],
  ["Prendre le minimum au lieu du maximum en ordonnancement (date au plus tôt)", "Une tâche ne commence que quand TOUTES ses tâches précédentes sont finies : on prend le maximum.", "Juste : E dépend de C (fin 6) et D (fin 15) → E commence à 15.", ""],
  ["Mal nier une proposition quantifiée", "« Pour tout » devient « il existe », et « et » devient « ou » (De Morgan).", "Faux : non(« tous les serveurs sont à jour ») = « aucun serveur n'est à jour ». → Juste : « il existe un serveur pas à jour ».", ""],
  ["Confondre suite arithmétique et géométrique", "+ r à chaque étape → arithmétique ; × q à chaque étape → géométrique. Une hausse de 10 % donne q = 1,1.", "Faux : hausse de 10 % → q = 0,1. → Juste : q = 1,1.", ""],
  ["Croire que le produit de matrices est commutatif", "En général, A × B ≠ B × A, et le produit n'est défini que si les dimensions correspondent.", "Juste : vérifier « colonnes de A = lignes de B » avant de calculer.", ""],
  ["Ne pas vérifier un résultat de congruence", "Le reste doit être entre 0 et n − 1.", "Faux : −3 ≡ −3 [7] → Juste : −3 ≡ 4 [7].", ""]
],
algo: [
  ["Croire que range(n) va jusqu'à n", "range(n) va de 0 à n − 1 ; range(a, b) s'arrête à b − 1.", "Faux : for i in range(1, 5) affiche 1 à 5 → Juste : 1, 2, 3, 4.", ""],
  ["Faire return dans la boucle", "return arrête immédiatement la fonction : le résultat n'est calculé que sur le premier élément.", "Juste : initialiser le compteur avant la boucle, faire return APRÈS la boucle.", ""],
  ["Confondre = et ==", "= affecte une valeur ; == compare.", "Faux : if note = 10: → Juste : if note == 10:", ""],
  ["Confondre print et return", "print affiche à l'écran ; return renvoie une valeur utilisable.", "Faux : une fonction qui fait print(total) et dont on utilise le résultat → None. Juste : return total.", ""],
  ["Mal initialiser un maximum", "Partir de 0 est faux si toutes les valeurs sont négatives.", "Juste : m = L[0], puis comparer avec les éléments suivants.", ""],
  ["Additionner du texte et un nombre", "input() renvoie toujours une chaîne : il faut convertir.", "Faux : age = input() ; age + 1 → Juste : age = int(input()).", ""],
  ["Oublier les deux-points ou l'indentation", "En Python, l'indentation définit les blocs : une erreur d'indentation change le programme ou l'empêche de tourner.", "Juste : « for x in L: » puis le bloc décalé de 4 espaces.", ""]
],
cge: [
  ["Remplacer l'étude du corpus par sa culture générale", "Selon les consignes de la nouvelle épreuve, la culture générale peut prolonger l'analyse mais ne doit pas remplacer l'étude des documents.", "Juste : partir d'une citation du document, l'expliquer, puis éventuellement ouvrir sur une référence personnelle.", "correcteurs"],
  ["Résumer les documents un par un", "Quand la question porte sur plusieurs documents, il faut les confronter (points communs, différences).", "Faux : « Le document 1 dit… Le document 2 dit… » → Juste : « Les deux documents s'accordent sur… mais alors que le premier…, le second… »", "correcteurs"],
  ["Répondre sans citer le texte", "Une réponse sans appui précis (citation courte ou référence) paraît inventée.", "Juste : « L'auteur parle d'un faux “conçu pour surprendre et indigner” : il montre ainsi… »", ""],
  ["Un essai sans exemples précis", "Un argument doit être illustré par une œuvre, un fait ou une expérience précise, et expliqué.", "Faux : « Beaucoup de gens croient aux fausses informations. » → Juste : « Comme le montre Edgar Morin dans La Rumeur d'Orléans… »", ""],
  ["Hors sujet par rapport à la question de l'essai", "Réutiliser un plan appris par cœur qui ne répond pas exactement à la question posée.", "Juste : analyser chaque mot du sujet et vérifier que chaque partie y répond.", ""],
  ["Négliger la relecture", "Les fautes d'accord et d'homophones coûtent des points dans les deux parties.", "Juste : 10 minutes de relecture ciblée (accords, a/à, et/est, ces/ses).", ""]
],
anglais: [
  ["Traduire mot à mot au lieu de rendre compte", "Le compte rendu restitue les idées essentielles en bon français, sans traduction littérale.", "Faux : « Le document est à propos de… » (calque de « is about ») → Juste : « Le document traite de… »", ""],
  ["Les faux amis", "Actually = en fait ; eventually = finalement ; library = bibliothèque ; to control = (souvent) contrôler/maîtriser selon le contexte.", "Faux : « Actually, the company uses Linux » traduit par « Actuellement… » → Juste : « En fait… »", ""],
  ["Ajouter un « s » aux indénombrables", "Software, hardware, information, advice, feedback ne prennent pas de « s ».", "Faux : softwares, informations → Juste : software, pieces of information.", ""],
  ["Se tromper de formule de politesse", "Dear Sir or Madam → Yours faithfully ; Dear Ms Smith → Yours sincerely (ou Kind regards).", "Juste : adapter la formule finale à la formule d'appel.", ""],
  ["Oublier les temps du récit à l'oral", "Pour raconter ton stage, utilise le prétérit (I worked, I set up).", "Faux : « I work on a firewall during my internship. » → Juste : « I worked on a firewall during my internship. »", ""]
]
};
