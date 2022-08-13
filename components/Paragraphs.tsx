const Paragraphs = ({paragraph}) => {
    // Try to get random paragraphs later here
    return (
        <div className='bg-[#FAEBD7] w-full p-3 m-auto text-xl text-cyan-900'>
            <p className="rounded-2xl p-4 bg-[#ADD8E6]">
                {paragraph}
            </p>
        </div>
    )
}

export default Paragraphs;