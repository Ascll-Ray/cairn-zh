import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
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

export default defineConfig({
  site: 'https://zh.cairnrpg.com',
  redirects: {
    '/second-edition/players-guide/': '/players-guide/',
    '/second-edition/wardens-guide/': '/wardens-guide/',
    '/second-edition/adventures/cas-1/': '/adventures/first-party/cas-1/',
    '/second-edition/': '/',
  },
  integrations: [
    starlight({
      title: process.env.SRD_TITLE || 'Cairn 第二版规则参考',
      customCss: ['./src/styles/cairn-theme.css'],
      head: [
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
      ],
      ...i18nConfig,
      sidebar: sidebarConfig,
    }),
  ],
});
