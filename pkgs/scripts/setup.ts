import * as path from "path";
import { $, cd } from "zx";
import { prepareSiteCache } from "./utils/cache";

const ROOT = process.cwd();
const dir = {
  root: (to: string) => {
    return path.join(ROOT, to);
  },
};
$.verbose = false;

cd(dir.root("pkgs/capacitor"));
await $`rm -rf android`;

$.verbose = true;
await $`bun cap add android`;

const confile = Bun.file(dir.root("res/config.json"));
if (confile) {
  const config = await confile.json();
  config.version++;
  await Bun.write(confile, JSON.stringify(config, null, 2));

  const buildfile = Bun.file(
    dir.root("pkgs/capacitor/android/app/build.gradle")
  );
  const buildsrc = await buildfile.text();

  let res = buildsrc.replace(
    /versionCode.+\n/,
    `versionCode ${config.version}\n`
  );
  res = res.replace(/versionName.+\n/, `versionName "1.${config.version}"\n`);
  await Bun.write(buildfile, res);
}

await prepareSiteCache("pkgs/capacitor/www");

$.verbose = false;
await $`cp ${dir.root("res/google-services.json")} android/app`;
await $`rm -rf resources`;
await $`mkdir resources`;
await $`cp ${dir.root("res/icon.png")} resources/icon.png`;
await $`cp ${dir.root("res/splash.png")} resources/splash.png`;
await $`bun capacitor-assets generate`;
await $`bun cap sync`;
await $`bun cap update`;
