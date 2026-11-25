---
title: 'DNS污染、Fake-IP与TUN虚拟网卡深度科普：SNI阻断与代理防泄漏原理解析'
description: '深度解析科学上网底层转发机制：为什么节点能测出延迟却依然打不开网页？本文从UDP/53端口DNS污染与TLS握手SNI明文阻断讲起，系统对比Real-IP与Fake-IP虚拟地址池机制、系统代理与TUN虚拟网卡底层接管差异，并提供DoH/DoT国内外分流防污染配置及DNS与WebRTC泄漏排查完整方案。'
pubDate: 2026-11-25
updatedDate: 2026-11-25
category: '网络科普'
tags: ['DNS污染', 'Fake-IP', 'TUN模式', 'SNI阻断', 'DNS防泄漏', '网络科普']
rating: 9.8
badge: '底层原理科普'
featured: true
author: '机场搜技术组'
faq:
  - question: '开启 Fake-IP 模式后，为什么局域网 NAS / 内网 SSH 或部分国内银行 App 反而无法连接？'
    answer: '因为 Fake-IP 会将所有未放行的域名解析请求统一劫持并返回 198.18.0.0/15 保留地址池中的虚拟 IP，依赖真实局域网 IP 通信或使用证书强校验/多链路并发的国内金融 App 拿到虚拟 IP 后会直接建立连接失败。必须在配置文件的 fake-ip-filter 列表中添加 *.local、*.lan、*.arpa、NTP 时间域名及常见银行/支付相关域名，强制它们走真实 DNS 解析。'
  - question: '用上 DoH / DoT 加密 DNS 之后，为什么国内网站打开变慢甚至部分公共 DoH 超时？'
    answer: 'DoH（TCP/443）和 DoT（TCP/853）虽然加密了查询内容本身，但建立 TLS 连接时的服务器域名 SNI 与目标 IP 依然可见，例如 dns.google 或 cloudflare-dns.com 在国内直连环境下容易被阻断或产生极高丢包。同时若把国内域名也丢给海外 DoH 解析，会导致 CDN 调度到海外节点。正确做法是设置 default-nameserver 解析 DoH 服务器自身，并用 nameserver-policy 让国内域名走运营商/阿里/腾讯 DoH，海外域名走远程代理解析。'
  - question: '为什么电脑或手机开启 TUN 虚拟网卡模式后耗电变快，还会与 VMware、WSL2 或 Docker 网桥冲突？'
    answer: 'TUN 模式工作在操作系统三层网络栈，所有进出网卡的 TCP/UDP/ICMP 数据包都需要经过内核虚拟网卡与用户态代理核心之间的上下文切换和内存拷贝，高吞吐下 CPU 占用显著高于应用层系统代理。此外，TUN 默认生成的路由表可能接管 WSL2、Docker 或虚拟机私有网段，引发回环丢包，需要在 tun 配置段的 route-exclude-address 中显式排除对应内网 CIDR。'
  - question: '我已经开启了 TUN 模式和 Fake-IP，为什么访问 ChatGPT 或 Netflix 依然提示区域不支持或触发 Cloudflare 拦截？'
    answer: 'TUN 与 Fake-IP 只能解决本地网络层的 DNS 泄漏与 UDP 旁路偷跑问题，不能改变落地服务器的 IP 信用画像。如果机场节点本身使用的是高频被滥用的数据中心广播 IP，或浏览器开启了 WebRTC 暴露本地/运营商公网 IP、系统时区与语言指纹矛盾，依然会被目标风控引擎直接拒绝。此时需结合原生住宅 IP 节点并在工具页复检完整出口与 WebRTC 状态。'
  - question: '关闭代理软件或从 Fake-IP 切回直连后，为什么短时间内部分网站仍显示 198.18.x.x 无法打开？'
    answer: '这是由于 Fake-IP 返回给浏览器和操作系统的虚拟地址仍带有较短 TTL，且浏览器内置异步 DNS 缓存或系统 DNS 服务缓存尚未过期；部分客户端若开启了 store-fake-ip 本地持久化且异常退出，也可能未及时恢复系统 DNS 设置。清理系统 DNS 缓存（如 Windows 执行 ipconfig /flushdns）并重启浏览器标签页即可立即恢复。'
