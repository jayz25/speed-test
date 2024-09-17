import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { addStatCall } from "../redux/stat";
import { AppDispatch } from "../types/types";

export const Result = ({ closeResultsModal, words, chars, accuracy}) => {
        const dispatch = useDispatch<AppDispatch>();
        dispatch(addStatCall({
            words, chars, accuracy,
            user: ""
        }));
        useEffect(() => {
            const closeModal = (event: KeyboardEvent) => {
                if(event.key === 'Esc' ||event.key === 'Escape') {
                    closeResultsModal();
                }
            }
            window.addEventListener('keydown', closeModal);
        })
        return (
            <>
            {/* Add transition effect for modal opening and closing and get a good close icon */}
            <div className="flex bg-[#EFEFEF] absolute top-0 right-0 left-0 bottom-0 justify-center bg-opacity-70 items-center">
                <div className="bg-[#ffffff] rounded-lg w-[600px] h-[200px] p-2 shadow-lg">
                    <button className="block relative left-0" onClick={() => closeResultsModal()}>
                        <span className="font-bold text-xl p-[10px]">x</span>
                    </button>
                    <div className="p-[10px]">
                        <p>
                            {`Your Typing speed is ${words} WPM (${chars} CPM) with ${accuracy}% Accuracy`}
                        </p>
                    </div>
                </div>
            </div>
            </>
        )
}