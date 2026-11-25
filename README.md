# Révision BTS SIO — version 24

Application autonome pour les options SISR et SLAM. Ouvrir `index.html` dans Chrome, Edge ou Firefox. Aucun compte, serveur ou paquet à installer pour l'utilisation locale.

## Commencer

1. Choisir son option en haut de page.
2. Renseigner sa date d'examen dans **Organisation → Réglages et sauvegarde**.
3. Lancer une **Séance guidée** (express 10 minutes, 15 ou 30 minutes), ou ouvrir **Mes matières**.
4. Exporter régulièrement sa progression depuis les réglages.

La progression reste dans ce navigateur, sous la clé `bts-sio-revision-v1`. La mise à jour au même emplacement conserve cette clé. Déplacer le dossier, changer de navigateur ou passer du fichier local à un site peut donner un stockage différent : exporter depuis l'ancienne adresse, puis restaurer depuis la nouvelle. Utiliser un seul onglet à la fois pour éviter que deux sessions écrasent leurs modifications.

## Les outils

| Besoin | Outil |
| --- | --- |
| Réviser chaque jour | Tableau de bord, objectif du jour, séances guidées (express 10 min, 15 min, 30 min) |
| Mémoriser | Flashcards FSRS (l'essentiel en une phrase, option « Explications avancées ») et carnet d'erreurs |
| Comprendre | Mes matières, bibliothèque, schémas, glossaire, pièges fréquents |
| Rédiger | Études de cas, corrections proposées, auto-évaluation |
| Travailler en temps limité | Examen blanc, copie enregistrée pendant la saisie |
| Préparer les oraux | Simulateur, duel oral à deux (l'un répond, l'autre joue le prof et note avec une grille sur 20, puis on inverse) et réalisations E5/E6 |
| Préparer un contrôle | Import de cours ; avec l'IA : dossier complet, questions en plus, ou sujet type BTS rédigé d'après les annales de la même épreuve, à passer en examen blanc avec une note pondérée par le barème |
| Jouer et réviser en QCM | Quiz chrono façon Kahoot (ou sans chrono), seul ou à plusieurs (code de partie, via Supabase Realtime) ; « Mes quiz » pour écrire ses questions ou les faire écrire par l'IA, et les partager |
| Pratiquer | Exercices réseau, maths/Python et TP SISR |
| S'organiser | Planning, notes d'entraînement et sauvegardes |
| Consulter les sources | Annales PDF et thèmes à réviser |
| Retrouver son travail | Bouton « Reprendre où j’en étais », brouillons conservés après fermeture |
| Suivre un parcours | Séances guidées : cartes, questions ciblées, puis écoute |
| Comprendre l'anglais oral | 4 fichiers audio inclus, questions, transcription, vocabulaire et auto-évaluation |
| Relire les réponses | Sources, remarque personnelle et statuts « À vérifier », « Relu par moi », « À discuter » |
| Se concentrer | Mode concentration dans les activités ; Échap pour retrouver la navigation |
| Retrouver un contenu | Recherche dans les notions apprises, notes, questions, contrôles et réalisations |
| Préparer un déplacement | Sélection des PDF et audios à conserver hors ligne sur la version hébergée |

Les brouillons concernent les études de cas, le paquet de flashcards actif, Python, les réponses d'écoute, les champs des contrôles et des réalisations. Le dernier cas et le dernier paquet sont conservés ; commencer une autre activité du même type peut les remplacer. Les séances guidées utilisent 5 cartes et 2 questions, ou 10 cartes et 4 questions, puis une écoute. La durée est indicative. Les données ajoutées sont incluses dans l'export JSON ; les sauvegardes des versions antérieures restent importables.

## Contenu et limites

- 23 sujets officiels E7/CEJM, avec 333 questions ; 29 ensembles complémentaires, dont des sujets officiels de CGE et d'anciennes annales de maths. Total : **475 questions**, **172 notions**, **37 PDF**.
- Les corrigés sont des propositions non officielles. Leur présence et leurs liens ont été contrôlés ; leur exactitude n'a pas été intégralement certifiée. Les réponses « Méthode : » demandent notamment une vérification dans les documents du sujet.
- La notation par mots-clés ne juge pas le raisonnement : lire la correction puis ajuster la note. La moyenne est une moyenne d'entraînement, pas une prédiction de résultat au BTS.
- Les fréquences d'annales décrivent le corpus inclus et l'option choisie ; elles ne donnent pas la probabilité du prochain sujet. Les autres thèmes constituent une liste de travail.
- Les quatre écoutes sont des exercices originaux courts (51 à 58 secondes), à voix américaine synthétique. Elles ne constituent pas des épreuves officielles et ne remplacent pas l'écoute de locuteurs variés. Les anciens sujets de maths ne remplacent pas les consignes actuelles du CCF. Le sujet CEJM propre au SIO de 2026 n'est pas inclus.
- Au clic sur un bouton IA, la demande est copiée et le service choisi s'ouvre. Une demande courte est transmise dans l'adresse du nouvel onglet ; une demande longue doit être collée. Les contenus partagés passent alors par ce service.
- Pas de synchronisation automatique : utiliser l'export/import entre appareils.
- Quiz à plusieurs : les messages passent par un projet Supabase (canaux « Realtime », WebSocket sur le port 443). La bibliothèque est chargée depuis cdn.jsdelivr.net au lancement d'une partie. Il faut Internet ; seuls des pseudos et le contenu des questions circulent, rien n'est enregistré. Un joueur qui perd la connexion ou dont le téléphone se met en veille retrouve sa place et ses points en revenant sur la page (même onglet). Si l'animateur ferme sa page, la partie s'arrête.
  À la création, l'animateur choisit : **son rôle** (« J'anime seulement » ou « J'anime et je joue aussi » : il répond sur son écran, au clic ou avec les touches 1 à 4, et figure au classement sous un pseudo) et **les explications** (« Pour tout le monde après chaque question », ou « Seulement sur mon écran » pour les expliquer lui-même : les téléphones n'affichent alors que la bonne réponse). Dans les deux cas, chaque joueur reçoit à la fin le corrigé complet : ses réponses, les bonnes réponses et les explications.
