// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '机场搜 | Jichangs.org';
export const SITE_NAME = '机场搜';
export const SITE_TAGLINE = '2026机场推荐 | 科学上网评测';
export const SITE_DESCRIPTION = '机场搜 (Jichangs.org) 汇总2026最新优质稳定高速机场推荐：首推神行加速、大佬云、云界线、榴莲云、闪电鼠、环球梯，对比月付年付价格、专属客户端与Nextin配置、不限时备用流量及优惠折扣。';
export const SITE_URL = 'https://jichangs.org';

// 推荐机场数据结构与精选数据（抓取整理自真实服务商及核验库）
export interface AirportItem {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  type: string;
  nodesCount: string;
  peakSpeed: string;
  streamingUnlock: string[];
  protocols: string[];
  startingPrice: string;
  billingPeriod: string;
  promoCode: string;
  discount: string;
  rating: number;
  highlightPoints: string[];
  affUrl: string;
  reviewSlug?: string;
  category: '主推首选' | '四端自研' | '不限时备用' | '轻量性价比';
}

export const TOP_AIRPORTS: AirportItem[] = [
  {
    id: 'shenxingjiasu',
    name: '神行加速',
    tagline: '综合主推首选，自研Windows客户端与iOS Nextin专属适配，支持通用订阅',
    badge: '综合主推首选',
    type: '专线+专属客户端',
    nodesCount: '60+ 节点 / 全球主力地区',
    peakSpeed: '560 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT 4o', 'TikTok', 'YouTube 4K'],
    protocols: ['专属协议', 'Shadowsocks', '通用订阅'],
    startingPrice: '¥23.00',
    billingPeriod: '月付起 (含150GB)',
    promoCode: 'sx0077',
    discount: '新客7折优惠券',
    rating: 9.9,
    highlightPoints: [
      '月付23元150GB起，年付特惠96元（60GB/月，折合8元/月）',
      '提供Windows自研专属客户端，iOS使用Nextin专属码 sxjs',
      '支持90GB/99元与450GB/398元不限时备用包，通用订阅向客服领取'
    ],
    affUrl: 'https://wuhan01.shenxingaff.com/#/?code=WUQMrgI8',
    reviewSlug: 'shenxingjiasu-review',
    category: '主推首选',
  },
  {
    id: 'dalaoyun',
    name: '大佬云',
    tagline: '四端自研客户端与通用订阅兼备，初云福利版19.99元与不限时备用包',
    badge: '四端自研标杆',
    type: '四端自研+通用订阅',
    nodesCount: '70+ 节点 / 亚太欧美',
    peakSpeed: '520 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT Plus', 'Claude 3.5', 'TikTok'],
    protocols: ['Shadowsocks', 'Clash通用订阅', '自有协议'],
    startingPrice: '¥19.99',
    billingPeriod: '月付起 (初云福利版100GB)',
    promoCode: 'dly88',
    discount: '新客首单7折',
    rating: 9.8,
    highlightPoints: [
      '四端自研客户端（Windows/macOS/Android/iOS Nextin专属码 dly）',
      '直接提供Clash等通用订阅链接，换客户端无需迁移成本',
      '提供99元78GB与199元160GB两款一次性不限时流量包'
    ],
    affUrl: 'https://fugui0077.dalaoyunaff.com/#/?code=1o7gYhTL',
    reviewSlug: 'dalaoyun-review',
    category: '四端自研',
  },
  {
    id: 'yunjiexian',
    name: '云界线',
    tagline: '自研客户端与iOS Nextin专属码，多档不限时流量包与首单7折',
    badge: '不限时备用首选',
    type: '专线+不限时备用',
    nodesCount: '55+ 节点 / 多国覆盖',
    peakSpeed: '490 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT', 'YouTube 4K'],
    protocols: ['专属客户端', '通用订阅(客服领取)'],
    startingPrice: '¥22.00',
    billingPeriod: '轻云实测结算价 (150GB)',
    promoCode: 'yjx888',
    discount: '首单7折优惠',
    rating: 9.7,
    highlightPoints: [
      '轻云套餐实际结算22元/月，年付小包96元含60GB/月',
      '提供99元80GB与199元200GB一次性不限时包，用完重购不按月过期',
      '提供Windows自研客户端，iOS使用Nextin专属码 yjx'
    ],
    affUrl: 'https://fugui0077.yunjiexianaff.com/#/?code=qA3LF6hW',
    reviewSlug: 'yunjiexian-review',
    category: '不限时备用',
  },
  {
    id: 'liulianyun',
    name: '榴莲云',
    tagline: '四端专属客户端与iOS Nextin支持，套餐每30天刷新，公告常驻7折',
    badge: '低价年付优选',
    type: '专属客户端+通用订阅',
    nodesCount: '50+ 节点 / 国际骨干',
    peakSpeed: '460 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT', 'TikTok', 'Hulu'],
    protocols: ['专属协议', '通用订阅(客服领取)'],
    startingPrice: '¥24.00',
    billingPeriod: '月付起 (含140GB)',
    promoCode: 'll88',
    discount: '常驻7折优惠码',
    rating: 9.6,
    highlightPoints: [
      '月付24元140GB，年付特惠96元含60GB/月，每30天重置',
      '四端专属客户端（Windows/Android/Mac），iOS使用Nextin专属码 lly',
      '不限同时使用客户端数量，通用订阅购买后向客服领取'
    ],
    affUrl: 'https://zyrrz.liulianyunaff.com/#/?code=Y6A1M1MN',
    reviewSlug: 'liulianyun-review',
    category: '主推首选',
  },
  {
    id: 'shandianshu',
    name: '闪电鼠',
    tagline: '官方多端客户端与iOS Nextin识别码，起步22元120GB轻量入门',
    badge: '轻量入门首购',
    type: '官方专属客户端',
    nodesCount: '45+ 节点 / 亚太主力',
    peakSpeed: '420 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT', 'YouTube 4K'],
    protocols: ['官方专属协议'],
    startingPrice: '¥22.00',
    billingPeriod: '月付起 (含120GB)',
    promoCode: 'sd88',
    discount: '新用户首购7折',
    rating: 9.5,
    highlightPoints: [
      '入门月付22元120GB，另有96元年付60GB/月套餐',
      '提供Android、Windows、Mac客户端教程，iOS使用Nextin识别码 sd88',
      '新用户首购可输入公告7折码 sd88 体验入门'
    ],
    affUrl: 'https://fugui0077.shandianshuaff.com/#/?code=I2yK9PfK',
    reviewSlug: 'shandianshu-review',
    category: '轻量性价比',
  },
  {
    id: 'huanqiuti',
    name: '环球梯',
    tagline: '多端官方客户端与iOS Nextin支持，限3台设备，提供365天按量包',
    badge: '多端按量周期',
    type: '官方客户端+365天按量',
    nodesCount: '45+ 节点 / 全球节点',
    peakSpeed: '390 Mbps',
    streamingUnlock: ['Netflix', 'Disney+', 'ChatGPT', 'TikTok'],
    protocols: ['官方客户端协议'],
    startingPrice: '¥23.00',
    billingPeriod: '月付起 (含120GB)',
    promoCode: 'HQ66',
    discount: '限量7折优惠码',
    rating: 9.4,
    highlightPoints: [
      '最低月付23元含120GB（限3台设备），96元年付60GB/月',
      '提供99元80GB与299元400GB按量包（有效期365天）',
      '提供官方多端客户端及iOS Nextin识别码 HQ66'
    ],
    affUrl: 'https://fugui0077.huanqiutiaff.com/#/?code=rJyQn4xG',
    reviewSlug: 'huanqiuti-review',
    category: '轻量性价比',
  },
  {
    id: 'bianyuan',
    name: '边缘节点',
    tagline: '四端客户端与永久不限时包，限时体验月付15元与极界标准22元',
    badge: '永久不限时包',
    type: '四端专属+永久不限时',
    nodesCount: '40+ 节点 / 覆盖多区',
    peakSpeed: '410 Mbps',
    streamingUnlock: ['Netflix', 'ChatGPT', 'Disney+'],
    protocols: ['专属客户端协议'],
    startingPrice: '¥15.00',
    billingPeriod: '体验月付 (50GB)',
    promoCode: 'xk808',
    discount: '新客8折优惠码',
    rating: 9.3,
    highlightPoints: [
      '限时体验月付15元50GB，主力极界标准22元120GB，98元年付小包',
      '提供100元100GB与399元450GB两款永久不限时包，不自动刷新',
      'Windows/macOS/Android专属客户端与iOS Nextin识别码 edgenova0526'
    ],
    affUrl: 'https://wep.edgenovaaff.com/#/?code=q1BOP7EV',
    reviewSlug: 'bianyuan-review',
    category: '不限时备用',
  },
  {
    id: 'feiv',
    name: '飞V',
    tagline: '四端客户端与终身不限时买断包，月付22元150GB起',
    badge: '终身买断不限时',
    type: '四端专属+终身包',
    nodesCount: '45+ 节点 / 国际线路',
    peakSpeed: '440 Mbps',
    streamingUnlock: ['Netflix', 'ChatGPT', 'Disney+', 'TikTok'],
    protocols: ['专属客户端协议'],
    startingPrice: '¥22.00',
    billingPeriod: '月付起 (150GB)',
    promoCode: 'fly20',
    discount: '新客8折优惠码',
    rating: 9.3,
    highlightPoints: [
      '月付22元150GB起，99元年付轻量包（折合8.25元/月）',
      '提供三档终身不限时包（189元130GB、479元380GB、799元600GB）',
      '支持Windows/macOS/Android与iOS Nextin，不限同时在线设备'
    ],
    affUrl: 'https://fugui.flyvaff.com/#/?code=gxmUajhy',
    reviewSlug: 'feiv-review',
    category: '不限时备用',
  },
  {
    id: 'lingdongyun',
    name: '灵动云',
    tagline: '四端客户端与永久有效不限时包，月付20元100GB起',
    badge: '永久有效长周期',
    type: '四端客户端+永久包',
    nodesCount: '40+ 节点 / 亚洲欧美',
    peakSpeed: '380 Mbps',
    streamingUnlock: ['Netflix', 'ChatGPT', 'YouTube 4K'],
    protocols: ['专属客户端协议'],
    startingPrice: '¥20.00',
    billingPeriod: '月付起 (100GB)',
    promoCode: 'TG_VIP',
    discount: 'TG群专属福利',
    rating: 9.2,
    highlightPoints: [
      '月付20元100GB起，99元年付穿云包（70GB/月，折合8.25元/月）',
      '提供三档永久有效不限时包（199元150GB、499元400GB、899元800GB）',
      '官方Telegram讨论群发布专属福利，支持四端客户端与iOS Nextin'
    ],
    affUrl: 'https://fugui.lingdongaff.com/#/?code=lyfEXnqR',
    reviewSlug: 'lingdongyun-review',
    category: '不限时备用',
  },
  {
    id: 'kuaili',
    name: '快狸',
    tagline: '多端客户端与通用订阅双轨，月狸小包15元50GB起步',
    badge: '双轨通用订阅',
    type: '多端客户端+通用订阅',
    nodesCount: '35+ 节点 / 主力覆盖',
    peakSpeed: '360 Mbps',
    streamingUnlock: ['Netflix', 'ChatGPT', 'Disney+'],
    protocols: ['客户端协议', 'Clash Mi通用订阅'],
    startingPrice: '¥15.00',
    billingPeriod: '月狸小包 (50GB)',
    promoCode: 'KUAILI',
    discount: '官方优惠券',
    rating: 9.1,
    highlightPoints: [
      '月狸月付小包15元50GB，森狸年付小包120元/年（折合10元/月）',
      '主力套餐小狸基础版22元100GB，购买日起每30天刷新',
      '提供Windows/macOS/Android客户端、iOS Nextin并支持Clash Mi通用导入'
    ],
    affUrl: 'https://fanxiaobin.kuailiaff.com/#/?code=K0WKmH8h',
    reviewSlug: 'kuaili-review',
    category: '轻量性价比',
  },
];

