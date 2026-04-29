import { useState, type JSX, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { TbArrowRight, TbTrash, TbBooks, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { RiRadarLine } from "react-icons/ri";
import { toast } from 'sonner';
import { Archive, Clock } from "lucide-react";
import { emptyArchive, getResearchHistory, RefreshResearchArchive } from '../store/InterfaceSlice'
import { GoReport } from "react-icons/go";
import { IoAnalytics, IoReload } from "react-icons/io5";
import { MdDoneAll, MdMore } from "react-icons/md";
import axios from 'axios'
import ExpandedReader from "@/components/ResearchArchive/ExpandedReader";
const BaseApiUrl = import.meta.env.VITE_BACKEND_URL
// import { Sort } from "@/components/ResearchArchive/sorting";
const QUICK_TAGS = [
    { label: "go deeper", value: "Go deeper on this topic with more authoritative sources." },
    { label: "find more sources", value: "Cross-verify the key claims with additional independent sources." },
    { label: "focus on X", value: "Focus specifically on " },
];
export function UnfinishedResearchPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoggedIn, user } = useAppSelector(s => s.auth);
    const { Research_Archive, fetchingPendingResearch } = useAppSelector(s => s.interface);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const FetchcountRef = useRef(0);
    useEffect(() => {
        if (Research_Archive?.length > 0) return;
        if (FetchcountRef.current > 3) return;
        if (isLoggedIn === false || !user) {
            // navigate('/login')
            return
        };


        dispatch(getResearchHistory(null)).unwrap().then((res) => {
            if (res?.message) {
                toast.message(res.message)
            }
        }).catch(err => toast.error(err)).finally(() => {
            FetchcountRef.current += 1
        })

    }, [isLoggedIn, user])

    // 1. Setup refs to access the DOM elements for cursor focus
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // 2. State should be an object to handle multiple items independently
    const [instructions, setInstructions] = useState<{ [key: string]: string }>({});
    function injectTag(value: string, item_id: number) {
        // Update the state for the specific item
        setInstructions(prev => ({
            ...prev,
            [item_id]: value
        }));

        // Focus and place cursor at the end after the DOM updates
        setTimeout(() => {
            const input = inputRefs.current[item_id];
            if (input) {
                input.focus();
                const len = value.length;
                input.setSelectionRange(len, len);
            }
        }, 0);
    }

    // Helper for manual typing
    function handleInputChange(item_id: number, value: string) {
        setInstructions(prev => ({
            ...prev,
            [item_id]: value
        }));
    }
    const research_history = useMemo(() => {
        return Research_Archive
    }, [Research_Archive])
    // handle sorting


    // conntinue hte pending research

    function handleResult(id: string, search_depth: string, action_type: string, item_id: number) {
        const resumed_research = Research_Archive.filter((res) => res.message_id === id);

        if (!action_type) {
            toast.info("An action_type is mandatory")
            return
        };
        if (resumed_research && resumed_research?.some((elem) => elem.isSynthesized === true)) {
            toast.message("This report has already been synthesized")
            return;
        }


        navigate(`/interface?MessageId=${id}&depth=${search_depth}&action_type=${action_type}&instructions=${instructions[item_id]}`)
    }


    // discard a resarch
    const handleDiscard = (id: string) => {
        const Source_index = Research_Archive.findIndex((item) => item.message_id === id);
        console.log(Source_index, 'the index of the source to be deleted')
        Research_Archive.splice(Source_index, 1);
        toast.message(`Thread id: ${id} is removed from archive`)

    };

    // visualization request
    function handleVisualize(message_id: string) {
        if (!message_id) return;
        navigate(`/interface?MessageId=${message_id}`) //send this to the interface
    }

    // get more pending research

    // refresh The archive
    function handleRefresh() {
        dispatch(emptyArchive());
        dispatch(RefreshResearchArchive()).unwrap().then((res) => {
            if (res.message) {
                toast.message(res.message);
            }
        }).catch((err: any) => {
            toast.error(err);
        })
    }

    // handle markdone

    async function handleMarkDone(id: string) {
        try {

            const response = await axios.put(`${BaseApiUrl}/api/markdone`, { message_id: id }, {
                withCredentials: true
            })
            toast.message(response.data.message);
            return response.data;
        } catch (err: any) {
            return toast.error(err?.message || err?.response?.data?.message);
        }
    }

    async function FetchMore() {
        const timestamp = research_history[research_history.length - 1].created_at;
        if (!timestamp) return;
        dispatch(getResearchHistory(timestamp)).unwrap().then((res) => {
            if (res?.message) {
                toast.message(res.message)
            }
        }).catch(err => toast.error(err)).finally(() => {
            FetchcountRef.current += 1
        })
    }
    return (<>
        <section className='p-4 relative flex items-center justify-between'>
            <div>
                <h1 className="flex items-center justify-start gap-2 bai-jamjuree-bold text-2xl">
                    <Archive /> Research Archive
                </h1>
                <span className='space-grotesk text-xs text-gray-600 dark:text-neutral-500'>Continue your pending research</span>
            </div>

            <section className='flex items-center justify-center gap-2'>

                <div className='space-y-2'>
                    <button onClick={handleRefresh} className='bai-jamjuree-semibold text-xs flex items-center justify-center gap-3 bg-neutral-200 dark:bg-neutral-900 rounded-sm p-2 cursor-pointer'>Refresh <IoReload /></button>
                    {/* <Sort /> */}
                </div>
                <button className='bai-jamjuree-semibold text-xs flex items-center justify-center gap-3 bg-neutral-200 dark:bg-neutral-900 rounded-sm p-2 cursor-pointer' onClick={() => FetchMore()}>
                    Fetch-More<MdMore />
                </button>
            </section>

        </section>


        <div className="p-6 max-w-7xl mx-auto ">

            {fetchingPendingResearch === true ? (<LoadingState />) :
                research_history.length > 0 ? (<>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {research_history.map((item, ind) => {
                            const isExpanded = expandedCard === item.message_id;

                            return (
                                <article
                                    key={`${item.message_id}/${ind}`}
                                    className="group flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 transition-all hover:border-blue-500/50 relative"
                                >

                                    {/* Header: Status bar */}
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-800/50">
                                        <span className="space-grotesk text-[9px] uppercase tracking-tighter opacity-80 flex items-center gap-1">
                                            <RiRadarLine /> {item.depth}
                                        </span>
                                        <span className="flex items-center gap-1.5 space-grotesk text-[9px] uppercase font-bold">
                                            <div className={`h-1.5 w-1.5 rounded-full ${item.isSynthesized ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                                            {item.isSynthesized ? "Ready" : "Pending"}
                                        </span>
                                    </div>

                                    {/* Body: Query Heading */}
                                    <div className="p-4 flex-grow">
                                        <h2 className="bai-jamjuree-regular text-base leading-tight mb-4 max-h-20 overflow-hidden">
                                            {item.query.split('&')[0].replace('new_instructions', '').trim()}
                                        </h2>

                                        {/* COLLAPSIBLE TOGGLE */}
                                        <button
                                            onClick={() => setExpandedCard(isExpanded ? null : item.message_id)}
                                            className="flex items-center justify-between w-full p-2 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:text-blue-500 transition-colors"
                                        >
                                            <span className="space-grotesk text-[10px] font-bold uppercase flex items-center gap-2">
                                                <TbBooks /> Research Details ({item.sources_count})
                                            </span>
                                            {isExpanded ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                                        </button>

                                        {/* EXPANDABLE SECTION: SCROLLABLE */}
                                        {isExpanded && (
                                            <div className="mt-2 border border-neutral-200 dark:border-neutral-800 rounded overflow-hidden">
                                                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50">
                                                    {item.information.details.map((source) => (
                                                        // <SourceDetail key={idx} source={source} />
                                                        <ExpandedReader source={source} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer: Actions */}
                                    <div className="max-w-[480px] w-full bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">


                                        {/* Interactive Section */}
                                        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                                            {/* Input Wrapper */}
                                            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-2 focus-within:border-sky-500/50 transition-colors">
                                                <Clock size={12} className="opacity-40" />
                                                <input
                                                    ref={(el) => { (inputRefs.current[item.id] = el) }}
                                                    value={instructions[item.id] || ""}
                                                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                                                    type="text"
                                                    placeholder="Optional: add new instructions before continuing..."
                                                    className="bai-jamjuree-regular bg-transparent border-none outline-none text-[11px] w-full text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                                />
                                            </div>

                                            {/* Quick Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {QUICK_TAGS.map((tag) => (
                                                    <button
                                                        key={tag.label}
                                                        onClick={() => injectTag(tag.value, item.id)}
                                                        className="bai-jamjuree-semibold text-[9px] uppercase tracking-wide px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-sky-500/40 hover:text-sky-500 transition-colors"
                                                    >
                                                        + {tag.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer Action Grid */}
                                        <div className="grid grid-cols-[auto_1fr_1fr] border-t border-neutral-200 dark:border-neutral-800">
                                            <div className='flex items-center justify-center '>
                                                <button
                                                    onClick={() => handleDiscard(item.message_id)}
                                                    className="   flex items-center justify-center p-3 border-r  border-red-800 dark:text-neutral-400 hover:bg-red-500/20 bg-red-500/10 hover:text-red-500 transition-all"
                                                >

                                                    <TbTrash size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkDone(item.message_id)}
                                                    className=" flex items-center justify-center p-3 border-r border-sky-800 dark:text-neutral-400
                                                    bg-sky-500/10 hover:bg-sky-500/20 hover:text-sky-500 transition-all"
                                                >

                                                    <MdDoneAll size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleVisualize(item.message_id)}
                                                    className=" flex items-center justify-center p-3 border-r border-purple-800 dark:text-neutral-400
                                                    bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-500 transition-all"
                                                >

                                                    <IoAnalytics size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleResult(item.message_id, item.depth, 'continue', item.id)}
                                                className="flex items-center justify-center gap-2 p-3 text-[9px] bai-jamjuree-semibold uppercase tracking-widest border-r border-neutral-200 dark:border-neutral-800 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
                                            >
                                                <Clock size={12} /> Continue
                                            </button>

                                            <button
                                                onClick={() => handleResult(item.message_id, item.depth, 'finalize', item.id)}
                                                className="flex items-center justify-center gap-2 p-3 text-[9px] bai-jamjuree-semibold uppercase tracking-widest bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 hover:opacity-80 transition-all"
                                            >
                                                <GoReport size={12} /> Finalize
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>) : (
                    <EmptyState />
                )

            }

        </div>
    </>);
}

// function SourceDetail({ source }: any) {
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//         <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
//             <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
//             >
//                 <div className="flex flex-col items-start text-left max-w-[90%]">
//                     <span className="bai-jamjuree-bold text-xs truncate w-full">{source.title}</span>
//                     <span className="space-grotesk text-[10px] text-blue-500 truncate w-full flex items-center gap-1">
//                         <TbLink size={10} /> {source.url}
//                     </span>
//                 </div>
//                 {isOpen ? <TbChevronUp size={14} /> : <TbChevronDown size={14} />}
//             </button>

//             {isOpen && (
//                 <div className="px-3 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
//                     {/* Raw Content Block */}
//                     <div className="bg-neutral-50 dark:bg-neutral-950 p-2 rounded border border-neutral-100 dark:border-neutral-800">
//                         <div className="flex items-center gap-1 mb-1 text-neutral-400">
//                             <TbQuote size={12} />
//                             <span className="text-[10px] uppercase font-bold space-grotesk">Extracted Content</span>
//                         </div>
//                         <Streamdown className="text-[11px] space-grotesk leading-relaxed text-neutral-600 dark:text-neutral-400 italic">
//                             {`"${source.content}"`}
//                         </Streamdown>
//                     </div>

//                     {/* Queries that returned this result */}
//                     {source.queries && (
//                         <div className="space-y-1">
//                             <div className="flex items-center gap-1 text-neutral-400">
//                                 <TbSearch size={12} />
//                                 <span className="text-[10px] uppercase font-bold space-grotesk">Source Queries</span>
//                             </div>
//                             <div className="flex flex-wrap gap-1">
//                                 {source.queries.map((q: string, i: number) => (
//                                     <span key={i} className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
//                                         {q}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

function EmptyState(): JSX.Element {
    return (<>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 w-full mx-auto">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                <TbBooks className="relative text-neutral-300 dark:text-neutral-700" size={64} />
            </div>

            <div className="space-y-1">
                <h3 className="bai-jamjuree-bold text-xl text-neutral-900 dark:text-neutral-100">
                    No research archives found
                </h3>
                <p className="space-grotesk text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                    Your intelligence reports and synthesized data will appear here once generated.
                </p>
            </div>

            <button className="group flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black space-grotesk px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-400 transition-all">
                <Link to='/interface'>
                    Start New Research
                </Link>
                <TbArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </>)
}

function LoadingState(): JSX.Element {
    return (<>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  w-full mx-auto">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 animate-pulse">
                    <div className="h-8 bg-neutral-100 dark:bg-neutral-800" /> {/* Header Shim */}
                    <div className="p-4 flex-grow space-y-3">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                        <div className="h-10 bg-neutral-50 dark:bg-neutral-800 rounded mt-4" />
                    </div>
                    <div className="grid grid-cols-2 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="h-10 border-r border-neutral-100 dark:border-neutral-800" />
                        <div className="h-10" />
                    </div>
                </div>
            ))}
        </div>
    </>)

}