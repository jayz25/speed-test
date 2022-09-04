import { statsInstance } from "../types/types";

export const sortRankings = (stats: Array<statsInstance>) => {
    //pretty weak sort Algo, got to improve. Deciding factors and if speed is equal it should compare accuracies
    stats.sort(function(a, b) {
        if(a.characters_per_minute > b.characters_per_minute) {
            return -1
        }else {
            return 1
        }
    });
    return stats;
}