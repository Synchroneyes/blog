import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Le blog de Seb & Kev',
  tagline: 'Des articles en lien avec AWS, avec du code source, pas mal non?',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://synchroneyes.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/blog/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'synchroneyes', // Usually your GitHub org/user name.
  projectName: 'blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Seb & Kev',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/docs/intro', label: 'Blog', position: 'left'},
        {to: '/about', label: 'A Propos', position: 'left'},
        {
          href: 'https://github.com/synchroneyes/blog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Blog',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'LinkedIn',
          items: [
            {
              label: 'Sebastien CABARRUS',
              href: 'https://www.linkedin.com/in/s%C3%A9bastien-cabarrus-91816a69/',
            },
            {
              label: 'Kevin MONVOISIN',
              href: 'https://www.linkedin.com/in/kevin-monvoisin/',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sebastien CABARRUS & Kevin MONVOISIN. Construit avec Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
