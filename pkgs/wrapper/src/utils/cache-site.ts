import { Directory, Filesystem } from "@capacitor/filesystem";
import { AppState } from "./app-state";
import { loadCacheLocal } from "./cache-local";
import { getText, urlmap } from "./cache-utils";

const directory = Directory.Data;
export const siteCache = async () => {
  const asset = {
    content: { md5: await getText("/content.md5") },
    site: { md5: await getText("/site.md5") },
  };

  const uri = new URL(
    (await Filesystem.readdir({ directory, path: "" })).files[0].uri
  );

  let base = localStorage.getItem("base_path");
  if (!base) {
    const arr = uri.pathname.split("/");
    arr.pop();
    arr.unshift("_capacitor_file_");
    base = arr.filter((e) => !!e).join("/");
    localStorage.setItem("base", base);
  }
  AppState.base_path = base;
  AppState.render();

  const local = {
    content: {
      md5: await getText(`/${base}/content.md5`),
    },
    site: {
      md5: await getText(`/${base}/site.md5`),
    },
  };

  const remote = {
    content: { md5: await getText(await urlmap("content.md5")) },
    site: { md5: await getText(await urlmap("site.md5")) },
  };

  await loadCacheLocal("content", local.content, asset.content);
  await loadCacheLocal("site", local.site, asset.site);

  AppState.ready = true;
  AppState.render();
};
