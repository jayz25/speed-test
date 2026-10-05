import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParagraphState } from "../types/types";
import { getWords, WordMode, WordOptions } from "../utils/getWords";

const initialState: ParagraphState = {
  wordsCollection: [],
  status: "idle",
  mode: "mixed",
  options: {},
  round: 0,
};

const paragraphSlice = createSlice({
  name: "paragraph",
  initialState,
  reducers: {
    loadWords: (state, action: PayloadAction<({ count?: number; mode?: WordMode } & WordOptions) | undefined>) => {
      const mode = action.payload?.mode ?? "mixed";
      const options = { punctuation: action.payload?.punctuation ?? false, numbers: action.payload?.numbers ?? false };
      state.mode = mode;
      state.options = options;
      state.wordsCollection = getWords(action.payload?.count ?? 60, mode, options);
      state.status = "ready";
      state.round += 1;
    },
    refreshWords: (state) => {
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