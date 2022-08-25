import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRandomElementFromArray } from "../utils/getRandomElement";

const initialState = {
    paragraphCollection: [],
    currentParagraph: {},
    status: '',
}
const paragraphSlice = createSlice({
    name: 'paragraph',
    initialState: initialState,
    reducers: {
        refreshParagraph: (state) => {
            state.currentParagraph = getRandomElementFromArray([...state.paragraphCollection]);
        }
    },
    extraReducers(builder) {
        builder
            .addCase(apiCall.pending, (state, action)=> {
            state.status = 'Loading'
        })
            .addCase(apiCall.fulfilled, (state, action) => {
            state.status = 'Success',
            state.paragraphCollection = [...action.payload],
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
        const response = await fetch("http://127.0.0.1:8000/getPara/");
        // const data = await response.json()
        return response.json();

    }
)
export const { refreshParagraph } = paragraphSlice.actions;
export default paragraphSlice.reducer;