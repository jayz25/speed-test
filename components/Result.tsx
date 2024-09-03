import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { addStatCall } from "../redux/stat";
import { AppDispatch } from "../types/types";

export const Result = ({setModalVisibility, ...stats}) => {
        const dispatch = useDispatch<AppDispatch>();
        dispatch(addStatCall(stats.stats));
        useEffect(() => {
            const closeModal = (event: KeyboardEvent) => {
                if(event.key === 'Esc' ||event.key === 'Escape') {
                    setModalVisibility(false);
                }
            }
            window.addEventListener('keydown', closeModal);
        })
        return (
            <>
            {/* Add transition effect for modal opening and closing and get a good close icon */}
            <div className="flex bg-[#EFEFEF] absolute top-0 right-0 left-0 bottom-0 justify-center bg-opacity-70 items-center">
                <div className="bg-[#ffffff] rounded-lg w-[600px] h-[200px] p-2 shadow-lg">
                    <button className="block relative left-0" onClick={() => setModalVisibility(false)}>
                        <span className="font-bold text-xl p-[10px]">x</span>
                    </button>
                    <div className="p-[10px]">
                        <p>
                            {`YOOOOOOO!  Congratulations! You're dumb, your Typing speed is ${stats.stats.words} WPM (${stats.stats.chars} CPM) with ${stats.stats.accuracy}% Accuracy. Wow dude. Just wow.`}
                        </p>
                    </div>
                </div>
            </div>
            </>
        )
}