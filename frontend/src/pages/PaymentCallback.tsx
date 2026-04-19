import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAppSelector } from '../store/hooks'
import { toast } from 'sonner'
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

type Status = "pending" | "paid" | "failed";

const PaymentCallback = () => {
    const { isLoggedIn, user } = useAppSelector((s) => s.auth);
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>("pending");
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (isLoggedIn === false || !user) return;
        const order_id = localStorage.getItem("antinode_order_id");
        if (!order_id) { setStatus("failed"); return; }

        let count = 0;
        const interval = setInterval(async () => {
            count++;
            try {
                const { data } = await axios.post(`${BaseApiUrl}/api/payment-status`, { order_id: order_id }, {
                    withCredentials: true,
                });
                setAttempts(count);
                toast.message(`Your payment staus is ${data.status}`)
                if (data.status === "paid") {
                    setStatus("paid");
                    localStorage.removeItem("antinode_order_id"); // only remove on resolution
                    clearInterval(interval);
                } else if (data.status === "failed" || count >= 10) {
                    setStatus("failed");
                    localStorage.removeItem("antinode_order_id");
                    clearInterval(interval);
                }
                else if (count >= 10) {
                    localStorage.removeItem("antinode_order_id");
                    setStatus("failed"); clearInterval(interval);
                }
            } catch (err: any) {
                toast.error(err?.message || err?.response?.data?.message)
                setStatus("failed");
                clearInterval(interval);
                localStorage.removeItem("antinode_order_id");

            }
        }, 1500);

        return () => {
            clearInterval(interval)
            localStorage.removeItem("antinode_order_id")
        };
    }, [isLoggedIn, user]);

    if (status === "pending") return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6 p-10 rounded-2xl border border-neutral-800 bg-neutral-950 w-full max-w-sm">
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">verifying</span>
                <div className="relative flex items-center justify-center w-14 h-14">
                    <div className="absolute inset-0 rounded-full border border-neutral-800" />
                    <div className="absolute inset-0 rounded-full border-t border-sky-500 animate-spin" />
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-white">Verifying your payment</p>
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">
                        Attempt {attempts}/10 · talking to gateway...
                    </p>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(Math.ceil(attempts / 3.5), 3) ? "bg-sky-500" : "bg-neutral-700"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    if (status === "paid") return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6 p-10 rounded-2xl border border-green-500/20 bg-neutral-950 w-full max-w-sm">
                <span className="font-mono text-[9px] uppercase tracking-widest text-green-500">confirmed</span>
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-white">Payment successful</p>
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">Your plan is now active</p>
                </div>
                <button
                    onClick={() => { localStorage.removeItem("antinode_order_id"); navigate("/"); }}
                    className="w-full py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-mono uppercase tracking-widest hover:bg-green-500/20 transition-all"
                >
                    Continue to app
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6 p-10 rounded-2xl border border-red-500/20 bg-neutral-950 w-full max-w-sm">
                <span className="font-mono text-[9px] uppercase tracking-widest text-red-500">failed</span>
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-white">Payment failed</p>
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">
                        {attempts >= 10 ? "Gateway timed out" : "Something went wrong"}
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <button
                        onClick={() => navigate("/checkout")}
                        className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-2.5 rounded-lg border border-neutral-800 text-neutral-500 text-[11px] font-mono uppercase tracking-widest hover:border-neutral-600 hover:text-neutral-300 transition-all"
                    >
                        Back to home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;