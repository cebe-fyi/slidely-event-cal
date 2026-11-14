// Public raster tiles for the local demo. Keep the provider replaceable before
// a larger rollout; attribution must remain visible for any chosen provider.
export const mapConfig = {
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