---

> **导读**：许多用户在日常使用代理工具时都遇到过这种现象：客户端里节点延迟测速只有 30ms，油管也能跑满带宽，但打开某些网站时却卡在“正在建立安全连接”，或者终端命令行、游戏联机工具根本不走代理通道；更隐蔽的是，明明开了全局代理，访问 ChatGPT 或 Netflix 时却突然弹出地区不支持。这些看似玄学的故障，根源几乎都出在 **DNS 解析路径、TLS 握手 SNI 特征、以及系统代理与 TUN 虚拟网卡的接管边界** 上。

> **核心结论（TL;DR）**：科学上网并非单纯的“换一个海外 IP 转发流量”，而是一套由 **本地 DNS 劫持/防污染 -> 内核分流匹配 -> 客户端入站接管（系统代理或 TUN） -> 隧道加密传输** 构成的精密链路。理解 `UDP/53 污染`、`TLS SNI 明文阻断`、`Real-IP 与 Fake-IP 映射` 以及 `TUN 三层路由接管`，即可用工程视角定位 95% 以上的断流与隐私泄漏问题。

---

## 一、为什么代理开启后依然“有延迟但打不开网页”？DNS 污染与 SNI 阻断全链路拆解

**直接答案**：当请求未能正确交由加密隧道处理，或客户端在本地发起了未经保护的明文域名查询与 TLS 握手时，中途网络设备会在毫秒级时间内通过“伪造 DNS 响应包”或“注入双向 TCP RST 重置帧”直接掐断连接，此时节点本身的 ICMP/TCP Ping 延迟依然正常。

在传统直连网络中，用户访问一个 HTTPS 网站（例如 `example.com`）通常需要经历两次最容易被旁路识别的明文交互：

### 1. UDP/53 端口的 DNS 污染与抢答机制

传统域名解析默认使用 `UDP 53` 端口进行明文通信。由于 UDP 是无状态协议且缺乏身份签名校验，网络路径上的旁路检测设备（IDS/DPI）会实时扫描经过的域名查询包：

- **特征识别与抢答**：一旦数据包中的 Question 字段命中敏感域名列表，旁路设备会在真实权威 DNS 服务器响应返回之前，先一步向用户终端发回一条伪造的 A / AAAA 记录响应包（通常指向无效保留地址或黑洞 IP）。
- **先到先得原则**：操作系统网络栈收到第一条合法格式的 UDP 响应后即采信并写入缓存，随后到达的真实海外 DNS 响应会被直接丢弃。这就是为什么本地 `nslookup` 有时明明解析出了一个海外 IP，但后续怎么都连不通的原因。

### 2. TLS 握手阶段 ClientHello 中的 SNI 明文暴露

即便本地通过修改 Hosts 或安全 DNS 拿到了完全正确的目标服务器真实 IP，直连建立 HTTPS 连接时依然会倒在第二步——**TLS 握手**。

为了支持同一台服务器 IP 托管多个不同域名的 HTTPS 证书，TLS 协议在握手最初的 `ClientHello` 明文报文中携带了 **SNI（Server Name Indication）** 扩展字段，直接暴露了用户即将访问的目标域名。中间审查设备不需要破解 HTTPS 加密载荷，仅凭 `ClientHello` 中的明文 SNI 即可精准识别目标站点，并立刻向客户端与服务端双向发送伪造的 `TCP RST`（连接重置）报文或直接黑洞丢弃后续数据包。

至于传输层协议如何对抗这种主动探测与阻断，可延伸阅读本站另一篇底层协议对比：[2026 主流翻墙协议全景对比：Shadowsocks、VLESS-Reality、Hysteria 2 与 TUIC 深度科普](/blog/hysteria2-tuic-shadowsocks-protocols-comparison/)；而如果你使用的普通公网中转频繁在握手期被掐断，建议结合 [IEPL 物理专线、IPLC 与 BGP 公网中转核心区别深度科普](/blog/iepl-iplc-bgp-transit-explained/) 排查传输链路底层抗干扰能力。

