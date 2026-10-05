import store from "../redux/store";

export type WordsCollection = Array<string>;

export type ParagraphStatus = "idle" | "ready";

export type StatStatus =
    | null
    | "Loading Stats"
    | "Stats Received"
    | "Stats API Failed"
    | "Saving Stat"
    | "Stat Saved"
    | "Save Failed";

export interface ParagraphState {
    wordsCollection: WordsCollection,
    status: ParagraphStatus,
}

export interface StatsInstance {
    id: number,
    user: string,
    words_per_minute: number,
    characters_per_minute: number,
    accuracy: number
}

export const isStatsInstance = (v: unknown): v is StatsInstance => {
    if (typeof v !== "object" || v === null) return false;
    const o = v as Record<string, unknown>;
    return (
        typeof o.id === "number" &&
        typeof o.user === "string" &&
        typeof o.words_per_minute === "number" &&
        typeof o.characters_per_minute === "number" &&
        typeof o.accuracy === "number"
    );
};

export interface StatState {
    stats: Array<StatsInstance>,
    status: StatStatus
}

export interface StatsInstancePayload {
    user: string,
    words: number,
    chars: number,
    accuracy: number
}



export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;