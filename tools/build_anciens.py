# -*- coding: utf-8 -*-
"""Genere data/anciens.js a partir des anciens sujets SISR et SLAM (avant la reforme) places dans sujets/anciens/SISR_*.pdf et SLAM_*.pdf.
Usage : python tools/build_anciens.py   (depuis la racine de l'application, necessite `pip install pypdf`)

Ces sujets sont ceux de l'ancienne epreuve E4 « Conception et maintenance de solutions informatiques » (option SISR),
sessions 2015 a 2021, metropole et Nouvelle-Caledonie, publies par le Reseau Certa (CC BY-NC-SA 4.0).
Ils sont volontairement SEPARES des annales actuelles (data/questions.js) : ils ne comptent pas dans les statistiques
des « Themes a reviser » ni dans l'etude de cas aleatoire. Pas de corrige : ceux du Reseau Certa sont reserves aux enseignants.

Chaque question recoit un « usage » : celui du dictionnaire MANUEL (relu a la main), sinon une estimation par mots-cles :
  'e7' = cybersecurite, utile pour l'E7 actuelle ; 'e6' = infrastructure et administration (utile pour l'E6) ;
  'e5' = gestion, ITIL, couts (utile pour l'E5) ; 'autre' = non classe.
Nom de fichier : SISR_<annee>_<Cas>.pdf (metropole) ou SISR_<annee>_<Cas>-Nouvelle-Caledonie.pdf."""
import re, os, json, glob, unicodedata
import pypdf

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(APP, 'sujets', 'anciens')

SEC = r'secur|filtrage|regle|pare-feu|parefeu|vpn|certificat|https|ssl|tls|faille|vulnerab|attaque|risque|journa|ssh|chiffr|rgpd|authentif|portail captif|comptes? (d.utilisateur|utilisateur|administrat|inactif|desactiv|inutilis)|suppression de(s)? comptes?|virus|menace|sauvegard|suspect|nmap|audit|habilitation|acces aux locaux|piratage|intrus|confidentialit|syslog|integrite|force brute'
GES = r'itil|incident|probleme|tco|cout|sla|contrat|priorit|categorie|cloud|maintenance|fournisseur|devis|commercialisation|gestion de parc'
# Option SLAM : developpement (utile pour l'E6 SLAM) et themes E7 SLAM reconnus par mots-cles.
SEC_SLAM = r'secur|injection|xss|csrf|faille|vulnerab|attaque|hach|mot(s)? de passe|authentif|chiffr|certificat|https|rgpd|donnees? personnelle|cnil|droits? (d.acces|sur|des utilisateurs)|grant|revoke|privileg|habilitation|journa|trace|tracab|jeton|token|session|cookie|confidentialit|integrite|piratage|sauvegard'
DEV = r'sql|requete|table|cle (primaire|etrangere)|schema|modele|mcd|mld|uml|classe|methode|attribut|objet|heritage|interface|fonction|procedure|declencheur|trigger|algorithme|code|programme|variable|boucle|tableau|test|xml|json|api|service web|application|base de donnees|vue|index|contrainte|diagramme|cas d.utilisation|developp|langage|framework|instruction'
THEMES_SLAM = [('injection', r'injection'), ('xss', r'xss|csrf|script'), ('sqldroits', r'grant|revoke|privileg|droits? (d.acces|sur)|habilitation'), ('mdp', r'hach|mot(s)? de passe'),
               ('auth', r'authentif|jeton|token|session|cookie|habilitation'), ('crypto', r'chiffr|certificat|https|signature'), ('rgpd', r'rgpd|donnees? personnelle|cnil'), ('logs', r'journa|trace|tracab'), ('trigger', r'declencheur|trigger')]
