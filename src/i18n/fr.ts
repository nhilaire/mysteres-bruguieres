// Every player-facing string lives in a dictionary, French first (the reference). Components never inline text:
// they read `t` from useI18n(). The scenario (Auguste's narration, riddles) has its own files in ./scenario.
// French typography: no-break space (NBSP) before ":" and inside « », narrow no-break space (NNBSP) before ; ! ?
import { formatter, NBSP, NNBSP } from './format';

const { label } = formatter('fr-FR');

export const fr = {
  locale: 'fr-FR',
  consent: {
    title: 'Tes données, ton choix',
    body:
      'Mystère à Bruguières peut envoyer des statistiques anonymes (étapes atteintes, énigmes, plantages) pour améliorer ' +
      'le parcours. Aucune position, aucun identifiant.',
    accept: "J'accepte",
    refuse: 'Je refuse',
    footnote: "Tu peux changer d'avis dans les réglages.",
  },
  title: {
    tagline: 'Jeu de piste · Bruguières',
    start: "Commencer l'aventure",
    continue: 'Continuer',
    continueHint: "Reprendre là où tu t'es arrêté(e)",
    restart: 'Recommencer',
    progressTitle: 'Enquête en cours',
    progress: (places: number, solved: number) => `${places} lieux sur 9 · ${solved} énigmes résolues`,
    percent: (percent: number) => `${percent}${NBSP}%`,
    settings: 'Réglages',
    about: 'À propos du jeu',
    imageLabel: 'Auguste Meridius, maître horloger, dans son atelier',
  },
  restart: {
    title: `Recommencer depuis le début${NNBSP}?`,
    body: 'Ta progression et ton score actuels seront effacés. Cette action est définitive.',
    confirm: 'Tout effacer',
    cancel: 'Annuler',
  },
  location: {
    kicker: 'Avant de partir',
    title: 'Le radar a besoin de ta position',
    why:
      'Mystère à Bruguières se joue dans la rue. À chaque étape, un radar calcule la distance et la direction du lieu ' +
      "suivant à partir de la position de ton téléphone, et détecte ton arrivée pour déclencher l'énigme.",
    private: "📍 Ta position sert uniquement à ce calcul, sur ton téléphone. Elle n'est ni enregistrée, ni envoyée.",
    battery: '🔋 Le GPS ne tourne que sur les écrans radar, jamais pendant les dialogues.',
    compass: '🧭 La boussole oriente le radar. Elle ne demande aucune autorisation.',
    systemHint: `La question vient de ton téléphone${NBSP}: choisis «${NBSP}Pendant l'utilisation de l'application${NBSP}».`,
    allow: 'Autoriser la position',
    askAgain: "Redemander l'autorisation",
    openSettings: 'Ouvrir les réglages',
    enable: 'Activer la localisation',
    retry: 'Réessayer',
    withoutGps: 'Jouer sans le GPS',
    deniedTitle: 'Sans ta position, le radar est aveugle',
    denied:
      `L'autorisation a été refusée. Le jeu ne peut plus te guider vers les lieux ni détecter ton arrivée${NBSP}: il ne ` +
      `te restera que les indices du récit, et le bouton «${NBSP}J'y suis${NNBSP}!${NBSP}» à valider à la main à chaque étape.`,
    blockedTitle: "L'autorisation est bloquée",
    blocked:
      `Ton téléphone ne nous laisse plus poser la question. Pour réveiller le radar${NBSP}: Réglages → Mystère à ` +
      `Bruguières → Position → «${NBSP}Pendant l'utilisation de l'application${NBSP}».`,
    servicesDisabledTitle: 'La localisation est désactivée',
    servicesDisabled:
      `L'autorisation est bien accordée, mais la localisation est coupée sur l'appareil${NBSP}: aucun signal GPS ne peut ` +
      "arriver jusqu'au jeu.",
    errorTitle: 'Impossible de vérifier la position',
    error:
      'Une erreur est survenue en interrogeant le GPS de ton téléphone. Tu peux réessayer, ou partir quand même et ' +
      'confirmer tes arrivées à la main.',
    returnHint: `Reviens ensuite dans le jeu${NBSP}: cet écran se met à jour tout seul.`,
    back: 'Retour au menu',
  },
  game: {
    menu: 'Menu',
    menuLabel: 'Ouvrir le menu du jeu',
    menuHint: "Met l'aventure en pause et revient à l'écran d'accueil",
    back: "Revenir à l'écran précédent",
    forward: "Aller à l'écran suivant",
    tapToContinue: '(Tapote pour continuer)',
    tapHintTyping: 'Tapote pour afficher tout le texte immédiatement',
    tapHintNext: 'Tapote pour passer au paragraphe suivant',
    tapHintLast: 'Tapote pour continuer vers la suite',
    portrait: "Portrait d'Auguste Meridius, maître horloger de Bruguières",
  },
  radar: {
    step: (n: number) => `Étape ${n} sur 9`,
    searching: 'Recherche du signal GPS…',
    noLocation: 'Position indisponible.',
    noCompass: `Boussole indisponible${NBSP}: suis la direction indiquée.`,
    direction: (dir: string) => label('Direction', dir),
    arrived: `Tu y es${NNBSP}!`,
    imHere: `J'y suis${NNBSP}!`,
    imHereLabel: 'Confirmer à la main que je suis arrivé(e)',
    lost: 'Je ne trouve pas le lieu',
    lostLabel: "Ouvrir l'itinéraire à pied dans l'appli de cartes",
    radarLabel: (distance: string, dir: string) => `Radar${NBSP}: lieu à ${distance}, direction ${dir}`,
  },
  dir: {
    n: 'Nord',
    ne: 'Nord-Est',
    e: 'Est',
    se: 'Sud-Est',
    s: 'Sud',
    sw: 'Sud-Ouest',
    w: 'Ouest',
    nw: 'Nord-Ouest',
  },
  quiz: {
    waiting: 'En attente de ta réponse…',
    answer: (choice: string) => label('Réponse', choice),
    right: `Bravo${NNBSP}!`,
    wrong: `Raté… essaie encore${NNBSP}!`,
    point: `+1${NBSP}point${NBSP}: trouvé du premier coup${NNBSP}!`,
    noPoint: `Pas de point cette fois${NBSP}: il fallait trouver du premier coup.`,
    continue: 'Continuer',
  },
  puzzle: {
    title: 'Le dernier mécanisme',
    intro: `Tes 9 chiffres sont les rouages. Fais chaque calcul${NBSP}: le résultat donne la place d'une lettre dans l'alphabet.`,
    numbersLabel: 'Tes chiffres',
    ordinal: (n: number) => (n === 1 ? '1er' : `${n}e`),
    validate: 'Valider',
    erase: 'Effacer',
    wrong: `Pas tout à fait… recompte${NNBSP}!`,
    reveal: 'Montre-moi',
    revealHint: `Tu bloques${NNBSP}? Auguste peut te montrer ce calcul.`,
    solved: 'Le mot oublié est…',
    continue: 'Continuer',
  },
  final: {
    title: `Aventure terminée${NNBSP}!`,
    score: (score: number) => `Énigmes trouvées du premier coup${NBSP}: ${score}${NBSP}/${NBSP}9`,
    rate: `Donne ta note à cette aventure${NBSP}:`,
    star: (n: number) => `Donner ${n} étoile${n > 1 ? 's' : ''}`,
    thanks: `Merci pour ta note${NNBSP}!`,
    restart: "Recommencer l'aventure",
  },
  settings: {
    title: 'Réglages',
    sound: 'Sons',
    soundHelp: 'Ping du radar, carillon, réponses et cloches.',
    haptics: 'Vibrations',
    hapticsHelp: 'Tic de proximité près du lieu, arrivée et réponses.',
    telemetry: 'Statistiques anonymes',
    telemetryHelp: "Aide à améliorer le parcours. Aucune position, aucun identifiant n'est envoyé.",
    language: 'Langue',
    languageAuto: 'Automatique',
    back: 'Retour',
  },
  // « À propos »: the story comes from the discovery brief (docs/BRIEF.md, "Story (About screen)"), quoted in the PRD.
  about: {
    title: 'À propos',
    storyTitle: "L'histoire de ce jeu",
    story: [
      "J'ai d'abord créé ce jeu pour faire visiter Bruguières à mes enfants autrement qu'en les traînant d'un monument à " +
        "l'autre. Puis je l'ai montré aux voisins, qui ont joint leurs pas aux nôtres… et j'ai eu envie de le partager " +
        'avec toutes les familles curieuses de la ville.',
    ],
    developer: 'Créé par un développeur indépendant passionné.',
    howToTitle: 'Comment ça marche',
    howTo: [
      {
        title: 'Auguste te raconte',
        body: "À chaque étape, le vieil horloger t'ouvre une page de la mémoire de Bruguières et t'indique où chercher.",
      },
      {
        title: 'Le radar te guide',
        body:
          "Une boussole et la distance en temps réel te mènent au lieu suivant. Arrivé(e) sur place, l'écran passe tout " +
          "seul — ou tu confirmes d'un tapotement.",
      },
      {
        title: 'Observe et réponds',
        body: `La réponse à l'énigme n'est pas dans le téléphone${NBSP}: elle est devant toi, sur une plaque, un mur, un escalier.`,
      },
      {
        title: 'Réveille le passé',
        body: "Chaque lieu te livre un chiffre. Réunis-les tous et le dernier puzzle révélera le souvenir perdu d'Auguste.",
      },
    ],
    practicalTitle: 'Avant de partir',
    practical: [
      '9 lieux à découvrir, 9 énigmes à résoudre.',
      'Compte environ 2 heures, à pied ou à vélo. Le parcours reste dans le centre du village.',
      `Active le GPS et garde une batterie confortable${NBSP}: le radar utilise la position et la boussole en continu.`,
      `Tu peux t'arrêter quand tu veux${NBSP}: la progression est sauvegardée automatiquement sur ton téléphone.`,
      "Un point est marqué pour chaque énigme trouvée du premier coup — le score final est le tien, pas celui d'Auguste.",
      `Si le radar te joue des tours, le bouton «${NBSP}Je ne trouve pas le lieu${NBSP}» ouvre l'itinéraire dans ton appli de cartes.`,
    ],
    authorTitle: "Un mot de l'auteur",
    author: [
      `Ce jeu ne sort pas d'un studio${NBSP}: il a été imaginé et programmé sur mon temps libre, sans prétention.`,
      "Il est donc perfectible et sans doute pas exempt de bugs. Si quelque chose ne marche pas comme prévu, merci d'avance pour ton indulgence.",
    ],
    dataTitle: 'Tes données',
    data: ['Ta position ne quitte jamais ton téléphone. Les statistiques anonymes ne sont envoyées que si tu les as acceptées.'],
    version: (version: string) => `Version ${version}`,
    back: 'Retour',
  },
  errors: {
    title: 'Oups',
    body: 'Un problème est survenu. Relance le jeu.',
    retry: 'Réessayer',
  },
} as const;
