import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Timer = () => {
    const timesUp = () => {
        //Change state to disabled
    }
    return (
        <>
            <CountdownCircleTimer
                isPlaying
                duration={60}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[60, 45, 25, 10]}
                onComplete={timesUp}
            >
                {({ remainingTime }) => (
                    <span className="text-4xl">{remainingTime}</span>   
                    )}
            </CountdownCircleTimer>
        </>
    )
}

export default Timer;