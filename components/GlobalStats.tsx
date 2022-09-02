import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getStatCall } from "../redux/stat"
import { AppDispatch, RootState } from "../types/types";

export const GlobalStats = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(getStatCall());
    },[])
    const stats = useSelector((state:RootState) => state.globalStats.stats);
    console.log(stats);

    return (
        <>
            <ul>
                    {stats &&
                        stats.map(stat => {
                            return (
                                <li key={stat.id}>
                                    <p>
                                        {stat.accuracy}
                                    </p>
                                </li>
                            )

                        })
                    }
            </ul>
        </>
    )
}