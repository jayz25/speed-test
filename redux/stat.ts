import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { statsInstancePayload, statState } from "../types/types";


export const statSlice = createSlice({
    name: 'stats',
    initialState: {
        stats: [],
        status: null,
    } as statState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            .addCase(getStatCall.pending, (state, action) => {
                state.status = 'Loading Stats'
            })
            .addCase(getStatCall.fulfilled, (state, action) => {
                state.stats = action.payload,
                state.status = 'Stats Received'
            })
            .addCase(getStatCall.rejected, (state, action) => {
                state.status = 'Stats API Failed'
            })
    },
})


export const addStatCall = createAsyncThunk(
    'stats/getStats',
    async (newStat: statsInstancePayload) => {
        const response = await fetch("http://127.0.0.1:8000/addStat/",{
            method: 'POST',
            body: JSON.stringify({
                "user": 'Anonymouse',
                "words_per_minute": newStat.words,
                "characters_per_minute": newStat.chars,
                "accuracy": newStat.accuracy
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        return response.json();
    }
)
export const getStatCall = createAsyncThunk(
    'stats/getStats',
    async (thunkAPI) => {
        const response = await fetch("http://127.0.0.1:8000/getStats/");
        return response.json();
    }
)
export default statSlice.reducer;