# Font Book Online

A modern, fast, and private font viewer for designers and developers. Preview and manage your local fonts directly in the browser.

![Font Book Online](public/og-image.png)

## Features

- 🔍 **Local Font Preview**: Browse and preview all fonts installed on your system
- 🎨 **Style Showcase**: View font styles, weights, and variations
- ⚡ **Fast & Private**: Your fonts stay local - no data leaves your browser
- 🖼️ **Glyph Panel**: Examine individual characters and font details
- ⌨️ **Keyboard Shortcuts**: Quick navigation and font management
- 🌙 **Dark Mode**: Automatic theme switching based on system preferences
- ⭐ **Favorites**: Mark and organize your favorite fonts
- 💾 **Persistent Storage**: Your preferences are saved locally

## Roadmap

- [ ] **Localization**: Multi-language support for global accessibility
- [ ] **Search**: Search for fonts by name, style, or other attributes
- [ ] **Braille Fallback**: Support for braille font rendering and accessibility features
- [ ] **Edit Text**: Edit text displayed in the font preview
- [ ] **Grid View**: Alternative layout option for viewing multiple fonts simultaneously
- [ ] **Integration Tests**:  Test suite for ensuring reliable functionality

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Components**: [@base-ui-components/react](https://github.com/base-ui-components/react)
- **State Management**: [Valtio](https://github.com/pmndrs/valtio)
- **Font Access**: [Local Font Access API](https://developer.mozilla.org/en-US/docs/Web/API/Local_Font_Access_API)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Animation**: [Rive](https://rive.app/)
- **Storage**: [Y.js](https://github.com/yjs/yjs) with IndexedDB persistence



## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm package manager

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

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Browser Support

Font Book Online requires a browser that supports the Local Font Access API. Currently supported in:

- Chrome/Chromium-based browsers (version 87+)
- Edge (version 87+)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by [Julio Merisio](https://juliomerisio.com)

## Acknowledgments

- Built with [Base UI Components](https://github.com/base-ui-components/react)
- Inspired by [Apple Font Book](https://support.apple.com/en-mz/guide/font-book/welcome/mac)
- Thanks to [localfonts.xyz](https://localfonts.xyz/) by [Guglieri](https://guglieri.com/)
- Built using the [Local Font Access API](https://wicg.github.io/local-font-access/)

### Further Reading
- [Anatomy of the Letterform](https://pangrampangram.com/blogs/journal/anatomy-of-the-letterform)
- [The Elements of Typographic Style](https://archive.org/details/the-elements-of-typographic-style-robert-bringhurst-z-lib.org) by Robert Bringhurst
- [Abstract: The Art of Design - Jonathan Hoefler](https://www.dailymotion.com/video/x8kgp1c) on Typeface Design