import { IoMdClose } from 'react-icons/io';
import { useAppSelector } from '../store/hooks.tsx';
import React from 'react';
import { GiDiamonds } from 'react-icons/gi';

export function QuotaIndicator() {
    const { Querycount, user } = useAppSelector(s => s.auth)
    const [IsUp, setIsUp] = React.useState(false);

    const Quota = user?.IsPremiumUser === false ? 5 : 10
    return (<>
        <div className={`
  flex items-center justify-between gap-3 
  fixed ${!IsUp ? "-top-12" : 'top-0'} 
  left-0 w-full h-fit px-4 py-2
  transition-all duration-300 ease-in-out -z-10
  ${Querycount >= Quota
                ? 'bg-red-500/10 border-b border-red-500/50 text-red-400'
                : 'bg-teal-500/10 border-b border-teal-500/50 text-teal-400'
            }
`}>
            <span className="space-grotesk text-xs flex items-center justify-center gap-2">
                {Querycount >= Quota
                    ? 'Quota exhausted — resets soon. You will be notified via app and email.'
                    : (<>
                        <GiDiamonds />Shards remaining → {Math.max(Quota - Querycount, 0)}
                    </>)
                }
            </span>
            <button
                onClick={() => setIsUp(!IsUp)}
                className="hover:opacity-70 transition-opacity ml-auto"
            >
                <IoMdClose size={14} className={Querycount >= Quota ? 'text-red-400' : 'text-teal-400'} />
            </button>
        </div>
    </>)
}