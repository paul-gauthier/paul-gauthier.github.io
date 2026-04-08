# Personal blog

This is a Jekyll-based personal blog with support for importing articles from the aider blog.

## Imported aider posts

Imported aider posts live in `_posts/aider/`.

Posts in that directory automatically get metadata from `_config.yml` so the site can:

- use the normal `post` layout
- show a note that the article was originally published on `aider.chat`
- link readers back to the original article and the aider blog homepage

The original article link is resolved like this:

1. use `canonical_url` if the post defines it
2. otherwise use `https://aider.chat{{ page.url }}`

## Local development

Typical workflow:

```bash
python scripts/sync_aider_blog.py
bundle exec jekyll serve
```

By default, the sync script reads posts from:

```text
vendor/aider/website/_posts
```

and copies them to:

```text
_posts/aider
```

You can also pass custom source and destination directories on the command line.

## Sync script behavior

`scripts/sync_aider_blog.py` currently:

- copies `*.md` posts from the source directory
- skips posts marked `draft: true`
- removes existing `*.md` files from the destination before copying
- preserves the original markdown contents without editing them

## Current limitations

The importer currently only copies markdown posts.

Some aider posts may also require:

- assets from `/assets/...`
- Jekyll includes from `_includes/`
- data files from `_data/`

Those are not synced yet.

Root-relative links such as `/docs/...` or `/HISTORY.html` will also need special handling if they should keep pointing at `aider.chat`.

## Repository layout

- `_posts/aider/` — imported aider posts
- `_layouts/` — site layouts
- `scripts/sync_aider_blog.py` — import helper
- `vendor/` — optional local copy of aider source content
