# -*- coding: utf-8 -*-
"""Genere app/data/questions.js a partir des PDF de app/sujets/.
Usage : python tools/build_questions.py   (depuis le dossier app/, necessite `pip install pypdf`)
Chaque question recoit un identifiant stable : <fichier sans .pdf>#<numero>, ex. E7_SISR_2022_CaledoBank#A1.2
Les corrections (ecrites a la main) sont dans data/corrections.js et utilisent ces identifiants."""
import re, os, json, glob
import pypdf

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUJ = os.path.join(APP, 'sujets')
CONT = r'(?:[a-d]\)|Justifier|Vous |Indiquer|Puis|\(|Seuls|Le code de statut|Ne recopier)'

# Documents dont le titre n'est pas reperable automatiquement dans le PDF : page indiquee a la main (approximative a une page pres).
PAGES_MANUELLES = {
    'CEJM_2022_Packitoo': {'Annexe 10': 11},
    'E7_SLAM_2024_GSIC': {'Doc B5': 13},
    'E7_SISR_2024_Martin': {'Doc B6': 18},
    'CEJM_2025_OVHcloud-Nouvelle-Caledonie': {'Annexe 10': 12},
}

# Enonces mal decoupes dans le PDF (phrase sans point final, notes de bas de page, titre sur deux lignes) : corrections a la main.
OVH = 'CEJM_2025_OVHcloud-Nouvelle-Caledonie#'
CORR_MANUELLES = {
    'CEJM_2022_Agricoopia-Nouvelle-Caledonie#1.1': {'texte': "Analyser en quoi le système d’information de Agricoopia constitue une source de forces et de faiblesses."},
    'CEJM_2022_Agricoopia-Nouvelle-Caledonie#1.2': {'texte': "Présenter les avantages et les risques de la stratégie d’impartition pour Agricoopia."},
    'CEJM_2023_IDEMIA-Nouvelle-Caledonie#3.2': {'texte': "Justifier l’existence d’un cadre juridique protecteur pour ce type de données."},
    # 'coupe' : retire la fin de l'énoncé à partir de ce texte (note de bas de page ou contexte de la question suivante collés à l'énoncé).
    'E7_SISR_2022_Myon-Nouvelle-Caledonie#A2.6': {'coupe': ' 1 bibliothèque'},
    'E7_SISR_2022_Myon-Nouvelle-Caledonie#B3.1': {'coupe': ' Il a été décidé'},
    'E7_SISR_2022_Myon-Nouvelle-Caledonie#B3.2': {'coupe': ' 2 Le principe'},
    'E7_SISR_2025_Everest-secours#B1.1': {'coupe': ' Vous vous penchez'},
    'E7_SISR_2025_Everest-secours#B1.3': {'coupe': ' Vous poursuivez'},
    'E7_SISR_2025_Everest-secours#B1.4': {'coupe': ' 5 Une attaque'},
    'E7_SISR_2025_Gaura-Nouvelle-Caledonie#A1.2': {'coupe': ' 4 Kali'},
    'E7_SISR_2025_Gaura-Nouvelle-Caledonie#A2.6': {'coupe': ' 7 Le certificat'},
    'E7_SISR_2025_Gaura-Nouvelle-Caledonie#B1.3': {'coupe': ' 8 RADIUS'},
    'E7_SISR_2025_Gaura-Nouvelle-Caledonie#B2.1': {'ajoute': ' Présenter la réponse sous forme de tableau.'},
    'E7_SISR_2026_Nelait-Nouvelle-Caledonie#C2.2': {'coupe': ' 1 ITIL'},
    OVH + '2.1': {'mission': "Mission 2 : La stratégie d’intégration d’OVHcloud, source de contraintes et d’opportunités"},
    OVH + '2.2': {'mission': "Mission 2 : La stratégie d’intégration d’OVHcloud, source de contraintes et d’opportunités"},
    OVH + '2.3': {'mission': "Mission 2 : La stratégie d’intégration d’OVHcloud, source de contraintes et d’opportunités"},
}

def clean(s):
    s = re.sub(r'[ \t]+', ' ', s)
    return re.sub(r'\s*\n\s*', ' ', s).strip()

def split_q(s):
    """Separe l'enonce de la question du texte de contexte qui suit (contexte de la question suivante)."""
    parts = re.split(r'(?<! M\.)(?<=[.?:])\s+(?=[A-ZÀÉÈL«])', s)
    q = [parts[0]]; i = 1
    while i < len(parts) and re.match(CONT, parts[i]):
        q.append(parts[i]); i += 1
    return ' '.join(q), ' '.join(parts[i:])

