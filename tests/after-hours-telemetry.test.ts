import assert from "node:assert/strict";
import test from "node:test";
import { createGameTelemetry } from "../public/game-test/telemetry.mjs";
import { createGame, enterStudio, advanceIntro, chooseLamp, advanceGame, revealHint } from "../public/game-test/game.mjs";

function fixture() {
  let state = createGame(() => 0.5);
  let time = 0;
  let counter = 0;
  const events: { event: string; properties: Record<string, unknown> }[] = [];
  const tracker = createGameTelemetry({
    getState: () => state, getLanguage: () => "en", now: () => time,
    uuid: () => `run-${++counter}`,
    emit: (event: string, properties: Record<string, unknown>) => events.push({ event, properties }),
  });
  return { tracker, events, state: () => state, set: (next: typeof state) => { state = next; }, tick: (ms: number) => { time += ms; } };
}

test("a game records a single enter, play and completion, and measures visible time", () => {
  const f = fixture();
  f.set(enterStudio(f.state())); f.tracker.enter(); f.tracker.enter();
  for (let i = 0; i < 4; i++) f.set(advanceIntro(f.state()));
  f.tracker.start(); f.tracker.start();
  f.tick(2000); f.tracker.visibility(false); f.tick(60000); f.tracker.visibility(true); f.tick(1000);
  f.set(revealHint(f.state())); f.tracker.hint();
  const wrong = ["hamrah", "nujaj", "kasane", "nasaq"].find((id) => id !== f.state().rounds[0])!;
  f.set(chooseLamp(f.state(), wrong)); f.tracker.guess(wrong, false);
  for (let i = 0; i < 3; i++) {
    const id = f.state().rounds[f.state().round];
    f.set(chooseLamp(f.state(), id)); f.tracker.guess(id, true); f.tracker.discovery(id);
    f.set(advanceGame(f.state()));
    if (i < 2) f.tracker.round();
  }
  f.tracker.complete(); f.tracker.complete(); f.tick(5000);
  const complete = f.events.filter((item) => item.event === "after_hours_completed");
  assert.equal(complete.length, 1);
  assert.equal(complete[0].properties.active_seconds, 3);
  assert.equal(complete[0].properties.incorrect_guesses, 1);
  assert.equal(complete[0].properties.total_hints, 1);
  assert.equal(complete[0].properties.attempts, 4);
  assert.equal(f.events.filter((item) => item.event === "after_hours_started").length, 1);
  assert.equal(f.events.filter((item) => item.event === "after_hours_entered").length, 1);
  assert.equal(f.events.filter((item) => item.event === "after_hours_round_started").length, 3);
});

test("replay gets a new run ID and page hiding alone does not count abandonment", () => {
  const f = fixture();
  f.set(enterStudio(f.state())); f.tracker.enter();
  f.tracker.visibility(false);
  assert.equal(f.events.some((item) => item.event === "after_hours_exited"), false);
  f.tracker.exit(); f.tracker.exit();
  assert.equal(f.events.filter((item) => item.event === "after_hours_exited").length, 1);
  f.tracker.restart(); f.set(createGame(() => 0.5));
  f.set(enterStudio(f.state())); f.tracker.enter();
  const entered = f.events.filter((item) => item.event === "after_hours_entered");
  assert.notEqual(entered[0].properties.game_id, entered[1].properties.game_id);
  assert.equal(entered[1].properties.active_seconds, 0);
});
