import { useEffect } from "react";
import { initNotif, registerNotifications } from "../utils/notif";
import config from "../../../../res/config.json";
import { useLocal } from "../utils/use-local";
import { Loading } from "./Loading";
import { Toast } from "@capacitor/toast";

export default () => {
  const local = useLocal({
    ref: null as null | HTMLIFrameElement,
    loading: true,
    reload: false,
    error: "",
    timeout: null as any,
    timeoutLimit: 5,
  });

  useEffect(() => {
    local.timeout = setTimeout(() => {
      local.error = "Jaringan tidak stabil";
      local.render();
      console.log(local);
    }, local.timeoutLimit * 1000);
    (async () => {
      if (!localStorage.getItem("installed")) {
        localStorage.setItem("installed", "1");
        Toast.show({ text: config.welcome });
      }
      await registerNotifications();
      await initNotif();
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
      <div className="absolute left-0 top-0">&nbsp;</div>
      {local.error ? (
        <div
          className={cx("absolute inset-0 flex items-center justify-center")}
        >
          <div className="flex flex-col space-y-2 text-lg items-stretch">
            <div>Aplikasi gagal load dalam {local.timeoutLimit} detik:</div>
            <div>{local.error}</div>
            <button
              className="bg-blue-400 p-2 text-white"
              onClick={() => {
                local.error = "";
                local.reload = true;
                local.loading = false;
                local.render();

                local.timeout = setTimeout(() => {
                  local.error = "Jaringan tidak stabil";
                  local.render();
                  console.log(local);
                }, local.timeoutLimit * 1000);
                
                setTimeout(() => {
                  local.reload = false;
                  local.loading = true;
                  local.render();
                });
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        <>
          {!local.reload && (
            <iframe
              className={cx(
                css`
                  opacity: ${!local.loading ? 1 : 0};
                  display: flex;
                  width: 100%;
                  height: 100%;
                `
              )}
              src={config.url}
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
                        console.log("raw", local.timeout);
                        clearTimeout(local.timeout);
                        if (local.loading) {
                          local.error = "";
                          local.loading = false;
                          local.render();
                        }

                        const msg = raw as unknown as { mobile: true } & {
                          type: "ready";
                        };

                        if (msg.type === "ready") {
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
                                    localStorage[
                                      `notif-` + data.notification.id
                                    ];
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
                  );
                }
              }}
            />
          )}
          {local.loading && <Loading />}
        </>
      )}
    </div>
  );
};
