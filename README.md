# Personal blog

This is a Jekyll-based personal blog with support for importing articles from the aider blog.

## Shareable, unlisted articles

To share an article before listing it on the homepage, create a normal post in
`docs/_posts/` and add `unlisted: true` to its YAML front matter:

```yaml
---
title: My draft article
date: 2026-09-25
unlisted: true
---
```

The article is built at its normal URL, omitted from the homepage, and given a
`<meta name="robots" content="noindex">` tag asking search engines not to index it.
Anyone with the link can read and forward it; unlisted articles are not private.
Keep these posts out of `_drafts/` and do not set `published: false`, since those
options prevent them from being included in a normal build.

Remove `unlisted: true` or set it to `false` to list the article on the homepage
and allow indexing, without changing its URL. Avoid changing the filename or date
if you want to preserve that URL.

The test article is `docs/_posts/2026-09-25-unlisted-test.md`, with the URL
`https://paulg.info/2026/09/25/unlisted-test/` after deployment.

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
