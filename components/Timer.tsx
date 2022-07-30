import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Timer = ({inputDisabled, setInputDisabled, timerKey, isPlaying}) => {
    
    return (
        <div className="fixed bottom-20 w-full m-auto">
            <CountdownCircleTimer
                key={timerKey}
                isPlaying = {isPlaying}
                duration={60}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[60, 45, 25, 10]}
                onComplete={() => setInputDisabled(true)} 
                // Calling reset stats on complete here would be good?
            >
                {({ remainingTime }) => (
                    <span className="text-4xl">{remainingTime}</span>   
                    )}
            </CountdownCircleTimer>
        </div>
    )
}

export default Timer;