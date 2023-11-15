import { Encoding, Filesystem, Directory } from "@capacitor/filesystem";
import { AsyncUnzipInflate, Unzip, gunzipSync } from "fflate";
import { urlmap } from "./cache-utils";
import { AppState } from "./app-state";
const directory = Directory.Data;

export const loadCacheLocal = async (
  type: string,
  local: { md5: string },
  asset: { md5: string }
) => {
  const write_blob = (await import("capacitor-blob-writer")).default;
  let ext = type === "site" ? "zip" : "z";

  if (!local.md5) {
    await Filesystem.writeFile({
      data: asset.md5,
      path: `/${type}.md5`,
      directory,
      encoding: Encoding.UTF8,
    });

    const buffer = await (await fetch(`/${type}.${ext}`)).arrayBuffer();
    const data = new Uint8Array(buffer);
    if (ext === "z") {
      const unzip = gunzipSync(data);
      try {
        await Filesystem.deleteFile({
          path: `/content.json`,
          directory,
        });
      } catch (e) {}
      await write_blob({
        blob: new Blob([unzip]),
        path: `/content.json`,
        directory,
      });
    } else {
      try {
        await Filesystem.rmdir({ path: `/site`, directory, recursive: true });
      } catch (e) {}
      await Filesystem.mkdir({ path: `/site`, directory });

      let html = await getText(await urlmap(`site.html`));
      html = html.replace(
        /\[\[base_url\]\]/gi,
        `https://localhost/${AppState.base_path}/site`
      );
      html = html.replace(/\[\[site_id\]\]/gi, AppState.site_id);

      await Promise.all([
        await Filesystem.writeFile({
          data: html,
          path: `/site/index.html`,
          directory,
          encoding: Encoding.UTF8,
        }),
        await Filesystem.writeFile({
          data: await getText(`https://prasi.app/index.css`),
          path: `/site/index.css`,
          directory,
          encoding: Encoding.UTF8,
        }),
      ]);

      const unzip = new Unzip((stream) => {
        const files = {} as Record<string, Uint8Array[]>;
        if (!files[stream.name]) files[stream.name] = [];
        stream.ondata = async (err, chunk, final) => {
          if (stream.size) {
            files[stream.name].push(chunk);
            if (final) {
              await write_blob({
                blob: new Blob(files[stream.name]),
                path: stream.name,
                directory,
              });
            }
          }
        };
        stream.start();
      });
      unzip.register(AsyncUnzipInflate);
      unzip.push(data, true);
    }
  }
};

const getText = async (url: string) => {
  try {
    return await (await fetch(url)).text();
  } catch (e) {
    return "";
  }
};
