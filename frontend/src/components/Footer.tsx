import {
  FiGithub,
  FiTwitter,
  FiYoutube,
  FiLink2,

  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router";
import { toast } from 'sonner';
import axios from 'axios';
import { LogoRender } from "./LogoRender";
import React from 'react';
import { CheckCircle, ShieldCheck, Zap } from "lucide-react";

const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const Footer = () => {
  const [wantsNewUpdates, setWantsNewUpdates] = React.useState(false);
  const [processing, setProcessing] = React.useState<string>('idle');

  async function GetNewsLetter() {
    if (!wantsNewUpdates) return;
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/user/get-newsletter`, wantsNewUpdates, {
        withCredentials: true,
        headers: { "Authorization": `Bearer ${AuthToken}` }
      });

      if (response.data.message) {
        toast.success(response?.data?.message);
        setProcessing("success");
      }
    } catch (error: any) {
      setProcessing('idle');
      toast.error(error?.message || error?.response?.data?.message);
    }
  }

  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Background Decor - Subtle Grid Hint */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[grid] bg-[size:20px_20px]"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)' }} />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand & Newsletter Section (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <LogoRender />
              <p className="space-grotesk text-neutral-500 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
                The collaborative and transparent AI for you and your teams built without any third party interference.
              </p>
            </div>

            {/* Upgraded Newsletter Box */}
            <div className="p-1 rounded-sm bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-800 dark:to-transparent max-w-md">
              <div className="bg-white dark:bg-black p-4 space-y-4">
                {processing === "idle" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Zap size={14} className="text-orange-500" />
                      <span className="bai-jamjuree-bold text-xs uppercase tracking-widest">Early Access Updates</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          onChange={() => setWantsNewUpdates(!wantsNewUpdates)}
                          className="mt-1 accent-black dark:accent-white"
                        />
                        <span className="space-grotesk text-[11px] text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                          I agree to receive the AntiNode newsletter, technical reports, and protocol updates.
                        </span>
                      </label>
                      <button
                        onClick={GetNewsLetter}
                        disabled={!wantsNewUpdates}
                        className="w-full py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-30"
                      >
                        Confirm Subscription <FiArrowRight />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center gap-2 text-emerald-500">
                    <CheckCircle size={24} />
                    <span className="space-grotesk text-xs font-bold uppercase tracking-widest">Registration Logged</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links Section (Spans 7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Column 1: Navigation */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <FiLink2 /> Ecosystem
              </h3>
              <ul className="space-y-3">
                {['Public Demo', 'How to use', 'Get in touch'].map((item) => (
                  <li key={item}>
                    <Link to="#" className="space-grotesk text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Governance */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={12} /> Governance
              </h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Refund Policy', 'Terms and conditions'].map((item) => (
                  <li key={item}>
                    <Link to="#" className="space-grotesk text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Social */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">Connect</h3>
              <div className="flex flex-wrap gap-3">
                <SocialIcon href="https://github/com/Ayushgairola6" icon={<FiGithub />} color="hover:bg-neutral-800" />
                <SocialIcon href="https://X.com/AntiNode" icon={<FiTwitter />} color="hover:bg-blue-500" />
                <SocialIcon href="https://youtube.com/AntiNode" icon={<FiYoutube />} color="hover:bg-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col md:flow-row justify-between items-center gap-4">
          <p className="bai-jamjuree-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
            © {new Date().getFullYear()} AntiNode / Knowledge Synthesis Protocol
          </p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEMS_OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, icon, color }: { href: string; icon: React.ReactNode, color: string }) => (
  <a
    href={href}
    className={`p-2.5 rounded-sm bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-white transition-all duration-300 ${color}`}
  >
    {React.cloneElement(icon as React.ReactElement)}
  </a>
);

export default Footer;