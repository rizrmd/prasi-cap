import { urlmap } from "../../wrapper/src/utils/cache-utils";
import { dir } from "./dir";

export const prepareSiteCache = async () => {};

const downloadArchive = async () => {
  const pubdir = dir.root("pkgs/wrapper/public");
  if (!(await Bun.file(`${pubdir}/content.md5`).exists())) {
    const md5 = await fetch(await urlmap("content.md5"));
    await Bun.write(Bun.file(`${pubdir}/content.md5`), await md5.arrayBuffer());
    const gz = await fetch(await urlmap("content.gz"));
    await Bun.write(Bun.file(`${pubdir}/content.z`), await gz.arrayBuffer());
  } else {
    const md5 = await fetch(await urlmap("content.md5"));
    const md5text = await md5.text();
    if (md5text !== (await Bun.file(`${pubdir}/content.md5`).text())) {
      await Bun.write(Bun.file(`${pubdir}/content.md5`), md5text);
      const gz = await fetch(await urlmap("content.gz"));
      await Bun.write(Bun.file(`${pubdir}/content.z`), await gz.arrayBuffer());
    }
  }

  if (!(await Bun.file(`${pubdir}/site.md5`).exists())) {
    const md5 = await fetch(await urlmap("site.md5"));
    await Bun.write(Bun.file(`${pubdir}/site.md5`), await md5.arrayBuffer());
    const zip = await fetch(await urlmap("site.zip"));
    await Bun.write(Bun.file(`${pubdir}/site.zip`), await zip.arrayBuffer());
  } else {
    const md5 = await fetch(await urlmap("site.md5"));
    const md5text = await md5.text();
    if (md5text !== (await Bun.file(`${pubdir}/site.md5`).text())) {
      await Bun.write(Bun.file(`${pubdir}/site.md5`), md5text);
      const zip = await fetch(await urlmap("site.zip"));
      await Bun.write(Bun.file(`${pubdir}/site.zip`), await zip.arrayBuffer());
    }
  }
};
