const animeDatabase = [
  {
    title: "Naruto",
    coverImage: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    description: "Naruto Uzumaki, un jeune ninja turbulent, reve de devenir le plus grand Hokage de son village. Malgre le demon-renard scelle en lui, il n'abandonne jamais.",
    genres: ["Action", "Aventure", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 220, releaseStatus: "Released" }]
  },
  {
    title: "Naruto Shippuden",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/17407.jpg",
    description: "Deux ans et demi apres son depart pour s'entrainer, Naruto revient plus fort que jamais pour sauver son ami Sasuke et proteger son village.",
    genres: ["Action", "Aventure", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 500, releaseStatus: "Released" }]
  },
  {
    title: "One Piece",
    coverImage: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    description: "Monkey D. Luffy et son equipage de pirates parcourent Grand Line a la recherche du tresor ultime, le One Piece, pour devenir le Roi des Pirates.",
    genres: ["Action", "Aventure", "Comedie", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 1100, releaseStatus: "Released" }]
  },
  {
    title: "L'Attaque des Titans",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    description: "Dans un monde ou l'humanite vit retranchee derriere d'immenses murs pour se proteger des Titans, Eren Jaeger jure de les exterminer tous.",
    genres: ["Action", "Drame", "Fantasy", "Shonen"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 12, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 22, releaseStatus: "Released" },
      { name: "Saison Finale", episodeCount: 28, releaseStatus: "Released" }
    ]
  },
  {
    title: "Jujutsu Kaisen",
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    description: "Yuji Itadori, un lyceen aux capacites physiques hors du commun, rejoint une ecole d'exorcistes apres avoir avale un doigt maudit de Ryomen Sukuna.",
    genres: ["Action", "Fantasy", "Shonen"],
    seasons: [
      { name: "Saison 1", episodeCount: 24, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 23, releaseStatus: "Released" }
    ]
  },
  {
    title: "Demon Slayer",
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    description: "Tanjiro Kamado devient pourfendeur de demons apres le massacre de sa famille et la transformation de sa soeur Nezuko en demon.",
    genres: ["Action", "Fantasy", "Shonen"],
    seasons: [
      { name: "Saison 1", episodeCount: 26, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 18, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 11, releaseStatus: "Released" },
      { name: "Saison 4", episodeCount: 8, releaseStatus: "Released" }
    ]
  },
  {
    title: "Death Note",
    coverImage: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    description: "Light Yagami, un lyceen surdoue, decouvre un carnet surnaturel qui tue quiconque dont le nom y est inscrit. Il decide de creer un monde parfait.",
    genres: ["Thriller", "Psychologique", "Surnaturel"],
    seasons: [{ name: "Saison 1", episodeCount: 37, releaseStatus: "Released" }]
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    coverImage: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    description: "Les freres Elric, Edward et Alphonse, cherchent la Pierre Philosophale pour restaurer leurs corps apres une transmutation humaine interdite.",
    genres: ["Action", "Aventure", "Drame", "Fantasy"],
    seasons: [{ name: "Saison 1", episodeCount: 64, releaseStatus: "Released" }]
  },
  {
    title: "My Hero Academia",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    description: "Dans un monde ou 80% de la population possede un pouvoir, Izuku Midoriya, ne sans alter, reve de devenir le plus grand des heros.",
    genres: ["Action", "Shonen", "Super-pouvoirs"],
    seasons: [
      { name: "Saison 1", episodeCount: 13, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 4", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 5", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 6", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 7", episodeCount: 21, releaseStatus: "Released" }
    ]
  },
  {
    title: "Dragon Ball Z",
    coverImage: "https://cdn.myanimelist.net/images/anime/6/20936.jpg",
    description: "Son Goku et ses amis defendent la Terre contre des menaces de plus en plus puissantes, des Saiyans aux dieux de la destruction.",
    genres: ["Action", "Aventure", "Shonen", "Arts Martiaux"],
    seasons: [{ name: "Saison 1", episodeCount: 291, releaseStatus: "Released" }]
  },
  {
    title: "Dragon Ball Super",
    coverImage: "https://cdn.myanimelist.net/images/anime/7/74606.jpg",
    description: "Suite de Dragon Ball Z, Son Goku explore de nouveaux univers et affronte des adversaires divins dans des tournois epiques.",
    genres: ["Action", "Aventure", "Shonen", "Arts Martiaux"],
    seasons: [{ name: "Saison 1", episodeCount: 131, releaseStatus: "Released" }]
  },
  {
    title: "Hunter x Hunter (2011)",
    coverImage: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
    description: "Gon Freecss part a l'aventure pour devenir Hunter et retrouver son pere, un Hunter legendaire qui l'a abandonne etant enfant.",
    genres: ["Action", "Aventure", "Fantasy", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 148, releaseStatus: "Released" }]
  },
  {
    title: "One Punch Man",
    coverImage: "https://cdn.myanimelist.net/images/anime/12/73739.jpg",
    description: "Saitama est un heros si puissant qu'il vainc tous ses adversaires d'un seul coup de poing, ce qui le plonge dans un ennui existentiel profond.",
    genres: ["Action", "Comedie", "Shonen", "Super-pouvoirs"],
    seasons: [
      { name: "Saison 1", episodeCount: 12, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 12, releaseStatus: "Released" }
    ]
  },
  {
    title: "Tokyo Ghoul",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
    description: "Ken Kaneki, etudiant ordinaire, devient mi-humain mi-goule apres une transplantation d'organe et doit naviguer entre deux mondes.",
    genres: ["Action", "Horreur", "Surnaturel", "Drame"],
    seasons: [
      { name: "Saison 1", episodeCount: 12, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 12, releaseStatus: "Released" }
    ]
  },
  {
    title: "Sword Art Online",
    coverImage: "https://cdn.myanimelist.net/images/anime/11/39717.jpg",
    description: "Des milliers de joueurs sont pieges dans un MMORPG en realite virtuelle. La seule facon de s'echapper : terminer le jeu. Mourir en jeu, c'est mourir en vrai.",
    genres: ["Action", "Aventure", "Fantasy", "Romance"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 24, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 47, releaseStatus: "Released" }
    ]
  },
  {
    title: "Steins;Gate",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
    description: "Rintaro Okabe, un scientifique excentrique, decouvre accidentellement le voyage dans le temps et doit faire face aux consequences devastatrices.",
    genres: ["Sci-Fi", "Thriller", "Psychologique"],
    seasons: [{ name: "Saison 1", episodeCount: 24, releaseStatus: "Released" }]
  },
  {
    title: "Cowboy Bebop",
    coverImage: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    description: "L'equipage du vaisseau Bebop chasse les primes a travers le systeme solaire dans une ambiance jazz, melancolique et stylisee.",
    genres: ["Action", "Sci-Fi", "Drame"],
    seasons: [{ name: "Saison 1", episodeCount: 26, releaseStatus: "Released" }]
  },
  {
    title: "Neon Genesis Evangelion",
    coverImage: "https://cdn.myanimelist.net/images/anime/1314/108941.jpg",
    description: "Shinji Ikari, un adolescent tourmente, est force de piloter un mecha geant pour sauver l'humanite contre des creatures mysterieuses appelees Anges.",
    genres: ["Mecha", "Sci-Fi", "Psychologique", "Drame"],
    seasons: [{ name: "Saison 1", episodeCount: 26, releaseStatus: "Released" }]
  },
  {
    title: "Bleach",
    coverImage: "https://cdn.myanimelist.net/images/anime/3/40451.jpg",
    description: "Ichigo Kurosaki obtient les pouvoirs d'un Shinigami et protege les vivants et les morts contre les esprits malveillants appeles Hollows.",
    genres: ["Action", "Aventure", "Surnaturel", "Shonen"],
    seasons: [
      { name: "Bleach", episodeCount: 366, releaseStatus: "Released" },
      { name: "Thousand-Year Blood War", episodeCount: 52, releaseStatus: "Released" }
    ]
  },
  {
    title: "Spy x Family",
    coverImage: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    description: "Un espion, une tueuse et une telepathe forment une fausse famille, chacun ignorant les secrets des autres, dans une comedie d'espionnage hilarante.",
    genres: ["Action", "Comedie", "Famille"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 12, releaseStatus: "Released" }
    ]
  },
  {
    title: "Chainsaw Man",
    coverImage: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    description: "Denji, un jeune homme desespere, fusionne avec son demon-tronconneuse Pochita pour devenir Chainsaw Man et rejoint une organisation de chasseurs de demons.",
    genres: ["Action", "Horreur", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 12, releaseStatus: "Released" }]
  },
  {
    title: "Mob Psycho 100",
    coverImage: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
    description: "Shigeo 'Mob' Kageyama est un collegien aux pouvoirs psychiques immenses qui tente de vivre une vie normale tout en controlant ses emotions.",
    genres: ["Action", "Comedie", "Surnaturel"],
    seasons: [
      { name: "Saison 1", episodeCount: 12, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 13, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 12, releaseStatus: "Released" }
    ]
  },
  {
    title: "Vinland Saga",
    coverImage: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
    description: "Thorfinn, fils d'un grand guerrier viking, cherche vengeance contre Askeladd tout en decouvrant la vraie signification d'etre un guerrier.",
    genres: ["Action", "Aventure", "Drame", "Historique"],
    seasons: [
      { name: "Saison 1", episodeCount: 24, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 24, releaseStatus: "Released" }
    ]
  },
  {
    title: "Code Geass",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/50331.jpg",
    description: "Lelouch vi Britannia obtient le pouvoir du Geass et mene une rebellion contre le Saint Empire de Britannia pour venger sa mere et proteger sa soeur.",
    genres: ["Action", "Mecha", "Sci-Fi", "Drame"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 25, releaseStatus: "Released" }
    ]
  },
  {
    title: "Re:Zero",
    coverImage: "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
    description: "Subaru Natsuki est transporte dans un monde fantastique ou il possede le pouvoir de 'Retour par la Mort' : chaque fois qu'il meurt, il revient dans le temps.",
    genres: ["Fantasy", "Drame", "Thriller", "Psychologique"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 16, releaseStatus: "Released" }
    ]
  },
  {
    title: "Violet Evergarden",
    coverImage: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    description: "Apres la guerre, Violet Evergarden, une ancienne soldate, devient Auto Memory Doll pour comprendre les derniers mots de son commandant : 'Je t'aime'.",
    genres: ["Drame", "Fantasy", "Romance", "Tranche de vie"],
    seasons: [{ name: "Saison 1", episodeCount: 13, releaseStatus: "Released" }]
  },
  {
    title: "Your Lie in April",
    coverImage: "https://cdn.myanimelist.net/images/anime/3/67177.jpg",
    description: "Kosei Arima, un prodige du piano qui ne peut plus entendre les notes, retrouve sa passion grace a une violoniste libre et passionnee, Kaori Miyazono.",
    genres: ["Drame", "Romance", "Musique"],
    seasons: [{ name: "Saison 1", episodeCount: 22, releaseStatus: "Released" }]
  },
  {
    title: "Toradora!",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/22125.jpg",
    description: "Ryuuji, un garcon a l'air menacant, et Taiga, une petite fille au caractere explosif, s'allient pour aider l'autre a conquerir le coeur de leur beguins respectifs.",
    genres: ["Romance", "Comedie", "Tranche de vie"],
    seasons: [{ name: "Saison 1", episodeCount: 25, releaseStatus: "Released" }]
  },
  {
    title: "Haikyuu!!",
    coverImage: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    description: "Hinata Shoyo, malgre sa petite taille, reve de devenir un champion de volleyball. Il rejoint l'equipe de Karasuno pour atteindre le sommet.",
    genres: ["Sport", "Comedie", "Shonen"],
    seasons: [
      { name: "Saison 1", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 25, releaseStatus: "Released" },
      { name: "Saison 3", episodeCount: 10, releaseStatus: "Released" },
      { name: "Saison 4", episodeCount: 25, releaseStatus: "Released" }
    ]
  },
  {
    title: "Mushoku Tensei",
    coverImage: "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
    description: "Un homme sans emploi est reincarne dans un monde de fantasy en tant que Rudeus Greyrat, ou il decide de vivre sa nouvelle vie sans regrets.",
    genres: ["Fantasy", "Aventure", "Drame", "Isekai"],
    seasons: [
      { name: "Saison 1", episodeCount: 23, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 25, releaseStatus: "Released" }
    ]
  },
  {
    title: "Solo Leveling",
    coverImage: "https://cdn.myanimelist.net/images/anime/1139/142912.jpg",
    description: "Sung Jinwoo, le chasseur le plus faible de rang E, obtient un systeme unique qui lui permet de monter de niveau sans limite apres un donjon mortel.",
    genres: ["Action", "Fantasy", "Aventure"],
    seasons: [
      { name: "Saison 1", episodeCount: 12, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 13, releaseStatus: "Released" }
    ]
  },
  {
    title: "Frieren: Beyond Journey's End",
    coverImage: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
    description: "Apres la defaite du Roi Demon, l'elfe magicienne Frieren realise que sa longue vie l'a empechee de vraiment connaitre ses compagnons disparus.",
    genres: ["Fantasy", "Aventure", "Drame", "Tranche de vie"],
    seasons: [{ name: "Saison 1", episodeCount: 28, releaseStatus: "Released" }]
  },
  {
    title: "Oshi no Ko",
    coverImage: "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
    description: "Apres avoir ete assassine, un medecin se reincarne en tant que fils de son idol preferee et decouvre les secrets sombres de l'industrie du divertissement.",
    genres: ["Drame", "Surnaturel", "Mystere"],
    seasons: [
      { name: "Saison 1", episodeCount: 11, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 13, releaseStatus: "Released" }
    ]
  },
  {
    title: "Blue Lock",
    coverImage: "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
    description: "300 jeunes attaquants japonais sont enfermes dans une installation appelée Blue Lock pour creer le meilleur buteur egocentriste du monde.",
    genres: ["Sport", "Shonen", "Drame"],
    seasons: [
      { name: "Saison 1", episodeCount: 24, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 14, releaseStatus: "Released" }
    ]
  },
  {
    title: "Bocchi the Rock!",
    coverImage: "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
    description: "Hitori 'Bocchi' Gotoh, une guitariste extremement timide, rejoint un groupe de rock et tente de surmonter son anxiete sociale par la musique.",
    genres: ["Comedie", "Musique", "Tranche de vie"],
    seasons: [{ name: "Saison 1", episodeCount: 12, releaseStatus: "Released" }]
  },
  {
    title: "Made in Abyss",
    coverImage: "https://cdn.myanimelist.net/images/anime/6/86733.jpg",
    description: "Riko descend dans l'Abysse, un gouffre gigantesque rempli de creatures et de reliques, pour retrouver sa mere, une legendaire Delveuse Blanche.",
    genres: ["Aventure", "Fantasy", "Drame", "Sci-Fi"],
    seasons: [
      { name: "Saison 1", episodeCount: 13, releaseStatus: "Released" },
      { name: "Saison 2", episodeCount: 12, releaseStatus: "Released" }
    ]
  },
  {
    title: "Cyberpunk: Edgerunners",
    coverImage: "https://cdn.myanimelist.net/images/anime/1818/126435.jpg",
    description: "A Night City, David Martinez, un jeune des rues, devient un mercenaire cyberpunk appele 'edgerunner' apres avoir perdu tout ce qu'il avait.",
    genres: ["Action", "Sci-Fi", "Drame"],
    seasons: [{ name: "Saison 1", episodeCount: 10, releaseStatus: "Released" }]
  },
  {
    title: "Black Clover",
    coverImage: "https://cdn.myanimelist.net/images/anime/2/88336.jpg",
    description: "Asta, ne sans aucun pouvoir magique dans un monde de sorciers, reve de devenir l'Empereur-Mage grace a un mystérieux grimoire a cinq feuilles.",
    genres: ["Action", "Fantasy", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 170, releaseStatus: "Released" }]
  },
  {
    title: "Dandadan",
    coverImage: "https://cdn.myanimelist.net/images/anime/1139/144772.jpg",
    description: "Momo et Okarun, deux lycéens aux croyances opposées - ovnis vs fantômes - découvrent que les deux existent et doivent combattre ensemble.",
    genres: ["Action", "Comedie", "Surnaturel", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 12, releaseStatus: "Released" }]
  },
  {
    title: "Sakamoto Days",
    coverImage: "https://cdn.myanimelist.net/images/anime/1101/147513.jpg",
    description: "Taro Sakamoto, un ancien tueur a gages legendaire devenu epicier de quartier, est rattrapé par son passé et doit proteger sa famille.",
    genres: ["Action", "Comedie", "Shonen"],
    seasons: [{ name: "Saison 1", episodeCount: 11, releaseStatus: "Released" }]
  }
];

export default animeDatabase;
