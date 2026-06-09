// Bing Maps 瓦片图层（与 anitabi.cn 同款）
// 将标准的 z/x/y 瓦片坐标转换为 Bing quadkey 格式

function tileXYToQuadKey(x: number, y: number, z: number): string {
  let quadKey = '';
  for (let i = z; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) !== 0) digit++;
    if ((y & mask) !== 0) digit += 2;
    quadKey += digit;
  }
  return quadKey;
}

export const BING_TILE_URL = 'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1';

export function getTileUrl(z: number, x: number, y: number): string {
  return BING_TILE_URL.replace('{quadkey}', tileXYToQuadKey(x, y, z));
}
