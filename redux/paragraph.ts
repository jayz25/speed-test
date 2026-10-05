import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParagraphState } from "../types/types";
import { getWords, WordMode } from "../utils/getWords";

const initialState: ParagraphState = {
  wordsCollection: [],
  status: "idle",
  mode: "mixed",
};

const paragraphSlice = createSlice({
  name: "paragraph",
  initialState,
  reducers: {
    loadWords: (state, action: PayloadAction<{ count?: number; mode?: WordMode } | undefined>) => {
      const mode = action.payload?.mode ?? "mixed";
      state.mode = mode;
      state.wordsCollection = getWords(action.payload?.count ?? 60, mode);
      state.status = "ready";
    },
    refreshWords: (state) => {
      state.wordsCollection = getWords(state.wordsCollection.length || 60, state.mode);
      state.status = "ready";
    },
  },
});

export const { loadWords, refreshWords } = paragraphSlice.actions;
export default paragraphSlice.reducer;