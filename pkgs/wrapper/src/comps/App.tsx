import { useEffect } from "react";
import { addListeners, registerNotifications } from "../utils/notif";

export default () => {
  useEffect(() => {
    addListeners();
    registerNotifications();
  }, []);

  return (
    <div
      className={cx(
        css`
          display: flex;
          width: 100%;
          height: 100%;
        `
      )}
    >
      Hello
    </div>
  );
};
