import { useEffect, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Modal } from "./Modal";

const Timer = ({inputDisabled, setInputDisabled, timerKey, isPlaying, setIsPlaying, setWpm}) => {
    const [isModalVisible, setModalVisibility] = useState(false);
    const onCompleteTimer = () => {
        //Fire input Disabled event or reset stats
        //Fire Modal dislay here
        setInputDisabled(true);
        setModalVisibility(true);
        setIsPlaying(false);
        //Can Call reset stats here
    }
    return (
        <>
        {(isModalVisible ? <Modal setModalVisibility={setModalVisibility}></Modal> :
        <div className="flex justify-center p-4">
            {/* This condition !isModaiVisible causing reset timer to bug out as it gets called again and again once we close modal
                due to state change in react, it's gonna re-render again and again otherwise find out why */}
            <CountdownCircleTimer
                key={timerKey}
                isPlaying = {isPlaying}
                duration={5}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[60, 45, 25, 10]}
                onComplete={onCompleteTimer}
                // Calling reset stats on complete here would be good?
            >
                {
                    ({ remainingTime }) => (
                        <span className="text-4xl">{remainingTime}</span>
                    )
                }
            </CountdownCircleTimer>
        </div>)}
        </>
    )
}

export default Timer;