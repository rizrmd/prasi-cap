import { Directory, Filesystem } from "@capacitor/filesystem";
import config from "../../../../res/config.json";

export const siteCache = async () => {};

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
  file: "site.zip" | "site.md5" | "content.gz" | "content.md5"
) => {
  if (!conf.site_id) {
    if (file === "content.gz" || file === "content.md5") {
      const res = await fetch(`${config.url}/site_id`);
      conf.site_id = await res.text();
    }
  }

  const map = {
    "site.zip": "/_file/site-zip",
    "site.md5": "/_file/site-md5",
    "content.gz": `/_file/current-${conf.site_id}`,
    "content.md5": `/_file/current-md5-${conf.site_id}`,
  };

  return url`${map[file]}`;
};
 
const conf = {
  site_id: "",
  write: async (raw: any) => {
    await Filesystem.writeFile({
      data: JSON.stringify(raw, null, 2),
      path: `/site-config.json`,
      directory: Directory.Data,
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
        directory: Directory.Data,
      });

      if (typeof res.data === "string") {
        conf = JSON.parse(res.data);
      }
    } catch (e) {}
    return conf;
  },
};
