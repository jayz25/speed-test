import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WordsCollection, paragraphState } from "../types/types";
import { getWords, WordMode } from "../utils/getWords";

const initialState: paragraphState = {
  wordsCollection: [],
  status: "idle",
};

const paragraphSlice = createSlice({
  name: "paragraph",
  initialState,
  reducers: {
    loadWords: (state, action: PayloadAction<{ count?: number; mode?: WordMode } | undefined>) => {
      state.wordsCollection = getWords(action.payload?.count ?? 60, action.payload?.mode ?? "mixed");
      state.status = "ready";
    },
    refreshWords: (state) => {
      state.wordsCollection = getWords(state.wordsCollection.length || 60, "mixed");
      state.status = "ready";
    },
  },
});

export const { loadWords, refreshWords } = paragraphSlice.actions;
export default paragraphSlice.reducer;