import React from 'react';
import { BiCheck } from "react-icons/bi"
import { TbAlertTriangle, TbCancel, TbChevronDown, TbChevronUp } from "react-icons/tb"
import { toast } from 'sonner'
import { FianLizeResearch, MimicSSE, setLoading, ShowVerificationPopup, UpdateChats, UpdateResearchData, setCreatingReport } from '../store/InterfaceSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentStatus } from '../store/websockteSlice';
import { v4 as uuid } from 'uuid'
import { currentTime } from '../../utlis/Date';
import { RiCornerDownRightLine } from 'react-icons/ri';
import { MdOutlinePsychology } from 'react-icons/md';
const QUICK_TAGS = [
    { label: "go deeper", value: "Go deeper on this topic with more authoritative sources." },
    { label: "find more sources", value: "Cross-verify the key claims with additional independent sources." },
    { label: "focus on X", value: "Focus specifically on " },
];

const REJECT_LABELS = [
    { label: "hallucinated", value: "hallucinated" },
    { label: "slop", value: "slop" },
    { label: "irrelevant", value: "irrelevant" },
    { label: "low quality", value: "low_quality" },
];

export const FinalizePopup = ({ message }: any) => {
    const { search_depth, loading, creatingReport } = useAppSelector(s => s.interface)
    const dispatch = useAppDispatch()
    const instructionsRef = React.useRef<HTMLInputElement>(null)


    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [focused, setFocused] = React.useState(false);

    function handleConfirm() {
        FinalizeReport("confirm", '');
    }

    function handleReject(label: string) {
        setRejectOpen(false);
        FinalizeReport("reject", label);
        // optionally pass label up: FinalizeReport("reject", label)
    }

    // to inject the value in the input from labels
    function injectTag(value: string) {
        if (!instructionsRef.current) return;
        instructionsRef.current.value = value;
        instructionsRef.current.focus();
        // place cursor at end
        const len = value.length;
        instructionsRef.current.setSelectionRange(len, len);
    }


    // hadles the skeletion adding or new mesage
    function handleUUidCreationAndMessageInsert() {
        const user_id = uuid();
        const AiId = uuid();

        // Insert user message
        dispatch(
            UpdateChats({
                id: user_id,
                sent_at: currentTime,
                sent_by: "You",
                message: {
                    isComplete: true,
                    content: instructionsRef?.current?.value || 'Use the sources from the research and created a detailed report.',
                },
            })
        );

        // Insert empty AI message
        dispatch(
            UpdateChats({
                id: AiId,
                sent_at: currentTime,
                sent_by: "AntiNode",
                message: {
                    isComplete: false,
                    content: "",
                },
            })
        );

        return { AiId, user_id }
    }
    // sends the further instructions and the indication toward the response
    const FinalizeReport = (choice: string, label: string) => {
        if (loading === true) {
            return;
        }
        if (!message || !message.id) return;
        if (!choice) return toast.error("Please choose whether you want to reject or confirm this.");

        dispatch(setCreatingReport());
        try {
            const { user_id } = handleUUidCreationAndMessageInsert()
            dispatch(setLoading(true))
            const info = {
                instructions: instructionsRef.current?.value || "",
                user_choice: choice,
                MessageId: message.id,
                userMessageId: user_id,
                report: label,
                web_search_depth: search_depth
            }

            dispatch(FianLizeResearch(info)).unwrap().then((res) => {
                if (res.message) toast.message(res.message);
                // if the last request was for more resarch 
                if (res.message === 'Research done') {
                    dispatch(UpdateResearchData(res));
                    dispatch(ShowVerificationPopup(res?.MessageId))

                    return;
                }

                // else if the finalized research was created
                dispatch(MimicSSE({ id: message.id, delta: res.result }));
                dispatch(setCurrentStatus("Analyzing.."));
                dispatch(ShowVerificationPopup(res?.MessageId)) //remove the id from popup handler cause we do not need it anymore

            }).catch((err: any) => {
                toast.error(err)
                dispatch(
                    MimicSSE({
                        id: message.id,
                        delta:
                            err
                    })
                );
            }).finally(() => {
                dispatch(setCreatingReport())
                dispatch(setLoading(false))

            })
        } catch (error: any) {
            return toast.error(error?.response?.data?.message || "Our system is overloaded right now , we are trying to resolve this problem thanks you!")
        }

    }


    ///-----m ain render
    return (<div
        aria-disabled={creatingReport}
        className={`relative flex flex-col gap-0 w-full rounded-xl border transition-all duration-300 overflow-visible
        ${creatingReport ? "opacity-50 pointer-events-none" : ""}
        ${focused
                ? "border-sky-500/40 shadow-lg shadow-sky-500/5"
                : "border-neutral-800 shadow-none"
            }
        dark:bg-neutral-950 bg-gray-50
      `}
    >

        {/* ── Top label bar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
            <div className="flex items-center gap-2">
                {/* Pit stop indicator dot */}
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest dark:text-neutral-300 text-black">
                    PIT_STOP · AWAITING_INSTRUCTION
                </span>
            </div>
            <span className="font-mono text-[9px] dark:text-neutral-400 text-black uppercase">
                research_complete
            </span>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="mx-3 h-px bg-neutral-800/70" />

        {/* ── Helper text ──────────────────────────────────────────── */}
        <div className="px-3 pt-2 pb-1 flex items-start gap-2">
            <RiCornerDownRightLine className="dark:text-neutral-300 text-black text-sm shrink-0 mt-0.5" />
            <p className="space-grotesk text-[10px] text-green-600 leading-relaxed">
                Review the research above. Add instructions to go deeper, correct the direction,
                or directly finalize into a report. Reject if the data is off-target.
            </p>
        </div>

        {/* ── Quick instruction tags ────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {QUICK_TAGS.map((tag) => (
                <button
                    key={tag.label}
                    onClick={() => injectTag(tag.value)}
                    className="font-mono text-[9px] uppercase tracking-wide px-2 py-1 rounded-md border border-neutral-800 dark:text-neutral-300 text-black hover:border-sky-500/40 hover:text-sky-400 transition-colors"
                >
                    + {tag.label}
                </button>
            ))}
        </div>

        {/* ── Input row ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 pb-3">
            <div className="flex-1 flex items-center gap-2 dark:bg-neutral-900  bg-gray-50 border border-neutral-800 rounded-lg px-3 py-2 focus-within:border-sky-500/40 transition-colors">
                <MdOutlinePsychology className="text-neutral-700 dark:text-white text-sm shrink-0" />
                <input
                    ref={instructionsRef}
                    disabled={creatingReport}
                    type="text"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Additional instructions, corrections, or deeper focus..."
                    className="bai-jamjuree-regular text-[11px] dark:text-neutral-300 text-black space-grotesk placeholder:text-neutral-700 bg-transparent border-none outline-none focus:ring-0 w-full"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && instructionsRef.current?.value) handleConfirm();
                    }}
                />
            </div>

            {/* Confirm */}
            <button
                onClick={() => handleConfirm()}
                title="Finalize report"
                disabled={creatingReport === true}
                className={` group flex items-center gap-1.5 px-3 py-2 rounded-lg ${creatingReport === true ? "bg-gray-100 text-black opacity-60" : " hover:bg-green-500/20 bg-green-500/10 border border-green-500/20 text-green-400  hover:border-green-500/40 opacity-100"} transition-all text-[10px] font-mono uppercase`}
            >
                <BiCheck size={14} />
                <span className="hidden sm:inline">{creatingReport === false ? "Finalize" : "Working"}</span>
            </button>

            {/* Reject — dropdown */}
            <div className="relative">
                <button
                    disabled={creatingReport === true}

                    onClick={() => setRejectOpen(!rejectOpen)}
                    title="Reject research"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-[10px] font-mono uppercase"
                >
                    <TbCancel size={14} />
                    <span className="hidden sm:inline">Reject</span>
                    {rejectOpen ? <TbChevronUp size={10} /> : <TbChevronDown size={10} />}
                </button>

                {/* Reject reason dropdown */}
                {rejectOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-40 dark:bg-neutral-950 bg-gray-50 border border-neutral-800 rounded-lg overflow-hidden shadow-xl z-50">
                        <p className="font-mono text-[9px] text-neutral-600 dark:text-white uppercase px-3 py-1.5 border-b border-neutral-800">
                            Mark as...
                        </p>
                        {REJECT_LABELS.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => handleReject(r.value)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] space-grotesk text-black dark:text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
                            >
                                <TbAlertTriangle size={10} className="shrink-0" />
                                {r.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>)
}