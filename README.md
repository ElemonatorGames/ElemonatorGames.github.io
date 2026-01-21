# Elemonator Games Inc. — Astro Site

Marketing site for Elemonator Games Inc., built with Astro.

## 🚀 Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── blog/
│   │   ├── projects/
│   │   ├── index.astro
│   │   └── co-development.astro
│   └── styles/
└── package.json
```

- **Pages** live in `src/pages/` and map to routes by filename.
- **Static assets** (images, icons) live in `public/`.
- **Global layout** defaults and metadata live in `src/layouts/Base.astro`.

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ✍️ Content Updates

### Add a new project

1. **Create a detail page** in `src/pages/projects/` using the existing pages as a template (e.g., `lightning.astro`).
2. **Update the projects index** at `src/pages/projects/index.astro` by adding a new card with your project title, metadata, summary, and link.
3. **Add imagery** under `public/` and update the project image `<img>` tag to use the new asset.

### Add a new blog post

1. **Create a post page** in `src/pages/blog/` (e.g., `new-post.astro`).
2. **Update the blog index** at `src/pages/blog/index.astro` by adding a new card with the title, date, summary, and link.
3. **Add assets** (if needed) to `public/` and reference them in the post.

### Add or update co-development packages

1. **Update the package cards** in `src/pages/co-development.astro` within the `card-grid` section (title, duration, summary).
2. **Update the modal content** in the `packageDetails` object in the same file so the detailed description, inclusions, and outcomes match the card.
3. **Keep package keys in sync** between the card `data-package` attribute and the `packageDetails` object.

## 🖼️ Assets & Icons

Brand icons placed in `public/icons/` are from **Font Awesome Free** and are used under their license (icons: CC BY 4.0). See https://fontawesome.com/license/free for details.
