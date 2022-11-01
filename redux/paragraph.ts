import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paragraphState } from "../types/types";
import { getRandomElementFromArray } from "../utils/getRandomElement";


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
            state.currentParagraph = getRandomElementFromArray(state.paragraphCollection);
        }
    },
    extraReducers(builder) {
        builder
            .addCase(apiCall.pending, (state, action)=> {
            state.status = 'Loading'
        })
            .addCase(apiCall.fulfilled, (state, action) => {
            state.status = 'Success',
            state.paragraphCollection = action.payload,
            state.currentParagraph = state.paragraphCollection[0]
        })
            .addCase(apiCall.rejected, (state, action) => {
            state.status = 'Rejected'
        })
    },
})

export const apiCall = createAsyncThunk(
    'paragraphs/getParagraphs',
    async (thunkAPI) => {
        const response = await fetch("http://speedtype-api.herokuapp.com/getPara/");
        return response.json();

    }
)


export const { refreshParagraph } = paragraphSlice.actions;
export default paragraphSlice.reducer;