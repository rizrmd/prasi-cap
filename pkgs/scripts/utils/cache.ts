import { gunzipSync } from "bun";
import { AsyncUnzipInflate, Unzip } from "fflate";
import { $ } from "zx";
import { CONTENT, getText, urlmap } from "../../wrapper/src/utils/cache-utils";
import { dir } from "./dir";
import { AppState } from "../../wrapper/src/utils/app-state";
const decoder = new TextDecoder();
export const prepareSiteCache = async (target: string) => {
  const pubdir = dir.root(target);
  await downloadArchive(target);

  $.verbose = false;
  const sitezip = Bun.file(`${pubdir}/site.zip`);
  if (await sitezip.exists()) {
    await $`rm -rf ${pubdir}/site`;
    await new Promise<void>(async (resolve) => {
      await $`mkdir -p ${pubdir}/site`;
      const files = {} as Record<string, Uint8Array[]>;
      const unzip = new Unzip(async (stream) => {
        if (!files[stream.name] && stream.size) files[stream.name] = [];

        stream.ondata = async (err, chunk, final) => {
          if (stream.size) {
            files[stream.name].push(chunk);
            if (final) {
              await Bun.write(
                Bun.file(`${pubdir}/${stream.name}`),
                new Blob(files[stream.name])
              );
              delete files[stream.name];
              if (Object.keys(files).length === 0) {
                resolve();
              }
            }
          }
        };
        stream.start();
      });
      unzip.register(AsyncUnzipInflate);
      unzip.push(new Uint8Array(await sitezip.arrayBuffer()), true);
    });

    let html = await getText(await urlmap(`site.html`));
    html = html.replace(/\[\[base_url\]\]/gi, `https://localhost/site`);
    html = html.replace(/\[\[site_id\]\]/gi, AppState.site_id);
    html = html.replace(
      `<script>`,
      `<script>window.mobilepath = "https://localhost/content";`
    );
    await Bun.write(Bun.file(`${pubdir}/index.html`), html);
    await Bun.write(
      Bun.file(`${pubdir}/site/index.css`),
      await getText("https://prasi.app/index.css")
    );
    await $`rm ${pubdir}/site.zip`;
  }

  const contentz = Bun.file(`${pubdir}/content.z`);
  if (await contentz.exists()) {
    const res = gunzipSync(new Uint8Array(await contentz.arrayBuffer()));
    const content = JSON.parse(decoder.decode(res)) as CONTENT;
    await $`rm -rf ${pubdir}/content`;
    for (const c of Object.keys(content)) {
      const sdir = `${pubdir}/content/${c}`;
      const child = (content as any)[c] as Record<string, any>;
      await $`mkdir -p ${sdir}`;
      if (Array.isArray(child)) {
        for (const c of child) {
          const file = Bun.file(`${sdir}/${c.id}.json`);
          await Bun.write(file, JSON.stringify(c, null, 2));
        }
      } else {
        if (c === "npm") {
          for (const [k, v] of Object.entries(child)) {
            await $`mkdir -p ${sdir}/${k}`;
            for (const [i, j] of Object.entries(v)) {
              if (k === "pages") {
                await $`mkdir -p ${sdir}/${k}/${i}`;
                for (const [r, s] of Object.entries(j as any)) {
                  const file = Bun.file(`${sdir}/${k}/${i}/${r}`);
                  await Bun.write(
                    file,
                    typeof s === "string" ? s : JSON.stringify(s, null, 2)
                  );
                }
              } else {
                const file = Bun.file(`${sdir}/${k}/${i}`);
                await Bun.write(
                  file,
                  typeof j === "string" ? j : JSON.stringify(j, null, 2)
                );
              }
            }
          }
        } else if (c === "site") {
          await Bun.write(`${sdir}/site.json`, JSON.stringify(child, null, 2));
        }
      }
    }

    await $`rm ${pubdir}/content.z`;
  }
};

const downloadArchive = async (target: string) => {
  const pubdir = dir.root(target);
  if (
    !(await Bun.file(`${pubdir}/content.md5`).exists()) ||
    !Bun.file(`${pubdir}/content`).size
  ) {
    console.log("downloading content.z", await urlmap("content.gz"));
    const md5 = await fetch(await urlmap("content.md5"));
    await Bun.write(Bun.file(`${pubdir}/content.md5`), await md5.arrayBuffer());
    const gz = await fetch(await urlmap("content.gz"));
    await Bun.write(Bun.file(`${pubdir}/content.z`), await gz.arrayBuffer());
  } else {
    const md5 = await fetch(await urlmap("content.md5"));
    const md5text = await md5.text();
    if (md5text !== (await Bun.file(`${pubdir}/content.md5`).text())) {
      console.log("downloading content.z", await urlmap("content.gz"));
      await Bun.write(Bun.file(`${pubdir}/content.md5`), md5text);
      const gz = await fetch(await urlmap("content.gz"));
      await Bun.write(Bun.file(`${pubdir}/content.z`), await gz.arrayBuffer());
    }
  }

  if (!(await Bun.file(`${pubdir}/site.md5`).exists())) {
    console.log("downloading site.zip");

    const md5 = await fetch(await urlmap("site.md5"));
    await Bun.write(Bun.file(`${pubdir}/site.md5`), await md5.arrayBuffer());
    const zip = await fetch(await urlmap("site.zip"));
    await Bun.write(Bun.file(`${pubdir}/site.zip`), await zip.arrayBuffer());
  } else {
    const md5 = await fetch(await urlmap("site.md5"));
    const md5text = await md5.text();
    if (md5text !== (await Bun.file(`${pubdir}/site.md5`).text())) {
      console.log("downloading site.zip");

      await Bun.write(Bun.file(`${pubdir}/site.md5`), md5text);
      const zip = await fetch(await urlmap("site.zip"));
      await Bun.write(Bun.file(`${pubdir}/site.zip`), await zip.arrayBuffer());
    }
  }
};
