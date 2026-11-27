/* ORTHOGRAPHE ET CONJUGAISON — écrit à la main (repris de l'application Révision Brevet), utile pour la culture générale (E1).
   HOMOPHONES   : [phrase avec ___, bonne réponse, autres choix (séparés par |), astuce]
   ACCORDS_PP   : [phrase avec ___, bonne réponse, autres choix, règle]
   VERBES       : groupe ('1', '2' ou 'irr'), auxiliaire ; les irréguliers ont leurs formes écrites en entier (voir js/plus.js). */
window.HOMOPHONES = [
  ['Il ___ peur du noir depuis qu\'il est petit.', 'a', 'à', 'On peut dire « avait » → verbe avoir : a.'],
  ['Nous partirons ___ la montagne cet été.', 'à', 'a', 'On ne peut pas dire « avait » → préposition : à.'],
  ['Le ciel ___ couvert ce matin.', 'est', 'et', 'On peut dire « était » → verbe être : est.'],
  ['Il a pris son sac ___ sa veste.', 'et', 'est', 'On peut dire « et puis » → conjonction : et.'],
  ['Mes cousins ___ arrivés hier soir.', 'sont', 'son', 'On peut dire « étaient » → verbe être : sont.'],
  ['Elle a oublié ___ parapluie dans le train.', 'son', 'sont', 'On peut dire « mon » → déterminant possessif : son.'],
  ['Veux-tu du thé ___ du café ?', 'ou', 'où', 'On peut dire « ou bien » → conjonction : ou.'],
  ['La ville ___ je suis né est au bord de la mer.', 'où', 'ou', 'Indique un lieu → pronom relatif : où.'],
  ['Ils ___ terminé leurs devoirs avant le dîner.', 'ont', 'on', 'On peut dire « avaient » → verbe avoir : ont.'],
  ['___ entend la mer depuis la terrasse.', 'On', 'Ont', 'On peut dire « il » → pronom : on.'],
  ['Il a rangé ___ livres dans son cartable.', 'ses', 'ces|c\'est|s\'est', '« les siens » → possessif : ses.'],
  ['Regarde ___ oiseaux sur la branche !', 'ces', 'ses|c\'est', 'On peut dire « ces oiseaux-là » → démonstratif : ces.'],
  ['___ une belle journée pour se promener.', 'C\'est', 'S\'est|Ces|Ses', 'On peut dire « cela est » → c\'est.'],
  ['Elle ___ levée très tôt ce matin.', 's\'est', 'c\'est|ses|ces', 'Verbe pronominal (se lever) → s\'est.'],
  ['Il ___ lave les mains avant de manger.', 'se', 'ce', 'Devant un verbe pronominal → se.'],
  ['___ matin, il pleuvait à verse.', 'Ce', 'Se', 'Devant un nom → déterminant démonstratif : ce.'],
  ['Je ___ ai donné rendez-vous devant le cinéma.', 'leur', 'leurs', 'Devant un verbe, pronom invariable : leur.'],
  ['Les élèves ont apporté ___ cahiers.', 'leurs', 'leur', 'Devant un nom pluriel, possessif : leurs.'],
  ['___ que tu fasses, fais-le bien.', 'Quoi', 'Quoique', '« Quoi que » = quelle que soit la chose que.'],
  ['___ fatigué, il a terminé la course.', 'Quoique', 'Quoi que', '« Quoique » = bien que.'],
  ['Je ne sais pas ___ heure il est.', 'quelle', 'qu\'elle|quel', 'On peut remplacer par « quelle » + nom féminin.'],
  ['Je pense ___ viendra demain.', 'qu\'elle', 'quelle', 'On peut dire « qu\'il » → que + elle.'],
  ['Il n\'y a ___ deux places libres.', 'plus que', 'plutôt que|plus tôt que', '« ne… que » : seulement.'],
  ['Je préfère marcher ___ prendre le bus.', 'plutôt que', 'plus tôt que', '« Plutôt » = de préférence.'],
  ['Il est arrivé ___ que prévu.', 'plus tôt', 'plutôt', 'Le contraire de « plus tard » → plus tôt.'],
  ['Il faut ___ dormir pour être en forme.', 'bien', 'biens', 'Adverbe invariable.'],
  ['Ils sont venus ___ seuls.', 'tout', 'tous|toutes', '« Tout » adverbe (= entièrement) reste invariable devant un adjectif masculin.'],
  ['___ les élèves sont sortis dans la cour.', 'Tous', 'Tout|Toutes', 'Déterminant qui s\'accorde avec « les élèves » (masculin pluriel).'],
  ['Il ___ fait du sport chaque semaine.', 'a', 'à', '« avait fait » → a.'],
  ['La porte ___ restée ouverte toute la nuit.', 'est', 'et', '« était restée » → est.'],
  ['Il ne faut pas ___ moquer des autres.', 'se', 'ce', 'Verbe pronominal « se moquer ».'],
  ['___ enfants jouent dans le jardin des voisins.', 'Ces', 'Ses|C\'est', 'On montre des enfants → démonstratif : ces.'],
  ['Il y a ___ de monde aujourd\'hui !', 'peu', 'peut|peux', '« peu » = pas beaucoup (adverbe).'],
  ['Il ___ venir avec nous s\'il le souhaite.', 'peut', 'peu|peux', 'On peut dire « pouvait » → verbe pouvoir, 3e personne : peut.'],
  ['Les fleurs ___ fanées à cause de la chaleur.', 'sont', 'son', '« étaient fanées » → sont.'],
  ['Le chien ___ fait des bêtises dans le salon.', 'a', 'à', '« avait fait » → a.'],
  ['Mange ta soupe ___ elle va refroidir !', 'sinon', 'si non', '« sinon » = autrement.'],
  ['___ voisins ont repeint leur maison.', 'Nos', 'Nôtres', 'Devant un nom, déterminant sans accent : nos.'],
  ['Il s\'est ___ de son erreur.', 'rendu compte', 'rendu conte|rendu comte', '« Se rendre compte » vient de « compter ».']
];

