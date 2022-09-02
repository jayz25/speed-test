import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Modal } from "./Modal";

const Timer = ({timerKey, isPlaying, setIsPlaying, setInputDisabled, ...stats}) => {
    const [isModalVisible, setModalVisibility] = useState(false);
    const onCompleteTimer = () => {
        // saveStats
        setModalVisibility(true);
        setIsPlaying(false);
        setInputDisabled(true);
        //Can Call reset stats here
        //Shall we save results into database while resetting?
    }
    return (
        <>
        {(isModalVisible && <Modal setModalVisibility={setModalVisibility} stats={stats}></Modal>)}
        <div className="flex justify-center p-4">
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
        </div>
        </>
    )
}

export default Timer;