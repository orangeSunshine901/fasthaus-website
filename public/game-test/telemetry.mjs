// One in-memory run ID per game. No visitor identity or gameplay is persisted here.
export function createGameTelemetry({ emit, getState, getLanguage, now = () => performance.now(), uuid = () => crypto.randomUUID() }) {
  let gameId = uuid();
  let entered = false;
  let started = false;
  let completed = false;
  let exited = false;
  let totalHints = 0;
  let activeMs = 0;
  let activeSince = null;
  const pause = () => {
    if (activeSince !== null) activeMs += Math.max(0, now() - activeSince);
    activeSince = null;
  };
  const properties = () => {
    const state = getState();
    return {
      game: 'after_hours', game_version: '2026-11-22', game_id: gameId,
      language: getLanguage(), phase: state.phase, round_number: state.round + 1,
      lamps_found: state.found.length, attempts: state.attempts,
      incorrect_guesses: Math.max(0, state.attempts - state.found.length), total_hints: totalHints,
      active_seconds: Math.round((activeMs + (activeSince === null ? 0 : Math.max(0, now() - activeSince))) / 100) / 10,
    };
  };
  const send = (event, extra = {}) => emit(`after_hours_${event}`, { ...properties(), ...extra });
  return {
    enter() {
      if (entered) return;
      entered = true; activeSince = now(); send('entered');
    },
    start() {
      if (started) return;
      started = true; send('started'); this.round();
    },
    round() { send('round_started', { lamp_id: getState().rounds[getState().round] }); },
    guess(lamp, correct) { send('guess_submitted', { lamp_id: lamp, target_lamp_id: getState().rounds[getState().round], correct }); },
    discovery(lamp) { send('lamp_discovered', { lamp_id: lamp }); },
    hint() { totalHints += 1; send('hint_used', { lamp_id: getState().rounds[getState().round], target_lamp_id: getState().rounds[getState().round], hint_number: getState().hints }); },
    complete() {
      if (completed) return;
      completed = true; pause(); send('completed');
    },
    restart() {
      pause(); send('restarted', { was_completed: completed, had_started: started });
      gameId = uuid(); entered = false; started = false; completed = false; exited = false;
      totalHints = 0; activeMs = 0;
    },
    language() { send('language_selected'); },
    shop(destination, lamp) { send('shop_clicked', { destination_type: destination, ...(lamp ? { lamp_id: lamp } : {}) }); },
    feedback(source) { send('feedback_opened', { source, completed }); },
    visibility(visible) {
      pause();
      if (visible && entered && !completed) activeSince = now();
    },
    exit() {
      if (exited || !entered) return;
      pause(); exited = true; send('exited', { completed, had_started: started });
    },
    resume() { exited = false; this.visibility(true); },
  };
}
