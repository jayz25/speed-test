export const Modal = ({setModalVisibility}) => {
        return (
            <div className="top-0 left-0 right-0 bottom-0 w-full h-full bg-neutral-700 fixed">
                
                <div className="modal-container absolute top-1/3  left-1/3 bg-zinc-200 rounded-md w-[600px] h-[200px]">
                    <button className="block absolute right-0" onClick={() => setModalVisibility(false)}>
                        <span className="font-bold text-xl float p-[10px]">x</span>
                    </button>
                    <div className="p-[10px]">
                        <p>
                        Hello This is a Modal Welcome To Modal
                        </p>
                    </div>
                    
                </div>
            </div>
        )
}