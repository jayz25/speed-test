
const StatsPill = ({stat, statImg, unit}: {stat: number, statImg: string, unit: string}) => {
    return (
            <div className='mr-5 overflow-auto flex flex-row items-center justify-around rounded-lg mt-3 mr-2 w-[6.5rem] h-[2.5rem] shadow-lg bg-[#ffffff]'>
                <div className="flex items-center flex-1 bg-[#D8D8D8] h-full w-full px-1 justifyy-center">
                    <img className=""
                        src={statImg}
                        alt='Alt'
                        width={30}
                        height={30}
                        />
                </div>
                <div className="flex-1 justify-center h-full w-full p-1">
                    <span className="text-2xl font-bold">{stat}</span>
                    <span className="text-xs self-end pl-1">{unit}</span>
                </div>
            </div>
    )
}
export default StatsPill;