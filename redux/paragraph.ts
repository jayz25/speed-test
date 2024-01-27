import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paragraphState } from "../types/types";
import { getRandomElementFromArray } from "../utils/getRandomElement";
import { removePunc } from "../utils/removePunc";


const typingSpeedParagraphs = [
    {
      id: 1,
      paragraph:
        "Nestled at the base of majestic mountains, the valley stretches for miles, a patchwork of vibrant meadows and dense forests. The air is filled with the sweet fragrance of wildflowers, and a gentle breeze carries the distant song of a babbling brook. Nature's orchestra plays a symphony, inviting you to explore the beauty that unfolds in every direction.",
    },
    {
      id: 2,
      paragraph:
        "In the heart of a bustling metropolis, skyscrapers reach towards the clouds, creating a stunning skyline that's illuminated by a myriad of lights as night falls. The streets pulse with life as people rush to and fro, each with a purpose and destination. The city never sleeps, and its energy is palpable, a constant hum that resonates through the urban landscape.",
    },
    {
      id: 3,
      paragraph:
        "As you wander through the ancient ruins, you're transported back in time. Weathered stones tell tales of civilizations long gone, and the air is thick with the weight of history. The remnants of a bygone era stand as a testament to the ingenuity and resilience of those who came before. It's a living museum, an immersive experience that allows you to connect with the past.",
    },
    {
      id: 4,
      paragraph:
        "Along the rugged coastline, waves crash against towering cliffs, sending sprays of saltwater into the air. Seabirds soar overhead, riding the thermals, and the distant cry of a whale echoes through the mist. The raw power of the ocean is on full display, a reminder of the forces that have shaped the landscape over millennia.",
    },
    {
      id: 5,
      paragraph:
        "A vast desert stretches under the scorching sun, an endless sea of dunes that seem to ripple like waves frozen in time. The heat is oppressive, and the air shimmers with mirages. Despite the harsh conditions, life thrives in unexpected forms. Creatures adapted to the arid environment leave their tracks in the sand, a dance of survival in a harsh and unforgiving land.",
    },
  ];

const initialState = {
    paragraphCollection: [],
    currentParagraph: null,
    status: '',
} as paragraphState

const paragraphSlice = createSlice({
  name: "paragraph",
  initialState: initialState as paragraphState,
  reducers: {
    refreshParagraph: (state) => {
      state.currentParagraph = removePunc(
        getRandomElementFromArray(state.paragraphCollection)
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(apiCall.pending, (state, action) => {
        state.status = "Loading";
      })
      .addCase(apiCall.fulfilled, (state, action) => {
            state.status = 'Success';
            state.paragraphCollection = action.payload;  
            state.currentParagraph = removePunc(state.paragraphCollection[0]);
      })
      .addCase(apiCall.rejected, (state, action) => {
        state.status = "Rejected";
      });
  },
});

export const apiCall = createAsyncThunk(
  "paragraphs/getParagraphs",
  async (thunkAPI) => {
    return typingSpeedParagraphs;
  }
);

export const { refreshParagraph } = paragraphSlice.actions;
export default paragraphSlice.reducer;