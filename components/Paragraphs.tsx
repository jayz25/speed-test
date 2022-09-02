import { useDispatch, useSelector } from 'react-redux';
import { refreshParagraph } from '../redux/paragraph';
import refresh from '../static/refresh.png';
import { AppDispatch, RootState } from '../types/types';

const Paragraphs = () => {
    const paragraph = useSelector((state: RootState)=>state.paragraph.currentParagraph);
    const dispatch = useDispatch<AppDispatch>();
    return (
        <div className='bg-[#FAEBD7] w-full p-3 m-auto text-xl text-cyan-900'>

            <p className="rounded-2xl p-4 bg-[#ADD8E6]">
            <span className="float-right" role='button'>
                <img
                    src={refresh.src}
                    alt="refresh button"
                    onClick={() => dispatch(refreshParagraph())}
                />
            </span>
                {paragraph?.paragraph}
            </p>
        </div>
    )
}

export default Paragraphs;