---

## 二、Fake-IP 和 Redir-Host（Real-IP）有什么本质区别？

**直接答案**：**Redir-Host（Real-IP）先向真实 DNS 查出准确 IP 后再走规则分流与节点连接，语义最兼容但额外耗时且极易触发国内本地解析泄漏；Fake-IP 则在本地立即返回一个 `198.18.0.0/15` 保留段虚拟 IP 让应用直接发包，由代理核心在出口侧再交由远程节点解析，实现零 DNS 延迟与物理级零泄漏。**

在 Mihomo（Clash.Meta）及 sing-box 等现代客户端中，DNS 工作模式的选择直接决定了分流命中精度与首包加载速度：

### 1. Real-IP（Redir-Host）模式的工作闭环

1. 浏览器向代理内置 DNS 发起域名查询；
2. 代理核心必须先等待远程 DoH/DoT 或代理解析服务器完成整趟查询，拿到真实目标 IP 后返回给浏览器；
3. 代理核心同时尝试结合 IP 归属地（GeoIP）或域名规则（Rule）决定直连或走代理；
4. 若命中代理规则，客户端将目标 IP 传给机场远端节点发起连接。

这一机制最大的问题在于**时间损耗与规则盲区**：每次访问新域名都必须同步等待至少 1 次完整的跨网 DNS RTT，而且如果规则库触发了 `GEOIP` 判定，就强制客户端**必须提前拿到真实 IP 才能判断走直连还是走代理**——这正是许多配置不当的订阅在本地触发直连 DNS 解析泄漏的源头。

### 2. Fake-IP 模式的“虚拟地址池欺骗”机制

Fake-IP 巧妙利用了 <a href="https://datatracker.ietf.org/doc/html/rfc2544" target="_blank" rel="noopener noreferrer">IETF RFC 2544</a> 专门预留给网络设备基准测试的私有保留网段 `198.18.0.0/15`（共 131,072 个可用地址）：

1. 浏览器请求解析 `github.com`，代理核心**根本不等待远程 DNS**，而是直接按规则判定其归属代理组，并在本地内存映射表中分配一个虚拟地址（如 `198.18.0.42`）在 **0.1 毫秒内**返回给浏览器；
2. 浏览器拿到虚拟 IP 后立刻发起 TCP/UDP 连接请求；
3. 代理核心拦截到目标为 `198.18.0.42` 的连接后，反查映射表还原出原始域名 `github.com`，再将**域名本身（而非 IP）**直接封装进加密隧道交由海外机场落地服务器在远程就近解析并发起连接。

这种设计的实战配置细则，可以在 [Clash Verge Rev 现代化跨平台客户端配置教程](/blog/clash-verge-rev-guide/) 与 [Sing-box 下一代通用代理核心深度指南](/blog/sing-box-universal-guide/) 中找到对应配置文件参数说明。

| 对比维度 | 传统本地直连 DNS | Redir-Host（Real-IP）模式 | Fake-IP 虚拟地址池模式 |
| :--- | :--- | :--- | :--- |
| **响应地址来源** | 运营商/本地缓存真实 IP | 客户端内置 DNS 异步查回的真实 IP | RFC 2544 保留段 `198.18.0.0/15` 映射池 |
| **首包 DNS 延迟** | 易被 UDP/53 抢答返回假地址 | 需等待 1 次完整跨网 DNS RTT（约 20-150ms） | 本地内存查表极速响应（< 1ms） |
| **GeoIP 规则触发成本** | 易泄漏本地真实定位 | 强制提前解析，直连规则易引发本地 DNS 泄漏 | 仅当命中强制 `no-resolve` 外的 IP 规则时才需解析 |
| **远端 CDN 就近调度** | 极差，常把海外请求调度到国内黑洞 | 取决于本地 DNS 是否支持海外 ECS | 极佳，由海外落地节点直接就近解析目标 CDN |
| **内网/特定软件兼容性** | 原生完全兼容 | 高，所有应用拿到的均是真实目标 IP | 依赖 `fake-ip-filter` 排除内网主机与部分金融 App |

