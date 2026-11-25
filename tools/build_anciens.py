# -*- coding: utf-8 -*-
"""Genere data/anciens.js a partir des anciens sujets SISR (avant la reforme) places dans sujets/anciens/SISR_*.pdf.
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
}


def sans_accents(s):
    return unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()


def usage(texte):
    t = sans_accents(texte)
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

out = {'sujets': [], 'questions': []}
for p in sorted(glob.glob(os.path.join(DOSSIER, 'SISR_*.pdf'))):
    sid = os.path.basename(p)[:-4]
    _, an, cas = sid.split('_', 2)
    zone = 'Nouvelle-Calédonie' if cas.endswith('-Nouvelle-Caledonie') else 'Métropole'
    cas = re.sub(r'-Nouvelle-Caledonie$', '', cas).replace('-', ' ')
    pages = [(i + 1, re.sub(r'[ \t\xa0]+', ' ', x.extract_text() or '')) for i, x in enumerate(pypdf.PdfReader(p).pages)]
    trouve, vus = [], set()
    for stricte in (True, False):   # d'abord « Question » ou « : » obligatoires ; sinon on accepte aussi « A.1.1 Texte »
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
                trouve.append({'id': sid + '#' + num, 'sujet': sid, 'num': num, 'page': n, 'dossier': dossier, 'texte': texte, 'usage': usage(texte)})
        if len(trouve) >= 8: break
    trouve.sort(key=lambda q: (q['num'][0], [int(v) for v in q['num'][1:].split('.')]))
    for q in trouve:
        cle = sid.split('_', 2)[2] + '#' + q['num']
        m = MANUEL.get(cle)
        if m: q['usage'] = m.split()[0]
        q['themes'] = m.split()[1:] if m else []
        if q['usage'] == 'e7' and not q['themes']: print('  A CLASSER (e7 sans theme) :', cle)
    out['sujets'].append({'id': sid, 'annee': int(an), 'cas': cas, 'zone': zone, 'fichier': 'sujets/anciens/' + sid + '.pdf', 'pages': len(pages)})
    out['questions'] += trouve
    u = {}
    for q in trouve: u[q['usage']] = u.get(q['usage'], 0) + 1
    print(sid, len(trouve), 'questions', u)

js = ('/* GENERE par tools/build_anciens.py - ne pas modifier a la main.\n'
      '   Anciens sujets SISR (epreuve E4 avant la reforme, 2015-2021), source Reseau Certa (CC BY-NC-SA 4.0).\n'
      '   Separes des annales actuelles : non comptes dans les statistiques. « usage » et « themes » = classement relu a la main. */\n'
      'window.ANCIENS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(APP, 'data', 'anciens.js'), 'w', encoding='utf-8').write(js)
print('total', len(out['questions']), 'questions')
