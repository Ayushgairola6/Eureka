import { Volume } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { GenerateSpeech } from "../../store/visualierSlice";
import removeMarkdown from 'markdown-to-text';
export const TTSRequest = ({ text }: { text: string }) => {
    const dispatch = useAppDispatch()
    const { isGenerating } = useAppSelector((s) => s.visualizer)
    // generating audio from text
    function HandleTextToSpeech() {
        if (!text) return toast.error("Something went wrong");
        const cleanedText = removeMarkdown(text)
        const data = { text: cleanedText };
        dispatch(GenerateSpeech(data)).unwrap().then((res) => {
            if (res?.message) {
                toast.message(res.message);
            }
        }).catch((err) => toast.error(err))
    }
    return (<>
        <div className='flex items-center justify-center  bg-white dark:bg-neutral-900   rounded-full p-2'>
            {isGenerating === false ? <button onClick={HandleTextToSpeech} className='flex items-center justify-center '><Volume size={16} /></button> : (<ul className='h-4 w-4 rounded-full border-t-2 border-red-600 animate-spin p-2' />)}
        </div>
    </>)
}

