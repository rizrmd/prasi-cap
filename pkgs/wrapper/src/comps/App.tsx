import { useEffect } from "react";
import { addListeners, registerNotifications } from "../utils/notif";
import config from "../../../../res/config.json";
import { useLocal } from "../utils/use-local";
import { Loading } from "./Loading";

export default () => {
  const local = useLocal({
    ref: null as null | HTMLIFrameElement,
    loading: true,
  });
  useEffect(() => {
    (async () => {
      await registerNotifications();
      await addListeners();
    })();
  }, []);

  return (
    <div
      className={cx(
        css`
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
        `
      )}
    >
      <iframe
        onLoad={(e) => {
          const el = e.currentTarget;
          if (el) {
            local.ref = el;
            const win = el.contentWindow;
            local.render();

            if (win) {
              win.postMessage({ mobile: true }, "*");
            }
            window.addEventListener(
              "message",
              ({ data: raw, currentTarget }) => {
                if (typeof raw === "object" && win) {
                  const msg = raw as unknown as { mobile: true } & {
                    type: "ready";
                  };

                  if (msg.type === "ready") {
                    if (local.loading) {
                      local.loading = false;
                      local.render();

                      if (iframe && typeof iframe.loaded === "function") {
                        iframe.loaded((data: any) => {
                          win.postMessage({ mobile: true, ...data }, "*");
                        });
                      }
                    }
                  }
                }
              }
            );
          }
        }}
        src={config.url}
        className={cx(
          css`
            display: flex;
            width: 100%;
            height: 100%;
          `
        )}
      />
      {local.loading && <Loading />}
    </div>
  );
};
