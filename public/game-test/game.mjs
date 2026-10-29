export const LAMPS = [
  {
    id: 'hamrah', name: 'Hamrah', description: 'rounded shade on a cherry-red base',
    clue: 'Before the skyline, people here searched the sea for something precious. Which lamp carries that story?',
    hints: ['Think of the UAE’s pearl-diving heritage.', 'A pale, rounded shade, like a pearl above the sea.', 'Look for the rounded white shade on the red base.'],
    story: 'A pearl of an idea. Hamrah takes its inspiration from the UAE’s pearl-diving heritage.',
    note: 'Pearl-diving heritage, reimagined in light.',
    url: 'https://www.fasthaus.ae/product/hamrah-lamp?variant=4-cherry-red',
  },
  {
    id: 'nujaj', name: 'Nujāj', description: 'fluted cone shade on a matcha-green base',
    clue: 'I’m after the one that plays with what you can see through. A little glass-like, a little mysterious.',
    hints: ['Think translucent surfaces and the softness of frosted glass.', 'Look for fine vertical flutes running through a cone-shaped shade.', 'It’s the fluted shade on the green base.'],
    story: 'Clearly, you have an eye. Nujāj pairs a translucent, fluted shade with a sculptural base.',
    note: 'Translucency, texture, and fluted forms.',
    url: 'https://www.fasthaus.ae/product/nujaj-desk-lamp?variant=1-matcha',
  },
  {
    id: 'kasane', name: 'Kasane', description: 'rippled wide shade on a tangerine base',
    clue: 'Imagine a desert ripple that decided to stay still. Then imagine it becoming a lamp.',
    hints: ['Think sand, flowing lines, and a repeating surface.', 'Its wide shade has a gently rippling edge.', 'Look for the rippled shade on the orange base.'],
    story: 'A little movement, held still. Kasane translates desert sand ripples into a sculptural light.',
    note: 'Desert ripples, translated into sculptural light.',
    url: 'https://www.fasthaus.ae/product/kasane-lamp?variant=2-tangerine',
  },
  {
    id: 'nasaq', name: 'Nasaq', description: 'three stacked rounded layers on a cobalt-blue base',
    clue: 'One shape was a good start. Then came another. And another. Which lamp found its rhythm in repetition?',
    hints: ['Think early-2010s abstraction and rounded, repeated forms.', 'Three soft layers, stacked one above another.', 'Find the stacked white shade on the blue base.'],
    story: 'Good things come in layers. Nasaq explores stacked, rounded forms and early-2010s abstraction.',
    note: 'Rounded repetition. A rhythm of its own.',
    url: 'https://www.fasthaus.ae/product/nasaq-lamp?variant=3-cobalt-blue',
  },
];

export const ROUND_COUNT = 3;

export const INTRO_DIALOGUE = [
  {
    label: 'Greeting',
    line: 'Oh, hello. You caught me after hours.',
    detail: 'Come in. There’s always room for one more curious mind.',
    reply: 'Hi! What’s this place?',
  },
  {
    label: 'A little chat',
    line: 'Welcome to Fasthaus. Every lamp here has a story.',
    detail: 'Some begin with a pearl. Others with a ripple, or a shape that repeats. Fancy a little guessing game?',
    reply: 'How does it work?',
  },
  {
    label: 'How to play',
    line: 'I’ll give you a clue. You pick the lamp.',
    detail: 'Click or tap one on the shelf. Get it right and it lights up. Find three to unlock the 10% reward.',
    reply: 'What if I get it wrong?',
  },
  {
    label: 'Ready when you are',
    line: 'We try again. No timer. No lost lives.',
    detail: 'You can ask for another clue whenever you’re stuck. Ready to find the first light?',
    reply: 'Let’s try it.',
  },
];

export function createGame(random = Math.random) {
  const rounds = LAMPS.map(lamp => lamp.id);
  for (let i = rounds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
  }
  return { phase: 'start', introStep: 0, round: 0, rounds: rounds.slice(0, ROUND_COUNT), found: [], hints: 0, attempts: 0, wrong: false };
}

export function enterStudio(state) {
  return state.phase === 'start' ? { ...state, phase: 'intro' } : state;
}

export function startGame(random = Math.random) {
  return { ...createGame(random), phase: 'guess' };
}

export function advanceIntro(state) {
  if (state.phase !== 'intro') return state;
  if (state.introStep < INTRO_DIALOGUE.length - 1) return { ...state, introStep: state.introStep + 1 };
  return { ...state, phase: 'guess' };
}

export function chooseLamp(state, id) {
  if (state.phase !== 'guess' || state.found.includes(id) || !LAMPS.some(lamp => lamp.id === id)) return state;
  if (id !== state.rounds[state.round]) return { ...state, attempts: state.attempts + 1, wrong: true };
  return { ...state, phase: 'reveal', found: [...state.found, id], attempts: state.attempts + 1, wrong: false };
}

export function revealHint(state) {
  if (state.phase !== 'guess' || state.hints >= LAMPS.find(lamp => lamp.id === state.rounds[state.round]).hints.length) return state;
  return { ...state, hints: state.hints + 1, wrong: false };
}

export function advanceGame(state) {
  if (state.phase !== 'reveal') return state;
  if (state.found.length === ROUND_COUNT) return { ...state, phase: 'complete' };
  return { ...state, phase: 'guess', round: state.round + 1, hints: 0, wrong: false };
}