---

## 三、系统代理（System Proxy）与 TUN 虚拟网卡到底该选哪个？

**直接答案**：**系统代理仅作用于浏览器等“主动读取操作系统 HTTP/SOCKS5 代理环境变量”的软件，属于应用层局部接管；TUN 模式则在操作系统内核注册一张虚拟三层网卡并改写全局路由表，能够无视应用是否支持代理设置，强行接管全部 TCP/UDP 流量。**

许多新手打开客户端后明明开启了代理，却发现 Git 命令行下载源码报错、Steam/联机游戏全程高延迟、或者某些桌面 Electron 客户端依然走本地直连，原因在于“系统代理”本质上只是一个**君子协定**。

### 1. 系统代理（应用层局部转发）

当你开启系统代理时，客户端只是在 Windows 注册表（Internet Settings）或 macOS 网络偏好设置中写入了类似 `127.0.0.1:7897` 的监听端口。

- **优点**：几乎零额外 CPU 开销，不影响 WSL2、Docker 等复杂本地虚拟化网络环境，排障简单。
- **局限**：大量桌面程序、终端 CLI 工具（`curl`、`git`、`pip`）、游戏客户端以及 UWP 应用**根本不会主动读取系统 HTTP 代理配置**；同时主流系统代理对 UDP 流量（如游戏语音、QUIC 视频流、WebRTC）支持极弱，导致这类流量直接绕过代理直奔运营商网关而暴露真实地址。

### 2. TUN 模式（网络层全局路由接管）

TUN（Network Tunnel）是操作系统内核原生支持的虚拟点对点网络设备接口。开启 TUN 模式后，客户端会在系统网络适配器中生成一张虚拟网卡，并将默认网关或特定 CIDR 网段路由表指向该虚拟网卡。

- **真实原理**：应用程序发出任何 IP 数据包（无论它是否支持代理设置），都会在操作系统内核三层网络协议栈被路由进 TUN 虚拟网卡，随后交由用户态代理核心（<a href="https://wiki.metacubex.one/config/inbound/tun/" target="_blank" rel="noopener noreferrer">Mihomo TUN 文档</a> 或 <a href="https://sing-box.sagernet.org/configuration/inbound/tun/" target="_blank" rel="noopener noreferrer">sing-box TUN 文档</a>）解包还原为四层 TCP/UDP 会话，匹配规则后再封包送往机场节点。
- **适用边界**：移动端的 iOS `NEPacketTunnelProvider` 与 Android `VpnService` 本质上也是 TUN 机制。关于各平台客户端如何安全切换系统代理与 TUN 栈（如 `system` / `gvisor` / `mixed`），可前往 [客户端指南汇总页](/clients) 或直接参考 [Shadowrocket 苹果 iOS 完整上手指南](/blog/shadowrocket-ios-tutorial/)。

| 对比维度 | 系统代理（System Proxy） | TUN 虚拟网卡模式（TUN Mode） |
| :--- | :--- | :--- |
| **OSI 工作层级** | 应用层 / 会话层（HTTP / SOCKS5 协议） | 网络层（L3 原始 IP 数据包接管） |
| **接管范围** | 仅支持读取系统代理的浏览器与部分桌面软件 | 全局所有进程、终端命令行、系统后台服务、游戏联机 |
| **UDP 与 ICMP 支持** | HTTP 代理完全不支持 UDP；SOCKS5 支持受限 | 原生完整接管 TCP、UDP 及 ICMP 流量 |
| **系统权限与开销** | 无需管理员权限，CPU 占用极低 | 需管理员/Root/系统网络扩展权限，高并发吞吐略有 CPU 开销 |
| **虚拟化与内网冲突** | 无冲突 | 可能与 Docker、WSL2、VMware 网桥争抢默认路由，需配排除网段 |