out = {'sujets': [], 'questions': []}
for p in sorted(glob.glob(os.path.join(SUJ, '*.pdf'))):
    sid = os.path.basename(p)[:-4]
    ep, *rest = sid.split('_')
    if ep == 'E7': opt, an, cas = rest[0], rest[1], ' '.join(rest[2:])
    else: opt, an, cas = 'CEJM', rest[0], ' '.join(rest[1:])
    cas = cas.replace('-', ' ')
    cas = cas.replace(' Nouvelle Caledonie', ' (Nouvelle-Calédonie)').replace(' secours', ' (sujet de secours)')
    r = pypdf.PdfReader(p)
    pg = [(i + 1, re.sub(r'[ \t\xa0]+', ' ', x.extract_text() or '')) for i, x in enumerate(r.pages)]
    docs = {}
    for n, x in pg:
        if n < (5 if ep == 'CEJM' else 3): continue
        for m in re.finditer(r'^ ?(Document|Annexe|DOCUMENT|ANNEXE) ([A-D]?\d+(?:\.\d|[a-z])?) ?[:\-–]', x, re.M):
            key = ('Doc ' if m.group(1).lower().startswith('doc') else 'Annexe ') + m.group(2)
            docs.setdefault(key, n)
    docs.update(PAGES_MANUELLES.get(sid, {}))
    docs = dict(sorted(docs.items(), key=lambda kv: kv[1]))
    out['sujets'].append({'id': sid, 'epreuve': 'E4 CEJM' if ep == 'CEJM' else 'E7 Cybersécurité', 'option': opt,
                          'annee': int(an), 'cas': cas, 'fichier': 'sujets/' + sid + '.pdf', 'pages': len(pg), 'docs': docs})
    # CEJM : annexes citees par chaque mission, ex. "Mission 2 : ... (Annexes 4, 5 et 8 a 11)" -> {'2': [4, 5, 8, 9, 10, 11]}
    annexes = {}
    if ep == 'CEJM':
        flat = re.sub(r'\s+', ' ', ' '.join(x for n, x in pg if 2 <= n <= 6))
        for m in re.finditer(r'(?:Mission|MISSION) (\d) ?:[^()]{0,220}\(([^)]*annexes?[^)]*)\)', flat, re.I):
            nums = []
            for a, b in re.findall(r'(\d+)(?: à (\d+))?', m.group(2)):
                nums += list(range(int(a), int(b or a) + 1))
            annexes[m.group(1)] = nums
    dossier = mission = ''; ctx = ''; seen = set()
    if ep == 'E7':
        rx = r'^ ?((?:Dossier|DOSSIER) [A-D][^\n]{0,140})|^ ?((?:Mission|MISSION) [A-D]\d[^\n]{0,140})|^ ?Question ([A-D]) ?\.? ?(\d(?:\.\d)?) ?:?([\s\S]{0,1600}?)(?=\n ?(?:Question [A-D]|Mission [A-D]|MISSION|Dossier [A-D]|DOSSIER|Documents? à|IMPORTANT|BTS S)|\Z)'
    else:
        rx = r'^ ?()((?:Mission|MISSION) \d ?:[^\n]{0,140})|^ ?()(\d\.\d)\.? ([\s\S]{0,900}?)(?=\n ?(?:\d\.\d\.? [A-Z]|Mission|MISSION|Dossier|DOSSIER|Annexe|ANNEXE)|\Z)'
    for n, x in pg:
        if n < 3 and ep == 'E7': continue
        for m in re.finditer(rx, x, re.M):
            if m.group(1): dossier = clean(m.group(1)); ctx = ''; continue
            if m.group(2):
                mission = re.sub(r'\s*\((?:contexte|annexe)[^)]*\)?\s*$', '', clean(m.group(2)).replace('MISSION', 'Mission'), flags=re.I); ctx = ''; continue
            num = (m.group(3) or '') + m.group(4)
            if num in seen or (ep == 'CEJM' and num[0] > '3'): continue
            seen.add(num)
            q, nxt = split_q(clean(m.group(5)))
            # documents utiles a la question : annexes de la mission (CEJM) ou documents du dossier A/B/C/D (E7),
            # et 'cites' = ceux nommes dans l'enonce ou son contexte
            if ep == 'CEJM':
                utiles = ['Annexe %d' % a for a in annexes.get(num[0], [])]
            else:
                utiles = [k for k in docs if re.match(r'Doc \d', k) or k.startswith('Doc ' + num[0])]
            cites = [k for k in docs if re.search(r'(?:document|annexe)s? ' + re.escape(k.split(' ')[1]) + r'\b', ctx + ' ' + q, re.I)]
            out['questions'].append({'id': sid + '#' + num, 'sujet': sid, 'num': num, 'dossier': dossier,
                                     'mission': mission, 'page': n, 'contexte': ctx, 'texte': q,
                                     'docs': [k for k in utiles if k in docs], 'cites': cites})
            cm = dict(CORR_MANUELLES.get(sid + '#' + num, {})); qq = out['questions'][-1]
            if 'coupe' in cm: c = cm.pop('coupe'); qq['texte'] = qq['texte'].split(c)[0].rstrip()
            if 'ajoute' in cm: qq['texte'] += cm.pop('ajoute')
            qq.update(cm)
            ctx = nxt
js = '/* GENERE par tools/build_questions.py - ne pas modifier a la main. Source : sujets Reseau Certa (CC BY-NC-SA 4.0). */\nwindow.ANNALES = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n'
open(os.path.join(APP, 'data', 'questions.js'), 'w', encoding='utf-8').write(js)
for s in out['sujets']:
    print(s['id'], len([q for q in out['questions'] if q['sujet'] == s['id']]), 'questions;', ' '.join(q['num'] for q in out['questions'] if q['sujet'] == s['id']))
    print('   docs:', s['docs'])
