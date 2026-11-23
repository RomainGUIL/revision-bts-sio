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
| Mémoriser | Flashcards FSRS et carnet d'erreurs |
| Comprendre | Mes matières, bibliothèque, schémas, glossaire, pièges fréquents |
| Rédiger | Études de cas, corrections proposées, auto-évaluation |
| Travailler en temps limité | Examen blanc, copie enregistrée pendant la saisie |
| Préparer les oraux | Simulateur et réalisations E5/E6 |
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
| `data/qcm.js` | Une question de quiz courte par notion (niveau 1 à 3, 3 pièges du même sujet) ; niveaux des sigles |
| `data/questions.js` | Généré depuis les PDF ; ne pas modifier directement |
| `tools/build_questions.py` | Régénération des questions ; nécessite `pypdf` |
| `tools/test.cjs` | Tests techniques et parcours navigateur reproductibles |
| `tools/test-study.cjs` | Tests des nouveaux parcours, des médias et des brouillons |
| `sw.js` | Cache isolé par périmètre de l'application |
| `POUR_RELECTURE.md` | Bilan de l'audit et limites restantes |

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

Les PDF proviennent des sources citées dans les contenus, notamment le [Réseau Certa](https://www.reseaucerta.org/sujet-examen/). Conserver les attributions et respecter leurs conditions de réutilisation.
