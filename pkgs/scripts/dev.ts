import { spawn } from "bun";
import { BuildContext, context } from "esbuild";
import { statSync } from "fs";
import * as path from "path";
import { $ } from "zx";
import { prepareSiteCache } from "./utils/cache";
import { BUILD_DIR, PROJECT_ROOT, PUBLIC_DIR, dir } from "./utils/dir";

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
  await prepareSiteCache("pkgs/wrapper/public");
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