---

## 四、为什么配置完仍会发生 DNS 泄漏？DoH / DoT 分流正确链路

**直接答案**：**即便开启了代理，如果客户端把域名解析请求错误发往本地运营商 DNS，或允许浏览器自主绕过 TUN 发送独立的 DoH 查询（Safe Browsing / Chrome 异步 DNS），本地宽带出口 IP 仍会记录在目标服务的 DNS 权威日志中，即构成 DNS 泄漏。**

### 1. DoH（DNS over HTTPS）与 DoT（DNS over TLS）如何各司其职

为避免在去往上游 DNS 的“最后一公里”遭遇旁路篡改，现代代理配置普遍采用加密 DNS 协议：
- **DoT（DNS over TLS，RFC 7858）**：使用独立端口 `TCP/853` 建立纯 TLS 隧道传输 DNS 查询，连接建立速度快，但在企业内网或严格防火墙环境下 `853` 端口容易被一刀切阻断。
- **DoH（DNS over HTTPS，RFC 8484）**：将 DNS 报文直接伪装成普通 HTTPS 请求封装在 `TCP/443` 端口传输（规范详情见 <a href="https://datatracker.ietf.org/doc/html/rfc8484" target="_blank" rel="noopener noreferrer">IETF RFC 8484</a>），极难被端口封杀。

### 2. 防止“国内变慢 + 国外泄漏”的分流黄金规则

千万不要盲目将所有 DNS 请求统统指向海外的 `8.8.8.8` 或 `https://dns.google/dns-query`。那样不仅会让淘宝、Bilibili 等国内服务被海外 CDN 误调度到新加坡或美国节点导致加载龟速，还可能因为直连不上海外 DoH 服务器而彻底断网。一套健壮的分流链路必须拆成三段：

1. **引导解析（`default-nameserver`）**：仅用纯 IP 形式的国内权威 DNS（如 `223.5.5.5`、`119.29.29.29`）来**仅仅解析 DoH 服务器自身的域名**（例如 `dns.alidns.com`），打破“鸡生蛋、蛋生鸡”的死循环；
2. **机场节点域名专属解析（`proxy-server-nameserver`）**：机场订阅下发的节点服务器本身往往也是域名（如 `hk01.example-airport.com`），必须确保节点域名通过国内高可用 DoH 解析，否则无法建立初始隧道；
3. **内外策略分流（`nameserver-policy` + `fallback`）**：国内域名列表（Geosite CN）强制走国内加密 DNS（阿里/腾讯 DoH）；海外域名在开启 Fake-IP 时不落本地解析，或者强制通过代理通道交由海外 DoH/远程落地解析（`respect-rules: true`）。

完成配置后，建议立即打开 <a href="https://www.dnsleaktest.com/" target="_blank" rel="noopener noreferrer">DNSLeakTest</a> 进行 Extended Test，并配合 <a href="https://browserleaks.com/webrtc" target="_blank" rel="noopener noreferrer">BrowserLeaks WebRTC 检测</a> 以及本站的 [网络工具页](/tools) 进行交叉验证：在全局或规则代理下测试海外服务时，**DNS 结果列表中绝不应出现你本地省市的联通/电信/移动 DNS 服务器地址**。若排除泄漏后仍遇 AI/流媒体报错，则属于节点本身 IP 纯净度问题，请对照阅读 [原生住宅 IP 与流媒体/ChatGPT 解锁深度指南](/blog/netflix-chatgpt-unlock-native-ip/)。

---

## 五、常见断流与风控报错怎么逐层排查？4 步定位矩阵

遇到任何代理疑难杂症时，切忌上来就删订阅或盲目重装，按照 **本地解析 -> 入站接管 -> 传输握手 -> 远端落地** 四层顺序排查，通常 2 分钟内即可精准定位病灶：

