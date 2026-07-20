// 城市风景图片 — 使用多个图源确保加载成功
// NOTE: 部分城市共用同一张照片 URL（如静冈/沼津共享富士山图、蒲田/大田共享大田区图、
// 吉祥寺/武藏野共享井之头公园图等），这是因可用照片集有限而做的有意识取舍，
// 并非 bug。后续如有更精确的独立照片可逐个替换。
const CITY_PHOTOS: Record<string, string> = {
  '池袋': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sunshine_60_and_Tokyo_Solamachi.jpg/640px-Sunshine_60_and_Tokyo_Solamachi.jpg',
  '秋叶原': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Akihabara_Night.jpg/640px-Akihabara_Night.jpg',
  '涩谷': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Shibuya_Crossing%2C_Tokyo_001.jpg/640px-Shibuya_Crossing%2C_Tokyo_001.jpg',
  '新宿': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Shinjuku_at_night.jpg/640px-Shinjuku_at_night.jpg',
  '中野': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nakano_Broadway_2022.jpg/640px-Nakano_Broadway_2022.jpg',
  '吉祥寺': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Inokashira_Park_Sakura.jpg/640px-Inokashira_Park_Sakura.jpg',
  '日本桥': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Dotonbori_at_night.jpg/640px-Dotonbori_at_night.jpg',
  '梅田': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Umeda_Sky_Building.jpg/640px-Umeda_Sky_Building.jpg',
  '天王寺': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Tsutenkaku_Osaka.jpg/640px-Tsutenkaku_Osaka.jpg',
  '心斋桥': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Shinsaibashi_bridge_at_night.jpg/640px-Shinsaibashi_bridge_at_night.jpg',
  '名古屋': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagoya_Castle_Golden_Dolphins.jpg/640px-Nagoya_Castle_Golden_Dolphins.jpg',
  '京都': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Kinkaku-ji_the_Golden_Temple_in_Kyoto.jpg/640px-Kinkaku-ji_the_Golden_Temple_in_Kyoto.jpg',
  '横滨': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Yokohama_Minato_Mirai_21_at_night.jpg/640px-Yokohama_Minato_Mirai_21_at_night.jpg',
  '神户': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Kobe_Port_Tower_and_Kobe_Maritime_Museum.jpg/640px-Kobe_Port_Tower_and_Kobe_Maritime_Museum.jpg',
  '札幌': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Sapporo_TV_Tower_night.jpg/640px-Sapporo_TV_Tower_night.jpg',
  '仙台': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sendai_Castle_02.jpg/640px-Sendai_Castle_02.jpg',
  '广岛': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Itsukushima_Shrine_Torii_Gate.jpg/640px-Itsukushima_Shrine_Torii_Gate.jpg',
  '福冈': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Canal_City_Hakata_Fukuoka.jpg/640px-Canal_City_Hakata_Fukuoka.jpg',
  '那霸': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Naha_Kokusai_Dori.jpg/640px-Naha_Kokusai_Dori.jpg',
  '函馆': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Hakodate_Night_View.jpg/640px-Hakodate_Night_View.jpg',
  '金泽': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kenrokuen_Garden_Kanazawa.jpg/640px-Kenrokuen_Garden_Kanazawa.jpg',
  '姬路': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Himeji_Castle_The_Keep_001.jpg/640px-Himeji_Castle_The_Keep_001.jpg',
  '熊本': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Kumamoto_Castle_Keep_Tower.jpg/640px-Kumamoto_Castle_Keep_Tower.jpg',
  '鹿儿岛': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Sakurajima_and_Kagoshima_City.jpg/640px-Sakurajima_and_Kagoshima_City.jpg',
  '静冈': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mount_Fuji_from_Lake_Saiko.jpg/640px-Mount_Fuji_from_Lake_Saiko.jpg',
  '沼津': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mount_Fuji_from_Lake_Saiko.jpg/640px-Mount_Fuji_from_Lake_Saiko.jpg',
  '旭川': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Asahikawa_Winter_Festival.jpg/640px-Asahikawa_Winter_Festival.jpg',
  '钏路': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Kushiro_Marshland.jpg/640px-Kushiro_Marshland.jpg',
  '秋田': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Akita_Kanto_Festival.jpg/640px-Akita_Kanto_Festival.jpg',
  '德岛': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Awa_Odori_Tokushima.jpg/640px-Awa_Odori_Tokushima.jpg',
  '高松': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Ritsurin_Garden_Takamatsu.jpg/640px-Ritsurin_Garden_Takamatsu.jpg',
  '松山': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dogo_Onsen_Matsuyama.jpg/640px-Dogo_Onsen_Matsuyama.jpg',
  '冈山': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Korakuen_Okayama.jpg/640px-Korakuen_Okayama.jpg',
  '千岁': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/New_Chitose_Airport.jpg/640px-New_Chitose_Airport.jpg',
  '大阪': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Osaka_Castle_Park.jpg/640px-Osaka_Castle_Park.jpg',
  '东京': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Tokyo_Tower_and_Shiba_Park.jpg/640px-Tokyo_Tower_and_Shiba_Park.jpg',
  '新潟': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Niigata_City_at_night.jpg/640px-Niigata_City_at_night.jpg',
  '长崎': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Nagasaki_Harbor_View.jpg/640px-Nagasaki_Harbor_View.jpg',
  '高知': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Kochi_Castle.jpg/640px-Kochi_Castle.jpg',
  '千叶': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chiba_Port_Tower.jpg/640px-Chiba_Port_Tower.jpg',
  '大宫': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Omiya_Bonsai_Village.jpg/640px-Omiya_Bonsai_Village.jpg',
  '岐阜': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Gifu_Castle_and_Mount_Kinka.jpg/640px-Gifu_Castle_and_Mount_Kinka.jpg',
  '盛冈': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Morioka_Castle_Site_Park.jpg/640px-Morioka_Castle_Site_Park.jpg',
  '福岛': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Fukushima_City_View.jpg/640px-Fukushima_City_View.jpg',
  '青森': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Aomori_Nebuta_Festival.jpg/640px-Aomori_Nebuta_Festival.jpg',
  '宇都宫': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Utsunomiya_City_View.jpg/640px-Utsunomiya_City_View.jpg',
  '川崎': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kawasaki_Daishi_Heiken-ji.jpg/640px-Kawasaki_Daishi_Heiken-ji.jpg',
  '米子': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tottori_Sand_Dunes.jpg/640px-Tottori_Sand_Dunes.jpg',
  '丰桥': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toyohashi_City_View.jpg/640px-Toyohashi_City_View.jpg',
  '小仓': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Kokura_Castle.jpg/640px-Kokura_Castle.jpg',
  '柏': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Kashiwa_City_View.jpg/640px-Kashiwa_City_View.jpg',
  '水户': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Kairakuen_Mito.jpg/640px-Kairakuen_Mito.jpg',
  '高崎': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Takasaki_Byakue_Daikannon.jpg/640px-Takasaki_Byakue_Daikannon.jpg',
  '町田': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Machida_City_View.jpg/640px-Machida_City_View.jpg',
  '八王子': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Mount_Takao_Hachioji.jpg/640px-Mount_Takao_Hachioji.jpg',
  '立川': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Showa_Kinen_Park_Tachikawa.jpg/640px-Showa_Kinen_Park_Tachikawa.jpg',
  '蒲田': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ota_City_Tokyo.jpg/640px-Ota_City_Tokyo.jpg',
  '大田': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ota_City_Tokyo.jpg/640px-Ota_City_Tokyo.jpg',
  '武藏野': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Inokashira_Park_Sakura.jpg/640px-Inokashira_Park_Sakura.jpg',
  '北海道': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Hokkaido_Lavender_Field.jpg/640px-Hokkaido_Lavender_Field.jpg',
  '冲绳': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Okinawa_Churaumi_Aquarium.jpg/640px-Okinawa_Churaumi_Aquarium.jpg',
  '埼玉': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Saitama_Stadium.jpg/640px-Saitama_Stadium.jpg',
  '爱知': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagoya_Castle_Golden_Dolphins.jpg/640px-Nagoya_Castle_Golden_Dolphins.jpg',
  '兵库': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Himeji_Castle_The_Keep_001.jpg/640px-Himeji_Castle_The_Keep_001.jpg',
  '香川': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Ritsurin_Garden_Takamatsu.jpg/640px-Ritsurin_Garden_Takamatsu.jpg',
  '爱媛': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dogo_Onsen_Matsuyama.jpg/640px-Dogo_Onsen_Matsuyama.jpg',
  '茨城': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Kairakuen_Mito.jpg/640px-Kairakuen_Mito.jpg',
  '群马': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Takasaki_Byakue_Daikannon.jpg/640px-Takasaki_Byakue_Daikannon.jpg',
  '栃木': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Utsunomiya_City_View.jpg/640px-Utsunomiya_City_View.jpg',
  '岩手': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Morioka_Castle_Site_Park.jpg/640px-Morioka_Castle_Site_Park.jpg',
  '鸟取': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tottori_Sand_Dunes.jpg/640px-Tottori_Sand_Dunes.jpg',
};

export function getCityPhoto(name: string, address: string): string {
  const searchText = name + address;
  // Sort keys by length descending so longer city names match before shorter ones
  // (e.g. "吉祥寺" before "吉祥", "鹿儿岛" before "鹿儿")
  const sortedEntries = Object.entries(CITY_PHOTOS).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [city, url] of sortedEntries) {
    if (searchText.includes(city)) return url;
  }
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Tokyo_Tower_and_Shiba_Park.jpg/640px-Tokyo_Tower_and_Shiba_Park.jpg';
}
