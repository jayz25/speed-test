import {
  createEngineState,
  engineReducer,
  getLetterStates,
  getWordCounts,
  isWordWrong,
  MAX_EXTRA_CHARS,
  type EngineAction,
  type EngineState,
} from "../typingEngine";

const WORDS = ["the", "cat", "sat"];

const run = (state: EngineState, ...actions: EngineAction[]) =>
  actions.reduce(engineReducer, state);
const type = (text: string): EngineAction[] =>
  Array.from(text, (char) => ({ type: "typeChar", char }));
const fresh = () => createEngineState(WORDS);

describe("createEngineState", () => {
  it("starts idle with one empty typed entry", () => {
    expect(fresh()).toMatchObject({
      typed: [""],
      activeWordIndex: 0,
      status: "idle",
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
    });
  });
});

describe("reset", () => {
  it("replaces words and returns a fresh state", () => {
    const used = run(fresh(), ...type("th"));
    const next = engineReducer(used, { type: "reset", words: ["a", "b"] });
    expect(next).toEqual(createEngineState(["a", "b"]));
  });
});

describe("typeChar", () => {
  it("sets status to running on the first key", () => {
    expect(run(fresh(), ...type("t")).status).toBe("running");
  });
  it("counts correct and incorrect keystrokes", () => {
    const s = run(fresh(), ...type("tx"));
    expect(s.correctKeystrokes).toBe(1);
    expect(s.incorrectKeystrokes).toBe(1);
    expect(s.typed[0]).toBe("tx");
  });
  it("counts extra characters beyond the word as incorrect", () => {
    const s = run(fresh(), ...type("thex"));
    expect(s.incorrectKeystrokes).toBe(1);
  });
  it("caps typed chars at target length + MAX_EXTRA_CHARS", () => {
    const s = run(fresh(), ...type("t".repeat(3 + MAX_EXTRA_CHARS + 5)));
    expect(s.typed[0]).toHaveLength(3 + MAX_EXTRA_CHARS);
    expect(s.incorrectKeystrokes).toBe(3 - 1 + MAX_EXTRA_CHARS);
  });
  it("is a no-op when there are no words", () => {
    const empty = createEngineState([]);
    expect(engineReducer(empty, { type: "typeChar", char: "a" })).toBe(empty);
  });
});

describe("getLetterStates", () => {
  it("marks untyped idle, matching correct and differing incorrect", () => {
    expect(getLetterStates("the", "tx")).toEqual(["correct", "incorrect", "idle"]);
  });
  it("returns an extra entry per char typed beyond the word", () => {
    expect(getLetterStates("the", "thexx")).toEqual([
      "correct", "correct", "correct", "extra", "extra",
    ]);
  });
});

describe("backspace", () => {
  it("removes the last typed character", () => {
    expect(run(fresh(), ...type("th"), { type: "backspace" }).typed[0]).toBe("t");
  });
  it("is a no-op on an empty active word", () => {
    const s = fresh();
    expect(engineReducer(s, { type: "backspace" })).toBe(s);
  });
  it("cannot reach into a previously submitted word", () => {
    const s = run(fresh(), ...type("the"), { type: "submitWord" });
    expect(engineReducer(s, { type: "backspace" })).toBe(s);
  });
  it("does not change keystroke counters", () => {
    const s = run(fresh(), ...type("tx"), { type: "backspace" });
    expect(s.incorrectKeystrokes).toBe(1);
  });
});

describe("submitWord", () => {
  it("is a no-op when the active word is empty", () => {
    const s = fresh();
    expect(engineReducer(s, { type: "submitWord" })).toBe(s);
  });
  it("advances to the next word", () => {
    const s = run(fresh(), ...type("the"), { type: "submitWord" });
    expect(s.activeWordIndex).toBe(1);
    expect(s.typed).toEqual(["the", ""]);
  });
  it("marks a wrong word via isWordWrong", () => {
    const s = run(fresh(), ...type("thx"), { type: "submitWord" });
    expect(isWordWrong(s, 0)).toBe(true);
  });
  it("does not mark a correct word wrong", () => {
    const s = run(fresh(), ...type("the"), { type: "submitWord" });
    expect(isWordWrong(s, 0)).toBe(false);
  });
});