| 常见故障现象 | 数据包层真实卡点定位 | 标准化排查与修复方案 |
| :--- | :--- | :--- |
| **测速延迟 40ms，但浏览器打开任意海外网站一直转圈报错** | 典型 **DNS 污染残留** 或节点域名未能成功本地解析，导致 TLS 握手未发出或发往黑洞地址 | 开启 `Fake-IP` 模式并刷新操作系统 DNS 缓存；检查 `proxy-server-nameserver` 是否配置正确国内 DoH |
| **浏览器访问正常，但终端 `git clone` / `curl` / Steam 联机完全不通** | 仅开启了应用层 **系统代理**，命令行工具与游戏进程绕过代理直连被 SNI 阻断 | 客户端开启 **TUN 虚拟网卡模式**，或为终端单独导出 `HTTP_PROXY` / `ALL_PROXY` 环境变量 |
| **开启 TUN 后微信文件传输失败，或 WSL2 / Docker 内部无法联网** | TUN 全局路由接管了本地虚拟网桥网段或局域网多播发现流量 | 在 `fake-ip-filter` 放行局域网域名，并在 `tun.route-exclude-address` 排除 WSL2/Docker 私有 CIDR |
| **已开全局与 Fake-IP，访问 ChatGPT / Claude 仍提示区域封锁或 Error 1020** | 本地未泄漏，但节点出口属于高风险数据中心广播 IP，或浏览器开启了 **WebRTC 本地 IP 暴露** | 前往 [网络工具页](/tools) 检查 IP 画像，禁用浏览器 WebRTC IP 暴露并更换具备原生住宅解锁能力的节点 |
| **晚高峰特定时间全站网页图片半截断裂、TLS 握手随机超时** | 非本地客户端 DNS 问题，而是机场所使用的 **公网中转线路遭遇运营商 QoS 限速或端口阻断** | 查阅 [机场防坑与避坑指南](/blog/avoid-airport-scams-guide/) 辨别虚假专线话术，并提前配置 [高性价比按量备用机场](/blog/cheap-value-backup-airports/) 实现毫秒容灾 |

---

## 六、常见问题解答（FAQ）

### Q1：开启 Fake-IP 模式后，为什么局域网 NAS / 内网 SSH 或部分国内银行 App 反而无法连接？

**答**：这是因为 Fake-IP 的核心机制是将绝大多数域名请求拦截在本地，并统一返回 `198.18.0.0/15` 地址池里的虚拟地址。局域网设备（如 `nas.local`、路由器管理域名）必须拿到真实的 `192.168.x.x` 内网 IP 才能建立二层/三层本地直连；而部分国内银行及支付类 App 内部做了证书双向校验或多路竞速检测，拿到虚拟保留 IP 后会直接判定网络异常拒绝连接。你只需在代理配置中的 `fake-ip-filter` 列表中补全 `*.local`、`*.lan`、时间同步域名（`time.*.com`）以及常见金融域名白名单，强制这些域名走真实解析即可解决。具体 YAML 写法可对照 [Clash Verge Rev 配置教程](/blog/clash-verge-rev-guide/) 与 [Sing-box 通用配置指南](/blog/sing-box-universal-guide/) 的推荐模板直接复制。

### Q2：用上 DoH / DoT 加密 DNS 之后，为什么国内网站打开变慢，甚至某些公共 DoH 服务器直接超时？

**答**：DoH（基于 `TCP/443`）与 DoT（基于 `TCP/853`）虽然把查询域名和返回结果放进了 TLS 加密通道里，但在握手初期发起连接时，DoH 服务器本身的域名 SNI（例如 `dns.google`）和服务器 IP 依然暴露在公网链路中，因此海外知名公共 DoH 在国内直连极易被限速甚至直接超时。同时，如果把国内热门网站的解析交给海外 DoH 处理，权威 DNS 会误判你在海外，给你分配新加坡甚至美西的 CDN 节点导致国内网页打开变慢。正确做法是通过 `nameserver-policy` 做严格的“国内域名走国内 DoH、海外域名走远程代理解析”，并搭配本站 [网络工具页](/tools) 与 [IEPL/IPLC 专线科普](/blog/iepl-iplc-bgp-transit-explained/) 一起排查基础传输质量。