// 常见客户端列表（包含主流全部客户端：小火箭、v2rayN/v2rayNG、Clash Verge Rev、Mihomo Party、Sing-box等）
export interface ClientItem {
  name: string;
  category: string;
  platforms: ('Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux')[];
  recommendedProtocol: string;
  description: string;
  downloadUrl: string;
  tutorialSlug: string;
  badge?: string;
}

export const POPULAR_CLIENTS: ClientItem[] = [
  {
    name: 'Shadowrocket (小火箭)',
    category: 'iOS 全能装机必备',
    platforms: ['iOS'],
    recommendedProtocol: 'Shadowsocks / Vless / Trojan / Hysteria 2',
    description: '苹果 iOS 生态最普及的代理神器，价格亲民且功能极其完备。支持扫码一键导入、全协议支持、完善的智能分流与免配置规则。',
    downloadUrl: 'https://apps.apple.com/app/shadowrocket/id932747118',
    tutorialSlug: 'shadowrocket-ios-tutorial',
    badge: 'iOS国民标杆',
  },
  {
    name: 'v2rayN',
    category: 'Windows 经典老牌主力',
    platforms: ['Windows'],
    recommendedProtocol: 'Xray / VLESS / VMess / Shadowsocks',
    description: 'Windows 平台资历深厚、极其可靠的开源客户端。支持 Xray 与 Sing-box 双核心、真连接并发测速、订阅自动化批量管理。',
    downloadUrl: 'https://github.com/2dust/v2rayN/releases',
    tutorialSlug: 'v2rayn-v2rayng-setup-guide',
    badge: 'Windows经典',
  },
  {
    name: 'v2rayNG',
    category: 'Android 必备老牌利器',
    platforms: ['Android'],
    recommendedProtocol: 'VLESS / VMess / Shadowsocks / Trojan',
    description: '安卓平台最经典的代理工具，内存占用极小、后台保活能力出众。支持订阅一键同步、分应用代理分流及节点快速测速。',
    downloadUrl: 'https://github.com/2dust/v2rayNG/releases',
    tutorialSlug: 'v2rayn-v2rayng-setup-guide',
    badge: 'Android老牌',
  },
  {
    name: 'Clash Verge Rev',
    category: '跨平台现代开源桌面端',
    platforms: ['Windows', 'macOS', 'Linux'],
    recommendedProtocol: 'Mihomo / Clash通用订阅 / 全协议支持',
    description: '开源现代界面的桌面客户端，集成 Mihomo(Meta) 内核，具备强大的 TUN 虚拟网卡接管、智能延迟测速及多订阅自动合并管理。',
    downloadUrl: 'https://github.com/clash-verge-rev/clash-verge-rev/releases',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '电脑端主力',
  },
  {
    name: 'Mihomo Party',
    category: '新一代优雅高颜值桌面端',
    platforms: ['Windows', 'macOS', 'Linux'],
    recommendedProtocol: 'Clash Meta / 通用订阅 / Hysteria 2',
    description: '当前备受推崇的新一代桌面客户端。界面精美优雅，内置可视化侧边面板、便捷节点选择与开箱即用的分流规则集。',
    downloadUrl: 'https://github.com/mihomo-party-org/mihomo-party/releases',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '新一代桌面标杆',
  },
  {
    name: 'Sing-box',
    category: '新一代通用极速内核',
    platforms: ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
    recommendedProtocol: 'Hysteria 2 / TUIC / VLESS / Reality',
    description: '全平台通用底层代理平台，原生完美支持 Hysteria 2、TUIC 等新一代 UDP 爆发协议，网络吞吐表现与低延迟极其出众。',
    downloadUrl: 'https://github.com/SagerNet/sing-box/releases',
    tutorialSlug: 'sing-box-universal-guide',
    badge: '极速新内核',
  },
  {
    name: 'Nextin',
    category: 'iOS 专属免配置直连',
    platforms: ['iOS'],
    recommendedProtocol: '专属站点识别码 / 原生直连',
    description: '针对国内苹果用户打磨的专属客户端，输入神行加速 (sxjs)、大佬云 (dly)、榴莲云 (lly)、云界线 (yjx) 专属识别码即可一键同步节点。',
    downloadUrl: 'https://apps.apple.com/app/nextin/id6477815345',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: 'iOS免海外ID',
  },
  {
    name: 'FlClash',
    category: '跨平台 Flutter 统一客户端',
    platforms: ['Windows', 'macOS', 'Android', 'Linux'],
    recommendedProtocol: 'Mihomo / Clash通用订阅',
    description: '新一代基于 Flutter 开发的轻量现代化跨平台客户端，内存占用超低，UI 精巧，移动端与桌面端保持完全一致的使用体验。',
    downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '跨端极简',
  },
  {
    name: 'Surge',
    category: 'iOS / macOS 旗舰级网络神器',
    platforms: ['iOS', 'macOS'],
    recommendedProtocol: 'Snell / Shadowsocks / Trojan / HTTPS',
    description: '苹果生态顶尖的专业网络调试与分流利器，具备卓越的稳定性、极致的接管效率与高级脚本引擎，适合进阶发烧友。',
    downloadUrl: 'https://nssurge.com/',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '极客旗舰',
  },
  {
    name: 'Loon',
    category: 'iOS 现代轻量高阶工具',
    platforms: ['iOS'],
    recommendedProtocol: 'Shadowsocks / Vmess / Trojan / WireGuard',
    description: '界面清新友好且功能强大的 iOS 代理软件，支持丰富的插件市场、脚本自动化与流媒体智能解锁规则。',
    downloadUrl: 'https://apps.apple.com/app/loon/id1373567447',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '轻量优雅',
  },
  {
    name: 'Quantumult X (圈X)',
    category: 'iOS 发烧友分流利器',
    platforms: ['iOS'],
    recommendedProtocol: 'Shadowsocks / Trojan / VMess',
    description: 'iOS 资深玩家高频推崇的经典工具，具备强大的分流策略引擎、本地重写支持与深色质感 UI，兼具高自由度与低耗电。',
    downloadUrl: 'https://apps.apple.com/app/quantumult-x/id1453926895',
    tutorialSlug: 'clash-verge-rev-guide',
    badge: '发烧友之选',
  },
  {
    name: 'Clash Mi',
    category: 'iOS / macOS 通用直装',
    platforms: ['iOS', 'macOS'],
    recommendedProtocol: 'Clash通用订阅 / Shadowsocks / Vless',
    description: 'App Store 正规上架的轻量免证书客户端，无需共享账号即可直接下载，支持通用订阅链接一键导入。',
    downloadUrl: 'https://apps.apple.com/us/app/clash-mi/id6744321968',
    tutorialSlug: 'sing-box-universal-guide',
    badge: 'App Store直装',
  },
];
