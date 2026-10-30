# 《石冢》(Cairn) 第二版 简体中文系统参考文档 (SRD)

欢迎查阅《石冢》(Cairn) 第二版（2e）官方简体中文系统参考文档（SRD）独立站点仓库。

- 🌐 **在线阅读站点**：[https://ascll-ray.github.io/cairn-zh/](https://ascll-ray.github.io/cairn-zh/)（官方域名解析筹备中：`https://zh.cairnrpg.com`）
- 📖 **规则范围**：31 个核心章节（《玩家手册》6 章 + 《监守手册》23 章全量对齐）
- 🔍 **功能特性**：纯中文双层手风琴折叠导航、Lunr.js 离线全文搜索、响应式排版与深色模式支持

---

## 游戏简介

《石冢》(Cairn) 是一款由 **Yochai Gal** 设计的经典探险角色扮演游戏（TRPG），主题是探索幽暗神秘的森林，其中遍布怪诞民俗、隐秘财宝与不可名状的怪物。

- **快速轻量**：角色生成随机快捷，无复杂职业与经验值惩罚；
- **探险驱动**：战斗混乱而致命，奖励谨慎规划与叙事内成长（Diegetic Growth）；
- **经典溯源**：基于 Ben Milton 的《恶棍》(Knave) 与 Chris McDowall 的《涉足奇境》(Into the Odd)。

---

## 致敬与版权说明

- **游戏原作**：由 **Yochai Gal** 设计并编写，原版发布于 [cairnrpg.com](https://cairnrpg.com)。
- **先驱致谢**：特别向《石冢》第一版（1e）中文译者 **ZzNoah** ([`ZzNoah/cairn-cn`](https://github.com/ZzNoah/cairn-cn)) 致敬。本译本在力量/敏捷/意志（STR/DEX/WIL）、金银铜币、耐久度（HP）、疲乏（Fatigue）、剥夺（Deprived）等核心 TRPG 机制名词上，严格遵循并继承了其确立的中文经典跑团术语体系。
- **第二版维护**：由 **Ascll-Ray** ([@Ascll-Ray](https://github.com/Ascll-Ray)) 完成第二版全量校对、Jekyll 架构装配与持续维护。

---

## 许可协议 (License)

本项目文本完全继承官方许可，采用 **[知识共享 署名-相同方式共享 4.0 国际许可协议 (CC-BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)** 进行发布。

你可以自由共享、演绎本作品，甚至用于商业目的，前提是保留原作者与译者的署名，并以相同许可方式分发衍生作品。

---

## 本地预览与调试

本项目基于 Jekyll 4.3+ 与 `just-the-docs` 主题构建：

```bash
# 1. 克隆本仓库
git clone https://github.com/Ascll-Ray/cairn-zh.git
cd cairn-zh

# 2. 安装依赖并启动本地 Jekyll 服务
bundle install
bundle exec jekyll serve
```

或使用 Python 快速伺服已编译的 `_site` 产物：
```bash
py -m http.server 8080 -d _site
```

---

## 勘误与社区反馈

本规则站处于持续维护状态。如果你在阅读中发现任何错别字、行文不畅、断链或术语争议，非常欢迎通过以下渠道交流与反馈：

1. **GitHub Issues**：在本项目提交 [New Issue](https://github.com/Ascll-Ray/cairn-zh/issues)；
2. **Pull Requests**：直接提交修正补丁；
3. **官方社区**：前往 [Cairn 官方 Discord](https://discord.gg/cairn) 的 `#translations` 讨论频道交流。
