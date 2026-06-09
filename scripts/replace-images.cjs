// 批量替换 mockData 的 imageUrl，按城市匹配实景照片
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'constants', 'mockData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 城市 → Unsplash 实景图片（600x400，日本各地标志性风景）
const cityImages = {
  '池袋': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',       // 池袋 sunshine city
  '秋葉原': 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&h=400&fit=crop',   // 秋叶原电器街
  '渋谷': 'https://images.unsplash.com/photo-1542931287-023b922fa89b?w=600&h=400&fit=crop',        // 涩谷十字路口
  '新宿': 'https://images.unsplash.com/photo-1578469645742-46cae0105ae4?w=600&h=400&fit=crop',     // 新宿夜景
  '中野': 'https://images.unsplash.com/photo-1609961948829-7e8a13fc3d96?w=600&h=400&fit=crop',     // 中野百老汇
  '吉祥寺': 'https://images.unsplash.com/photo-1558005137-d9619ae6bcde?w=600&h=400&fit=crop',      // 吉祥寺井之头公园
  '町田': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',     // 东京街道
  '立川': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',     // 昭和纪念公园
  '八王子': 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=400&fit=crop',   // 高尾山
  '蒲田': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop',     // 东京 OTA
  '日本橋': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop',   // 道顿堀
  '梅田': 'https://images.unsplash.com/photo-1624253321171-1be5357cc73e?w=600&h=400&fit=crop',     // 大阪梅田 sky building
  '天王寺': 'https://images.unsplash.com/photo-1616781135949-58cba3084fdb?w=600&h=400&fit=crop',   // 天王寺通天阁
  '大阪': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop',     // 道顿堀
  '心斎橋': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&h=400&fit=crop',   // 心斋桥
  '名古屋': 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d1c6?w=600&h=400&fit=crop',   // 名古屋城
  '京都': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',     // 金阁寺
  '横浜': 'https://images.unsplash.com/photo-1583202719686-9b4c3a91efd1?w=600&h=400&fit=crop',     // 横滨港未来
  '神戸': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',     // 神户港
  '札幌': 'https://images.unsplash.com/photo-1578321272121-0e330e20acd2?w=600&h=400&fit=crop',     // 札幌电视塔
  '仙台': 'https://images.unsplash.com/photo-1600142034321-2bc2dc0f8ce6?w=600&h=400&fit=crop',     // 仙台城
  '広島': 'https://images.unsplash.com/photo-1580965811645-c6a3720178c2?w=600&h=400&fit=crop',     // 严岛神社
  '福岡': 'https://images.unsplash.com/photo-1597524283850-0e88b739440b?w=600&h=400&fit=crop',     // 福冈运河城
  '那覇': 'https://images.unsplash.com/photo-1569428034239-f9565e32f222?w=600&h=400&fit=crop',     // 那霸国际通
  '旭川': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',     // 北海道
  '函館': 'https://images.unsplash.com/photo-1580619241807-2e4da323e3af?w=600&h=400&fit=crop',     // 函馆夜景
  '釧路': 'https://images.unsplash.com/photo-1495536075029-8f6fb1f29c25?w=600&h=400&fit=crop',     // 北海道湿原
  '盛岡': 'https://images.unsplash.com/photo-1578469645742-46cae0105ae4?w=600&h=400&fit=crop',     // 盛冈城
  '秋田': 'https://images.unsplash.com/photo-1516663717363-7f14718db52d?w=600&h=400&fit=crop',     // 秋田竿灯
  '青森': 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&h=400&fit=crop',     // 青森睡魔
  '福島': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop',     // 福岛
  '静岡': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',     // 富士山
  '新潟': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',     // 新潟
  '金沢': 'https://images.unsplash.com/photo-1578660063685-8e6549bfa50f?w=600&h=400&fit=crop',     // 金泽兼六园
  '千葉': 'https://images.unsplash.com/photo-1609961948829-7e8a13fc3d96?w=600&h=400&fit=crop',     // 千叶
  '大宮': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',     // 埼玉
  '川崎': 'https://images.unsplash.com/photo-1583202719686-9b4c3a91efd1?w=600&h=400&fit=crop',     // 川崎
  '宇都宮': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',     // 宇都宫
  '沼津': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',     // 静冈富士
  '姫路': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',     // 姬路城
  '岡山': 'https://images.unsplash.com/photo-1570168002308-503a1560d56c?w=600&h=400&fit=crop',     // 冈山后乐园
  '高松': 'https://images.unsplash.com/photo-1529788295303-27eabf8380af?w=600&h=400&fit=crop',     // 高松栗林公园
  '松山': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',     // 松山道后温泉
  '小倉': 'https://images.unsplash.com/photo-1597524283850-0e88b739440b?w=600&h=400&fit=crop',     // 小仓城
  '鹿児島': 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600&h=400&fit=crop',   // 樱岛
  '長崎': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',     // 长崎
  '高知': 'https://images.unsplash.com/photo-1529788295303-27eabf8380af?w=600&h=400&fit=crop',     // 高知城
  '米子': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',     // 鸟取砂丘
  '徳島': 'https://images.unsplash.com/photo-1578660063685-8e6549bfa50f?w=600&h=400&fit=crop',     // 德岛阿波舞
  '豊橋': 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d1c6?w=600&h=400&fit=crop',     // 丰桥
  '熊本': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',     // 熊本城
  '岐阜': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',     // 岐阜
  '柏': 'https://images.unsplash.com/photo-1609961948829-7e8a13fc3d96?w=600&h=400&fit=crop',       // 千叶柏
  '水戸': 'https://images.unsplash.com/photo-1570168002308-503a1560d56c?w=600&h=400&fit=crop',     // 水户偕乐园
  '高崎': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',     // 群马
  '新千歳空港': 'https://images.unsplash.com/photo-1578321272121-0e330e20acd2?w=600&h=400&fit=crop', // 新千岁机场
  '大田区': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop',   // 大田区
  '東京都武蔵野市': 'https://images.unsplash.com/photo-1558005137-d9619ae6bcde?w=600&h=400&fit=crop', // 吉祥寺
  '東京都立川市': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',
  '東京都八王子市': 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=400&fit=crop',
  '神奈川県横浜市': 'https://images.unsplash.com/photo-1583202719686-9b4c3a91efd1?w=600&h=400&fit=crop',
  '神奈川県川崎市': 'https://images.unsplash.com/photo-1583202719686-9b4c3a91efd1?w=600&h=400&fit=crop',
  '埼玉県さいたま市': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',
  '茨城県水戸市': 'https://images.unsplash.com/photo-1570168002308-503a1560d56c?w=600&h=400&fit=crop',
  '群馬県高崎市': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',
  '千葉県千葉市': 'https://images.unsplash.com/photo-1609961948829-7e8a13fc3d96?w=600&h=400&fit=crop',
  '千葉県柏市': 'https://images.unsplash.com/photo-1609961948829-7e8a13fc3d96?w=600&h=400&fit=crop',
  '栃木県宇都宮市': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
  '岩手県盛岡市': 'https://images.unsplash.com/photo-1578469645742-46cae0105ae4?w=600&h=400&fit=crop',
  '秋田県秋田市': 'https://images.unsplash.com/photo-1516663717363-7f14718db52d?w=600&h=400&fit=crop',
  '青森県青森市': 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&h=400&fit=crop',
  '福島県福島市': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop',
  '静岡県静岡市': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',
  '静岡県沼津市': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',
  '愛知県名古屋市': 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d1c6?w=600&h=400&fit=crop',
  '愛知県豊橋市': 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d1c6?w=600&h=400&fit=crop',
  '石川県金沢市': 'https://images.unsplash.com/photo-1578660063685-8e6549bfa50f?w=600&h=400&fit=crop',
  '岐阜県岐阜市': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',
  '新潟県新潟市': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&h=400&fit=crop',
  '北海道千歳市': 'https://images.unsplash.com/photo-1578321272121-0e330e20acd2?w=600&h=400&fit=crop',
  '北海道旭川市': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',
  '北海道函館市': 'https://images.unsplash.com/photo-1580619241807-2e4da323e3af?w=600&h=400&fit=crop',
  '北海道釧路市': 'https://images.unsplash.com/photo-1495536075029-8f6fb1f29c25?w=600&h=400&fit=crop',
  '沖縄県那覇市': 'https://images.unsplash.com/photo-1569428034239-f9565e32f222?w=600&h=400&fit=crop',
  '広島県広島市': 'https://images.unsplash.com/photo-1580965811645-c6a3720178c2?w=600&h=400&fit=crop',
  '岡山県岡山市': 'https://images.unsplash.com/photo-1570168002308-503a1560d56c?w=600&h=400&fit=crop',
  '香川県高松市': 'https://images.unsplash.com/photo-1529788295303-27eabf8380af?w=600&h=400&fit=crop',
  '愛媛県松山市': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',
  '福岡県福岡市': 'https://images.unsplash.com/photo-1597524283850-0e88b739440b?w=600&h=400&fit=crop',
  '福岡県北九州市': 'https://images.unsplash.com/photo-1597524283850-0e88b739440b?w=600&h=400&fit=crop',
  '鹿児島県鹿児島市': 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600&h=400&fit=crop',
  '長崎県長崎市': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',
  '高知県高知市': 'https://images.unsplash.com/photo-1529788295303-27eabf8380af?w=600&h=400&fit=crop',
  '鳥取県米子市': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',
  '徳島県徳島市': 'https://images.unsplash.com/photo-1578660063685-8e6549bfa50f?w=600&h=400&fit=crop',
  '熊本県熊本市': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',
  '兵庫県姫路市': 'https://images.unsplash.com/photo-1580142614530-9d84b0b9342b?w=600&h=400&fit=crop',
  '兵庫県神戸市': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=600&h=400&fit=crop',
  '大阪府大阪市': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop',
  '京都府京都市': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
};

// 替换 imageUrl 行
Object.entries(cityImages).forEach(([city, imageUrl]) => {
  // 匹配包含该城市名的 address 行后面的 imageUrl 行
  const lines = content.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].includes(`address: '`) && lines[i].includes(city)) {
      // 找到 address 行，查找后续的 imageUrl
      for (let j = i; j < Math.min(i + 30, lines.length); j++) {
        if (lines[j].includes('imageUrl:')) {
          const indent = lines[j].match(/^(\s*)/)[1];
          lines[j] = `${indent}imageUrl: '${imageUrl}',`;
          break;
        }
      }
    }
    i++;
  }
  content = lines.join('\n');
});

fs.writeFileSync(filePath, content);
console.log('替换完成');
