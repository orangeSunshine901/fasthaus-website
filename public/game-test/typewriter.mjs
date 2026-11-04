export function splitGraphemes(text) {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(text), part => part.segment);
  }
  return Array.from(text).reduce((parts, character) => {
    if (/\p{Mark}/u.test(character) && parts.length) parts[parts.length - 1] += character;
    else parts.push(character);
    return parts;
  }, []);
}

export function createTypewriter(render, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  let text = null, characters = [], count = 0, timer = null, generation = 0;

  function finish() {
    generation++;
    if (timer !== null) cancel(timer);
    timer = null;
    count = characters.length;
    if (text !== null) render(count, true);
  }

  function play(nextText, instant = false) {
    if (nextText === text) return;
    generation++;
    if (timer !== null) cancel(timer);
    timer = null;
    text = nextText;
    characters = splitGraphemes(text);
    count = 0;
    if (instant || !characters.length) { finish(); return; }
    const currentGeneration = generation;
    function tick() {
      if (generation !== currentGeneration) return;
      timer = null;
      count++;
      const complete = count === characters.length;
      render(count, complete);
      if (!complete) timer = schedule(tick, /[.!?؟،]/.test(characters[count - 1]) ? 140 : 24);
    }
    tick();
  }

  return { play, finish };
}
