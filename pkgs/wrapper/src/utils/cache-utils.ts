import { AppState } from "./app-state";
import config from "../../../../res/config.json";
import { Encoding, Filesystem, Directory } from "@capacitor/filesystem";
import { AsyncUnzipInflate, Unzip, gunzipSync } from "fflate";
const directory = Directory.Data;

export type CONTENT = {
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

export const getText = async (url: string) => {
  try {
    return await (await fetch(url)).text();
  } catch (e) {
    return "";
  }
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