### Q3：为什么电脑或手机开启 TUN 虚拟网卡模式后耗电变快，还会和 VMware、WSL2 或 Docker 网桥冲突？

**答**：应用层系统代理只在浏览器等软件主动发包时转发有限的 TCP 流，而 TUN 模式处于操作系统三层网络栈，系统后台任何进程、UDP 心跳乃至高并发 P2P 流量进入虚拟网卡后，都需要频繁跨越“内核态与用户态”进行数据包封装与解包，因此 CPU 唤醒次数与内存拷贝开销明显大于系统代理，在笔记本和手机上自然会体感耗电增加。此外，当桌面端开启 `auto-route` 自动接管默认路由时，容易把 WSL2、Docker 容器网桥或 VMware Host-Only 网段的通信包一并吸进代理隧道引发死循环，只需在配置中把对应虚拟网桥网段列入排除列表即可共存。移动端 iOS 切换与省电策略可参考 [Shadowrocket iOS 完整教程](/blog/shadowrocket-ios-tutorial/)，多平台客户端兼容清单见 [客户端指南页](/clients)。

### Q4：我已经开启了 TUN 模式 + Fake-IP，为什么访问 ChatGPT 或 Netflix 依然提示区域不支持或触发 Cloudflare Error 1020？

**答**：请务必区分“本地防泄漏”与“远端 IP 风控画像”这两个概念。开启 TUN 与 Fake-IP 只能保证你的真实运营商 IP 和本地 DNS 查询不会半路偷跑泄露给目标网站；但如果机场落地节点分配给你的本身就是被无数人共用、滥用或被 Cloudflare / OpenAI 标记为高欺诈分（Fraud Score）的数据中心机房广播 IP，或者你的浏览器启用了 WebRTC STUN 探测泄漏了内网与物理出口信息，风控防火墙照样会第一时间拦截请求。你可以先用 [网络工具页](/tools) 检查完整出口画像，再按照 [原生住宅 IP 与流媒体/ChatGPT 解锁深度指南](/blog/netflix-chatgpt-unlock-native-ip/) 的标准甄别真正的原生双 ISP 落地节点。

### Q5：关闭代理软件或从 Fake-IP 切回直连后，为什么短时间内部分网站仍显示解析到了 `198.18.x.x` 无法访问？

**答**：这是因为 Fake-IP 返回给浏览器和操作系统的虚拟地址虽然通常设置了极短的 TTL（存活时间），但包括 Chrome 在内的现代浏览器内置了异步 DNS 缓存池，操作系统自身的 DNS Client 服务也会保留最近一段时间的映射记录；另外如果客户端启用了 `store-fake-ip` 本地持久化缓存或在异常闪退时未恢复网卡 DNS 指向，残留的 `198.18.x.x` 虚拟 IP 在无代理核接管的情况下就会全部请求超时。此时只需在 Windows 终端运行 `ipconfig /flushdns`（macOS 运行 `sudo killall -HUP mDNSResponder`）清空系统缓存，并重启浏览器即可秒恢复。若平时经常需要频繁切换或调试客户端，建议参考 [v2rayN 与 v2rayNG 多端配置指南](/blog/v2rayn-v2rayng-setup-guide/) 的安全退出习惯，并随手备一条 [高性价比按量备用机场](/blog/cheap-value-backup-airports/) 防止主力配置异常时彻底失联。

---

**延伸阅读与实测推荐**：掌握底层 DNS、SNI 与 TUN 转发逻辑后，如果你正在挑选传输协议抗封锁能力强、且远端配备干净原生 DNS 与住宅 IP 的稳定机场，欢迎前往查看 [机场搜综合排行红黑榜](/ranking) 或直接对照 [2026 主力高稳优质机场推荐黄页](/blog/2026-top-airports-recommendation/) 筛选适合自己网络环境的服务商。
