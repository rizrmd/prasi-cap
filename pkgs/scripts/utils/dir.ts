import * as path from "path";

export const PROJECT_ROOT = path.join(process.cwd(), "pkgs", "wrapper");
export const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
export const BUILD_DIR = path.resolve(PROJECT_ROOT, "build");

export const dir = {
  root: (to: string) => {
    return path.join(process.cwd(), to);
  },
  path: (to: string) => {
    return path.join(PROJECT_ROOT, to);
  },
};
