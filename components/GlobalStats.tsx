import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getStatCall } from "../redux/stat"
import { AppDispatch, RootState } from "../types/types";
import { sortRankings } from "../utils/sortRankings";

export const GlobalStats = () => {
    const dispatch = useDispatch<AppDispatch>();
    const stats = useSelector((state:RootState) => state.globalStats.stats);
    const rankings = sortRankings([...stats])
    //top 10 and sort in backend
    useEffect(() => {
        dispatch(getStatCall());
    },[])

    return (
        <>
        <div className="w-full h-full flex items-center justify-center">
            <table className="mt-[100px]">

                <thead>
                    <th className="p-[.8rem] px-[4rem] bg-[#eae6ff] rounded-tl-lg">
                        Name
                    </th>
                    <th className="p-[.8rem] px-[4rem] bg-[#eae6ff]">
                        Speed [WPM]
                    </th>
                    <th className="p-[.8rem] px-[4rem] bg-[#eae6ff]">
                        Speed [CPM]
                    </th>
                    <th className="p-[.8rem] px-[4rem] bg-[#eae6ff] rounded-tr-lg">
                        Accuracy
                    </th>
                </thead>
                <tbody>
                    {rankings &&
                    rankings.map(stat => {
                        return (
                            <tr>
                                <td className="p-[.8rem] px-[4rem] bg-[#e8ffe6]">{stat.user}</td>
                                <td className="p-[.8rem] px-[4rem] bg-[#e8ffe6]">{stat.words_per_minute} WPM</td>
                                <td className="p-[.8rem] px-[4rem] bg-[#e8ffe6]">{stat.characters_per_minute} CPM</td>
                                <td className="p-[.8rem] px-[4rem] bg-[#e8ffe6]">{stat.accuracy}%</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        </>
    )
}