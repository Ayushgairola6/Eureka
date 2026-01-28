
export const DeepWebArchitecture = () => (
    <svg viewBox="0 0 800 400" className=" bg-transparent     top-0 left-0 h-full w-full ">
        <defs>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
            </marker>
        </defs>

        {/* --- Grid Background --- */}
        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#smallGrid)" />

        {/* --- Nodes --- */}
        <g className="font-mono text-xs fill-zinc-300 text-center">

            {/* 1. Request */}
            <rect x="50" y="180" width="100" height="40" rx="4" fill="#18181b" stroke="#8b5cf6" strokeWidth="2" />
            <text x="100" y="205" textAnchor="middle">USER PROMPT</text>

            {/* 2. Intent & Dorking */}
            <rect x="200" y="100" width="140" height="60" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            <text x="270" y="125" textAnchor="middle" className="fill-purple-400">INTENT ANALYSIS</text>
            <text x="270" y="145" textAnchor="middle" fill="#71717a">Google Dork Gen</text>

            {/* 3. Serper & Fetch */}
            <rect x="200" y="240" width="140" height="60" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            <text x="270" y="265" textAnchor="middle" className="fill-blue-400">SERPER API</text>
            <text x="270" y="285" textAnchor="middle" fill="#71717a">Link Extraction</text>

            {/* 4. Scraping Pipeline (The "Engine") */}
            <circle cx="450" cy="200" r="40" fill="#18181b" stroke="#10b981" strokeWidth="2" filter="url(#glow-purple)" />
            <text x="450" y="195" textAnchor="middle" className="fill-emerald-400 font-bold">SCRAPER</text>
            <text x="450" y="215" textAnchor="middle" fill="#71717a">Pipeline</text>

            {/* 5. Context & Report */}
            <rect x="550" y="170" width="120" height="60" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            <text x="610" y="195" textAnchor="middle" className="fill-orange-400">CONTEXT</text>
            <text x="610" y="215" textAnchor="middle" fill="#71717a">Sanitization</text>

            <rect x="710" y="180" width="80" height="40" rx="4" fill="#8b5cf6" stroke="none" />
            <text x="750" y="205" textAnchor="middle" fill="#fff" fontWeight="bold">REPORT</text>
        </g>

        {/* --- Paths & Animations --- */}
        <g fill="none" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arrowhead)">
            {/* User -> Split */}
            <path d="M150 200 L 180 200" />
            <path d="M180 200 L 200 130" />
            <path d="M180 200 L 200 270" />

            {/* Converge on Scraper */}
            <path d="M340 130 L 410 180" />
            <path d="M340 270 L 410 220" />

            {/* Scraper -> Output */}
            <path d="M490 200 L 550 200" />
            <path d="M670 200 L 710 200" />
        </g>

        {/* --- Animated Packets --- */}
        {/* Packet 1: Intent Path */}
        <circle r="3" fill="#a78bfa">
            <animateMotion dur="3s" repeatCount="indefinite" path="M150 200 L 180 200 L 200 130 L 340 130 L 410 180" />
        </circle>
        {/* Packet 2: Serper Path */}
        <circle r="3" fill="#3b82f6">
            <animateMotion dur="3s" begin="0.5s" repeatCount="indefinite" path="M150 200 L 180 200 L 200 270 L 340 270 L 410 220" />
        </circle>
        {/* Packet 3: Final Output */}
        <circle r="3" fill="#10b981">
            <animateMotion dur="3s" begin="2.5s" repeatCount="indefinite" path="M490 200 L 710 200" />
        </circle>

    </svg>
);


export const SynthesisArchitecture = () => (
    <svg viewBox="0 0 800 400" className=" bg-transparent     top-0 left-0 h-1/2 w-full ">
        <defs>
            <linearGradient id="audit-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
        </defs>

        {/* --- Central Synthesis Core --- */}
        <circle cx="400" cy="200" r="60" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5">
            <animateTransform attributeName="transform" type="rotate" from="0 400 200" to="360 400 200" dur="20s" repeatCount="indefinite" />
        </circle>
        <text x="400" y="205" textAnchor="middle" className="fill-white font-mono text-sm font-bold">SYNTHESIS</text>

        {/* --- The Loops --- */}
        {/* 1. Low Confidence Loop (Top) */}
        <path id="correctionLoop" d="M 400 140 C 400 80, 250 80, 250 150 C 250 180, 320 190, 340 195" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" />
        <rect x="220" y="60" width="100" height="30" rx="4" fill="#18181b" stroke="#f59e0b" />
        <text x="270" y="80" textAnchor="middle" className="fill-amber-500 font-mono text-[10px]">SELF_CORRECT</text>

        {/* 2. Verification Audit (Bottom) */}
        <path id="auditLoop" d="M 460 205 C 550 210, 550 320, 400 320 C 300 320, 300 250, 350 230" fill="none" stroke="#10b981" strokeWidth="1.5" />
        <rect x="350" y="305" width="100" height="30" rx="4" fill="#18181b" stroke="#10b981" />
        <text x="400" y="325" textAnchor="middle" className="fill-emerald-500 font-mono text-[10px]">CONFIDENCE: 98%</text>

        {/* --- Input / Output --- */}
        <text x="100" y="205" className="fill-zinc-500 font-mono text-xs">RAW DATA &gt;</text>
        <path d="M170 200 L 330 200" stroke="#3f3f46" strokeWidth="2" />

        <text x="650" y="205" className="fill-zinc-200 font-mono text-xs">&gt; FINAL REPORT</text>
        <path d="M470 200 L 640 200" stroke="#3f3f46" strokeWidth="2" />

        {/* --- Active Particles --- */}
        {/* Amber particle fixing itself */}
        <circle r="3" fill="#f59e0b">
            <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#correctionLoop" />
            </animateMotion>
        </circle>

        {/* Green particle verifying */}
        <circle r="3" fill="#10b981">
            <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#auditLoop" />
            </animateMotion>
        </circle>

    </svg>
);


