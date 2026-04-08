#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

DRAFT_RE = re.compile(r"^draft:\s*(true|false)\s*(?:#.*)?$", re.IGNORECASE)


def front_matter_lines(text: str) -> list[str]:
    lines = text.replace("\r\n", "\n").split("\n")
    if not lines or lines[0] != "---":
        return []

    front_matter = []
    for line in lines[1:]:
        if line == "---":
            return front_matter
        front_matter.append(line)

    return []


def is_draft(post_path: Path) -> bool:
    try:
        text = post_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = post_path.read_text(encoding="utf-8-sig")

    for line in front_matter_lines(text):
        match = DRAFT_RE.match(line.strip())
        if match:
            return match.group(1).lower() == "true"

    return False


def sync_posts(source_dir: Path, dest_dir: Path) -> None:
    if not source_dir.is_dir():
        raise SystemExit(f"Source directory not found: {source_dir}")

    dest_dir.mkdir(parents=True, exist_ok=True)

    for existing_post in dest_dir.glob("*.md"):
        existing_post.unlink()

    copied = 0
    skipped = 0

    for post_path in sorted(source_dir.glob("*.md")):
        if is_draft(post_path):
            skipped += 1
            continue

        shutil.copy2(post_path, dest_dir / post_path.name)
        copied += 1

    print(f"Copied {copied} posts to {dest_dir}")
    if skipped:
        print(f"Skipped {skipped} draft posts")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Copy aider blog posts into this Jekyll site without modifying the originals."
    )
    parser.add_argument(
        "source",
        nargs="?",
        default="vendor/aider/website/_posts",
        help="Directory containing the source aider markdown posts.",
    )
    parser.add_argument(
        "dest",
        nargs="?",
        default="docs/_posts/aider",
        help="Destination directory for imported posts.",
    )
    args = parser.parse_args()

    sync_posts(Path(args.source), Path(args.dest))


if __name__ == "__main__":
    main()
