import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paragraphState } from "../types/types";
import { getRandomElementFromArray } from "../utils/getRandomElement";
import { removePunc } from "../utils/removePunc";

const initialState = {
    paragraphCollection: [],
    currentParagraph: null,
    status: '',
} as paragraphState

const paragraphSlice = createSlice({
    name: 'paragraph',
    initialState: initialState as paragraphState,
    reducers: {
        refreshParagraph: (state) => {
            state.currentParagraph = removePunc(getRandomElementFromArray(state.paragraphCollection));
        }
    },
    extraReducers(builder) {
        builder
            .addCase(apiCall.pending, (state, action) => {
            state.status = 'Loading'
        })
            .addCase(apiCall.fulfilled, (state, action) => {
            state.status = 'Success',
            state.paragraphCollection = action.payload,  
            state.currentParagraph = removePunc(state.paragraphCollection[0])
        })
            .addCase(apiCall.rejected, (state, action) => {
            state.status = 'Rejected'
        })
    },
})

export const apiCall = createAsyncThunk(
    'paragraphs/getParagraphs',
    async (thunkAPI) => {
        // const response = await fetch("https://web-production-3dee.up.railway.app/getPara/");
        const response = await fetch("http://127.0.0.1:8000/getPara/");
        return response.json();

    }
)


export const { refreshParagraph } = paragraphSlice.actions;
export default paragraphSlice.reducer;