- **Thèmes à réviser (E7 par option, E4)** : pour chaque thème, présence année par année dans les sujets de métropole, probabilité estimée pour la session suivante = (sessions où le thème est tombé + 1) ÷ (sessions + 2), et encadré de conclusions calculé à partir de ces chiffres. Un bouton ajoute les sujets de Nouvelle-Calédonie et de secours au calcul, avec un poids de ½ (`POIDS_AUTRES` dans `js/app.js`) : comparés sur 18 sujets E7 en novembre 2026, ils ressemblent autant aux sujets de métropole que ces derniers entre eux, mais prédisent moins bien la métropole suivante (59 % des thèmes retrouvés contre 73 %). Le taux de retour d'une session à l'autre est calculé sur la métropole seule.
- **Anciens sujets SISR (avant la réforme)** : 12 études de cas de l'ancienne épreuve E4 « Conception et maintenance de solutions informatiques », 2015 à 2021, métropole et Nouvelle-Calédonie (Réseau Certa), dans `sujets/anciens/SISR_*.pdf`. Page séparée `#anciens` (lien en bas de « Sujets et corrections ») : ils ne comptent ni dans les « Thèmes à réviser » ni dans l'étude de cas aléatoire, et n'ont pas de corrigé (ceux du Réseau Certa sont réservés aux enseignants). `data/anciens.js` est généré par `python tools/build_anciens.py` ; l'usage de chaque question a été relu à la main (dictionnaire `MANUEL` du script) : E7 cybersécurité 36 % (66 questions), E6 infrastructure 52 %, E5 gestion 11 %. Les questions E7 portent surtout sur le filtrage, la sauvegarde, l'authentification et le chiffrement ; presque rien sur le RGPD, la journalisation ou l'analyse de risques façon EBIOS, très présents dans l'E7 actuelle. Deux sujets calédoniens (Camera 2016, SATOASI 2019) n'ont pas pu être téléchargés : le serveur du Réseau Certa coupait la connexion.
- **Configurer le jeu à plusieurs** : créer un projet gratuit sur [supabase.com](https://supabase.com), puis copier dans `js/config.js` le « Project URL » et la clé publique (« anon » ou « publishable ») de Project Settings → API. Aucune table n'est nécessaire. Ne jamais y mettre la clé « service_role » / « secret ».

Le thème CGE 2027 « Le vrai du faux » est confirmé par le [Bulletin officiel](https://www.education.gouv.fr/bo/2026/Hebdo17/ESRS2608144N). La date CGE du 11 mai 2027, de 9 h à 12 h en métropole, figure au [calendrier officiel](https://www.education.gouv.fr/bo/2026/Hebdo38/ESRE2625597A). Pour les épreuves propres au SIO et les oraux, suivre la convocation.

## Téléphone et hors ligne

Héberger le dossier sur un site HTTPS puis utiliser « Ajouter à l'écran d'accueil ». Ouvrir directement le fichier sur ordinateur n'installe pas le service worker.

Les fichiers de l'application sont mis en cache à l'installation. Dans **Organisation → Préparer le hors-ligne**, sélectionner les PDF et audios utiles puis lancer leur préparation. Le bouton de vérification lit les fichiers réellement présents dans le cache. Les échecs de téléchargement sont signalés ; le navigateur peut libérer son stockage, donc vérifier avant de partir. Les médias déjà téléchargés dans le cache de la v20 sont transférés au cache des médias lors de la mise à jour. La lecture partielle des médias est prise en charge pour permettre le déplacement dans l'audio hors ligne.

En ouvrant `index.html` directement, les PDF et audios sont simplement lus dans le dossier fourni : conserver le dossier complet. Après une modification de la version hébergée, changer la version dans `sw.js` puis republier.

## Maintenance

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure et ordre de chargement |
| `css/style.css` | Interface, thèmes, téléphone et impression |
| `js/app.js` | État, validation, calculs, vues `V`, actions `ACT`, routage par hash (dont contrôles, quiz chrono, Mes quiz et parties à plusieurs) |
| `js/config.js` | Adresse et clé publique du projet Supabase pour le quiz à plusieurs |
| `js/study.js`, `css/study.css` | Brouillons, séances, relecture, écoute, recherche et préparation hors ligne |
| `data/media.js`, `audio/*.wav` | Textes, questions et fichiers des quatre écoutes ; catalogue des médias |
| `data/*.js` | Contenus pédagogiques chargés dans `window` |
| `data/flash.js` | Réponse simple de chaque flashcard ; notions retirées des flashcards et du quiz (organisation des épreuves, conseils de méthode) |
| `data/qcm.js` | Une question de quiz courte par notion (niveau 1 à 3, 3 pièges du même sujet) ; niveaux des sigles |
| `data/questions.js` | Généré depuis les PDF ; ne pas modifier directement |
| `tools/build_questions.py` | Régénération des questions ; nécessite `pypdf` |
| `tools/test.cjs` | Tests techniques et parcours navigateur reproductibles |
| `tools/test-study.cjs` | Tests des nouveaux parcours, des médias et des brouillons |
| `sw.js` | Cache isolé par périmètre de l'application |
| `POUR_RELECTURE.md` | Bilan de l'audit et limites restantes |

### Sécurité

- **Contenus personnels** (contrôles, dossiers de l'IA, quiz, réalisations, notes, pseudos des parties, fichiers importés) : toujours affichés comme du texte. Un test injecte du code HTML et JavaScript dans tous ces champs et vérifie, sur toutes les pages, qu'il n'est jamais interprété.
- **Imports** (sauvegarde, contrôle ou quiz partagé, réponse d'une IA) : structure et types vérifiés avant tout enregistrement ; clés dangereuses (`__proto__`…) refusées.
- **Politique de sécurité du contenu (CSP)** dans `index.html` : scripts de l'application et bibliothèque Supabase seulement, connexions vers Supabase seulement, aucun objet ni formulaire externe.
- **Bibliothèque Supabase** chargée avec une empreinte d'intégrité (SRI) : un fichier modifié sur le CDN serait refusé.
- **Liens externes** ouverts avec `noopener`.
- **Limite du jeu à plusieurs** : les canaux Supabase sont publics et sans compte. Une personne qui connaît le code d'une partie peut y envoyer de faux messages (par exemple se faire passer pour l'animateur). C'est acceptable pour un quiz entre élèves ; aucune donnée n'est enregistrée et seuls des pseudos circulent. Le projet Supabase n'a aucune table.

Les textes d'énoncés et corrections sont échappés. Les documents des cas sont du HTML de confiance livré avec l'application. Les cours HTML importés sont convertis en texte dans un document inerte.

### Vérifications

Avec Node.js, depuis le dossier de l'application :

```sh
node tools/test.cjs
node tools/test-study.cjs
```

Pour les parcours réels, installer Playwright dans un environnement de développement, disposer de Google Chrome, puis lancer :

```sh
node tools/test.cjs --browser
node tools/test-study.cjs --browser
```

Les tests utilisent un profil temporaire et ne modifient pas le navigateur personnel. Aucun paquet n'est nécessaire pour utiliser l'application elle-même.

Les PDF proviennent des sources citées dans les contenus, notamment le [Réseau Certa](https://www.reseaucerta.org/sujet-examen/) : « © Réseau CERTA - Ministère de l'Éducation Nationale - www.reseaucerta.org », licence CC BY-NC-SA 4.0. Conserver les attributions et respecter leurs conditions de réutilisation (pas d'usage commercial, contenus dérivés sous la même licence).

### Mentions légales

Page `#mentions` (menu « Organisation », fonction `V.mentions` dans `js/app.js`) : éditeur anonyme (particulier non professionnel, LCEN art. 1-1, II), hébergeur GitHub Pages, sources et licences, données personnelles (stockage local, Supabase pour le jeu à plusieurs, liens externes). À mettre à jour (`MENTIONS_MAJ`) si l'hébergement, Supabase ou les sources changent.
