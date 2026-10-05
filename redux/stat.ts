import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isStatsInstance, StatsInstance, StatsInstancePayload, StatState } from "../types/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const isStatsApiEnabled = API_BASE !== "";

export const statSlice = createSlice({
  name: "stats",
  initialState: {
    stats: [],
    status: null,
  } as StatState,
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
      .addCase(getStatCall.rejected, (state, action) => {
        // An aborted request (unmount) isn't a failure; a newer request owns the status.
        if (action.meta.aborted) return;
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
  async (newStat: StatsInstancePayload) => {
    const response = await fetch(`${API_BASE}/addStat/`, {
      method: "POST",
      body: JSON.stringify({
        user: newStat.user,
        words_per_minute: newStat.words,
        characters_per_minute: newStat.chars,
        accuracy: newStat.accuracy,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
);

export const getStatCall = createAsyncThunk(
  "stats/getStats",
  async (_arg, { signal }): Promise<StatsInstance[]> => {
    const response = await fetch(`${API_BASE}/getStats/`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error("Invalid stats response: expected an array");
    return body.filter(isStatsInstance);
  }
);

export default statSlice.reducer;