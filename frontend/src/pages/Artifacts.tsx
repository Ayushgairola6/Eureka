// pages/Artifacts.jsx
import { useEffect, useRef } from "react";
import { Archive, BarChart3, MoreVertical, RefreshCw } from "lucide-react"; // adjust icons as needed
import Visualizer from "@/components/visualizer/Visualizer"; // your chart component
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { FetchArtifacts } from '../store/visualierSlice.ts'
import { toast } from 'sonner';
export default function ArtifactsPage() {

    const fetchRef = useRef(0);
    const dispatch = useAppDispatch();
    const { artifacts, fetching_artifacts } = useAppSelector((s) => s.visualizer)
    const { isLoggedIn, user } = useAppSelector(s => s.auth);

    // using click
    function handleFetchArtifacts(timestamp: any) {
        if (fetchRef.current >= 1) return;

        dispatch(FetchArtifacts(timestamp)).unwrap().then((res) => {
            if (res?.message) {
                toast.message(res.message)
            }
            fetchRef.current = 1
        }).catch((error: any) => toast.error(error));
    }

    // on load
    useEffect(() => {
        if (isLoggedIn === false || !user) return;

        const timestamp = artifacts[artifacts.length - 1];
        // if (!timestamp) return;
        handleFetchArtifacts(timestamp)


    }, [isLoggedIn, user]);

    return (
        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <section className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Artifacts
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-neutral-500 mt-1">
                        Your saved data visualizations
                    </p>
                </div>
                <div className='flex items-center justify-center gap-2'>
                    <button
                        onClick={() => {
                            // const timestamp = artifacts[artifacts.length - 1];

                            handleFetchArtifacts(null) //if refresh just fetch the existing cached
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase bg-neutral-200 dark:bg-neutral-900 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            // if asking for more send the timestamp
                            const timestamp = artifacts[artifacts.length - 1];

                            handleFetchArtifacts(timestamp)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase bg-neutral-200 dark:bg-neutral-900 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <MoreVertical size={14} />
                        Fetch More
                    </button>
                </div>

            </section>

            {/* Content */}
            {fetching_artifacts ? (
                <LoadingState />
            ) : artifacts.length === 0 ? (
                <ErrorState error={"No artifacts found"} />
            ) : artifacts.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artifacts.map((artifact: any, index: number) => (
                        <ArtifactCard key={`${artifact?.id}+${index}`} artifact={artifact} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ------------------------- Sub-components -------------------------

function LoadingState() {
    // Skeleton grid matching the final layout
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="h-64 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                >
                    <div className="h-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-t-lg" />
                    <div className="p-4 space-y-2">
                        <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ErrorState({ error }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
                <BarChart3 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                Failed to load artifacts
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">{error}</p>

        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-full mb-4">
                <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                No artifacts yet
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
                Visualizations you generate from your research will appear here.
                <br />
                Try finalizing a report or using the visualize button in the archive.
            </p>
        </div>
    );
}

function ArtifactCard({ artifact }: any) {



    return (
        <article className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 transition-all hover:border-blue-500/50">
            {/* Chart preview area */}
            <div className="p-4  flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                {artifact ? (
                    <>
                        <Visualizer chartData={artifact} />
                    </>
                ) : (
                    <p className="text-sm text-gray-400">Missing chart data</p>
                )}
            </div>

            {/* Metadata */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-1.5 bg-ne">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 leading-tight line-clamp-2">
                    {artifact?.data?.title || "Untitled Chart"}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-neutral-500">
                    <span className="uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {artifact?.data?.chart_type || "chart"}
                    </span>
                    <span className="truncate opacity-70">
                        {artifact?.data?.MessageId?.slice(0, 5)}…
                    </span>
                </div>
            </div>
        </article>
    );
}