INF = r'vlan|adress|\bip\b|dhcp|dns|rout|commutateur|spanning|rstp|qos|agregation|etherchannel|ipv6|virtuel|esx|\bsan\b|raid|stockage|ansible|playbook|crontab|configur|debit|interface|borne|wi-fi|wifi|serveur|snmp|cluster|disponibilit|liaison|cablage|onduleur|oid|supervision'


# Classement relu a la main question par question (novembre 2026). Il remplace le classement par mots-cles.
# Cle = fin de l'identifiant (Cas#numero) ; valeur = usage, suivi pour l'E7 des themes de l'application (data/notions.js, THEMES) travailles.
MANUEL = {
    'La-Guingampaise-Nouvelle-Caledonie#A1.1': 'e7 crypto sauvegarde', 'La-Guingampaise-Nouvelle-Caledonie#A1.2': 'e7 sauvegarde',
    'La-Guingampaise-Nouvelle-Caledonie#A2.1': 'e6', 'La-Guingampaise-Nouvelle-Caledonie#A2.2': 'e6', 'La-Guingampaise-Nouvelle-Caledonie#A2.3': 'e6',
    'La-Guingampaise-Nouvelle-Caledonie#B1.2': 'e7 sauvegarde incident', 'La-Guingampaise-Nouvelle-Caledonie#B1.3': 'e7 risques sauvegarde',
    'La-Guingampaise-Nouvelle-Caledonie#B2.1': 'e7 filtrage sauvegarde', 'La-Guingampaise-Nouvelle-Caledonie#B2.2': 'e6',
    'La-Guingampaise-Nouvelle-Caledonie#B3.1': 'e7 crypto', 'La-Guingampaise-Nouvelle-Caledonie#B3.2': 'e7 malware',
    'Saveol#A1.1': 'e6', 'Saveol#A1.2': 'e7 crypto risques', 'Saveol#A1.3': 'e6', 'Saveol#B1.1': 'e7 dispo', 'Saveol#B2.1': 'e7 filtrage', 'Saveol#B2.2': 'e5',
    'Rioca#A1.1': 'e6', 'Rioca#A1.2': 'e6', 'Rioca#A2.2': 'e7 dispo', 'Rioca#A2.3': 'e7 dispo', 'Rioca#A2.4': 'e7 sauvegarde dispo', 'Rioca#A2.5': 'e7 dispo',
    'Rioca#A3.1': 'e7 risques', 'Rioca#A3.2': 'e7 risques', 'Rioca#A3.3': 'e7 filtrage', 'Rioca#A4.1': 'e7 supervision', 'Rioca#A5.1': 'e7 logs sauvegarde',
    'Rioca#A5.2': 'e7 crypto dispo', 'Rioca#B2.1': 'e6', 'Rioca#B2.3': 'e6', 'Rioca#B2.4': 'e6', 'Rioca#B2.5': 'e6',
    'Armatis-LC#A2.1': 'e7 auth', 'Armatis-LC#A2.2': 'e7 crypto', 'Armatis-LC#A2.3': 'e7 auth', 'Armatis-LC#A2.4': 'e7 mdp', 'Armatis-LC#A2.5': 'e7 mdp auth',
    'Armatis-LC#A1.3': 'e6', 'Armatis-LC#B3.1': 'e6',
    'Universite-Ouest-Nouvelle-Caledonie#A2.1': 'e7 risques auth', 'Universite-Ouest-Nouvelle-Caledonie#A2.3': 'e7 risques', 'Universite-Ouest-Nouvelle-Caledonie#A3.1': 'e6',
    'Universite-Ouest-Nouvelle-Caledonie#A3.2': 'e7 wifi', 'Universite-Ouest-Nouvelle-Caledonie#A3.3': 'e7 crypto',
    'Universite-Ouest-Nouvelle-Caledonie#B3.1': 'e7 filtrage', 'Universite-Ouest-Nouvelle-Caledonie#B3.2': 'e7 filtrage',
    'CUB#A3.2': 'e6', 'CUB#A3.3': 'e6',
    'HSP-Nouvelle-Caledonie#A3.1': 'e7 risques malware', 'HSP-Nouvelle-Caledonie#B1.1': 'e7 malware', 'HSP-Nouvelle-Caledonie#B2.1': 'e7 sauvegarde',
    'HSP-Nouvelle-Caledonie#B2.2': 'e6', 'HSP-Nouvelle-Caledonie#B2.3': 'e7 incident', 'HSP-Nouvelle-Caledonie#B4.1': 'e5',
    'ModePrivee#A1.4': 'e6', 'ModePrivee#A2.1': 'e7 auth crypto', 'ModePrivee#A2.2': 'e7 logs', 'ModePrivee#A2.3': 'e7 supervision',
    'ModePrivee#B2.1': 'e7 logs incident', 'ModePrivee#B2.2': 'e7 filtrage incident', 'ModePrivee#B3.2': 'e5', 'ModePrivee#B3.3': 'e5', 'ModePrivee#C1.3': 'e5', 'ModePrivee#C1.4': 'e5',
    'DMAT#A1.1': 'e7 filtrage archi', 'DMAT#A1.2': 'e7 filtrage', 'DMAT#A1.3': 'e7 filtrage', 'DMAT#A3.3': 'e7 auth', 'DMAT#B1.1': 'e6',
    'DMAT#C2.1': 'e7 auth risques', 'DMAT#C2.2': 'e7 auth', 'DMAT#C2.3': 'e7 auth',
    'Leidoscope-Nouvelle-Caledonie#B2.1': 'e7 sauvegarde',
    'CMIN#A1.1': 'e6', 'CMIN#A1.2': 'e6', 'CMIN#A2.3': 'e6', 'CMIN#B1.1': 'e7 ad', 'CMIN#B1.2': 'e7 ad', 'CMIN#B1.3': 'e7 ad', 'CMIN#B1.4': 'e7 ad',
    'LINS-Nouvelle-Caledonie#A1.1': 'e7 archi', 'LINS-Nouvelle-Caledonie#A1.3': 'e7 crypto', 'LINS-Nouvelle-Caledonie#A1.4': 'e7 archi filtrage',
    'LINS-Nouvelle-Caledonie#A1.6': 'e7 filtrage', 'LINS-Nouvelle-Caledonie#A1.7': 'e7 filtrage', 'LINS-Nouvelle-Caledonie#A2.1': 'e7 filtrage sauvegarde',
    'LINS-Nouvelle-Caledonie#A2.2': 'e7 filtrage', 'LINS-Nouvelle-Caledonie#A2.3': 'e7 sauvegarde', 'LINS-Nouvelle-Caledonie#B1.1': 'e7 malware',
    'LINS-Nouvelle-Caledonie#B1.2': 'e7 malware filtrage', 'LINS-Nouvelle-Caledonie#B1.3': 'e7 auth crypto', 'LINS-Nouvelle-Caledonie#B2.1': 'e7 incident',
    'LINS-Nouvelle-Caledonie#B2.2': 'e7 incident', 'LINS-Nouvelle-Caledonie#B2.3': 'e7 supervision',
    # SLAM (relu a la main, novembre 2026) : corrige les faux positifs des mots-cles (« calculs chiffres », « en integrant »…).
    'AEROPLAN-Nouvelle-Caledonie#3.1': 'e6', 'SUPMASTER#4': 'e6', 'TRISEL#5': 'e6', 'AHM-23#2.3': 'e6', 'Vins-de-France-Nouvelle-Caledonie#1.2': 'e6',
    'TRISEL#3': 'e7 auth', 'DEMGUIV-Nouvelle-Caledonie#11': 'e7 risques', 'AHM-23#1.3': 'e7 auth', 'AHM-23#1.4': 'e7 sauvegarde', 'AHM-23#1.5': 'e7 sauvegarde',
    'Localux-Nouvelle-Caledonie#3.3': 'e5', 'WebCaisse#4.1': 'e5', 'HackatInnov#D.2': 'e7 archi',
    'Vins-de-France-Nouvelle-Caledonie#4.1': 'e7 crypto', 'Vins-de-France-Nouvelle-Caledonie#4.2': 'e7 auth', 'Vins-de-France-Nouvelle-Caledonie#4.3': 'e7 injection',
    'Vins-de-France-Nouvelle-Caledonie#4.4': 'e7 auth mdp',
    'EQUIDA#1.1': 'e6', 'EQUIDA#1.2': 'e6', 'EQUIDA#3.2': 'e6', 'EQUIDA#5.2': 'e5', 'GEST-PC-Nouvelle-Caledonie#1.2': 'e6', 'GEST-PC-Nouvelle-Caledonie#1.3': 'e6',
    'GEST-PC-Nouvelle-Caledonie#2.2': 'e6', 'SUPMASTER#5': 'e6', 'SUPMASTER#10': 'e6', 'MUSIC-Nouvelle-Caledonie#2': 'e5', 'MUSIC-Nouvelle-Caledonie#3': 'e5',
    'MUSIC-Nouvelle-Caledonie#5': 'e6', 'DEMGUIV-Nouvelle-Caledonie#1': 'e6', 'DEMGUIV-Nouvelle-Caledonie#2': 'e6', 'DANE-Nouvelle-Caledonie#4.4': 'e6',
    'WebCaisse#4.3': 'e5', 'Restiloc#4.2': 'e5', 'Restiloc#4.3': 'e5', 'Restiloc#4.4': 'e5', 'Coopain#4.2': 'e5', 'Vins-de-France-Nouvelle-Caledonie#1.4': 'e6',
}


