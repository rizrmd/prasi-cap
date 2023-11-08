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

                      if (notif && typeof notif.loaded === "function") {
                        notif.loaded((data: any) => {
                          win.postMessage({ mobile: true, ...data }, "*");
                        });

                        notif.onReceive = (data) => {
                          localStorage[`notif-` + data.id] =
                            JSON.stringify(data);
                          win.postMessage(
                            {
                              mobile: true,
                              type: "notification-receive",
                              notif: data,
                            },
                            "*"
                          );
                        };
                        
                        notif.onTap = (data) => {
                          if (data) {
                            try {
                              const msg =
                                localStorage[`notif-` + data.notification.id];
                              if (msg) {
                                win.postMessage(
                                  {
                                    mobile: true,
                                    type: "notification-tap",
                                    notif: JSON.parse(msg),
                                  },
                                  "*"
                                );
                                localStorage.removeItem(
                                  `notif-` + data.notification.id
                                );
                              } else {
                                win.postMessage(
                                  {
                                    mobile: true,
                                    type: "notification-tap",
                                    notif: null,
                                  },
                                  "*"
                                );
                              }
                            } catch (e) {}
                          } else {
                            win.postMessage(
                              {
                                mobile: true,
                                type: "notification-tap",
                                notif: null,
                              },
                              "*"
                            );
                          }
                        };
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
