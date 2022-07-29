import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Timer = ({inputDisabled, setInputDisabled, key}) => {
    // const [timeUp, setTimeup] = useState(false);
    // const timesUp = () => {
    //     //Change state to disabled
    //     //Stop typing
    //     // setTimeup(true)
    //     setInputDisabled(true);
    // }
    return (
        <div className="fixed bottom-20 left-20">
            <CountdownCircleTimer
                key={key}
                isPlaying
                duration={60}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[60, 45, 25, 10]}
                onComplete={() => setInputDisabled(true)}
            >
                {({ remainingTime }) => (
                    <span className="text-4xl">{remainingTime}</span>   
                    )}
            </CountdownCircleTimer>
        </div>
    )
}

export default Timer;