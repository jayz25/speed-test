const StatsPill = ({stat, statName}) => {
    return (
        <>
        <div className='flex-col items-center justfiy-center'>
            <div className='flex items-center justify-center mr-2 rounded-full w-[5rem] h-[5rem] shadow-lg bg-[#ffffff]'>
                <span className="text-2xl">{`${stat}`}</span>
            </div>
            <div className="flex justify-center w-[5rem] pt-[.5rem]">
                <span>{statName}</span>
            </div>
        </div>
        </>
    )
}
export default StatsPill;