export const RoomsArchitecture = () => (
    <svg viewBox="0 0 800 450" className=" bg-transparent     top-0 left-0 h-full w-full ">

        {/* --- The Room (Center) --- */}
        <rect x="300" y="150" width="200" height="150" rx="8" fill="#18181b" stroke="#8b5cf6" strokeWidth="2" />
        <text x="400" y="180" textAnchor="middle" className="fill-white font-mono text-sm font-bold">ANTINODE ROOM</text>
        <text x="400" y="200" textAnchor="middle" className="fill-zinc-500 font-mono text-[10px]">Active Session: #829A</text>

        {/* --- Users (Left) --- */}
        <g transform="translate(50, 150)">
            <circle cx="20" cy="0" r="15" fill="#27272a" stroke="#52525b" />
            <circle cx="20" cy="50" r="15" fill="#27272a" stroke="#52525b" />
            <circle cx="20" cy="100" r="15" fill="#27272a" stroke="#52525b" />
            <path d="M40 0 L 250 50" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
            <path d="M40 50 L 250 75" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
            <path d="M40 100 L 250 100" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
        </g>
        <text x="70" y="290" className="fill-zinc-400 font-mono text-[10px]">Real-time Collaboration</text>

        {/* --- Documents System (Right) --- */}
        {/* Private Docs */}
        <g transform="translate(550, 120)">
            <rect x="0" y="0" width="120" height="40" rx="4" fill="#27272a" stroke="#ef4444" strokeWidth="1" />
            <text x="60" y="25" textAnchor="middle" className="fill-red-400 font-mono text-[10px]">PRIVATE VAULT</text>
        </g>

        {/* Public Knowledge + Voting */}
        <g transform="translate(550, 200)">
            <rect x="0" y="0" width="120" height="80" rx="4" fill="#27272a" stroke="#10b981" strokeWidth="1" />
            <text x="60" y="25" textAnchor="middle" className="fill-emerald-400 font-mono text-[10px]">PUBLIC KNOWLEDGE</text>

            {/* Voting UI Representation */}
            <rect x="20" y="40" width="80" height="20" rx="2" fill="#18181b" />
            <text x="60" y="54" textAnchor="middle" className="fill-zinc-500 font-mono text-[8px]">Auth Score: 924</text>

            {/* Up/Down Arrows */}
            <path d="M 105 45 L 110 40 L 115 45" fill="none" stroke="#10b981" strokeWidth="1.5" />
            <path d="M 105 55 L 110 60 L 115 55" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        </g>

        {/* --- Connection Lines --- */}
        <path d="M500 225 L 550 240" stroke="#10b981" strokeWidth="1" />
        <path d="M500 225 L 550 140" stroke="#ef4444" strokeWidth="1" />

        {/* --- Live Logs Window (Bottom) --- */}
        <rect x="250" y="350" width="300" height="60" rx="4" fill="#09090b" stroke="#3f3f46" />
        <text x="260" y="370" className="fill-green-500 font-mono text-[10px]">&gt; User_A upvoted 'Oncology_Study_2025.pdf'</text>
        <text x="260" y="385" className="fill-zinc-500 font-mono text-[10px]">&gt; Room authenticating source...</text>
        <text x="260" y="400" className="fill-purple-500 font-mono text-[10px]">&gt; Consensus Reached.</text>

        {/* --- Pulse Animation for Collaboration --- */}
        <circle cx="400" cy="225" r="50" fill="none" stroke="#8b5cf6" opacity="0.2">
            <animate attributeName="r" values="50;70;50" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="4s" repeatCount="indefinite" />
        </circle>

    </svg>
);