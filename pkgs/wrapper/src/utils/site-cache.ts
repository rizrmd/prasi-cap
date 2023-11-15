import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { AsyncUnzipInflate, Unzip, gunzipSync } from "fflate";
import config from "../../../../res/config.json";
import { AppState } from "./app-state";
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

  await load("content", local.content, asset.content);
  await load("site", local.site, asset.site);
  AppState.ready = true;
  AppState.render();

  console.log(
    (await Filesystem.readdir({ path: "/site", directory })).files
      .map((e) => e.name)
      .join("\n")
  );
};
const load = async (
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

const url = (strings: any, ...values: string[]) => {
  const u = new URL(config.url);
  let result = "";
  let i = 0;
  let k = 0;
  while (true) {
    if (strings.length > i) {
      result += strings[i++];
    }
    if (values.length > k) {
      result += values[k++];
    }
    if (strings.length === i && values.length === k) {
      break;
    }
  }
  u.pathname = result;
  return u.toString();
};

export const urlmap = async (
  file: "site.html" | "site.zip" | "site.md5" | "content.gz" | "content.md5"
) => {
  if (!AppState.site_id) {
    const res = await fetch(`${config.url}/site_id`);
    AppState.site_id = await res.text();
  }

  const map = {
    "site.html": "/_file/site-html",
    "site.zip": "/_file/site-zip",
    "site.md5": "/_file/site-md5",
    "content.gz": `/_file/current-${AppState.site_id}`,
    "content.md5": `/_file/current-md5-${AppState.site_id}`,
  };

  return url`${map[file]}`;
};

const conf = {
  write: async (raw: any) => {
    await Filesystem.writeFile({
      data: JSON.stringify(raw, null, 2),
      path: `/site-config.json`,
      directory,
    });
  },
  read: async () => {
    let conf = {
      site: { md5: "" },
      current: { md5: "" },
    };
    try {
      const res = await Filesystem.readFile({
        path: `/site-config.json`,
        directory,
      });

      if (typeof res.data === "string") {
        conf = JSON.parse(res.data);
      }
    } catch (e) {}
    return conf;
  },
};

type CONTENT = {
  site: {
    id: string;
    name: string;
    favicon: string;
    domain: string;
    id_user: string;
    created_at: Date | null;
    id_org: string | null;
    updated_at: Date | null;
    responsive: string;
  } | null;
  pages: {
    id: string;
    name: string;
    url: string;
    content_tree: any;
    id_site: string;
    created_at: Date | null;
    js_compiled: string | null;
    js: string | null;
    updated_at: Date | null;
    id_folder: string | null;
    is_deleted: boolean;
  }[];
  npm: {
    site: Record<string, string>;
    pages: Record<string, Record<string, string>>;
  };
  comps: {
    id: string;
    name: string;
    content_tree: any;
    created_at: Date | null;
    updated_at: Date | null;
    type: string;
    id_component_group: string | null;
    props: any;
  }[];
};

const getText = async (url: string) => {
  try {
    return await (await fetch(url)).text();
  } catch (e) {
    return "";
  }
};
