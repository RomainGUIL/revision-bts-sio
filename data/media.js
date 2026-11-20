/* Textes originaux pédagogiques, voix synthétique Microsoft Zira (en-US). */
window.LISTENING = [
  {
    "id": "helpdesk",
    "title": "A call to the help desk",
    "level": "Progressif · assistance",
    "audio": "audio/helpdesk.wav",
    "transcript": "Hello, this is Emma from the sales team. I am calling because I cannot access the shared folder from home. My internet connection is working, and I can open the company website. However, when I try to connect to the virtual private network, I get a message saying that my password has expired. I have a meeting with a client at ten thirty, and the presentation is in that folder. I have already restarted my laptop, but that did not solve the problem. Could you help me reset my password using the company portal? Please do not send a temporary password to my personal email address. You can call me back on my work mobile. I will be available until ten o'clock. Thank you.",
    "questions": [
      {
        "q": "Quel accès ne fonctionne pas, et quel message explique le problème ?",
        "answer": "L'accès VPN échoue car le mot de passe a expiré. Emma ne peut donc pas ouvrir le dossier partagé depuis chez elle.",
        "evidence": "my password has expired"
      },
      {
        "q": "Pourquoi sa demande est-elle urgente ?",
        "answer": "Elle a une réunion avec un client à 10 h 30 et sa présentation se trouve dans le dossier partagé.",
        "evidence": "a meeting with a client at ten thirty"
      },
      {
        "q": "Qu'a-t-elle déjà essayé et quel canal de contact demande-t-elle ?",
        "answer": "Elle a redémarré son ordinateur. Elle souhaite être rappelée sur son mobile professionnel avant 10 h, sans mot de passe envoyé à son adresse personnelle.",
        "evidence": "call me back on my work mobile"
      }
    ],
    "vocabulary": [
      [
        "shared folder",
        "dossier partagé"
      ],
      [
        "expired",
        "expiré"
      ],
      [
        "call back",
        "rappeler"
      ],
      [
        "work mobile",
        "téléphone professionnel"
      ]
    ],
    "seconds": 51
  },
  {
    "id": "phishing",
    "title": "An unusual message",
    "level": "Progressif · cybersécurité",
    "audio": "audio/phishing.wav",
    "transcript": "This morning, several employees received an email that appeared to come from our delivery company. The message asked them to pay a small fee before a parcel could be delivered. One employee noticed that the sender's address was different from the usual address. The link also led to an unfamiliar website. She did not click it. Instead, she used the report button in her email application and contacted the security team. We are now checking whether anyone entered payment details or a password. If you received this message, please report it and do not forward it to your colleagues. If you already entered information, call the help desk immediately. Reporting quickly helps us protect your account. You will not be blamed for asking for help.",
    "questions": [
      {
        "q": "Quel prétexte le message utilise-t-il pour demander de l'argent ?",
        "answer": "Il demande de petits frais pour permettre la livraison d'un colis.",
        "evidence": "pay a small fee before a parcel could be delivered"
      },
      {
        "q": "Quels sont les deux indices suspects repérés ?",
        "answer": "L'adresse de l'expéditeur diffère de l'adresse habituelle, et le lien mène vers un site inconnu.",
        "evidence": "the sender's address was different"
      },
      {
        "q": "Que doit faire une personne ayant déjà saisi ses informations ?",
        "answer": "Appeler immédiatement l'assistance. L'équipe doit savoir si des données de paiement ou un mot de passe ont été saisis.",
        "evidence": "call the help desk immediately"
      }
    ],
    "vocabulary": [
      [
        "delivery",
        "livraison"
      ],
      [
        "fee",
        "frais"
      ],
      [
        "sender",
        "expéditeur"
      ],
      [
        "report",
        "signaler"
      ],
      [
        "forward",
        "transférer un message"
      ]
    ],
    "seconds": 53
  },
  {
    "id": "outage",
    "title": "An update after an outage",
    "level": "Intermédiaire · infrastructure",
    "audio": "audio/outage.wav",
    "transcript": "Here is an update on yesterday's service outage. At nine fifteen, our monitoring system detected that the customer portal was no longer responding. The internal network and staff email were still available. We first suspected a network problem, but the logs showed that the application could not connect to its database. A configuration change had introduced an incorrect server address. We restored the previous configuration and checked the portal with the support team. The service was available again at nine forty. No customer records were lost. This afternoon, we will review the change procedure and add an automated connection test before future releases. We will also improve the status page so that customers can see when a problem is being investigated. Our priority is to prevent the same incident from happening again.",
    "questions": [
      {
        "q": "Quel service était touché et pendant combien de temps ?",
        "answer": "Le portail client était indisponible de 9 h 15 à 9 h 40, soit 25 minutes. Le réseau interne et la messagerie du personnel fonctionnaient encore.",
        "evidence": "available again at nine forty"
      },
      {
        "q": "Quelle était la cause réelle et comment le service a-t-il été rétabli ?",
        "answer": "Un changement de configuration avait introduit une mauvaise adresse de serveur de base de données. L'équipe a rétabli la configuration précédente.",
        "evidence": "an incorrect server address"
      },
      {
        "q": "Quelles mesures d'amélioration sont annoncées ?",
        "answer": "Revoir la procédure de changement, ajouter un test automatique de connexion avant les mises en production et améliorer la page d'état pour informer les clients.",
        "evidence": "add an automated connection test before future releases"
      }
    ],
    "vocabulary": [
      [
        "outage",
        "interruption de service"
      ],
      [
        "logs",
        "journaux"
      ],
      [
        "restore",
        "rétablir"
      ],
      [
        "release",
        "mise en production / version"
      ],
      [
        "status page",
        "page d'état du service"
      ]
    ],
    "seconds": 58
  },
  {
    "id": "backup",
    "title": "Preparing a recovery test",
    "level": "Intermédiaire · continuité",
    "audio": "audio/backup.wav",
    "transcript": "Before the next team meeting, I would like us to test our recovery procedure. A successful backup report does not prove that we can restore the data when we need it. On Thursday, we will restore a sample of files into a separate test environment. We will check that the files open correctly and that only authorised users can access them. Please record the time needed for each step and any problems you encounter. Do not overwrite the production files during the exercise. The backup copy used for the test must remain protected. After the exercise, we will compare the recovery time with the target agreed with the business team. If the process takes too long, we will update the procedure and arrange another test. The aim is to learn before a real incident occurs.",
    "questions": [
      {
        "q": "Pourquoi un rapport de sauvegarde réussi ne suffit-il pas ?",
        "answer": "Il ne prouve pas que les données pourront effectivement être restaurées lorsque ce sera nécessaire.",
        "evidence": "does not prove that we can restore the data"
      },
      {
        "q": "Où le test aura-t-il lieu et que faut-il éviter ?",
        "answer": "Dans un environnement de test distinct, jeudi. Il faut éviter d'écraser les fichiers de production et protéger la copie de sauvegarde.",
        "evidence": "a separate test environment"
      },
      {
        "q": "Que faut-il mesurer et comparer après l'exercice ?",
        "answer": "Le temps nécessaire aux étapes de restauration et les problèmes rencontrés. La durée totale sera comparée à l'objectif convenu avec l'équipe métier.",
        "evidence": "the target agreed with the business team"
      }
    ],
    "vocabulary": [
      [
        "recovery",
        "reprise / restauration"
      ],
      [
        "overwrite",
        "écraser"
      ],
      [
        "sample",
        "échantillon"
      ],
      [
        "business team",
        "équipe métier"
      ],
      [
        "target",
        "objectif"
      ]
    ],
    "seconds": 54
  }
];
window.OFFLINE_FILES = [
  {
    "path": "audio/helpdesk.wav",
    "title": "A call to the help desk",
    "kind": "Audio",
    "bytes": 2245678
  },
  {
    "path": "audio/phishing.wav",
    "title": "An unusual message",
    "kind": "Audio",
    "bytes": 2339136
  },
  {
    "path": "audio/outage.wav",
    "title": "An update after an outage",
    "kind": "Audio",
    "bytes": 2559136
  },
  {
    "path": "audio/backup.wav",
    "title": "Preparing a recovery test",
    "kind": "Audio",
    "bytes": 2363188
  },
  {
    "path": "sujets/anciens/Maths_2013_metropole.pdf",
    "title": "Maths 2013 metropole",
    "kind": "PDF",
    "bytes": 63639
  },
  {
    "path": "sujets/anciens/Maths_2013_nouvelle-caledonie.pdf",
    "title": "Maths 2013 nouvelle-caledonie",
    "kind": "PDF",
    "bytes": 70149
  },
  {
    "path": "sujets/anciens/Maths_2013_polynesie.pdf",
    "title": "Maths 2013 polynesie",
    "kind": "PDF",
    "bytes": 26779
  },
  {
    "path": "sujets/anciens/Maths_2014_metropole.pdf",
    "title": "Maths 2014 metropole",
    "kind": "PDF",
    "bytes": 81513
  },
  {
    "path": "sujets/anciens/Maths_2014_nouvelle-caledonie.pdf",
    "title": "Maths 2014 nouvelle-caledonie",
    "kind": "PDF",
    "bytes": 108969
  },
  {
    "path": "sujets/anciens/Maths_2014_polynesie.pdf",
    "title": "Maths 2014 polynesie",
    "kind": "PDF",
    "bytes": 71717
  },
  {
    "path": "sujets/anciens/Maths_2015_metropole.pdf",
    "title": "Maths 2015 metropole",
    "kind": "PDF",
    "bytes": 437328
  },
  {
    "path": "sujets/anciens/Maths_2015_nouvelle-caledonie.pdf",
    "title": "Maths 2015 nouvelle-caledonie",
    "kind": "PDF",
    "bytes": 41330
  },
  {
    "path": "sujets/anciens/Maths_2015_polynesie.pdf",
    "title": "Maths 2015 polynesie",
    "kind": "PDF",
    "bytes": 77081
  },
  {
    "path": "sujets/anciens/Maths_2016_metropole.pdf",
    "title": "Maths 2016 metropole",
    "kind": "PDF",
    "bytes": 67226
  },
  {
    "path": "sujets/anciens/Maths_2016_polynesie.pdf",
    "title": "Maths 2016 polynesie",
    "kind": "PDF",
    "bytes": 81406
  },
  {
    "path": "sujets/CEJM_2022_Agricoopia-Nouvelle-Caledonie.pdf",
    "title": "CEJM 2022 Agricoopia-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 171695
  },
  {
    "path": "sujets/CEJM_2022_Packitoo.pdf",
    "title": "CEJM 2022 Packitoo",
    "kind": "PDF",
    "bytes": 407822
  },
  {
    "path": "sujets/CEJM_2023_IDEMIA-Nouvelle-Caledonie.pdf",
    "title": "CEJM 2023 IDEMIA-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 849171
  },
  {
    "path": "sujets/CEJM_2023_NOVEFI.pdf",
    "title": "CEJM 2023 NOVEFI",
    "kind": "PDF",
    "bytes": 564888
  },
  {
    "path": "sujets/CEJM_2024_Purecontrol-secours.pdf",
    "title": "CEJM 2024 Purecontrol-secours",
    "kind": "PDF",
    "bytes": 926060
  },
  {
    "path": "sujets/CEJM_2024_Ref-plus.pdf",
    "title": "CEJM 2024 Ref-plus",
    "kind": "PDF",
    "bytes": 1076355
  },
  {
    "path": "sujets/CEJM_2025_DIGIM.pdf",
    "title": "CEJM 2025 DIGIM",
    "kind": "PDF",
    "bytes": 978255
  },
  {
    "path": "sujets/CEJM_2025_OVHcloud-Nouvelle-Caledonie.pdf",
    "title": "CEJM 2025 OVHcloud-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 988780
  },
  {
    "path": "sujets/cge/CGE_2025_A-table.pdf",
    "title": "CGE 2025 A-table",
    "kind": "PDF",
    "bytes": 312377
  },
  {
    "path": "sujets/cge/CGE_2026_Les-animaux-et-nous.pdf",
    "title": "CGE 2026 Les-animaux-et-nous",
    "kind": "PDF",
    "bytes": 1567440
  },
  {
    "path": "sujets/cge/CGE_sujet-zero_A-table.pdf",
    "title": "CGE sujet-zero A-table",
    "kind": "PDF",
    "bytes": 873159
  },
  {
    "path": "sujets/E7_SISR_2022_CaledoBank.pdf",
    "title": "E7 SISR 2022 CaledoBank",
    "kind": "PDF",
    "bytes": 1924163
  },
  {
    "path": "sujets/E7_SISR_2022_Myon-Nouvelle-Caledonie.pdf",
    "title": "E7 SISR 2022 Myon-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 738524
  },
  {
    "path": "sujets/E7_SISR_2023_Saint-Jacques-Nouvelle-Caledonie.pdf",
    "title": "E7 SISR 2023 Saint-Jacques-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 887490
  },
  {
    "path": "sujets/E7_SISR_2023_Ville-du-Parc.pdf",
    "title": "E7 SISR 2023 Ville-du-Parc",
    "kind": "PDF",
    "bytes": 1166383
  },
  {
    "path": "sujets/E7_SISR_2024_Martin.pdf",
    "title": "E7 SISR 2024 Martin",
    "kind": "PDF",
    "bytes": 1551375
  },
  {
    "path": "sujets/E7_SISR_2025_Everest-secours.pdf",
    "title": "E7 SISR 2025 Everest-secours",
    "kind": "PDF",
    "bytes": 885398
  },
  {
    "path": "sujets/E7_SISR_2025_Gaura-Nouvelle-Caledonie.pdf",
    "title": "E7 SISR 2025 Gaura-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 1014574
  },
  {
    "path": "sujets/E7_SISR_2025_SA-Blanca.pdf",
    "title": "E7 SISR 2025 SA-Blanca",
    "kind": "PDF",
    "bytes": 865274
  },
  {
    "path": "sujets/E7_SISR_2026_Nelait-Nouvelle-Caledonie.pdf",
    "title": "E7 SISR 2026 Nelait-Nouvelle-Caledonie",
    "kind": "PDF",
    "bytes": 898672
  },
  {
    "path": "sujets/E7_SISR_2026_Sparcle.pdf",
    "title": "E7 SISR 2026 Sparcle",
    "kind": "PDF",
    "bytes": 819636
  },
  {
    "path": "sujets/E7_SLAM_2022_Easy2Drive.pdf",
    "title": "E7 SLAM 2022 Easy2Drive",
    "kind": "PDF",
    "bytes": 1933481
  },
  {
    "path": "sujets/E7_SLAM_2023_Lama-Zoo.pdf",
    "title": "E7 SLAM 2023 Lama-Zoo",
    "kind": "PDF",
    "bytes": 1084477
  },
  {
    "path": "sujets/E7_SLAM_2024_GSIC.pdf",
    "title": "E7 SLAM 2024 GSIC",
    "kind": "PDF",
    "bytes": 924422
  },
  {
    "path": "sujets/E7_SLAM_2025_Casterman.pdf",
    "title": "E7 SLAM 2025 Casterman",
    "kind": "PDF",
    "bytes": 517646
  },
  {
    "path": "sujets/E7_SLAM_2026_NDV.pdf",
    "title": "E7 SLAM 2026 NDV",
    "kind": "PDF",
    "bytes": 930853
  }
];
