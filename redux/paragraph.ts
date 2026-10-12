import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParagraphState } from "../types/types";
import { getWords, WordMode, WordOptions } from "../utils/getWords";
import { pickQuote, quoteToWords, type QuoteLength } from "../utils/quotes";

const initialState: ParagraphState = {
  wordsCollection: [],
  status: "idle",
  mode: "mixed",
  options: {},
  quoteLength: null,
  source: null,
  round: 0,
};

/** Replaces the words with a random quote of `length` (avoiding `excludeText`) and bumps the round. */
function setQuote(state: ParagraphState, length: QuoteLength, excludeText?: string) {
  const quote = pickQuote(length, Math.random, excludeText);
  state.wordsCollection = quoteToWords(quote);
  state.quoteLength = length;
  state.source = quote.source;
  state.status = "ready";
  state.round += 1;
}

const paragraphSlice = createSlice({
  name: "paragraph",
  initialState,
  reducers: {
    loadWords: (state, action: PayloadAction<({ count?: number; mode?: WordMode; quoteLength?: QuoteLength } & WordOptions) | undefined>) => {
      // Quote mode: a random quote of the tier, typed as written (difficulty/options are ignored).
      if (action.payload?.quoteLength) {
        setQuote(state, action.payload.quoteLength);
        return;
      }
      const mode = action.payload?.mode ?? "mixed";
      const options = { punctuation: action.payload?.punctuation ?? false, numbers: action.payload?.numbers ?? false };
      state.mode = mode;
      state.options = options;
      state.quoteLength = null;
      state.source = null;
      state.wordsCollection = getWords(action.payload?.count ?? 60, mode, options);
      state.status = "ready";
      state.round += 1;
    },
    refreshWords: (state) => {
      if (state.quoteLength) {
        setQuote(state, state.quoteLength, state.wordsCollection.join(" "));
        return;
      }
      state.wordsCollection = getWords(state.wordsCollection.length || 60, state.mode, { ...state.options });
      state.status = "ready";
      state.round += 1;
    },
    /** Same words, new test: bumps `round` so the engine, timer and result posting restart. */
    repeatWords: (state) => {
      state.round += 1;
    },
  },
});

export const { loadWords, refreshWords, repeatWords } = paragraphSlice.actions;
export default paragraphSlice.reducer;