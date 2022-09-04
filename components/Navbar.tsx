import Link from "next/link"

export const Navbar = () => {
    return (
        <div className="h-[4rem]">
            <ul className="w-[200px] h-full list-none flex flex-row">
                <li className=" h-full flex flex-1 items-center justify-center hover:bg-[#C1CFE1]">
                    <Link href="/">
                        <a className="text-md font-normal">Home</a>
                    </Link>
                </li>
                <li className="flex flex-1 items-center justify-center hover:bg-[#C1CFE1]">
                    <Link href="/stats">
                        <a className="text-md font-normal">Global Stats</a>
                    </Link>
                </li>
            </ul>
        </div>
    )
}