import { SetQueryCount } from "./AuthSlice";
import {
  finalizeMessage,
  UpdateMessage,
  // UpdateDocUsed,
} from "./InterfaceSlice";

export function HandleSSEConnection(url: any, AiId: string, dispatch: any) {
  const evtSource = new EventSource(url);

  evtSource.onopen = () => {
    console.log("SSE connection opened.");
  };

  evtSource.onmessage = (e) => {
    if (e.data === "[DONE]") {
      dispatch(finalizeMessage({ id: AiId }));
      SetQueryCount();
      evtSource.close();
      return;
    }

    dispatch(UpdateMessage({ id: AiId, delta: e.data }));
  };

  evtSource.onerror = (_err) => {
    // console.error("EventSource error:", err);

    dispatch(
      UpdateMessage({
        id: AiId,
        delta: "Error while generating a response ",
      })
    );
    // checking the metadata first so that we can use them to setup docs used array
    evtSource.addEventListener("metadata", (event) => {
      const meta = JSON.parse(event.data);
      // update the array
      // dispatch(UpdateDocUsed(meta));
      console.log("Documents used:", meta.documents);
    });
    evtSource.close();
  };
}
