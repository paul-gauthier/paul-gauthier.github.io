#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

API_BASE = "https://hacker-news.firebaseio.com/v0"
HN_BASE = "https://news.ycombinator.com"
SLUG_RE = re.compile(r"[^a-z0-9]+")


def fetch_json(url: str) -> Any:
    request = Request(url, headers={"User-Agent": "sync_hn_comments.py"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def fetch_user(username: str) -> dict[str, Any]:
    data = fetch_json(f"{API_BASE}/user/{username}.json")
    if not isinstance(data, dict):
        raise SystemExit(f"Hacker News user not found: {username}")
    return data


def fetch_item(item_id: int, cache: dict[int, dict[str, Any] | None]) -> dict[str, Any] | None:
    if item_id not in cache:
        data = fetch_json(f"{API_BASE}/item/{item_id}.json")
        cache[item_id] = data if isinstance(data, dict) else None
    return cache[item_id]


def item_url(item_id: int) -> str:
    return f"{HN_BASE}/item?id={item_id}"


def slugify(text: str) -> str:
    slug = SLUG_RE.sub("-", text.lower()).strip("-")
    return slug[:80].rstrip("-") or "hn-comment"


def yaml_quote(text: str) -> str:
    return "'" + text.replace("'", "''") + "'"


def get_root_story(comment: dict[str, Any], cache: dict[int, dict[str, Any] | None]) -> dict[str, Any] | None:
    current = comment
    seen: set[int] = set()

    while True:
        item_type = current.get("type")
        if item_type in {"story", "poll"}:
            return current

        parent_id = current.get("parent")
        if not isinstance(parent_id, int) or parent_id in seen:
            return None

        seen.add(parent_id)
        parent = fetch_item(parent_id, cache)
        if parent is None:
            return None

        current = parent


def get_story_url(story: dict[str, Any]) -> str:
    story_url = story.get("url")
    if isinstance(story_url, str) and story_url:
        return story_url

    story_id = story.get("id")
    if isinstance(story_id, int):
        return item_url(story_id)

    return HN_BASE


def get_comments(
    username: str, cache: dict[int, dict[str, Any] | None]
) -> tuple[str, list[dict[str, Any]]]:
    user = fetch_user(username)
    user_id = str(user.get("id") or username)
    submitted = user.get("submitted")
    if not isinstance(submitted, list):
        return user_id, []

    comments = []

    for item_id in submitted:
        if not isinstance(item_id, int):
            continue

        item = fetch_item(item_id, cache)
        if item is None:
            continue

        if item.get("type") != "comment":
            continue
        if item.get("by") != user_id:
            continue
        if item.get("deleted") or item.get("dead"):
            continue

        comments.append(item)

    comments.sort(key=lambda item: (int(item.get("time", 0)), int(item.get("id", 0))))
    return user_id, comments


def build_post_text(username: str, comment: dict[str, Any], story: dict[str, Any] | None) -> str:
    comment_id = int(comment["id"])
    timestamp = int(comment.get("time", 0))
    date_text = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S %z")

    story_id = story.get("id") if story else None
    story_title = str(story.get("title") or "") if story else ""
    story_url = get_story_url(story) if story is not None else ""
    story_thread_url = item_url(story_id) if isinstance(story_id, int) else ""

    if story_title:
        title = f"HN comment on: {story_title}"
    else:
        title = f"HN comment #{comment_id}"

    lines = [
        "---",
        f"title: {yaml_quote(title)}",
        f"date: {date_text}",
        f"canonical_url: {item_url(comment_id)}",
        f"hn_comment_id: {comment_id}",
        f"hn_username: {yaml_quote(username)}",
    ]

    if isinstance(story_id, int):
        lines.append(f"hn_story_id: {story_id}")
    if story_title:
        lines.append(f"hn_story_title: {yaml_quote(story_title)}")
    if story_url:
        lines.append(f"hn_story_url: {yaml_quote(story_url)}")

    lines.extend(["---", ""])

    body = [f'<p><a href="{escape(item_url(comment_id), quote=True)}">View comment on Hacker News</a>']
    if story_thread_url:
        body.append(f' · <a href="{escape(story_thread_url, quote=True)}">View story thread</a>')
    if story_url and story_url != story_thread_url:
        body.append(f' · <a href="{escape(story_url, quote=True)}">Original story</a>')
    body.append("</p>")

    if story_title:
        body.append(f"<p><strong>Context:</strong> {escape(story_title)}</p>")

    comment_html = str(comment.get("text") or "").strip()
    body.append('<div class="hn-comment">')
    body.append(comment_html or "<p><em>No comment text available.</em></p>")
    body.append("</div>")

    lines.extend(body)
    lines.append("")

    return "\n".join(lines)


def sync_comments(username: str, dest_dir: Path) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)

    for existing_post in dest_dir.glob("*.md"):
        existing_post.unlink()

    cache: dict[int, dict[str, Any] | None] = {}
    user_id, comments = get_comments(username, cache)

    copied = 0

    for comment in comments:
        comment_id = int(comment["id"])
        timestamp = datetime.fromtimestamp(int(comment.get("time", 0)), tz=timezone.utc)
        story = get_root_story(comment, cache)
        story_title = str(story.get("title") or "") if story else ""
        filename = (
            f"{timestamp.strftime('%Y-%m-%d')}-hn-comment-{comment_id}-"
            f"{slugify(story_title or f'comment-{comment_id}')}.md"
        )

        post_text = build_post_text(user_id, comment, story)
        (dest_dir / filename).write_text(post_text, encoding="utf-8")
        copied += 1

    print(f"Copied {copied} HN comments to {dest_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Copy Hacker News comments into this Jekyll site as imported posts."
    )
    parser.add_argument(
        "username",
        help="Hacker News username to import comments from.",
    )
    parser.add_argument(
        "dest",
        nargs="?",
        default="docs/_posts/hn",
        help="Destination directory for imported comment posts.",
    )
    args = parser.parse_args()

    sync_comments(args.username, Path(args.dest))


if __name__ == "__main__":
    main()