describe("isWordWrong", () => {
  it("is false for the active and upcoming words", () => {
    const s = run(fresh(), ...type("zzz"));
    expect(isWordWrong(s, 0)).toBe(false);
    expect(isWordWrong(s, 1)).toBe(false);
  });
});

describe("getWordCounts", () => {
  it("counts matched, incorrect words and matched characters", () => {
    const s = run(
      fresh(),
      ...type("the"), { type: "submitWord" },
      ...type("cxt"), { type: "submitWord" },
      ...type("sa"),
    );
    expect(getWordCounts(s)).toEqual({ wordsMatched: 1, wordsIncorrect: 1, charsMatched: 3 });
  });
  it("returns zeros for a fresh state", () => {
    expect(getWordCounts(fresh())).toEqual({ wordsMatched: 0, wordsIncorrect: 0, charsMatched: 0 });
  });
});

describe("finish", () => {
  it("is a no-op while idle", () => {
    const s = fresh();
    expect(engineReducer(s, { type: "finish" })).toBe(s);
  });
  it("blocks further input once finished", () => {
    const done = run(fresh(), ...type("t"), { type: "finish" });
    expect(done.status).toBe("finished");
    for (const action of [
      ...type("h"),
      { type: "backspace" },
      { type: "submitWord" },
    ] as EngineAction[]) {
      expect(engineReducer(done, action)).toBe(done);
    }
  });
});

describe("immutability", () => {
  it("returns new objects and leaves the input untouched", () => {
    const before = fresh();
    const snapshot = JSON.stringify(before);
    const after = engineReducer(before, { type: "typeChar", char: "t" });
    expect(after).not.toBe(before);
    expect(after.typed).not.toBe(before.typed);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
  it("keeps unchanged typed entries referentially equal in value", () => {
    const s = run(fresh(), ...type("the"), { type: "submitWord" }, ...type("c"));
    expect(s.typed[0]).toBe("the");
    expect(s.typed).toEqual(["the", "c"]);
  });
});

describe("finishOnLastWord (words mode)", () => {
  const wordsMode = () => createEngineState(WORDS, true);

  it("defaults to off and is set by createEngineState / reset", () => {
    expect(fresh().finishOnLastWord).toBe(false);
    expect(wordsMode().finishOnLastWord).toBe(true);
    expect(engineReducer(fresh(), { type: "reset", words: WORDS, finishOnLastWord: true }).finishOnLastWord).toBe(true);
    expect(engineReducer(wordsMode(), { type: "reset", words: WORDS }).finishOnLastWord).toBe(false);
  });

  it("finishes when the last word's final char is typed correctly", () => {
    const state = run(wordsMode(), ...type("the"), { type: "submitWord" }, ...type("cat"), { type: "submitWord" }, ...type("sa"));
    expect(state.status).toBe("running");
    const done = run(state, ...type("t"));
    expect(done.status).toBe("finished");
    expect(done.activeWordIndex).toBe(3);
    expect(getWordCounts(done).wordsMatched).toBe(3);
  });

  it("finishes on submitting the last word even when it is wrong", () => {
    const state = run(wordsMode(), ...type("the"), { type: "submitWord" }, ...type("cat"), { type: "submitWord" }, ...type("sax"));
    expect(state.status).toBe("running");
    const done = run(state, { type: "submitWord" });
    expect(done.status).toBe("finished");
    expect(getWordCounts(done).wordsIncorrect).toBe(1);
  });

  it("does not finish mid-list or when the flag is off", () => {
    expect(run(wordsMode(), ...type("the"), { type: "submitWord" }).status).toBe("running");
    const off = run(fresh(), ...type("the"), { type: "submitWord" }, ...type("cat"), { type: "submitWord" }, ...type("sat"));
    expect(off.status).toBe("running");
  });

  it("ignores input after finishing", () => {
    const done = run(createEngineState(["a"], true), ...type("a"));
    expect(done.status).toBe("finished");
    expect(run(done, ...type("b"), { type: "submitWord" })).toBe(done);
  });
});
