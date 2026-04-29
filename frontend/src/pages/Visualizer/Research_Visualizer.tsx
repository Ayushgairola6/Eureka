import Visualizer from "@/components/visualizer/Visualizer";
import { useAppSelector, useAppDispatch } from '../../store/hooks.tsx';
import { Loader2, BarChart3 } from 'lucide-react'; // Example icons
import { BiCollapse } from "react-icons/bi";
import { HandleVisualizationRequest, toggleInsights, setIsVisualizing } from '../../store/visualierSlice.ts'
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from 'sonner'

export const ResearchVisualizer = () => {
    const { VisualizationData, isVisualizing, showInsights } = useAppSelector(s => s.visualizer);
    const { isLoggedIn, user } = useAppSelector(s => s.auth);
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        if (isLoggedIn === false || !user) return;
        const MessageId = searchParams.get("MessageId");

        if (!MessageId) return;

        const data = {
            MessageId: MessageId
        }

        dispatch(toggleInsights(true))
        dispatch(setIsVisualizing(true))
        dispatch(HandleVisualizationRequest(data)).unwrap().then((res) => {
            toast.message(res.message);
        }).catch(error => {
            toast.error(error);
        }).finally(() =>
            dispatch(setIsVisualizing(false))

        )

    }, [isLoggedIn, user])

    // Find the specific chart data for the current message

    return (
        <div className={`fixed top-10 right-0  w-[450px] h-[calc(100vh-40px)] border-l dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 overflow-y-auto z-50 p-4 ${showInsights === true ? "translate-x-0" : "translate-x-full"} transition-all duration-300 ease-in`}>
            <div className="flex items-center justify-between  mb-6 border-b dark:border-neutral-800 pb-4">
                <span className='flex items-center justify-center gap-2'>
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h2 className="font-bold text-gray-800 dark:text-neutral-200">Data Insights (BETA)</h2>
                </span>

                <button onClick={() => {
                    dispatch(toggleInsights(!showInsights))
                }} className='cursor-pointer z-10'><BiCollapse size={17} /></button>
            </div>

            {isVisualizing === true ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-500 animate-pulse">Visualizing research data...</p>
                </div>
            ) : VisualizationData?.length > 0 ? (
                VisualizationData.map((source) => {
                    return <Visualizer chartData={source} />

                })
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <div className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-full mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No visualization active</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Select a message or ask the AI to "visualize" the results.
                    </p>
                </div>
            )}
        </div>
    );
}

export default ResearchVisualizer;