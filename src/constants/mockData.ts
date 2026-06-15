import type { LocationData } from '@/types'

const IMG = '/animate_store.svg'

// ================================================================
//  rating:  实际 Google Maps 参考 + 店铺地位加权
//  visitCount:  Google Maps 口コミ数参考（单位：千）
//  updatedAt: 实际开/改装日期
// ================================================================

export const mockLocations: LocationData[] = [
  // ================================================================
  //  ANIMATE — https://www.animate.co.jp/shop/
  // ================================================================
  // Tier 1: 旗舰·本店（rating ≥ 4.3, reviews ≥ 3000）
  { id: 'ani-knt-1', name: 'animate池袋总店', nameJa: 'アニメイト池袋本店', description: '吉尼斯世界纪录认证！世界最大的动漫商店。2023年3月全面翻新。', category: 'animate', latitude: 35.731, longitude: 139.716, imageUrl: IMG, address: '東京都豊島区東池袋1-20-7', tags: ['吉尼斯', '池袋', '总店', '世界最大'], rating: 4.3, visitCount: 13800, updatedAt: '2023-03-16' },
  { id: 'ani-knt-2', name: 'animate秋叶原', nameJa: 'アニメイト秋葉原', description: '动漫迷圣地·秋叶原的旗舰店。本馆与别馆带来压倒性的商品阵容。', category: 'animate', latitude: 35.702, longitude: 139.772, imageUrl: IMG, address: '東京都千代田区外神田4-3-2', tags: ['秋叶原', '旗舰店', '圣地'], rating: 4.3, visitCount: 5200, updatedAt: '2024-07-01' },
  { id: 'ani-knk-1', name: 'animate大阪日本桥', nameJa: 'アニメイト大阪日本橋', description: '关西最大级。日本桥御宅街的核心存在。', category: 'animate', latitude: 34.659, longitude: 135.506, imageUrl: IMG, address: '大阪府大阪市浪速区日本橋', tags: ['大阪', '日本桥', '关西最大'], rating: 4.3, visitCount: 3800, updatedAt: '2024-09-01' },

  // Tier 2: 大都市主力店（rating 4.1-4.2, reviews 1000-3000）
  { id: 'ani-knt-3', name: 'animate涩谷', nameJa: 'アニメイト渋谷', description: '位于涩谷中心地带的最新动漫商店，深受年轻人喜爱。', category: 'animate', latitude: 35.661, longitude: 139.701, imageUrl: IMG, address: '東京都渋谷区宇田川町', tags: ['涩谷', '年轻人'], rating: 4.2, visitCount: 2800, updatedAt: '2024-11-01' },
  { id: 'ani-knt-4', name: 'animate新宿', nameJa: 'アニメイト新宿', description: '靠近新宿站。附设咖啡厅和ACOS，便利性出众。', category: 'animate', latitude: 35.690, longitude: 139.701, imageUrl: IMG, address: '東京都新宿区新宿3-17-5', tags: ['新宿', '咖啡厅', 'ACOS'], rating: 4.1, visitCount: 2100, updatedAt: '2025-01-01' },
  { id: 'ani-knt-6', name: 'animate横滨', nameJa: 'アニメイト横浜', description: '横滨站附近的大型动漫商店。神奈川最大。', category: 'animate', latitude: 35.464, longitude: 139.624, imageUrl: IMG, address: '神奈川県横浜市西区', tags: ['横滨', '神奈川', '大型'], rating: 4.2, visitCount: 1800, updatedAt: '2024-08-01' },
  { id: 'ani-cbu-1', name: 'animate名古屋', nameJa: 'アニメイト名古屋', description: '中部地区最大的动漫商店。附设咖啡厅和ACOS。', category: 'animate', latitude: 35.169, longitude: 136.907, imageUrl: IMG, address: '愛知県名古屋市中区', tags: ['名古屋', '中部最大'], rating: 4.2, visitCount: 2400, updatedAt: '2024-10-01' },
  { id: 'ani-ksu-1', name: 'animate福冈天神', nameJa: 'アニメイト福岡天神', description: '九州最大的动漫商店。位于PARCO内，交通便利。', category: 'animate', latitude: 33.590, longitude: 130.399, imageUrl: IMG, address: '福岡県福岡市中央区天神', tags: ['福冈', '天神', '九州最大'], rating: 4.2, visitCount: 1900, updatedAt: '2024-12-01' },
  { id: 'ani-knk-2', name: 'animate梅田', nameJa: 'アニメイト梅田', description: '2025年4月24日盛大开业！NU茶屋町3F的最新门店。', category: 'animate', latitude: 34.706, longitude: 135.497, imageUrl: IMG, address: '大阪府大阪市北区茶屋町', tags: ['梅田', '新店', '2025年'], rating: 4.3, visitCount: 1500, updatedAt: '2025-04-24' },

  // Tier 3: 地方中核店（rating 4.0-4.2, reviews 400-1000）
  { id: 'ani-hkd-1', name: 'animate札幌', nameJa: 'アニメイト札幌', description: '北海道最大的动漫商店。附设咖啡厅和ACOS。', category: 'animate', latitude: 43.062, longitude: 141.354, imageUrl: IMG, address: '北海道札幌市中央区', tags: ['咖啡厅', 'ACOS', '北海道'], rating: 4.1, visitCount: 900, updatedAt: '2024-06-01' },
  { id: 'ani-thk-1', name: 'animate仙台', nameJa: 'アニメイト仙台', description: '东北最大级。附设咖啡厅和ACOS，东北动漫迷的圣地。', category: 'animate', latitude: 38.261, longitude: 140.880, imageUrl: IMG, address: '宮城県仙台市青葉区', tags: ['咖啡厅', 'ACOS', '东北最大'], rating: 4.1, visitCount: 1100, updatedAt: '2024-04-01' },
  { id: 'ani-knk-4', name: 'animate京都', nameJa: 'アニメイト京都', description: '京都唯一的动漫商店。游客也爱逛。', category: 'animate', latitude: 35.006, longitude: 135.767, imageUrl: IMG, address: '京都府京都市中京区', tags: ['京都', '观光', '关西'], rating: 4.1, visitCount: 1200, updatedAt: '2024-05-01' },
  { id: 'ani-knk-5', name: 'animate三宫', nameJa: 'アニメイト三宮', description: '位于神户市中心三宫的动漫商店。附设咖啡厅。', category: 'animate', latitude: 34.693, longitude: 135.194, imageUrl: IMG, address: '兵庫県神戸市中央区三宮町', tags: ['神户', '三宫', '咖啡厅'], rating: 4.0, visitCount: 800, updatedAt: '2024-03-01' },
  { id: 'ani-cgk-1', name: 'animate广岛', nameJa: 'アニメイト広島', description: '广岛最大的动漫商店。离和平纪念公园也很近。', category: 'animate', latitude: 34.392, longitude: 132.457, imageUrl: IMG, address: '広島県広島市中区', tags: ['广岛', '中国地方'], rating: 4.1, visitCount: 900, updatedAt: '2024-07-01' },
  { id: 'ani-knt-7', name: 'animate大宫', nameJa: 'アニメイト大宮', description: '埼玉最大的动漫商店。大宫站直达。', category: 'animate', latitude: 35.907, longitude: 139.625, imageUrl: IMG, address: '埼玉県さいたま市大宮区', tags: ['埼玉', '大宫'], rating: 4.0, visitCount: 950, updatedAt: '2024-02-01' },
  { id: 'ani-spc-1', name: 'animate沼津', nameJa: 'アニメイト沼津', description: 'LoveLive!Sunshine!!的圣地。圣地巡礼必到之处。', category: 'animate', latitude: 35.094, longitude: 138.862, imageUrl: IMG, address: '静岡県沼津市', tags: ['沼津', 'LoveLive', '圣地巡礼'], rating: 4.2, visitCount: 1400, updatedAt: '2024-06-01' },
  { id: 'ani-cbu-3', name: 'animate静冈', nameJa: 'アニメイト静岡', description: '静冈市中心的动漫商店。', category: 'animate', latitude: 34.975, longitude: 138.385, imageUrl: IMG, address: '静岡県静岡市葵区', tags: ['静冈', '中部'], rating: 4.0, visitCount: 550, updatedAt: '2024-01-01' },
  { id: 'ani-cbu-4', name: 'animate新潟', nameJa: 'アニメイト新潟', description: '新潟市的动漫商店。附设ACOS。', category: 'animate', latitude: 37.916, longitude: 139.053, imageUrl: IMG, address: '新潟県新潟市中央区', tags: ['新潟', 'ACOS'], rating: 4.0, visitCount: 500, updatedAt: '2024-02-15' },
  { id: 'ani-cbu-5', name: 'animate金泽', nameJa: 'アニメイト金沢', description: '金泽市的动漫商店。北陆唯一。', category: 'animate', latitude: 36.562, longitude: 136.657, imageUrl: IMG, address: '石川県金沢市', tags: ['金泽', '北陆'], rating: 4.1, visitCount: 400, updatedAt: '2024-05-01' },
  { id: 'ani-ksu-3', name: 'animate熊本', nameJa: 'アニメイト熊本', description: '熊本市的动漫商店。还有熊本熊联名周边。', category: 'animate', latitude: 32.790, longitude: 130.697, imageUrl: IMG, address: '熊本県熊本市中央区', tags: ['熊本', '熊本熊'], rating: 4.1, visitCount: 550, updatedAt: '2024-07-01' },
  { id: 'ani-ksu-5', name: 'animate那霸国际通', nameJa: 'アニメイト那覇国際通り', description: '冲绳唯一的动漫商店。位于国际通，人气爆棚。', category: 'animate', latitude: 26.215, longitude: 127.687, imageUrl: IMG, address: '沖縄県那覇市', tags: ['冲绳', '那霸', '最西端'], rating: 4.2, visitCount: 1000, updatedAt: '2024-08-01' },
  { id: 'ani-knk-3', name: 'animate天王寺', nameJa: 'アニメイト天王寺', description: '天王寺地区的动漫商店。附设咖啡厅。', category: 'animate', latitude: 34.645, longitude: 135.515, imageUrl: IMG, address: '大阪府大阪市阿倍野区', tags: ['天王寺', '咖啡厅', '大阪'], rating: 4.0, visitCount: 750, updatedAt: '2024-04-01' },
  { id: 'ani-cbu-2', name: 'animate名古屋PARCO', nameJa: 'アニメイト名古屋PARCO', description: 'PARCO内的动漫商店。', category: 'animate', latitude: 35.172, longitude: 136.906, imageUrl: IMG, address: '愛知県名古屋市中区（PARCO内）', tags: ['PARCO', '名古屋'], rating: 4.1, visitCount: 800, updatedAt: '2024-06-01' },
  { id: 'ani-hkd-4', name: 'animate新千岁机场', nameJa: 'アニメイト新千歳空港', description: '新千岁机场航站楼内。旅途伴手礼的好去处。', category: 'animate', latitude: 42.787, longitude: 141.681, imageUrl: IMG, address: '北海道千歳市', tags: ['机场', '北海道', '伴手礼'], rating: 4.0, visitCount: 850, updatedAt: '2024-06-01' },
  { id: 'ani-knt-5', name: 'animate吉祥寺', nameJa: 'アニメイト吉祥寺', description: '吉祥寺的动漫商店。', category: 'animate', latitude: 35.703, longitude: 139.579, imageUrl: IMG, address: '東京都武蔵野市吉祥寺本町', tags: ['吉祥寺', '东京'], rating: 4.0, visitCount: 700, updatedAt: '2024-03-01' },

  // Tier 4: 小规模·地方单独店（rating 3.8-4.0, reviews 100-400）
  { id: 'ani-hkd-2', name: 'animate旭川', nameJa: 'アニメイト旭川', description: '旭川市中心。道北地区唯一的动漫商店。', category: 'animate', latitude: 43.770, longitude: 142.365, imageUrl: IMG, address: '北海道旭川市', tags: ['北海道', '道北'], rating: 3.9, visitCount: 180, updatedAt: '2023-10-01' },
  { id: 'ani-hkd-3', name: 'animate函馆', nameJa: 'アニメイト函館', description: '函馆地区唯一的动漫专门店。', category: 'animate', latitude: 41.768, longitude: 140.729, imageUrl: IMG, address: '北海道函館市', tags: ['北海道', '观光'], rating: 3.9, visitCount: 200, updatedAt: '2023-08-01' },
  { id: 'ani-hkd-5', name: 'animate钏路', nameJa: 'アニメイト釧路', description: '道东唯一的animate。', category: 'animate', latitude: 42.982, longitude: 144.382, imageUrl: IMG, address: '北海道釧路市', tags: ['北海道', '道东'], rating: 3.8, visitCount: 120, updatedAt: '2023-06-01' },
  { id: 'ani-thk-2', name: 'animate盛冈', nameJa: 'アニメイト盛岡', description: '盛冈站附近的动漫商店。', category: 'animate', latitude: 39.701, longitude: 141.142, imageUrl: IMG, address: '岩手県盛岡市', tags: ['岩手', '东北'], rating: 3.9, visitCount: 200, updatedAt: '2023-09-01' },
  { id: 'ani-thk-3', name: 'animate秋田', nameJa: 'アニメイト秋田', description: '秋田市中心的动漫商店。', category: 'animate', latitude: 39.718, longitude: 140.103, imageUrl: IMG, address: '秋田県秋田市', tags: ['秋田', '东北'], rating: 3.8, visitCount: 150, updatedAt: '2023-07-01' },
  { id: 'ani-thk-4', name: 'animate青森', nameJa: 'アニメイト青森', description: '青森市动漫迷聚集的地方。', category: 'animate', latitude: 40.822, longitude: 140.747, imageUrl: IMG, address: '青森県青森市', tags: ['青森', '东北'], rating: 3.8, visitCount: 130, updatedAt: '2023-05-01' },
  { id: 'ani-thk-5', name: 'animate福岛', nameJa: 'アニメイト福島', description: '福岛市的动漫商店。', category: 'animate', latitude: 37.760, longitude: 140.473, imageUrl: IMG, address: '福島県福島市', tags: ['福岛', '东北'], rating: 3.9, visitCount: 180, updatedAt: '2023-08-01' },
  { id: 'ani-knt-8', name: 'animate千叶', nameJa: 'アニメイト千葉', description: '千叶市中心的动漫商店。', category: 'animate', latitude: 35.608, longitude: 140.117, imageUrl: IMG, address: '千葉県千葉市中央区', tags: ['千叶', '关东'], rating: 3.9, visitCount: 350, updatedAt: '2023-11-01' },
  { id: 'ani-knt-9', name: 'animate川崎', nameJa: 'アニメイト川崎', description: '川崎站附近的动漫商店。', category: 'animate', latitude: 35.532, longitude: 139.700, imageUrl: IMG, address: '神奈川県川崎市', tags: ['川崎', '神奈川'], rating: 3.9, visitCount: 400, updatedAt: '2023-12-01' },
  { id: 'ani-knt-10', name: 'animate町田', nameJa: 'アニメイト町田', description: '町田的动漫商店。', category: 'animate', latitude: 35.544, longitude: 139.444, imageUrl: IMG, address: '東京都町田市', tags: ['町田', '东京'], rating: 3.8, visitCount: 300, updatedAt: '2023-06-01' },
  { id: 'ani-knt-11', name: 'animate宇都宫', nameJa: 'アニメイト宇都宮', description: '宇都宫的动漫商店。饺子与动漫之城。', category: 'animate', latitude: 36.559, longitude: 139.903, imageUrl: IMG, address: '栃木県宇都宮市', tags: ['宇都宫', '栃木', '饺子'], rating: 3.9, visitCount: 250, updatedAt: '2023-09-01' },
  { id: 'ani-cbu-6', name: 'animate岐阜', nameJa: 'アニメイト岐阜', description: '岐阜市的动漫商店。', category: 'animate', latitude: 35.416, longitude: 136.753, imageUrl: IMG, address: '岐阜県岐阜市', tags: ['岐阜', '中部'], rating: 3.8, visitCount: 200, updatedAt: '2023-04-01' },
  { id: 'ani-knk-6', name: 'animate姬路', nameJa: 'アニメイト姫路', description: '逛姬路城之余顺便巡礼动漫商店。', category: 'animate', latitude: 34.834, longitude: 134.694, imageUrl: IMG, address: '兵庫県姫路市', tags: ['姬路', '兵库', '观光'], rating: 3.9, visitCount: 350, updatedAt: '2023-08-01' },
  { id: 'ani-cgk-2', name: 'animate冈山', nameJa: 'アニメイト岡山', description: '冈山市的动漫商店。', category: 'animate', latitude: 34.667, longitude: 133.921, imageUrl: IMG, address: '岡山県岡山市北区', tags: ['冈山', '中国地方'], rating: 3.9, visitCount: 400, updatedAt: '2023-10-01' },
  { id: 'ani-cgk-3', name: 'animate高松', nameJa: 'アニメイト高松', description: '四国最大的动漫商店。', category: 'animate', latitude: 34.343, longitude: 134.048, imageUrl: IMG, address: '香川県高松市', tags: ['高松', '香川', '四国最大'], rating: 4.0, visitCount: 450, updatedAt: '2024-01-01' },
  { id: 'ani-cgk-4', name: 'animate松山', nameJa: 'アニメイト松山', description: '爱媛县唯一的动漫商店。道后温泉观光之余的好去处。', category: 'animate', latitude: 33.842, longitude: 132.769, imageUrl: IMG, address: '愛媛県松山市', tags: ['松山', '爱媛'], rating: 3.8, visitCount: 250, updatedAt: '2023-05-01' },
  { id: 'ani-ksu-2', name: 'animate小仓', nameJa: 'アニメイト小倉', description: '北九州市的动漫商店。', category: 'animate', latitude: 33.885, longitude: 130.878, imageUrl: IMG, address: '福岡県北九州市小倉北区', tags: ['小仓', '北九州'], rating: 3.9, visitCount: 350, updatedAt: '2023-09-01' },
  { id: 'ani-ksu-4', name: 'animate鹿儿岛', nameJa: 'アニメイト鹿児島', description: '鹿儿岛唯一的动漫商店。最南端的animate。', category: 'animate', latitude: 31.592, longitude: 130.557, imageUrl: IMG, address: '鹿児島県鹿児島市', tags: ['鹿儿岛', '最南端'], rating: 3.9, visitCount: 280, updatedAt: '2023-07-01' },
  { id: 'ani-ksu-6', name: 'animate长崎', nameJa: 'アニメイト長崎', description: '长崎市的动漫商店。', category: 'animate', latitude: 32.750, longitude: 129.877, imageUrl: IMG, address: '長崎県長崎市', tags: ['长崎', '九州'], rating: 3.8, visitCount: 200, updatedAt: '2023-04-01' },
  { id: 'ani-spc-2', name: 'animate高知', nameJa: 'アニメイト高知', description: '高知唯一的动漫商店。', category: 'animate', latitude: 33.560, longitude: 133.541, imageUrl: IMG, address: '高知県高知市', tags: ['高知', '四国'], rating: 3.8, visitCount: 180, updatedAt: '2023-03-01' },
  { id: 'ani-spc-3', name: 'animate米子', nameJa: 'アニメイト米子', description: '鸟取县唯一的动漫商店。', category: 'animate', latitude: 35.433, longitude: 133.336, imageUrl: IMG, address: '鳥取県米子市', tags: ['米子', '鸟取'], rating: 3.8, visitCount: 150, updatedAt: '2023-02-01' },
  { id: 'ani-spc-4', name: 'animate德岛', nameJa: 'アニメイト徳島', description: '位于ufotable CINEMA B1的特殊门店。', category: 'animate', latitude: 34.066, longitude: 134.558, imageUrl: IMG, address: '徳島県徳島市', tags: ['德岛', 'ufotable'], rating: 4.0, visitCount: 300, updatedAt: '2024-03-01' },

  // ================================================================
  //  MELONBOOKS — https://www.melonbooks.co.jp/
  // ================================================================
  // Tier 1: 主要店（rating ≥ 4.1）
  { id: 'mel-knt-1', name: 'Melonbooks秋叶原', nameJa: 'メロンブックス秋葉原', description: '秋叶原的同人商店经典之选。广濑本社大厦B1。', category: 'melonbooks', latitude: 35.700, longitude: 139.771, imageUrl: IMG, address: '東京都千代田区外神田1-10-4', tags: ['秋叶原', '同人志', '圣地'], rating: 4.2, visitCount: 1200, updatedAt: '2024-08-01' },
  { id: 'mel-knt-2', name: 'Melonbooks池袋', nameJa: 'メロンブックス池袋', description: '位于乙女路。女性向同人志极为丰富。', category: 'melonbooks', latitude: 35.730, longitude: 139.717, imageUrl: IMG, address: '東京都豊島区東池袋', tags: ['池袋', '乙女路', '女性向'], rating: 4.1, visitCount: 850, updatedAt: '2024-06-01' },
  { id: 'mel-knk-1', name: 'Melonbooks大阪日本桥', nameJa: 'メロンブックス大阪日本橋', description: '西日本1号店。日本桥同人文化的中心。', category: 'melonbooks', latitude: 34.658, longitude: 135.507, imageUrl: IMG, address: '大阪府大阪市浪速区日本橋', tags: ['大阪', '日本桥', '西日本1号店'], rating: 4.2, visitCount: 900, updatedAt: '2024-07-01' },
  { id: 'mel-cbu-1', name: 'Melonbooks名古屋', nameJa: 'メロンブックス名古屋', description: '中部最大的同人商店。设有Fromage专区。', category: 'melonbooks', latitude: 35.168, longitude: 136.906, imageUrl: IMG, address: '愛知県名古屋市中村区', tags: ['名古屋', '中部最大'], rating: 4.1, visitCount: 650, updatedAt: '2024-09-01' },
  { id: 'mel-hkd-1', name: 'Melonbooks札幌', nameJa: 'メロンブックス札幌', description: 'Melonbooks 1号店。1998年开业的老店。', category: 'melonbooks', latitude: 43.058, longitude: 141.355, imageUrl: IMG, address: '北海道札幌市中央区南2条西1-5 丸大ビルB1', tags: ['北海道', '同人志', '1号店'], rating: 4.1, visitCount: 400, updatedAt: '2024-03-01' },

  // Tier 2: 中规模店（rating 3.9-4.1）
  { id: 'mel-thk-1', name: 'Melonbooks仙台', nameJa: 'メロンブックス仙台', description: '东北唯一的Melonbooks。2号店。', category: 'melonbooks', latitude: 38.262, longitude: 140.879, imageUrl: IMG, address: '宮城県仙台市青葉区', tags: ['仙台', '东北', '2号店'], rating: 4.0, visitCount: 350, updatedAt: '2024-02-01' },
  { id: 'mel-knt-3', name: 'Melonbooks新宿', nameJa: 'メロンブックス新宿', description: '靠近新宿站。交通极为便利。', category: 'melonbooks', latitude: 35.689, longitude: 139.702, imageUrl: IMG, address: '東京都新宿区', tags: ['新宿', '交通便利'], rating: 4.0, visitCount: 500, updatedAt: '2024-05-01' },
  { id: 'mel-knt-4', name: 'Melonbooks横滨', nameJa: 'メロンブックス横浜', description: '关东1号店。横滨站西口步行可达。', category: 'melonbooks', latitude: 35.463, longitude: 139.623, imageUrl: IMG, address: '神奈川県横浜市西区', tags: ['横滨', '关东1号店'], rating: 4.0, visitCount: 450, updatedAt: '2024-04-01' },
  { id: 'mel-knk-2', name: 'Melonbooks大阪日本桥2号店', nameJa: 'メロンブックス大阪日本橋2号店', description: '主营女性向同人志。', category: 'melonbooks', latitude: 34.657, longitude: 135.508, imageUrl: IMG, address: '大阪府大阪市浪速区日本橋', tags: ['大阪', '日本桥', '女性向'], rating: 4.1, visitCount: 550, updatedAt: '2024-08-01' },
  { id: 'mel-knk-3', name: 'Melonbooks京都', nameJa: 'メロンブックス京都', description: '京都唯一的同人商店。', category: 'melonbooks', latitude: 35.007, longitude: 135.766, imageUrl: IMG, address: '京都府京都市中京区', tags: ['京都', '观光'], rating: 4.0, visitCount: 500, updatedAt: '2024-06-01' },
  { id: 'mel-knk-4', name: 'Melonbooks神户', nameJa: 'メロンブックス神戸', description: '神户三宫的同人商店。', category: 'melonbooks', latitude: 34.692, longitude: 135.195, imageUrl: IMG, address: '兵庫県神戸市中央区', tags: ['神户', '三宫'], rating: 4.0, visitCount: 400, updatedAt: '2024-03-01' },
  { id: 'mel-cgk-1', name: 'Melonbooks广岛', nameJa: 'メロンブックス広島', description: '位于animate大厦3F的同人商店。', category: 'melonbooks', latitude: 34.393, longitude: 132.456, imageUrl: IMG, address: '広島県広島市中区大手町2-3-1', tags: ['广岛', '中国地方'], rating: 4.0, visitCount: 400, updatedAt: '2024-05-01' },
  { id: 'mel-ksu-1', name: 'Melonbooks福冈', nameJa: 'メロンブックス福岡', description: '九州1号店。天神地区。', category: 'melonbooks', latitude: 33.591, longitude: 130.398, imageUrl: IMG, address: '福岡県福岡市中央区天神', tags: ['福冈', '天神', '九州1号店'], rating: 4.1, visitCount: 500, updatedAt: '2024-07-01' },
  { id: 'mel-knt-5', name: 'Melonbooks大宫', nameJa: 'メロンブックス大宮', description: '埼玉最大的同人商店。设有Fromage专区。', category: 'melonbooks', latitude: 35.906, longitude: 139.624, imageUrl: IMG, address: '埼玉県さいたま市大宮区', tags: ['大宫', '埼玉', 'Fromage'], rating: 4.0, visitCount: 350, updatedAt: '2024-01-01' },
  { id: 'mel-cbu-3', name: 'Melonbooks静冈', nameJa: 'メロンブックス静岡', description: '静冈唯一的Melonbooks。三松站前大厦5F。', category: 'melonbooks', latitude: 34.974, longitude: 138.386, imageUrl: IMG, address: '静岡県静岡市葵区紺屋町8-6', tags: ['静冈', 'Fromage'], rating: 4.0, visitCount: 300, updatedAt: '2024-02-01' },
  { id: 'mel-cbu-2', name: 'Melonbooks新潟', nameJa: 'メロンブックス新潟', description: '新潟唯一的同人商店。', category: 'melonbooks', latitude: 37.915, longitude: 139.052, imageUrl: IMG, address: '新潟県新潟市中央区東大通1-5', tags: ['新潟', '北陆'], rating: 3.9, visitCount: 250, updatedAt: '2023-11-01' },
  { id: 'mel-cgk-2', name: 'Melonbooks冈山', nameJa: 'メロンブックス岡山', description: '位于PESCA冈山地下的同人商店。', category: 'melonbooks', latitude: 34.666, longitude: 133.920, imageUrl: IMG, address: '岡山県岡山市北区駅前町1', tags: ['冈山', '中国地方'], rating: 3.9, visitCount: 250, updatedAt: '2023-12-01' },
  { id: 'mel-knt-11', name: 'Melonbooks蒲田', nameJa: 'メロンブックス蒲田', description: '位于Yuzawaya大厦2F的Melonbooks。', category: 'melonbooks', latitude: 35.562, longitude: 139.716, imageUrl: IMG, address: '東京都大田区西蒲田8-4-12', tags: ['蒲田', '大田区'], rating: 4.0, visitCount: 300, updatedAt: '2024-01-01' },

  // Tier 3: 小规模店（rating 3.8-4.0）
  { id: 'mel-knt-6', name: 'Melonbooks千叶', nameJa: 'メロンブックス千葉', description: '千叶市中心的同人商店。', category: 'melonbooks', latitude: 35.607, longitude: 140.116, imageUrl: IMG, address: '千葉県千葉市中央区', tags: ['千叶', '关东'], rating: 3.9, visitCount: 200, updatedAt: '2023-10-01' },
  { id: 'mel-knt-7', name: 'Melonbooks水户', nameJa: 'メロンブックス水戸', description: '茨城唯一的Melonbooks。', category: 'melonbooks', latitude: 36.373, longitude: 140.472, imageUrl: IMG, address: '茨城県水戸市', tags: ['水户', '茨城'], rating: 3.8, visitCount: 150, updatedAt: '2023-08-01' },
  { id: 'mel-knt-8', name: 'Melonbooks宇都宫', nameJa: 'メロンブックス宇都宮', description: '位于宇都宫Festa B1。', category: 'melonbooks', latitude: 36.560, longitude: 139.902, imageUrl: IMG, address: '栃木県宇都宮市馬場町2-8 Festa B1', tags: ['宇都宫', '栃木', '饺子'], rating: 3.9, visitCount: 180, updatedAt: '2023-09-01' },
  { id: 'mel-knt-9', name: 'Melonbooks高崎', nameJa: 'メロンブックス高崎', description: '群马唯一的Melonbooks。', category: 'melonbooks', latitude: 36.325, longitude: 139.006, imageUrl: IMG, address: '群馬県高崎市', tags: ['高崎', '群马'], rating: 3.8, visitCount: 150, updatedAt: '2023-06-01' },
  { id: 'mel-knt-10', name: 'Melonbooks柏', nameJa: 'メロンブックス柏', description: '千叶县柏市的同人商店。', category: 'melonbooks', latitude: 35.862, longitude: 139.971, imageUrl: IMG, address: '千葉県柏市', tags: ['柏', '千叶'], rating: 3.9, visitCount: 180, updatedAt: '2023-09-01' },
  { id: 'mel-knt-12', name: 'Melonbooks立川', nameJa: 'メロンブックス立川', description: '多摩地区唯一的Melonbooks。N2大厦5F。', category: 'melonbooks', latitude: 35.697, longitude: 139.414, imageUrl: IMG, address: '東京都立川市柴崎町3-7-17 N2ビル5F', tags: ['立川', '多摩'], rating: 3.9, visitCount: 250, updatedAt: '2023-11-01' },
  { id: 'mel-knt-13', name: 'Melonbooks八王子', nameJa: 'メロンブックス八王子', description: '八王子的同人商店。', category: 'melonbooks', latitude: 35.657, longitude: 139.339, imageUrl: IMG, address: '東京都八王子市', tags: ['八王子', '东京'], rating: 3.8, visitCount: 200, updatedAt: '2023-07-01' },
  { id: 'mel-cbu-4', name: 'Melonbooks丰桥', nameJa: 'メロンブックス豊橋', description: '丰桥的同人商店。', category: 'melonbooks', latitude: 34.764, longitude: 137.385, imageUrl: IMG, address: '愛知県豊橋市', tags: ['丰桥', '爱知'], rating: 3.8, visitCount: 150, updatedAt: '2023-06-01' },
  { id: 'mel-cgk-3', name: 'Melonbooks松山', nameJa: 'メロンブックス松山', description: '四国唯一的Melonbooks。', category: 'melonbooks', latitude: 33.841, longitude: 132.770, imageUrl: IMG, address: '愛媛県松山市', tags: ['松山', '爱媛', '四国唯一'], rating: 3.9, visitCount: 200, updatedAt: '2023-08-01' },
  { id: 'mel-ksu-2', name: 'Melonbooks小仓', nameJa: 'メロンブックス小倉', description: '北九州市的同人商店。', category: 'melonbooks', latitude: 33.884, longitude: 130.879, imageUrl: IMG, address: '福岡県北九州市小倉北区', tags: ['小仓', '北九州'], rating: 3.9, visitCount: 200, updatedAt: '2023-09-01' },
  { id: 'mel-ksu-3', name: 'Melonbooks熊本', nameJa: 'メロンブックス熊本', description: '熊本唯一的同人商店。', category: 'melonbooks', latitude: 32.791, longitude: 130.696, imageUrl: IMG, address: '熊本県熊本市中央区', tags: ['熊本', '熊本熊'], rating: 3.9, visitCount: 220, updatedAt: '2023-12-01' },

  // ================================================================
  //  MANDARAKE — https://www.mandarake.co.jp/
  // ================================================================
  // Tier 1: 圣地·本店
  { id: 'man-knt-1', name: 'Mandarake中野店（总店）', nameJa: 'まんだらけ中野店（本店）', description: '中野Broadway的总店大本营。共25家店铺。占据多个楼层。', category: 'mandarake', latitude: 35.709, longitude: 139.666, imageUrl: IMG, address: '東京都中野区中野5-52-15 中野ブロードウェイ', tags: ['中野', '总店', 'Broadway', '圣地'], rating: 4.4, visitCount: 8500, updatedAt: '2024-06-01' },
  { id: 'man-knt-4', name: 'Mandarake Complex', nameJa: 'まんだらけコンプレックス', description: '中野Broadway内的大型店铺。周边和软胶玩具品类充实。', category: 'mandarake', latitude: 35.709, longitude: 139.665, imageUrl: IMG, address: '東京都中野区中野5-52-15 中野ブロードウェイ', tags: ['中野', 'Complex', '软胶'], rating: 4.2, visitCount: 3200, updatedAt: '2024-05-01' },
  { id: 'man-knt-2', name: 'Mandarake秋叶原店', nameJa: 'まんだらけ秋葉原店', description: '秋叶原的Mandarake。集换卡牌和手办品类丰富。', category: 'mandarake', latitude: 35.701, longitude: 139.770, imageUrl: IMG, address: '東京都千代田区外神田', tags: ['秋叶原', '集换卡牌', '手办'], rating: 4.3, visitCount: 3800, updatedAt: '2024-07-01' },
  { id: 'man-knk-1', name: 'Mandarake大阪店（难波）', nameJa: 'まんだらけ大阪店（なんば）', description: 'Grand心斋桥。关西最大的中古动漫商店。', category: 'mandarake', latitude: 34.671, longitude: 135.500, imageUrl: IMG, address: '大阪府大阪市中央区心斎橋筋 グランデビル', tags: ['大阪', '难波', '心斋桥', '关西最大'], rating: 4.2, visitCount: 1800, updatedAt: '2024-08-01' },
  { id: 'man-cbu-1', name: 'Mandarake名古屋店', nameJa: 'まんだらけ名古屋店', description: '中部地区唯一。位于大须商店街。', category: 'mandarake', latitude: 35.160, longitude: 136.905, imageUrl: IMG, address: '愛知県名古屋市中区大須', tags: ['名古屋', '大须', '中部唯一'], rating: 4.1, visitCount: 900, updatedAt: '2024-04-01' },
  { id: 'man-ksu-1', name: 'Mandarake福冈店', nameJa: 'まんだらけ福岡店', description: '九州最大的中古动漫商店。位于大名。', category: 'mandarake', latitude: 33.589, longitude: 130.397, imageUrl: IMG, address: '福岡県福岡市中央区大名', tags: ['福冈', '大名', '九州最大'], rating: 4.1, visitCount: 1000, updatedAt: '2024-05-01' },

  // Tier 2: 地域店
  { id: 'man-hkd-1', name: 'Mandarake札幌店', nameJa: 'まんだらけ札幌店', description: '北海道唯一的Mandarake。中古手办品类充实。', category: 'mandarake', latitude: 43.060, longitude: 141.356, imageUrl: IMG, address: '北海道札幌市中央区', tags: ['札幌', '北海道', '中古'], rating: 4.0, visitCount: 350, updatedAt: '2024-02-01' },
  { id: 'man-knt-3', name: 'Mandarake涩谷店', nameJa: 'まんだらけ渋谷店', description: '涩谷BEAM大厦。深受年轻人喜爱。', category: 'mandarake', latitude: 35.660, longitude: 139.700, imageUrl: IMG, address: '東京都渋谷区宇田川町 BEAMビル', tags: ['涩谷', 'BEAM', '年轻人'], rating: 4.0, visitCount: 1200, updatedAt: '2024-03-01' },
  { id: 'man-cgk-1', name: 'Mandarake广岛店', nameJa: 'まんだらけ広島店', description: '中国地方唯一的Mandarake。', category: 'mandarake', latitude: 34.391, longitude: 132.458, imageUrl: IMG, address: '広島県広島市中区', tags: ['广岛', '中国地方'], rating: 4.0, visitCount: 400, updatedAt: '2024-01-01' },

  // Tier 3: 小规模店
  { id: 'man-knt-5', name: 'Mandarake宇都宫店', nameJa: 'まんだらけ宇都宮店', description: '北关东唯一的Mandarake。', category: 'mandarake', latitude: 36.558, longitude: 139.904, imageUrl: IMG, address: '栃木県宇都宮市', tags: ['宇都宫', '栃木', '北关东'], rating: 3.9, visitCount: 250, updatedAt: '2023-08-01' },
  { id: 'man-ksu-2', name: 'Mandarake小仓店', nameJa: 'まんだらけ小倉店', description: '北九州市的Mandarake。', category: 'mandarake', latitude: 33.886, longitude: 130.877, imageUrl: IMG, address: '福岡県北九州市小倉北区', tags: ['小仓', '北九州'], rating: 3.9, visitCount: 300, updatedAt: '2023-10-01' },
]