window.ACCORDS_PP = [
  ['Les lettres qu\'il a ___ sont dans le tiroir. (écrire)', 'écrites', 'écrit|écrits|écrite', 'Avec avoir, accord avec le COD placé avant : « qu\' » = les lettres (féminin pluriel).'],
  ['Elles ont ___ toute la soirée. (danser)', 'dansé', 'dansées|dansés|dansée', 'Avec avoir, pas d\'accord avec le sujet ; pas de COD placé avant.'],
  ['Mes sœurs sont ___ à Lyon. (partir)', 'parties', 'parti|partis|partie', 'Avec être, accord avec le sujet (féminin pluriel).'],
  ['La tarte que nous avons ___ était délicieuse. (manger)', 'mangée', 'mangé|mangés|mangées', 'COD « que » = la tarte, placé avant → féminin singulier.'],
  ['Ils se sont ___ les mains. (laver)', 'lavé', 'lavés|lavées|lavée', 'Le COD « les mains » est placé après : pas d\'accord.'],
  ['Elle s\'est ___ dans le miroir. (regarder)', 'regardée', 'regardé|regardés|regardées', 'Elle a regardé qui ? se (= elle), placé avant → accord.'],
  ['Les fleurs que j\'ai ___ hier fanent déjà. (cueillir)', 'cueillies', 'cueilli|cueillis|cueillie', 'COD « que » = les fleurs, placé avant.'],
  ['Les soldats étaient ___ de fatigue. (épuiser)', 'épuisés', 'épuisé|épuisées|épuiser', 'Employé avec être (verbe d\'état) : accord avec le sujet.'],
  ['Nous avons ___ nos amis à la gare. (attendre)', 'attendu', 'attendus|attendues|attendre', 'COD placé après le verbe : pas d\'accord.'],
  ['Cette histoire, je l\'ai ___ cent fois. (entendre)', 'entendue', 'entendu|entendus|entendues', '« l\' » = cette histoire, COD placé avant → féminin singulier.'],
  ['Elles se sont ___ de bonne heure. (lever)', 'levées', 'levé|levés|levée', 'Verbe pronominal, « se » COD placé avant → féminin pluriel.'],
  ['Les efforts qu\'il a ___ ont payé. (fournir)', 'fournis', 'fourni|fournies|fournie', 'COD « que » = les efforts (masculin pluriel).'],
  ['La maison a été ___ en 1920. (construire)', 'construite', 'construit|construits|construites', 'Voix passive (être) : accord avec le sujet.'],
  ['Ils ont ___ leur maison. (vendre)', 'vendu', 'vendus|vendue|vendre', 'COD après le verbe : pas d\'accord.'],
  ['Combien de pages as-tu ___ ? (lire)', 'lues', 'lu|lus|lue', 'COD « combien de pages » placé avant → féminin pluriel.'],
  ['Elle est ___ très tard. (rentrer)', 'rentrée', 'rentré|rentrés|rentrées', 'Avec être : accord avec le sujet.'],
  ['Les décisions qu\'ils ont ___ sont importantes. (prendre)', 'prises', 'pris|prise|prit', 'COD « que » = les décisions (féminin pluriel).'],
  ['Les enfants, je les ai ___ jouer dans le parc. (voir)', 'vus', 'vu|vues|vue', '« les » (les enfants) fait l\'action de jouer → accord : vus.'],
  ['Il a ___ beaucoup de chance. (avoir)', 'eu', 'eus|eue|eues', 'COD après le verbe : pas d\'accord.'],
  ['Les heures que j\'ai ___ à réviser m\'ont aidé. (passer)', 'passées', 'passé|passés|passée', 'COD « que » = les heures (féminin pluriel).']
];

