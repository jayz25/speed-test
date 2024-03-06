import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiCall } from "../redux/paragraph";
import { AppDispatch } from "../types/types";
import Paragraphs from "./Paragraphs"

export const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(apiCall());
    },[]);
    return (
        // TODO: Find out issue with unnecessary Y-axis scrollbar, currently fixed with overflow hidden here
            <div className="relative h-full overflow-hidden flex flex-1 justify-center bg-[#525252]">
                <Paragraphs />
            </div>
        )

}
export default Home;