import { spawn } from "bun";
import { BuildContext, context } from "esbuild";
import { statSync } from "fs";
import * as path from "path";
import { $ } from "zx";
import { urlmap } from "../wrapper/src/utils/cache-utils";
import { BUILD_DIR, PROJECT_ROOT, PUBLIC_DIR, dir } from "./utils/dir";
import { prepareSiteCache } from "./utils/cache";

const g = global as unknown as {
  bundler: BuildContext;
};

if (g.bundler) {
  await g.bundler.dispose();
} else {
  spawn({
    cmd: [
      "bun",
      "tailwindcss",
      "-w",
      "-o",
      "./public/tailwind.css",
      "--minify",
    ],
    cwd: dir.root("pkgs/wrapper"),
  });

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
}
$.verbose = false;

await $`rm -rf  ${dir.path("build")}`;
await $`cp -r ${dir.path("public")} ${dir.path("build")}`;

g.bundler = await context({
  absWorkingDir: PROJECT_ROOT,
  entryPoints: [dir.path("src/index.tsx")],
  minify: true,
  // sourcemap: true,
  outdir: dir.path("build"),
  bundle: true,
  format: "iife",
  target: "es2016",
  plugins: [
    {
      name: "cap",
      setup(build) {
        build.onEnd(async (result) => {
          await $`rm -rf ${dir.root("pkgs/capacitor/www")}`;
          await $`cp -r ${dir.path("build")} ${dir.root("pkgs/capacitor/www")}`;
          await $`cd ${dir.root("pkgs/capacitor")} && npx cap sync`;
        });
      },
    },
  ],
});
await g.bundler.watch({});

function serveFromDir(config: {
  directory: string;
  path: string;
}): Response | null {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ["", ".html", "index.html"];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = statSync(pathWithSuffix);
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix));
      }
    } catch (err) {}
  }

  return null;
}

const server = Bun.serve({
  fetch(request) {
    let reqPath = new URL(request.url).pathname;
    console.log(request.method, reqPath);
    if (reqPath === "/") reqPath = "/index.html";

    // check public
    const publicResponse = serveFromDir({
      directory: PUBLIC_DIR,
      path: reqPath,
    });
    if (publicResponse) return publicResponse;

    // check /.build
    const buildResponse = serveFromDir({ directory: BUILD_DIR, path: reqPath });
    if (buildResponse) return buildResponse;

    return new Response("File not found", {
      status: 404,
    });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
prepareSiteCache();
