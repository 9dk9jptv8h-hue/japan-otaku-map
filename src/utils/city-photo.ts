// 城市风景图片 — 本地自托管（public/cities/）
// 原因：upload.wikimedia.org 在中国大陆不可用，热链会导致图片加载失败。
// 图片来自 Wikimedia Commons，按各自许可使用；完整署名与许可见 public/cities/CREDITS.md，
// getCityPhotoSource() 返回每张图对应的 Commons 文件页链接（弹窗署名用）。
const PHOTO_BASE = `${import.meta.env.BASE_URL}cities/`

const CITY_PHOTOS: Record<string, string> = {
  '池袋': 'photo-36.webp',
  '秋叶原': 'photo-57.webp',
  '涩谷': 'photo-03.webp',
  '新宿': 'photo-21.webp',
  '中野': 'photo-24.webp',
  '吉祥寺': 'photo-18.webp',
  '日本桥': 'photo-14.webp',
  '梅田': 'photo-04.webp',
  '天王寺': 'photo-48.webp',
  '心斋桥': 'photo-59.webp',
  '名古屋': 'photo-42.webp',
  '京都': 'photo-58.webp',
  '横滨': 'photo-09.webp',
  '神户': 'photo-23.webp',
  '札幌': 'photo-12.webp',
  '仙台': 'photo-32.webp',
  '广岛': 'photo-31.webp',
  '福冈': 'photo-45.webp',
  '那霸': 'photo-54.webp',
  '函馆': 'photo-25.webp',
  '金泽': 'photo-07.webp',
  '姬路': 'photo-30.webp',
  '熊本': 'photo-10.webp',
  '鹿儿岛': 'photo-49.webp',
  '静冈': 'photo-55.webp',
  '沼津': 'photo-55.webp',
  '旭川': 'photo-08.webp',
  '钏路': 'photo-22.webp',
  '秋田': 'photo-37.webp',
  '德岛': 'photo-43.webp',
  '高松': 'photo-40.webp',
  '松山': 'photo-05.webp',
  '冈山': 'photo-26.webp',
  '千岁': 'photo-39.webp',
  '大阪': 'photo-13.webp',
  '东京': 'photo-50.webp',
  '新潟': 'photo-06.webp',
  '长崎': 'photo-29.webp',
  '高知': 'photo-47.webp',
  '千叶': 'photo-34.webp',
  '大宫': 'photo-46.webp',
  '岐阜': 'photo-17.webp',
  '盛冈': 'photo-33.webp',
  '福岛': 'photo-19.webp',
  '青森': 'photo-28.webp',
  '宇都宫': 'photo-52.webp',
  '川崎': 'photo-15.webp',
  '米子': 'photo-11.webp',
  '丰桥': 'photo-44.webp',
  '小仓': 'photo-51.webp',
  '柏': 'photo-56.webp',
  '水户': 'photo-35.webp',
  '高崎': 'photo-02.webp',
  '町田': 'photo-41.webp',
  '八王子': 'photo-20.webp',
  '立川': 'photo-16.webp',
  '蒲田': 'photo-27.webp',
  '大田': 'photo-27.webp',
  '武藏野': 'photo-18.webp',
  '北海道': 'photo-53.webp',
  '冲绳': 'photo-38.webp',
  '埼玉': 'photo-01.webp',
  '爱知': 'photo-42.webp',
  '兵库': 'photo-30.webp',
  '香川': 'photo-40.webp',
  '爱媛': 'photo-05.webp',
  '茨城': 'photo-35.webp',
  '群马': 'photo-02.webp',
  '栃木': 'photo-52.webp',
  '岩手': 'photo-33.webp',
  '鸟取': 'photo-11.webp',
};