def sans_accents(s):
    return unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()


def usage(texte, opt='SISR'):
    t = sans_accents(texte)
    if opt == 'SLAM':
        return 'e7' if re.search(SEC_SLAM, t) else 'e5' if re.search(GES, t) else 'e6' if re.search(DEV, t) else 'autre'
    return 'e7' if re.search(SEC, t) else 'e5' if re.search(GES, t) else 'e6' if re.search(INF, t) else 'autre'


def propre(s):
    return re.sub(r'\s+', ' ', s).strip()


SUITE = r'(?:[a-h][.)]\s|Justifie|Vous (?:pr[ée]cis|justifi|indiquer|donner|veiller|pourr|mentionn|r[ée]dig|propos)|Indique|Pr[ée]cise|Puis|\(|Seul|Expliqu|Propos|Donne|Lister|R[ée]dig|D[ée]tail|Calcul|Argument|Compl[ée]t)'


def enonce(s):
    """Garde l'énoncé de la question et retire le paragraphe de contexte de la question suivante, collé derrière dans le PDF."""
    parts = re.split(r'(?<! M\.)(?<!Mme\.)(?<! [A-Z]\.)(?<!\b[a-h]\.)(?<=[.?:])\s+(?=[A-ZÀÉÈÊÎÔÛ«])', s)   # pas de coupure après « M. », « Mme. », « F. »
    q = [parts[0]]; i = 1
    while i < len(parts) and re.match(SUITE, parts[i]):
        q.append(parts[i]); i += 1
    return ' '.join(q)


