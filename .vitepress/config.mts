import { defineConfig } from 'vitepress'
import { Theme } from 'vitepress'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blogpost_vitepress/',
  head: [
    // [
    //   'link',
    //   { rel:'preload', href: '/fonts/Outfit-VariableFont_wght.ttf', as: 'font', type: 'font/ttf', crossorigin: 'anonymous' }
    // ],
    [
      'link',
      { rel: 'icon', href: '/mpzlg.svg' }
    ],
  ],
  srcDir: "markdown",
  lang: 'en-US',
  
  title: "Mizumo's Little Blogpost",
  description: "A Blogpost related to tech and writing",
  
  themeConfig: {
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present. Mizumo-prjkt!'
    },
    // https://vitepress.dev/reference/default-theme-config
    logo: '/icons/mpzlg.svg',
    // siteTitle: false,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'MizKernel', link: '/mizkernel/releases' },
      { text: 'Patched GSI', link: '/gsi/patched_gsi'},
      { text: 'News', link: '/news/landing'},
      { text: 'Guides', link: '/guides/guides_landing'}
    ],

    sidebar: [
      {
        text: 'MizKernel',
        items: [
          { text: 'MizKernel Releases', link: '/mizkernel/releases' },
        ]
      },
      {
        text: 'News',
        items: [
          { text: 'News Index', link: '/news/landing' },
          { text: 'December 2025', link: '/news/2025_dec'}
        ]
      },
      {
        text: 'Guides (Under construction!)',
        items: [
          { text: 'Guide Metaindex', link: '/guides/guides_landing'},
          { text: 'How to build a kernel?' },
          { text: 'How to apply patches?' },
          { text: 'How to install GSI on a Samsung Device?' }
        ]
      },
      {
        text: "Prepatched Super Images for Samsung Devices",
        items: [
          { text: 'Files', link: '/gsi/patched_gsi'}
        ]
      },
      {
        text: 'VitePress Documentation Samples (i intended this to be here btw)',
        items: [
          { text: 'Markdown Examples', link: '/examples/markdown-examples' },
          { text: 'Runtime API Examples', link: '/examples/api-examples' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Mizumo-prjkt' }
    ]
  }
})
