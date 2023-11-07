import * as path from "path";
import { $, cd } from "zx";

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

$.verbose = false;
await $`cp ${dir.root("res/google-services.json")} android/app`;
await $`bun cap sync`;
await $`bun cap update`;
