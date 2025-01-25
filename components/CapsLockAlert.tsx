export const CapsLockAlert = ({ isVisible = false}) => {

    return (
            <div className={`${isVisible ? "opacity-100" : "opacity-0"} rounded-xl px-2 py-1 mb-2 font-bold text-lg text-black bg-[#FFD523] flex`}>
                Caps Lock
            </div>
        )

}
export default CapsLockAlert;