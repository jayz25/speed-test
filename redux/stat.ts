import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { statsInstancePayload, statState } from "../types/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const statSlice = createSlice({
  name: "stats",
  initialState: {
    stats: [],
    status: null,
  } as statState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getStatCall.pending, (state) => {
        state.status = "Loading Stats";
      })
      .addCase(getStatCall.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.status = "Stats Received";
      })
      .addCase(getStatCall.rejected, (state) => {
        state.status = "Stats API Failed";
      })
      .addCase(addStatCall.pending, (state) => {
        state.status = "Saving Stat";
      })
      .addCase(addStatCall.fulfilled, (state) => {
        state.status = "Stat Saved";
      })
      .addCase(addStatCall.rejected, (state) => {
        state.status = "Save Failed";
      });
  },
});

export const addStatCall = createAsyncThunk(
  "stats/addStat", // Fixed: was duplicate 'stats/getStats'
  async (newStat: statsInstancePayload) => {
    const response = await fetch(`${API_BASE}/addStat/`, {
      method: "POST",
      body: JSON.stringify({
        user: "Anonymous", // Fixed typo: was 'Anonymouse'
        words_per_minute: newStat.words,
        characters_per_minute: newStat.chars,
        accuracy: newStat.accuracy,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return response.json();
  }
);

export const getStatCall = createAsyncThunk(
  "stats/getStats",
  async () => {
    const response = await fetch(`${API_BASE}/getStats/`);
    return response.json();
  }
);

export default statSlice.reducer;