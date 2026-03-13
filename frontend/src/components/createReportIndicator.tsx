export const CreatingReport = () => {
    return (<>
        <div className="fixed bottom-30 right-10 flex flex-col gap-2 px-3 py-3 bg-neutral-950 border border-neutral-800 rounded-xl w-52">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-[7px] h-[7px] rounded-full bg-sky-400 animate-pulse" />
                    <span className="font-mono text-[11px] text-neutral-400 tracking-wide">
                        ANALYST_MODE
                    </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-600">PROCESSING</span>
            </div>

            <div className="h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full w-2/5 bg-sky-400 rounded-full animate-[slide_1.6s_ease-in-out_infinite] slide" />
            </div>

            <span className="font-mono text-[10px] text-neutral-700">
                check live tail for logs
            </span>
        </div>
    </>)
}