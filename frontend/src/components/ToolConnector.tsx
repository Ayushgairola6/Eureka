import { useAppSelector } from '../store/hooks';
import { toast } from 'sonner'
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

export function ConnectDriveButton() {

    const { driveConnected } = useAppSelector(s => s.tools)
    function handleConnect() {
        console.log(driveConnected)
        if (driveConnected === true) {
            toast.info("Drive is already connected with your account.")
            return
        };
        window.location.href = `${BaseApiUrl}/api/auth/google/drive/callback`;
        // check if redirected back with drive=connected
    }



    return (
        <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-800 text-[11px] space-grotesk text-neutral-400 hover:border-sky-500/40 hover:text-sky-400 transition-colors absolute bottom-5 left-35"
        >
            <img src="/google-drive-icon.svg" className="w-3.5 h-3.5 bg" />
            {driveConnected === true ? 'Drive Connected ✓' : 'Connect Google Drive'}
        </button>
    );
}
