import { Directory, Filesystem } from "@capacitor/filesystem";
import { AppState } from "./app-state";
import { getText } from "./cache-utils";
import { getCacheBaseUrl } from "./cache-asset";

export const siteCache = async () => {
  const asset = {
    content: { md5: await getText("/content.md5") },
    site: { md5: await getText("/site.md5") },
  };

  AppState.base_path = await getCacheBaseUrl();
  AppState.render();

  const local = {
    content: {
      md5: await getText(`/${AppState.base_path}/content.md5`),
    },
    site: {
      md5: await getText(`/${AppState.base_path}/site.md5`),
    },
  };

  if (!local.content.md5) {
    location.href = "/site/index.html";
  }

  // const remote = {
  //   content: { md5: await getText(await urlmap("content.md5")) },
  //   site: { md5: await getText(await urlmap("site.md5")) },
  // };

  // await loadCacheLocal("content", local.content, asset.content);
  // await loadCacheLocal("site", local.site, asset.site);

  // AppState.ready = true;
  // AppState.render();
};