# Debut d'une question : « Question A.1.1 », « A.1.1 : », « A1.1: », « Question A1.1 », « B.2.3 Texte » (ce dernier format seulement s'il est
# precede de « Question » ou suivi de « : », pour ne pas confondre avec les titres de documents comme « A2.1 Solution 1 »).
DEBUT = re.compile(r'^ ?(Question\s*)?([A-D])\s?\.?\s?(\d)\s?\.\s?(\d)(?:\.\d)?\b\s*(:)?\s*', re.M)
FIN = re.compile(r'\n ?(?:(?:Question\s*)?[A-D]\s?\.?\s?\d\s?\.\s?\d\b|Dossier|DOSSIER|Partie [A-D]|PARTIE|Mission|Document|DOCUMENT|Annexe|ANNEXE|BTS S|EXAMEN|Code sujet|SESSION)')

def questions_slam(sid, pages):
    """Sujets SLAM : trois numerotations selon les annees.
    « Question A.2.1 » (2020-2021), « 1.1 » ou « 1.1 - » dans les blocs « TRAVAIL A FAIRE » (2013, 2017-2019), ou « 7. » numerote
    sur tout le sujet (2014-2016). On garde la numerotation qui trouve le plus de questions, rangees par mission."""
    MIS = re.compile(r'^ ?(?:Mission|MISSION|Dossier|DOSSIER|Partie|PARTIE) ?([A-D]?\.?\d?)\b\s*[-–—:]?\s*([^\n]{0,110})', re.M)
    FORMES = [
        re.compile(r'^ ?Question\s*([A-D])\s?\.?\s?(\d)(?:\s?\.\s?(\d))?\b\s*[-–—:.]?', re.M),
        re.compile(r'^ ?(?:Question\s*)?(\d)\s?\.\s?(\d)(?![\d.])\s*[-–—:.)]?', re.M),
        re.compile(r'^ ?(\d{1,2})\.\s+(?=[A-ZÀÂÉÈÊÎÔ])', re.M),
    ]
    VERBE = r'(modifier|expliquer|ecrire|proposer|rediger|coder|indiquer|fournir|realiser|presenter|donner|justifier|completer|preciser|decrire|concevoir|lister|identifier|analyser|mettre|calculer|definir|citer|choisir|expliciter|etablir|creer|montrer|argumenter|afin|dans le cadre|a partir|en vous|apres|sachant|representer|elaborer|completez|programmer|implementer|traduire|corriger|construire|determiner|evaluer|comparer|enumerer|recenser)'
    STOP = re.compile(r'\n ?(?:Mission|MISSION|Dossier|DOSSIER|Partie|PARTIE|Document|DOCUMENT|Annexe|ANNEXE|IMPORTANT|BTS S|Code sujet|SESSION)\b')
    pages = [(n, re.sub(r'[ \t\r\xa0]+', ' ', x)) for n, x in pages]
    meilleur = []
    for k, ITEM in enumerate(FORMES):
        trouve, vus, mission = [], set(), ''
        for n, x in pages:
            if n < 2: continue
            evts = [(m.start(), 'm', m) for m in MIS.finditer(x)]
            for m in ITEM.finditer(x):
                avant = sans_accents(x[max(0, m.start() - 2500):m.start() + 12])
                if k == 0 or 'travail a faire' in avant or re.search(r'question\s*\d', avant) or re.match(VERBE, sans_accents(x[m.end():m.end() + 30]).lstrip(' -:.)')):
                    evts.append((m.start(), 'q', m))
            evts.sort(key=lambda e: e[0])
            for i, (pos, typ, m) in enumerate(evts):
                if typ == 'm':
                    mission = propre(m.group(0)); continue
                num = '.'.join(g for g in m.groups() if g)
                if num in vus: continue
                fin = evts[i + 1][0] if i + 1 < len(evts) else len(x)
                st = STOP.search(x, m.end())
                if st and st.start() < fin: fin = st.start()
                texte = enonce(propre(x[m.end():fin]))[:900]
                if len(texte) < 15: continue
                vus.add(num)
                trouve.append({'id': sid + '#' + num, 'sujet': sid, 'num': num, 'page': n, 'dossier': mission, 'texte': texte, 'usage': usage(texte, 'SLAM')})
        if len(trouve) > len(meilleur): meilleur = trouve
        if k < 2 and len(meilleur) >= 6: break   # numerotation precise trouvee : inutile d'essayer « 7. »
    return meilleur


