# Font Book Online

<p align="center">
  <a href="https://fontbook.online">
    <img src="public/android-chrome-512x512.png" alt="Font Book Online Logo" width="256" />
  </a>
  <h1 align="center" style="text-align: center;">Font Book Online</h1>
</p>

A modern font viewer for your local fonts, built with Next.js. Preview your local fonts in the browser with a fast, private, and easy-to-use interface.

## Features

- 🔍 Preview and explore your local system fonts
- ⭐️ Favorite fonts for quick access
- 🏷️ Organize fonts by family and style
- 📱 PWA support - install as a desktop app
- ⌨️ Keyboard shortcuts for power users
- 🎨 Beautiful UI
- 🏃‍♂️ Fast and efficient font loading
- 🔒 Privacy-focused - all processing happens locally
- 🔍 Search fonts by family, style, and postscript name (all persisted in the URL)
- 🔄 Scroll position restoration between tabs and page reloads

## Browser Compatibility

Font Book Online requires the Local Font Access API, which is currently supported in:

- ✅ Chrome/Chromium-based browsers (version 87+)
- ✅ Edge (version 87+)
- ✅ Opera (version 73+)
- ❌ Firefox (not supported)
- ❌ Safari (not supported)
- ❌ Mobile browsers (not supported)

> **Note**: Due to Local Font Access API limitations, Font Book Online currently works only on desktop browsers that support this API. Mobile support will be added once the API becomes available on mobile platforms.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later
- A supported browser (see Browser Compatibility section)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/juliomerisio/fontbook.online.git
cd fontbook.online
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Keyboard Shortcuts

Font Book Online is designed for keyboard-first navigation:

- `↑/k` - Navigate up
- `↓/j` - Navigate down
- `f` - Toggle favorite
- `t` - Switch between All/Favorites tabs
- `space` - Toggle sort mode (in Favorites)
- `/` - Focus search
- `esc` - Clear search / Exit sort mode / Close panels

## PWA Features

Font Book Online is a Progressive Web App (PWA) that offers:

- 💻 Install as a desktop app
- 🔄 Offline support
- 💨 Fast loading with service worker caching
- 🎯 Native app-like experience

To install:
- **Desktop Chrome/Edge**: Click the install button in your browser's address bar
- **Other browsers**: Installation not available due to Local Font Access API limitations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

<img src="https://github.com/juliomerisio.png" width="100" alt="Julio Merisio" style="border-radius: 50%;" />

**Julio Merisio** — [GitHub](https://github.com/juliomerisio) • [Twitter](https://twitter.com/juliomerisio) • [LinkedIn](https://linkedin.com/in/juliomerisio)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time collaboration powered by [Yjs](https://yjs.dev/)
- UI components from [Base UI Components](https://github.com/juliomerisio/base-ui-components)
- Uses the [Local Font Access API](https://developer.mozilla.org/en-US/docs/Web/API/Local_Font_Access_API)

## Further Reading

- [Anatomy of the Letterform](https://pangrampangram.com/blogs/journal/anatomy-of-the-letterform) - Understanding typography fundamentals
- [The Elements of Typographic Style](https://archive.org/details/the-elements-of-typographic-style-robert-bringhurst-z-lib.org) by Robert Bringhurst - A comprehensive guide to typography
- [Abstract: The Art of Design - Jonathan Hoefler](https://www.dailymotion.com/video/x8kgp1c) - Documentary on typeface design
- [Local Font Access API Explainer](https://github.com/WICG/local-font-access) - Technical details about the API