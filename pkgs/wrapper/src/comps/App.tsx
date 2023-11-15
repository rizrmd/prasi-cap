import { AppState } from "../utils/app-state";
import { useLocal } from "../utils/use-local";
import { Loading } from "./Loading";

export default () => {
  const local = useLocal({});
  AppState.render = local.render;

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
      {!AppState.ready ? (
        <Loading />
      ) : (
        <iframe
          className={cx(`flex flex-1`)}
          src={
            `https://localhost` +
            (AppState.base_path ? `/${AppState.base_path}` : "") +
            "/site/index.html"
          }
        ></iframe>
      )}
    </div>
  );
};
