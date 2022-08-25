import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiCall, refreshParagraph } from "../redux/api";
import { AppDispatch } from "../redux/store";
import Paragraphs from "./Paragraphs"
import TypeHere from "./TypeHere"

export const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(apiCall());
    },[]);
    return (
        <>
            <Paragraphs />
            <TypeHere />
        </>

        )

}
export default Home;