/* Verbes du générateur de conjugaison. Pour les irréguliers : présent (6), radical de l'imparfait, passé simple (6),
   radical du futur et du conditionnel, subjonctif présent (6), participe passé, auxiliaire. */
window.VERBES_IRR = {
  'être': ['suis es est sommes êtes sont', 'ét', 'fus fus fut fûmes fûtes furent', 'ser', 'sois sois soit soyons soyez soient', 'été', 'avoir'],
  'avoir': ['ai as a avons avez ont', 'av', 'eus eus eut eûmes eûtes eurent', 'aur', 'aie aies ait ayons ayez aient', 'eu', 'avoir'],
  'aller': ['vais vas va allons allez vont', 'all', 'allai allas alla allâmes allâtes allèrent', 'ir', 'aille ailles aille allions alliez aillent', 'allé', 'être'],
  'faire': ['fais fais fait faisons faites font', 'fais', 'fis fis fit fîmes fîtes firent', 'fer', 'fasse fasses fasse fassions fassiez fassent', 'fait', 'avoir'],
  'dire': ['dis dis dit disons dites disent', 'dis', 'dis dis dit dîmes dîtes dirent', 'dir', 'dise dises dise disions disiez disent', 'dit', 'avoir'],
  'pouvoir': ['peux peux peut pouvons pouvez peuvent', 'pouv', 'pus pus put pûmes pûtes purent', 'pourr', 'puisse puisses puisse puissions puissiez puissent', 'pu', 'avoir'],
  'vouloir': ['veux veux veut voulons voulez veulent', 'voul', 'voulus voulus voulut voulûmes voulûtes voulurent', 'voudr', 'veuille veuilles veuille voulions vouliez veuillent', 'voulu', 'avoir'],
  'venir': ['viens viens vient venons venez viennent', 'ven', 'vins vins vint vînmes vîntes vinrent', 'viendr', 'vienne viennes vienne venions veniez viennent', 'venu', 'être'],
  'prendre': ['prends prends prend prenons prenez prennent', 'pren', 'pris pris prit prîmes prîtes prirent', 'prendr', 'prenne prennes prenne prenions preniez prennent', 'pris', 'avoir'],
  'voir': ['vois vois voit voyons voyez voient', 'voy', 'vis vis vit vîmes vîtes virent', 'verr', 'voie voies voie voyions voyiez voient', 'vu', 'avoir'],
  'savoir': ['sais sais sait savons savez savent', 'sav', 'sus sus sut sûmes sûtes surent', 'saur', 'sache saches sache sachions sachiez sachent', 'su', 'avoir'],
  'devoir': ['dois dois doit devons devez doivent', 'dev', 'dus dus dut dûmes dûtes durent', 'devr', 'doive doives doive devions deviez doivent', 'dû', 'avoir'],
  'mettre': ['mets mets met mettons mettez mettent', 'mett', 'mis mis mit mîmes mîtes mirent', 'mettr', 'mette mettes mette mettions mettiez mettent', 'mis', 'avoir'],
  'partir': ['pars pars part partons partez partent', 'part', 'partis partis partit partîmes partîtes partirent', 'partir', 'parte partes parte partions partiez partent', 'parti', 'être'],
  'écrire': ['écris écris écrit écrivons écrivez écrivent', 'écriv', 'écrivis écrivis écrivit écrivîmes écrivîtes écrivirent', 'écrir', 'écrive écrives écrive écrivions écriviez écrivent', 'écrit', 'avoir'],
  'lire': ['lis lis lit lisons lisez lisent', 'lis', 'lus lus lut lûmes lûtes lurent', 'lir', 'lise lises lise lisions lisiez lisent', 'lu', 'avoir']
};
window.VERBES_REG = {
  '1': ['chanter', 'marcher', 'parler', 'regarder', 'aimer', 'jouer', 'travailler', 'écouter', 'trouver', 'penser', 'crier', 'manger', 'commencer', 'arriver:être', 'tomber:être', 'entrer:être', 'rester:être'],
  '2': ['finir', 'choisir', 'grandir', 'réussir', 'obéir', 'réfléchir', 'rougir']
};
