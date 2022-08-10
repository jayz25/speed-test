export const Modal = ({setModalVisibility}) => {
        return (

            <>
            {/* Add transition effect for modal opening and closing and get a good close icon */}
            <div className="flex bg-[#EFEFEF] absolute top-0 right-0 left-0 bottom-0 justify-center bg-opacity-70 items-center">
                <div className="bg-[#ffffff] rounded-md w-[600px] h-[200px] p-2 shadow-lg">
                    <button className="block relative left-0" onClick={() => setModalVisibility(false)}>
                        <span className="font-bold text-xl p-[10px]">x</span>
                    </button>
                    <div className="p-[10px]">
                        <p>
                        Hello This is a Modal Welcome To Modal
                        </p>
                    </div>
                </div>
            </div>
            </>
        )
}