import { Directory, Filesystem } from "@capacitor/filesystem";

const directory = Directory.Data;

export const getCacheBaseUrl = async () => {
  const uri = new URL(
    (await Filesystem.readdir({ directory, path: "" })).files[0].uri
  );
  let base = localStorage.getItem("base_path");
  if (!base) {
    const arr = uri.pathname.split("/");
    arr.pop();
    arr.unshift("_capacitor_file_");
    base = arr.filter((e) => !!e).join("/");
    localStorage.setItem("base", base);
  }
  return base;
};
