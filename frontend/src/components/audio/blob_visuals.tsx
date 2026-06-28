// import { useEffect, useRef, useState } from "react";

// export function AudioWaveform({ blob,audioBuffer }:any) {
//     const [bars, setBars] = useState([]);
//     const canvasRef = useRef<any>(null);

//     async function getAudioData(blob) {
//         const arrayBuffer = await blob.arrayBuffer();
//         const audioContext = new (window.AudioContext || window.AudioContext)();
//         const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
//         return audioBuffer;
//     }
//     function getWaveformData(audioBuffer:any[], bars = 100) {
//         const rawData = audioBuffer.getChannelData(0); // Left channel
//         const step = Math.floor(rawData.length / bars);
//         const amplitudes = [];

//         for (let i = 0; i < bars; i++) {
//             let sum = 0;
//             for (let j = 0; j < step; j++) {
//                 sum += Math.abs(rawData[i * step + j]);
//             }
//             amplitudes.push(sum / step);
//         }

//         // Normalize to 0-1
//         const max = Math.max(...amplitudes);
//         return amplitudes.map(a => a / max);
//     }
//     useEffect(() => {
//         if (!blob) return;

//         getAudioData(blob).then(buffer => {
//             const data = getWaveformData(buffer, 60);
//             setBars(data);
//         });
//     }, [blob]);

//     // Option A: CSS bars (like WhatsApp voice messages)
//     return (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
//             {bars.map((height, i) => (
//                 <div
//                     key={i}
//                     style={{
//                         width: 3,
//                         height: `${Math.max(height * 100, 4)}%`,
//                         background: '#3b82f6',
//                         borderRadius: 2,
//                         transition: 'height 0.2s'
//                     }}
//                 />
//             ))}
//         </div>
//     );
// }