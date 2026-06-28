import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAudioFile } from '../../store/visualierSlice';

export function AudioPlayer() {
    const { audioFile } = useAppSelector(s => s.visualizer);
    const dispatch = useAppDispatch();
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [waveformData, setWaveformData] = useState<number[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!audioFile) {
            setAudioUrl(null);
            setWaveformData([]);
            setIsPlaying(false);
            setCurrentTime(0);
            return;
        }

        setIsLoading(true);
        let blob: Blob;
        if (audioFile instanceof Blob) {
            blob = audioFile;
        } else {
            blob = new Blob([audioFile], { type: 'audio/wav' });
        }

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        blob.arrayBuffer().then(arrayBuffer =>
            audioCtx.decodeAudioData(arrayBuffer)
        ).then(audioBuffer => {
            const data = extractWaveform(audioBuffer, 60);
            setWaveformData(data);
            setIsLoading(false);
        }).catch(() => {
            setWaveformData(Array(60).fill(0).map(() => 0.3 + Math.random() * 0.7));
            setIsLoading(false);
        });

        return () => {
            URL.revokeObjectURL(url);
            audioCtx.close();
        };
    }, [audioFile]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [audioUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || waveformData.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barWidth = 3;
        const gap = 2;
        const progress = duration ? currentTime / duration : 0;
        const progressIndex = Math.floor(progress * waveformData.length);

        ctx.clearRect(0, 0, width, height);

        waveformData.forEach((amplitude, i) => {
            const x = i * (barWidth + gap);
            const barHeight = Math.max(amplitude * height * 0.8, 4);
            const y = (height - barHeight) / 2;

            // Minimal monochrome: black for played, gray-300 for unplayed (light mode)
            // In dark mode: white for played, gray-600 for unplayed
            const isDark = document.documentElement.classList.contains('dark');
            ctx.fillStyle = i < progressIndex
                ? (isDark ? '#ffffff' : '#000000')
                : (isDark ? '#4b5563' : '#d1d5db');

            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 2);
            ctx.fill();
        });
    }, [waveformData, currentTime, duration]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        if (!canvas || !audio || !duration) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, x / rect.width));
        audio.currentTime = ratio * duration;
    }, [duration]);

    const toggleSpeed = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const rates = [1, 1.5, 2];
        const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        audio.playbackRate = next;
        setPlaybackRate(next);
    }, [playbackRate]);

    const handleClose = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        dispatch(setAudioFile(null));
    }, [dispatch]);

    const formatTime = (time: number) => {
        if (!isFinite(time)) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!audioFile) return null;

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(500px,92vw)] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">

                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        preload="metadata"
                        className="hidden"
                    />
                )}

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-95 active:scale-90 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                    {isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                    ) : isPlaying ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Waveform + Time */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <canvas
                        ref={canvasRef}
                        onClick={handleSeek}
                        className="h-9 w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500">
                        <span className="font-mono">{formatTime(currentTime)}</span>
                        <span className="font-mono">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Speed */}
                <button
                    onClick={toggleSpeed}
                    className="shrink-0 rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
                >
                    {playbackRate}x
                </button>

                {/* Close */}
                <button
                    onClick={handleClose}
                    className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                    title="Close"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function extractWaveform(audioBuffer: AudioBuffer, bars: number): number[] {
    const raw = audioBuffer.getChannelData(0);
    const step = Math.floor(raw.length / bars);
    const amplitudes: number[] = [];

    for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
            sum += Math.abs(raw[i * step + j]);
        }
        amplitudes.push(sum / step);
    }

    const max = Math.max(...amplitudes, 0.001);
    return amplitudes.map(a => Math.max(a / max, 0.08));
}