out = {'sujets': [], 'questions': []}
for p in sorted(glob.glob(os.path.join(DOSSIER, 'SISR_*.pdf')) + glob.glob(os.path.join(DOSSIER, 'SLAM_*.pdf'))):
    sid = os.path.basename(p)[:-4]
    opt, an, cas = sid.split('_', 2)
    zone = 'Nouvelle-Calédonie' if cas.endswith('-Nouvelle-Caledonie') else 'Métropole'
    cas = re.sub(r'-Nouvelle-Caledonie$', '', cas).replace('-', ' ')
    pages = [(i + 1, re.sub(r'[ \t\xa0]+', ' ', x.extract_text() or '')) for i, x in enumerate(pypdf.PdfReader(p).pages)]
    trouve, vus = ([], set()) if opt == 'SISR' else (questions_slam(sid, pages), set())
    for stricte in ((True, False) if opt == 'SISR' else ()):   # d'abord « Question » ou « : » obligatoires ; sinon on accepte aussi « A.1.1 Texte »
        trouve, vus, dossier = [], set(), ''
        for n, x in pages:
            if n < 3: continue
            for m in re.finditer(r'^ ?((?:Dossier|DOSSIER|Partie|PARTIE) [A-D]\b[^\n]{0,110})', x, re.M):
                pass
            for m in DEBUT.finditer(x):
                if stricte and not (m.group(1) or m.group(5)): continue
                num = m.group(2) + m.group(3) + '.' + m.group(4)
                if num in vus: continue
                fin = FIN.search(x, m.end())
                texte = enonce(propre(x[m.end():fin.start() if fin else m.end() + 900]))[:900]
                if len(texte) < 15 or re.match(r'^(Solution|Extrait|Utilisation|Impact|Co[uû]t)', texte): continue
                avant = x[:m.start()]
                d = re.findall(r'^ ?((?:Dossier|DOSSIER|Partie|PARTIE) [A-D]\b[^\n]{0,110})', avant, re.M)
                if d: dossier = propre(d[-1])
                vus.add(num)
                trouve.append({'id': sid + '#' + num, 'sujet': sid, 'num': num, 'page': n, 'dossier': dossier, 'texte': texte, 'usage': usage(texte, opt)})
        if len(trouve) >= 8: break
    trouve.sort(key=lambda q: (q['num'][0] if q['num'][0].isalpha() else '', [int(v) for v in re.findall('[0-9]+', q['num'])]))
    for q in trouve:
        cle = sid.split('_', 2)[2] + '#' + q['num']
        m = MANUEL.get(cle)
        if m: q['usage'] = m.split()[0]
        q['themes'] = m.split()[1:] if m else []
        if opt == 'SLAM' and not m and q['usage'] == 'e7':
            t = sans_accents(q['texte']); q['themes'] = [th for th, rx in THEMES_SLAM if re.search(rx, t)][:3]
        if q['usage'] == 'e7' and not q['themes']: print('  A CLASSER (e7 sans theme) :', cle)
    out['sujets'].append({'id': sid, 'option': opt, 'annee': int(an), 'cas': cas, 'zone': zone, 'fichier': 'sujets/anciens/' + sid + '.pdf', 'pages': len(pages)})
    out['questions'] += trouve
    u = {}
    for q in trouve: u[q['usage']] = u.get(q['usage'], 0) + 1
    print(sid, len(trouve), 'questions', u)

js = ('/* GENERE par tools/build_anciens.py - ne pas modifier a la main.\n'
      '   Anciens sujets SISR (2015-2021) et SLAM (2013-2021) de l ancienne epreuve E5 ecrite, source Reseau Certa (CC BY-NC-SA 4.0).\n'
      '   Separes des annales actuelles : non comptes dans les statistiques. « usage » et « themes » = classement relu a la main. */\n'
      'window.ANCIENS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(APP, 'data', 'anciens.js'), 'w', encoding='utf-8').write(js)
print('total', len(out['questions']), 'questions')
