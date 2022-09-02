import store from "../redux/store";

export type ParagraphCollection = Array<ParagraphObject>;
export interface ParagraphObject {
    id: number,
    paragraph: string,
}

export interface paragraphState {
    paragraphCollection: ParagraphCollection,
    currentParagraph: ParagraphObject,
    status: string | null,
}

export interface statsInstance {
    id: number,
    user: string,
    words_per_minute: number,
    characters_per_minute: number,
    accuracy: number
}

export interface statState {
    stats: Array<statsInstance>,
    status: string | null
}

export interface statsInstancePayload {
    user: string,
    words: number,
    chars: number,
    accuracy: number
}

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;