import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { TRANSLATIONS, translate } from '../public/game-test/i18n.mjs';
import { createTypewriter, splitGraphemes } from '../public/game-test/typewriter.mjs';
import { LAMPS, ROUND_COUNT, startGame, chooseLamp, advanceGame } from '../public/game-test/game.mjs';

test('both languages cover every screen, lamp and hint without changing product identities', () => {
  assert.deepEqual(Object.keys(TRANSLATIONS.ar.ui).sort(), Object.keys(TRANSLATIONS.en.ui).sort());
  for (const locale of Object.values(TRANSLATIONS)) {
    assert.equal(locale.intro.length, 4);
    locale.intro.forEach(speech => Object.values(speech).forEach(value => assert(value.trim())));
    assert.deepEqual(locale.lamps.map(lamp => lamp.id), LAMPS.map(lamp => lamp.id));
    locale.lamps.forEach((lamp, index) => {
      assert.equal(lamp.url, LAMPS[index].url);
      assert.equal(lamp.hints.length, 3);
      for (const text of [lamp.name, lamp.clue, lamp.story, lamp.description, lamp.note, ...lamp.hints]) assert(text.trim());
    });
  }
  const html = readFileSync(new URL('../public/game-test/index.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) {
    assert(translate('en', match[1]));
    assert(translate('ar', match[1]));
  }
});

test('Arabic uses the supplied dialogue, product names and Arabic numerals', () => {
  assert.equal(TRANSLATIONS.ar.ui.startTitle, 'هل أنت مستعد لتجد النور؟');
  assert.equal(TRANSLATIONS.ar.intro[1].line, 'أهلاً بك في فاستهاوس. لكل مصباحٍ هنا حكاية.');
  assert.equal(TRANSLATIONS.ar.lamps.find(lamp => lamp.id === 'nujaj')?.name, 'نُجاج');
  assert.equal(translate('ar', 'progress', {found: 1, total: 3}), '١ / ٣ مضاءة');
  assert.equal(translate('ar', 'story', {number: 3, total: 3}), 'القصة ٣ من ٣');
  assert.equal(translate('en', 'progress', {found: 1, total: 3}), '1 / 3 lit');
});

test('all four translated lamps can participate in a three-round game', () => {
  const covered = new Set();
  for (const random of [() => 0, () => 0.999]) {
    let state = startGame(random);
    for (const id of state.rounds) {
      for (const locale of Object.values(TRANSLATIONS)) assert(locale.lamps.find(lamp => lamp.id === id)?.story);
      covered.add(id);
      state = advanceGame(chooseLamp(state, id));
    }
    assert.equal(state.phase, 'complete');
    assert.equal(state.found.length, ROUND_COUNT);
  }
  assert.equal(covered.size, LAMPS.length);
});

test('Arabic typing preserves vowel marks and cancels the previous language', () => {
  assert.deepEqual(splitGraphemes('نُجاج'), ['نُ', 'ج', 'ا', 'ج']);
  assert.equal(splitGraphemes('أيُّ مصباحٍ أصف؟').join(''), 'أيُّ مصباحٍ أصف؟');
  const queued = new Map<number, () => void>();
  const frames: Array<{count: number; complete: boolean}> = [];
  let timer = 0;
  const writer = createTypewriter((count: number, complete: boolean) => frames.push({count, complete}), {
    schedule: ((callback: () => void) => { queued.set(++timer, callback); return timer; }) as unknown as typeof setTimeout,
    cancel: id => { queued.delete(id as number); },
  });
  writer.play('Welcome');
  const staleTick = queued.values().next().value!;
  writer.play('نُجاج');
  staleTick();
  assert.deepEqual(frames.at(-1), {count: 1, complete: false});
  while (queued.size) {
    const [id, callback] = queued.entries().next().value!;
    queued.delete(id); callback();
  }
  assert.deepEqual(frames.at(-1), {count: 4, complete: true});
  writer.play('أهلاً بك', true);
  assert.equal(queued.size, 0);
  assert.equal(frames.at(-1)?.complete, true);
});