// 每张图的 Commons 文件页（署名链接）
const PHOTO_SOURCES: Record<string, string> = {
  'photo-01.webp': 'https://commons.wikimedia.org/wiki/File:Saitama_stadium2002-1.jpg',
  'photo-02.webp': 'https://commons.wikimedia.org/wiki/File:Takasaki_Kannon_Akaiitokigansai.jpg',
  'photo-03.webp': 'https://commons.wikimedia.org/wiki/File:Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg',
  'photo-04.webp': 'https://commons.wikimedia.org/wiki/File:Umeda_Sky_Building,_Osaka,_November_2016_-02.jpg',
  'photo-05.webp': 'https://commons.wikimedia.org/wiki/File:Dōgo_Onsen.jpg',
  'photo-06.webp': 'https://commons.wikimedia.org/wiki/File:Bandaibashi-Bridge_20130929.JPG',
  'photo-07.webp': 'https://commons.wikimedia.org/wiki/File:View_towards_Hanami-bashi_with_sakura,_Kenroku-en,_Kanazawa,_2016.jpg',
  'photo-08.webp': 'https://commons.wikimedia.org/wiki/File:Asahikawa_Winter_Festival_Snow_Statue_1.jpg',
  'photo-09.webp': 'https://commons.wikimedia.org/wiki/File:070203_MM21&FUJI.jpg',
  'photo-10.webp': 'https://commons.wikimedia.org/wiki/File:Kumamoto_Castle_02n3200.jpg',
  'photo-11.webp': 'https://commons.wikimedia.org/wiki/File:Tottori-Sakyu_Tottori_Japan.JPG',
  'photo-12.webp': 'https://commons.wikimedia.org/wiki/File:Sapporo_TV_tower-20091013-RM-162316.jpg',
  'photo-13.webp': 'https://commons.wikimedia.org/wiki/File:Osaka_Castle_02bs3200.jpg',
  'photo-14.webp': 'https://commons.wikimedia.org/wiki/File:Dotonbori,_Osaka,_at_night,_November_2016.jpg',
  'photo-15.webp': 'https://commons.wikimedia.org/wiki/File:Kawasaki_Daishi_Main_Hall.jpg',
  'photo-16.webp': 'https://commons.wikimedia.org/wiki/File:2018_Showa_Memorial_Park_02.jpg',
  'photo-17.webp': 'https://commons.wikimedia.org/wiki/File:Gifu_Castle.jpg',
  'photo-18.webp': 'https://commons.wikimedia.org/wiki/File:Inokasira_Park.jpg',
  'photo-19.webp': 'https://commons.wikimedia.org/wiki/File:JRE_Fukushima-STA_East_2026.jpg',
  'photo-20.webp': 'https://commons.wikimedia.org/wiki/File:Takao-san_hike_during_winter_18.jpg',
  'photo-21.webp': 'https://commons.wikimedia.org/wiki/File:Colorful_illuminated_facades_of_buildings_at_night,_with_green,_blue_and_pink_lights,_Kabukicho,_Shinjuku,_Tokyo.jpg',
  'photo-22.webp': 'https://commons.wikimedia.org/wiki/File:Kushiro-Shitsugen_Kushiro-river.jpg',
  'photo-23.webp': 'https://commons.wikimedia.org/wiki/File:Kobe_Port_Tower_and_Maritime_Museum,_November_2016.jpg',
  'photo-24.webp': 'https://commons.wikimedia.org/wiki/File:Nakano_broadway_entrance.JPG',
  'photo-25.webp': 'https://commons.wikimedia.org/wiki/File:View_from_Mount_Hakodate_Japan01o.jpg',
  'photo-26.webp': 'https://commons.wikimedia.org/wiki/File:Korakuen_(japanese_garden)_and_Okayama_castle.jpg',
  'photo-27.webp': 'https://commons.wikimedia.org/wiki/File:Keikyu_Kamata_Shopping_Street_Asuto.jpg',
  'photo-28.webp': 'https://commons.wikimedia.org/wiki/File:Aomori,_Nebuta-matsuri_34.jpg',
  'photo-29.webp': 'https://commons.wikimedia.org/wiki/File:Nagasaki_City_view_from_Hamahira01s3.jpg',
  'photo-30.webp': 'https://commons.wikimedia.org/wiki/File:Château_de_Himeji02.jpg',
  'photo-31.webp': 'https://commons.wikimedia.org/wiki/File:Itsukushima-jinja_torii_at_sunset,_Miyajima,_Japan,_20240816_1812_4144.jpg',
  'photo-32.webp': 'https://commons.wikimedia.org/wiki/File:Sendai_skyline_and_Hirose_River_from_Hyojogawara_Bridge.jpg',
  'photo-33.webp': 'https://commons.wikimedia.org/wiki/File:盛岡城址烏帽子岩.JPG',
  'photo-34.webp': 'https://commons.wikimedia.org/wiki/File:Chiba_Port_Tower_20111211.jpg',
  'photo-35.webp': 'https://commons.wikimedia.org/wiki/File:Kairakuen_bairin.jpg',
  'photo-36.webp': 'https://commons.wikimedia.org/wiki/File:サンシャイン60.JPG',
  'photo-37.webp': 'https://commons.wikimedia.org/wiki/File:Akita_Kanto.jpg',
  'photo-38.webp': 'https://commons.wikimedia.org/wiki/File:Okinawa_Aquarium.jpg',
  'photo-39.webp': 'https://commons.wikimedia.org/wiki/File:Hokkaido_New_Chitose_Airport13n4272.jpg',
  'photo-40.webp': 'https://commons.wikimedia.org/wiki/File:Ritsurin_Garden,_Takamatsu_3-27_(26501902471).jpg',
  'photo-41.webp': 'https://commons.wikimedia.org/wiki/File:Machida_city.jpg',
  'photo-42.webp': 'https://commons.wikimedia.org/wiki/File:Nagoya_Castle(Larger).jpg',
  'photo-43.webp': 'https://commons.wikimedia.org/wiki/File:Awa-odori_2008_Tokushima.jpg',
  'photo-44.webp': 'https://commons.wikimedia.org/wiki/File:Toyohashi_City_Hall_(2011.09.15).jpg',
  'photo-45.webp': 'https://commons.wikimedia.org/wiki/File:Canal_City_Hakata_2011.jpg',
  'photo-46.webp': 'https://commons.wikimedia.org/wiki/File:Omiya_Bonsai_Village_(13593494913).jpg',
  'photo-47.webp': 'https://commons.wikimedia.org/wiki/File:Kochi_Castle08s3872.jpg',
  'photo-48.webp': 'https://commons.wikimedia.org/wiki/File:Shinsekai_and_Tsutenkaku_Tower.jpg',
  'photo-49.webp': 'https://commons.wikimedia.org/wiki/File:20100721_Sakurajima_Ferry_4243.jpg',
  'photo-50.webp': 'https://commons.wikimedia.org/wiki/File:Tokyo_Tower_2016.jpg',
  'photo-51.webp': 'https://commons.wikimedia.org/wiki/File:Kokura_castle_from_the_Japanese_garden.jpg',
  'photo-52.webp': 'https://commons.wikimedia.org/wiki/File:Utsunomiya_Oya-ji_Temple.JPG',
  'photo-53.webp': 'https://commons.wikimedia.org/wiki/File:ファーム富田_(Farm_Tomita)_@_富良野_(Furano)_-_panoramio_(1).jpg',
  'photo-54.webp': 'https://commons.wikimedia.org/wiki/File:Kokusai-dori08s3s4440.jpg',
  'photo-55.webp': 'https://commons.wikimedia.org/wiki/File:Aerial_panorama_of_Mount_Fuji_from_Lake_Saiko._June_2023.jpg',
  'photo-56.webp': 'https://commons.wikimedia.org/wiki/File:Kashiwa_Station_before_Redevelopment.jpg',
  'photo-57.webp': 'https://commons.wikimedia.org/wiki/File:Akihabara_Main_Street_in_Night_20000208.jpg',
  'photo-58.webp': 'https://commons.wikimedia.org/wiki/File:Kinkaku-ji_in_November_2016_-02.jpg',
  'photo-59.webp': 'https://commons.wikimedia.org/wiki/File:Shinsaibashi-suji_201408.JPG',
};

function findPhoto(name: string, address: string): string {
  const searchText = name + address;
  // Sort keys by length descending so longer city names match before shorter ones
  // (e.g. "吉祥寺" before "吉祥", "鹿儿岛" before "鹿儿")
  const sortedEntries = Object.entries(CITY_PHOTOS).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [city, file] of sortedEntries) {
    if (searchText.includes(city)) return file;
  }
  return 'photo-50.webp'; // 东京塔兜底图
}

export function getCityPhoto(name: string, address: string): string {
  return PHOTO_BASE + findPhoto(name, address);
}

/** 返回该城市照片对应的 Commons 文件页 URL（署名用） */
export function getCityPhotoSource(name: string, address: string): string {
  const file = findPhoto(name, address);
  return PHOTO_SOURCES[file] ?? 'https://commons.wikimedia.org';
}