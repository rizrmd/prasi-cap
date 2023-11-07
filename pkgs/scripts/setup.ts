import * as path from "path";
import { $ } from "zx";

const dir = {
  root: (to: string) => {
    return path.join(process.cwd(), to);
  },
};

