import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

const sidebarPath = new URL('./src/sidebar.json', import.meta.url);
const sidebarConfig = fs.existsSync(sidebarPath)
  ? JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
  : [
      { label: 'Core Rules', autogenerate: { directory: 'rules' } },
      { label: 'Community & License', autogenerate: { directory: 'community' } },
    ];

// 多语言国际化扩展接口
const enableI18n = true;

const i18nConfig = {
  defaultLocale: 'root',
  locales: {
    root: { label: '简体中文', lang: 'zh-CN' },
  },
};

// 可选轻量分析探针配置 (Zero-Cookie / Privacy-First)
const analyticsHead = [];
if (process.env.PLAUSIBLE_DOMAIN) {
  analyticsHead.push({
    tag: 'script',
    attrs: {
      defer: true,
      'data-domain': process.env.PLAUSIBLE_DOMAIN,
      src: 'https://plausible.io/js/script.js',
    },
  });
}
if (process.env.CF_BEACON) {
  analyticsHead.push({
    tag: 'script',
    attrs: {
      defer: true,
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      'data-cf-beacon': `{"token": "${process.env.CF_BEACON}"}`,
    },
  });
}

export default defineConfig({
  redirects: {
    '/second-edition/players-guide/': '/players-guide/',
    '/second-edition/wardens-guide/': '/wardens-guide/',
    '/second-edition/adventures/cas-1/': '/adventures/first-party/cas-1/',
    '/second-edition/': '/',
  },
  site: process.env.SITE_URL || 'https://zh.cairnrpg.com',
  integrations: [
    starlight({
      title: process.env.SRD_TITLE || 'Cairn 第二版规则参考',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/cairn-theme.css', './src/styles/ttrpg-patch.css'],
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:locale', content: 'zh_CN' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:site_name', content: 'Cairn 第二版规则参考' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/site.webmanifest' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: '/og-image.png' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: '/og-image.png' },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/dice-roller.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/lightbox.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/search-ux.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/bestiary-filter.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/site-ux.js', defer: true },
        },
        ...analyticsHead,
      ],
      ...i18nConfig,
      sidebar: sidebarConfig,
    }),
    sitemap(),
  ],
});
