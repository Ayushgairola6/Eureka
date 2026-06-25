import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js"


export const HandleTTS = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Please login to continue" });

        const { text } = req.body;
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ message: "Valid text input is required" });
        }

        // 1. Call the audio model's chat completions endpoint (non-streaming)
        const response = await fetch("https://blaze-fire-audio.hf.space/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Add auth token if your Space is private
                // "Authorization": `Bearer ${process.env.HF_TOKEN}`
            },
            body: JSON.stringify({
                model: "LFM2.5-Audio-1.5B-Q4_0", // Match your deployed model name
                messages: [
                    {
                        role: "system",
                        content: "Perform TTS. Use the UK female voice."
                    },
                    {
                        role: "user",
                        content: text.trim()
                    }
                ],
                // Disable streaming
                stream: false,
                max_tokens: 512,
                temperature: 0.2,
                // Reset context for each request
                extra_body: { reset_context: true }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("TTS API error:", response.status, errorText);
            return res.status(response.status).json({
                message: "TTS service error",
                error: errorText
            });
        }

        // 2. Parse the JSON response
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({
                message: "No response from TTS model",
                raw: data
            });
        }

        // The content can be either:
        // - A base64 audio string (if the model generated audio)
        // - A text response (if the model didn't generate audio)

        // Check if the response is audio (base64 PCM data)
        if (content.startsWith('data:audio')) {
            // Extract the base64 audio data
            const base64Audio = content.split(',')[1] || content;

            // Decode base64 to Buffer
            const audioBuffer = Buffer.from(base64Audio, 'base64');

            // Convert raw PCM to WAV format (24kHz, mono, 32-bit float)
            const wavBuffer = pcmToWav(audioBuffer, 24000);

            // Return as downloadable audio file
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `attachment; filename="tts_${Date.now()}.wav"`);
            return res.send(wavBuffer);
        } else {
            // If the response is just text (no audio generated)
            return res.status(200).json({
                message: "TTS produced text response instead of audio",
                text: content
            });
        }

    } catch (err) {
        console.error("TTS error:", err);
        return res.status(500).json({
            message: "TTS processing failed",
            error: err.message
        });
    }
};

// Helper: Convert PCM to WAV
function pcmToWav(pcmData, sampleRate) {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcmData.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(3, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 4, 28);
    header.writeUInt16LE(4, 32);
    header.writeUInt16LE(32, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcmData.length, 40);
    return Buffer.concat([header, pcmData]);
}