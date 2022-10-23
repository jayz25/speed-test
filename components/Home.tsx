import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiCall } from "../redux/paragraph";
import { AppDispatch } from "../types/types";
import Paragraphs from "./Paragraphs"
import TypeHere from "./TypeHere"

export const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(apiCall());
    },[]);
    return (
            <div className="relative flex flex-1 justify-center bg-[#525252]">
                <Paragraphs />
                {/* <TypeHere /> */}
            </div>
        )

}
export default Home;