export const AppState = {
  ready: false,
  site_id:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("site_id") || ""
      : "",
  base_path:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("base_path") || ""
      : "",
  render: () => {},
};
