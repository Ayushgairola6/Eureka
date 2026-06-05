import { supabase } from "../controllers/supabaseHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";

export const HandleDocumentMetadataGathering = async (selectedDocuments, user) => {
    const cacheResults = await Promise.all(
        selectedDocuments.filter(Boolean).map(async (id) => {
            try {
                const cached = await redisClient.hGetAll(`doc:${id}`);
                return Object.keys(cached).length > 0
                    ? { id, data: cached, fromCache: true }
                    : { id, data: null, fromCache: false };
            } catch {
                return { id, data: null, fromCache: false };
            }
        })
    );

    const hits = cacheResults.filter((r) => r.fromCache);
    const misses = cacheResults.filter((r) => !r.fromCache);
    let dbResults = [];

    if (misses.length > 0) {
        const { data, error } = await supabase
            .from("Contributions")
            .select("document_id, feedback, metadata")
            .in("document_id", misses.map((r) => r.id))
            .eq("user_id", user.user_id);

        if (!error && data) {
            dbResults = data;
            const pipeline = redisClient.multi();
            data.forEach(({ document_id, feedback, metadata }) => {
                pipeline.hSet(`doc:${document_id}`, {
                    document_id,
                    feedback: feedback || "",
                    metadata: JSON.stringify(metadata || {}),
                });
                pipeline.expire(`doc:${document_id}`, 60 * 60 * 5);
            });
            await pipeline.exec();
        }
    }

    return [
        ...hits.map((h) => ({
            document_id: h.id,
            feedback: h.data.feedback,
            metadata: JSON.parse(h.data.metadata || "{}"),
        })),
        ...dbResults,
    ];
};

