/* PYTHON POUR L'E3 (algorithmique appliquée) — écrit à la main, page « Maths et Python ».
   PY_FICHE    : aide-mémoire [titre, code d'exemple, explication]
   PY_AFFICHE  : « Que va afficher ce programme ? » [code, sortie exacte, explication] — la sortie a été vérifiée avec Python 3.
   PY_COMPLETE : « Complète la ligne » [énoncé, code avec ____, réponses acceptées (sans espaces), explication]
   PY_ECRIRE   : « Écris la fonction » [énoncé, tests (assert), solution, explication] — les solutions passent leurs tests (vérifié avec Python 3). */
window.PY_FICHE = [
  ["Variables et types", "age = 20\nprix = 12.5\nnom = \"Lina\"\nadmin = True\nprint(type(prix))   # <class 'float'>", "Le type dépend de la valeur. input() renvoie toujours du texte : int(input()) pour un nombre."],
  ["Conditions", "if note >= 10:\n    print(\"admis\")\nelif note >= 8:\n    print(\"rattrapage\")\nelse:\n    print(\"ajourné\")", "Deux-points en fin de ligne, bloc indenté de 4 espaces, == pour comparer."],
  ["Boucle for et range", "for i in range(3):        # 0, 1, 2\n    print(i)\nfor i in range(2, 10, 3):  # 2, 5, 8\n    print(i)", "range(a, b, pas) : de a inclus à b EXCLU."],
  ["Boucle while", "n = 37\nwhile n > 0:\n    print(n % 2)\n    n = n // 2", "Répète tant que la condition est vraie : la variable doit évoluer. // = division entière, % = reste."],
  ["Listes", "ports = [22, 80, 443]\nports.append(3389)\nprint(ports[0], ports[-1], len(ports))\nprint(ports[1:3])          # [80, 443]\nprint(80 in ports)         # True", "Indices à partir de 0 ; le dernier est len(L) - 1 ou -1."],
  ["Dictionnaires", "services = {22: \"SSH\", 80: \"HTTP\"}\nservices[443] = \"HTTPS\"\nfor port, nom in services.items():\n    print(port, nom)\nprint(services.get(21, \"inconnu\"))", "Clé → valeur. get() évite l'erreur si la clé n'existe pas."],
  ["Chaînes", "ligne = \"jdupont;Compta;actif\"\nlogin, service, etat = ligne.split(\";\")\nprint(login.upper())\nprint(f\"{login} est dans {service}\")", "split découpe, join assemble, f-string insère des variables."],
  ["Fonctions", "def nb_hotes(cidr):\n    \"\"\"Nombre d'hôtes d'un réseau /cidr.\"\"\"\n    return 2 ** (32 - cidr) - 2\n\nprint(nb_hotes(24))   # 254", "return renvoie le résultat ; ** est la puissance."],
  ["Conversions de base", "print(bin(10))          # 0b1010\nprint(hex(255))         # 0xff\nprint(int(\"1010\", 2))   # 10\nprint(int(\"ff\", 16))    # 255", "Utile pour les adresses IP et les masques."],
  ["Compter, sommer, maximum", "L = [12, 7, 19, 3]\ntotal = 0\nm = L[0]\nfor x in L:\n    total = total + x\n    if x > m:\n        m = x\nprint(total, m)   # 41 19", "Les trois schémas les plus fréquents : initialiser AVANT la boucle."]
];
window.PY_AFFICHE = [
  ["for i in range(4):\n    print(i)", "0\n1\n2\n3", "range(4) donne 0, 1, 2, 3 : 4 est exclu."],
  ["s = 0\nfor i in range(1, 5):\n    s = s + i\nprint(s)", "10", "1 + 2 + 3 + 4 = 10 (5 est exclu)."],
  ["x = 7\nif x % 2 == 0:\n    print(\"pair\")\nelse:\n    print(\"impair\")", "impair", "7 % 2 vaut 1 : le reste n'est pas 0."],
  ["L = [3, 8, 1]\nL.append(5)\nprint(len(L), L[1], L[-1])", "4 8 5", "append ajoute 5 à la fin ; L[1] est le 2e élément ; L[-1] le dernier."],
  ["n = 13\nb = \"\"\nwhile n > 0:\n    b = str(n % 2) + b\n    n = n // 2\nprint(b)", "1101", "Divisions successives par 2 : restes 1, 0, 1, 1 lus de bas en haut → 1101."],
  ["mots = [\"vlan\", \"dns\", \"dhcp\"]\nfor m in mots:\n    print(m.upper(), len(m))", "VLAN 4\nDNS 3\nDHCP 4", "Pour chaque mot : en majuscules puis sa longueur."],
  ["d = {\"admin\": 2, \"user\": 5}\nd[\"user\"] = d[\"user\"] + 1\nprint(d[\"user\"], len(d))", "6 2", "La valeur de \"user\" passe à 6 ; le dictionnaire a toujours 2 clés."],
  ["def f(a, b):\n    return a * b + 1\n\nprint(f(3, 4))", "13", "3 × 4 + 1 = 13."],
  ["i = 1\nwhile i < 20:\n    i = i * 3\nprint(i)", "27", "i vaut 1, 3, 9, 27 : à 27 la condition i < 20 est fausse, on sort."],
  ["L = [4, 9, 2, 7]\nm = L[0]\nfor x in L:\n    if x > m:\n        m = x\nprint(m)", "9", "Recherche du maximum : 9."],
  ["c = 0\nfor x in [5, 12, 8, 15, 3]:\n    if x >= 8:\n        c = c + 1\nprint(c)", "3", "12, 8 et 15 sont ≥ 8 : 3 éléments."],
  ["print(10 // 3, 10 % 3, 2 ** 5)", "3 1 32", "// division entière, % reste, ** puissance."],
  ["ip = \"192.168.1.20\"\noctets = ip.split(\".\")\nprint(octets[2], len(octets))", "1 4", "split(\".\") donne ['192', '168', '1', '20'] : l'indice 2 est '1'."],
  ["def double(L):\n    R = []\n    for x in L:\n        R.append(2 * x)\n    return R\n\nprint(double([1, 2, 3]))", "[2, 4, 6]", "La fonction construit une nouvelle liste avec chaque valeur doublée."],
  ["s = \"\"\nfor c in \"reseau\":\n    if c not in \"aeiou\":\n        s = s + c\nprint(s)", "rs", "On garde seulement les consonnes : r, s (les voyelles e, e, a, u sont retirées)."],
  ["for i in range(3):\n    for j in range(2):\n        print(i, j)", "0 0\n0 1\n1 0\n1 1\n2 0\n2 1", "Boucles imbriquées : pour chaque i, j prend 0 puis 1."],
  ["a, b = 48, 18\nwhile b != 0:\n    a, b = b, a % b\nprint(a)", "6", "Algorithme d'Euclide : PGCD(48, 18) = 6."],
  ["L = [1, 2, 3, 4, 5, 6]\nprint(L[1:4], L[::2])", "[2, 3, 4] [1, 3, 5]", "L[1:4] : indices 1 à 3 ; L[::2] : un élément sur deux."],
  ["x = 5\ndef f():\n    x = 10\n    return x\nprint(f(), x)", "10 5", "Le x de la fonction est local : le x global reste à 5."],
  ["n = 0\nfor x in range(10):\n    if x % 3 == 0:\n        n = n + x\nprint(n)", "18", "Multiples de 3 entre 0 et 9 : 0 + 3 + 6 + 9 = 18."]
];
window.PY_COMPLETE = [
  ["Complète pour afficher les nombres de 1 à 10 inclus.", "for i in ____:\n    print(i)", ["range(1,11)"], "range(1, 11) : 11 est exclu, donc on va jusqu'à 10."],
  ["Complète pour ajouter le port 8080 à la fin de la liste.", "ports = [80, 443]\n____", ["ports.append(8080)", "ports+=[8080]", "ports=ports+[8080]"], "append ajoute un élément à la fin de la liste."],
  ["Complète la condition : afficher \"pair\" si n est pair.", "if ____:\n    print(\"pair\")", ["n%2==0", "n%2==0:"], "Un nombre est pair si le reste de sa division par 2 est nul."],
  ["Complète pour renvoyer la moyenne de la liste L.", "def moyenne(L):\n    return ____", ["sum(L)/len(L)"], "Somme divisée par le nombre d'éléments."],
  ["Complète pour compter les comptes inactifs.", "nb = 0\nfor etat in etats:\n    if etat == \"inactif\":\n        ____", ["nb=nb+1", "nb+=1"], "On incrémente le compteur à chaque compte inactif."],
  ["Complète pour obtenir l'entier correspondant au binaire \"11000000\".", "valeur = ____", ["int(\"11000000\",2)", "int('11000000',2)"], "int(texte, 2) convertit un texte écrit en base 2."],
  ["Complète pour parcourir les clés et valeurs du dictionnaire.", "for login, role in comptes.____:\n    print(login, role)", ["items()"], "items() donne les couples (clé, valeur)."],
  ["Complète pour arrêter la boucle quand n vaut 0.", "while ____:\n    n = n // 10", ["n>0", "n!=0", "n>0:", "n!=0:"], "On répète tant que n n'est pas nul."]
];
window.PY_ECRIRE = [
  ["Écris une fonction somme(L) qui renvoie la somme des éléments d'une liste, SANS utiliser sum().", "assert somme([1, 2, 3]) == 6\nassert somme([]) == 0", "def somme(L):\n    total = 0\n    for x in L:\n        total = total + x\n    return total", "Compteur initialisé à 0, boucle, return après la boucle."],
  ["Écris une fonction maximum(L) qui renvoie le plus grand élément d'une liste non vide, SANS utiliser max().", "assert maximum([3, 9, 2]) == 9\nassert maximum([-5, -2, -8]) == -2", "def maximum(L):\n    m = L[0]\n    for x in L:\n        if x > m:\n            m = x\n    return m", "Initialiser avec le premier élément (et non 0, sinon le test avec des négatifs échoue)."],
  ["Écris une fonction nb_hotes(cidr) qui renvoie le nombre d'hôtes utilisables d'un réseau IPv4 /cidr (entre 1 et 30).", "assert nb_hotes(24) == 254\nassert nb_hotes(30) == 2", "def nb_hotes(cidr):\n    return 2 ** (32 - cidr) - 2", "32 − cidr bits d'hôte, moins le réseau et la diffusion."],
  ["Écris une fonction en_binaire(n) qui renvoie l'écriture binaire de n (entier ≥ 1) sous forme de texte, SANS utiliser bin().", "assert en_binaire(13) == \"1101\"\nassert en_binaire(1) == \"1\"", "def en_binaire(n):\n    b = \"\"\n    while n > 0:\n        b = str(n % 2) + b\n        n = n // 2\n    return b", "Divisions successives par 2, en ajoutant chaque reste à GAUCHE."],
  ["Écris une fonction pgcd(a, b) avec l'algorithme d'Euclide.", "assert pgcd(48, 18) == 6\nassert pgcd(17, 5) == 1", "def pgcd(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a", "On remplace (a, b) par (b, a mod b) jusqu'à ce que b soit nul."],
  ["Écris une fonction compte_admins(comptes) qui reçoit une liste de dictionnaires {\"login\": …, \"role\": …} et renvoie le nombre de rôles \"admin\".", "assert compte_admins([{\"login\": \"a\", \"role\": \"admin\"}, {\"login\": \"b\", \"role\": \"user\"}]) == 1\nassert compte_admins([]) == 0", "def compte_admins(comptes):\n    nb = 0\n    for c in comptes:\n        if c[\"role\"] == \"admin\":\n            nb = nb + 1\n    return nb", "On accède à la clé \"role\" de chaque dictionnaire."],
  ["Écris une fonction mot_de_passe_valide(mdp) qui renvoie True si le mot de passe a au moins 12 caractères ET contient au moins un chiffre.", "assert mot_de_passe_valide(\"motdepasse2026\") == True\nassert mot_de_passe_valide(\"court1\") == False\nassert mot_de_passe_valide(\"sanschiffreaucun\") == False", "def mot_de_passe_valide(mdp):\n    a_chiffre = False\n    for c in mdp:\n        if c.isdigit():\n            a_chiffre = True\n    return len(mdp) >= 12 and a_chiffre", "Deux conditions combinées avec and ; isdigit() teste si un caractère est un chiffre."],
  ["Écris une fonction est_premier(n) qui renvoie True si n (entier ≥ 2) est premier.", "assert est_premier(7) == True\nassert est_premier(9) == False\nassert est_premier(2) == True", "def est_premier(n):\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d = d + 1\n    return True", "On teste les diviseurs jusqu'à la racine carrée de n ; ici le return dans la boucle est voulu (dès qu'un diviseur est trouvé)."]
];
