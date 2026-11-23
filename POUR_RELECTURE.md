# Relecture et corrections — version 24

Audit technique et interface du 13 novembre 2026, à partir de `Revision-BTS-SIO-v19/app`.

Compléments des versions 22 à 24, vérifiés le 23 novembre 2026 :

- Import des réponses de l'IA réparé quand le texte est copié « mis en forme » depuis ChatGPT (échappements Markdown, entités HTML, guillemets typographiques, virgules en trop) ; message clair quand l'IA n'a produit ni flashcard ni question.
- Mes contrôles : trois demandes à l'IA (dossier complet, questions en plus ajoutées au dernier dossier, sujet type BTS rédigé avec des questions d'annales de la même épreuve comme modèle). Le sujet BTS s'affiche à côté des questions, se travaille question par question ou se passe en examen blanc (4 h présélectionnées, corrigé à la fin) ; sa note est pondérée par le barème.
- Quiz chrono façon Kahoot, seul ou à plusieurs, avec « Sans chrono ». Le jeu à plusieurs passait d'abord en pair à pair (PeerJS), qui ne fonctionnait pas même sur un même réseau ; il passe désormais par Supabase Realtime (port 443), avec retour d'un joueur déconnecté et arrivée en cours de partie. Mes quiz : édition, génération par l'IA, partage par fichier, temps par question.
- Doublons retirés : « QCM rapide » fusionné dans le quiz chrono (mode sans chrono, anciens liens `#qcm` redirigés) ; « Révision express » rangée dans les séances guidées ; « Erreurs fréquentes » renommée « Pièges fréquents » pour ne plus se confondre avec le carnet d'erreurs ; `LISEZMOI.md`, copie exacte du README, supprimé ; alias `joursAvant` remplacé par `daysUntil` ; bouton « S'entraîner question par question » des sujets BTS retiré (même rôle que « M'interroger ») ; lecture du JSON des IA et noms de fichiers mis en commun.
- Feuille de style : la section « Relecture v20 » qui redéfinissait 35 règles, les 4 blocs téléphone et les 2 blocs impression ont été fusionnés (629 → 576 lignes), ainsi que les déclarations mortes du menu mobile. Les styles calculés de chaque élément ont été comparés avant/après sur 27 pages, en thème clair et sombre, à 375, 1000 et 1280 px : aucune différence.
- Quiz chrono : les réponses des fiches (≈ 280 caractères) étaient illisibles en 20 s et les pièges venaient d'autres notions (réponse trouvable par élimination). 172 QCM courts ont été rédigés (`data/qcm.js`), un par notion, avec 3 pièges du même sujet et un niveau (36 faciles, 106 moyens, 30 difficiles). Ils visent la compréhension plutôt que les détails fournis par les documents des sujets (durées, amendes, numéros de port, syntaxe exacte). Parties de 10 questions du plus facile au plus difficile ; temps automatique selon la longueur et le niveau (10 à 45 s). Trois entrées du glossaire inadaptées au quiz sont exclues.
- Tests : 24 groupes pour le socle (dont réparation des réponses copiées, sujets BTS et quiz personnels) et 4 pour l'étude, sans Playwright. Parcours vérifiés à la main dans le navigateur : contrôles, quiz chrono, Mes quiz, partie à plusieurs à 2 joueurs.

Compléments de la version 21, vérifiés le 20 novembre 2026 :

- Brouillons et position conservés après fermeture pour les cas, flashcards, Python, écoutes et formulaires personnels ; reprise depuis l'accueil.
- Séances guidées de 15 ou 30 minutes indicatives : cartes à revoir, questions avec priorité aux erreurs, puis une écoute.
- Sources et suivi personnel des corrigés, notes de relecture et liste des réponses à discuter. Aucun statut de certification officielle n'est ajouté.
- Quatre écoutes anglaises originales à voix synthétique, avec questions, transcription, vocabulaire et correction. Les fichiers WAV sont livrés dans le dossier.
- Mode concentration avec sortie par Échap, recherche globale incluant les contenus personnels et les notions apprises.
- Préparation sélective des PDF et audios hors ligne, lecture de l'état réel du cache, migration des PDF de la version précédente et réponses aux requêtes de lecture partielle des médias.
- Protection des brouillons lorsqu'un formulaire est refusé ou qu'une suppression est annulée ; reprise utilisable quand une séance restaurée référence un contenu supprimé.

Les constats ci-dessous décrivent l'audit initial v20 ; la conservation des brouillons va désormais au-delà de la fermeture du navigateur.

Le socle est utile et peut rester en HTML/CSS/JavaScript sans framework. Les priorités étaient la fiabilité des données personnelles, le chronomètre, les petits écrans et la clarté des indications pédagogiques. Les contenus et PDF ont été conservés.

## Bugs corrigés

| Constat en v19 | Correction |
| --- | --- |
| Sauvegarde JSON trop peu vérifiée ; état remplacé avant une éventuelle erreur | Validation des structures et valeurs ; rejet des clés dangereuses ; enregistrement du candidat avant remplacement de l'état actif |
| Contrôles et cartes non reconstruits après restauration | Reconstruction des questions, flashcards et pseudo-sujets ; nettoyage des anciennes sessions |
| Remise à zéro laissant certains objets actifs | Nettoyage des examens, QCM, oraux, études de cas et contrôles dérivés |
| Échecs de stockage généralement silencieux | Avertissement visible ; progression locale illisible protégée contre la réécriture automatique |
| Examen rendu automatiquement seulement si son chronomètre était affiché | Échéance contrôlée ailleurs dans l'application, au retour de visibilité et au chargement |
| Ajustement de note d'examen modifiant la dernière étude de cas ou réponse | Mise à jour des entrées correspondant précisément à l'examen |
| Brouillon de cas perdu en quittant sa vue | Conservation pendant la saisie et entre pages, jusqu'à fermeture de l'application ; réponses validées persistantes |
| Carte FSRS stable mais échue absente du compteur « à revoir » | L'échéance prime sur la catégorie « maîtrisée » |
| Décalages UTC, contrôle d'aujourd'hui affiché J-1, examen passé affiché « Jour J » | Calcul en jours locaux et distinction aujourd'hui / passé |
| Fréquences de cybersécurité incluant l'autre option | Filtrage et recalcul selon SISR/SLAM |
| Sigle court reconnu dans un autre mot | Limites de mots, par exemple IP dans « équipement » |
| Imports IA fragiles aux mots-clés fournis en texte | Acceptation de listes ou de texte séparé par points-virgules, validation avant ajout |
| Cours HTML analysé via un élément actif | Document inerte, scripts/styles retirés avant extraction du texte |
| Service worker supprimant les autres caches du domaine | Cache isolé par périmètre ; nettoyage limité à ses anciennes versions |
| Mise en cache des réponses PDF partielles susceptible d'échouer | Conservation des réponses complètes HTTP 200, erreurs de cache gérées |
| Menu mobile sans état accessible ni fermeture Échap | `aria-expanded`, fermeture clavier, contenu arrière inerte, déverrouillage sur grand écran |
| Certains liens malformés pouvant casser le rendu | Garde sur les routes et thèmes inconnus |

## Interface et nettoyage

- Palette verte, thème sombre cohérent, tableau de bord hiérarchisé et bouton principal de révision express.
- Accès directs aux matières, flashcards et études de cas ; outils complémentaires regroupés.
- Accès redondants retirés des groupes de navigation et deuxième raccourci express retiré de l'accueil.
- Débordements corrigés sur neuf écrans en 390 px : contrôles, cas, examen, bibliothèque, pentest, Python, annales, thèmes et notes. Vérification complémentaire en 320 px.
- Champs contenus dans l'écran, tableaux défilants, boutons tactiles, meilleure disposition des paquets et objectifs.
- Lien d'évitement, page active annoncée, titre du document adapté, thèmes des champs cohérents et préférence de mouvement réduit respectée.
- Retrait de « quasi certain » et des pourcentages prédictifs non justifiés ; conservation des fréquences descriptives et des exercices associés dans « Thèmes à réviser ».
- Guide réécrit : retrait des anciennes listes contradictoires, décomptes obsolètes et instructions Leitner dépassées. L'archive originale conserve l'ancien historique.
- Confidentialité clarifiée : les demandes IA courtes sont transmises dans l'URL au clic.

## Vérifications

`node tools/test.cjs --browser` couvre les sauvegardes anciennes et actuelles, imports invalides, contrôles, cartes, dates, fréquences, examens, réinitialisation et isolation des caches.

Les parcours Chrome vérifient les vues principales pour SISR et SLAM à 1440, 390 et 320 px, puis les flashcards, brouillons, restaurations, rejets d'imports, réponses d'examen séparées et reprise après rechargement, import HTML inerte et expiration d'un examen sauvegardé. Les captures utilisent un profil de test séparé, contrôlé visuellement en clair, sombre et mobile.

La cohérence des **475 questions**, **172 notions**, de leurs thèmes, corrections et documents liés a été vérifiée. Les PDF référencés sont présents et les vues de chaque sujet sont rendues dans les tests.

Pour la v21, `node tools/test-study.cjs --browser` ajoute 20 groupes de tests : médias locaux, validation des nouvelles données, migration et lecture partielle du cache, reprise après rechargement, formulaires, indentation Python, relecture, recherche, lecture audio effective, concentration, séance guidée de 15 minutes complète, affichage à 1440/390/320 px et export/import. Avec les 26 groupes du socle, **46 groupes passent**. La préparation des médias utilise un vrai CacheStorage dans Chrome sur une origine HTTPS simulée, avec des réponses réseau locales ; cela ne valide pas une installation réelle du service worker sur téléphone.

**Limites :** le service worker est testé avec des doublures de son API, pas par installation sur iPhone. Safari/iOS, impression papier, dictée vocale, ouverture effective des services IA et toutes les réponses possibles aux exercices n'ont pas été validés. Les tests FSRS vérifient des séquences de calcul cohérentes, sans nouvelle comparaison exhaustive avec py-fsrs.

## Travail restant conseillé

1. **Relecture pédagogique des corrigés**, surtout ceux commençant par « Méthode : », les raisonnements CEJM et la culture générale. Leur présence ne garantit pas leur exactitude ; aucun corrigé n'est certifié ici par un enseignant.
2. **Compréhension orale en anglais** : enrichir les quatre exercices synthétiques avec des enregistrements de locuteurs variés, adaptés et autorisés.
3. **CEJM SIO 2026** : le sujet propre au SIO reste absent ; ne pas le remplacer automatiquement par le sujet commun des autres BTS.
4. **Évaluation** : les mots-clés ne comprennent ni le raisonnement ni les négations. L'auto-évaluation reste nécessaire ; la moyenne n'est pas une prédiction de note officielle.
5. **Synchronisation et concurrence** : données locales, sans fusion de deux onglets simultanés. Travailler dans un seul onglet par navigateur et exporter pour transférer.
6. **Maintenance** : le fichier applicatif reste conséquent. Les tests ajoutés permettent une future séparation progressive, sans imposer de framework.

## Sources officielles vérifiées ponctuellement

- [Thème CGE 2027 — Bulletin officiel du 23 avril 2026](https://www.education.gouv.fr/bo/2026/Hebdo17/ESRS2608144N) : « Le vrai du faux » confirmé.
- [Calendrier commun 2027 — Bulletin officiel du 8 octobre 2026](https://www.education.gouv.fr/bo/2026/Hebdo38/ESRE2625597A) : CGE le 11 mai 2027, 9 h–12 h en métropole ; ne remplace pas la convocation SIO.

Ce travail n'est pas un audit exhaustif du référentiel ni une certification de tous les contenus pédagogiques.
