#!/usr/bin/env python3
"""Probe stroydocs.com wind rose page and fetch city data."""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIMATE = ROOT / "api" / "internal" / "analytics" / "data" / "climate_snip.json"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main() -> None:
    html = fetch("https://stroydocs.com/info/e_veter")
    print("html_len", len(html))

    scripts = re.findall(r'<script[^>]+src="([^"]+)"', html)
    print("scripts:")
    for s in scripts:
        print(" ", s)

    inline = re.findall(r"<script[^>]*>([\s\S]*?)</script>", html)
    for i, block in enumerate(inline):
        if any(k in block.lower() for k in ("veter", "ajax", "city", "gorod", "rose", "fetch")):
            print(f"\n--- inline script {i} ({len(block)} chars) ---")
            print(block[:3000])

    # try common endpoints
    candidates = [
        "https://stroydocs.com/info/e_veter/data",
        "https://stroydocs.com/api/e_veter",
        "https://stroydocs.com/e_veter/data.json",
        "https://stroydocs.com/info/e_veter/cities",
        "https://stroydocs.com/js/e_veter.js",
    ]
    for url in candidates:
        try:
            body = fetch(url)
            print(f"\nOK {url} len={len(body)}")
            print(body[:500])
        except Exception as e:
            print(f"FAIL {url}: {e}")

    data = json.loads(CLIMATE.read_text(encoding="utf-8"))
    names = [s["name"] for s in data["settlements"]]
    print(f"\nsettlements: {len(names)}")
    print("sample:", names[:5])


if __name__ == "__main__":
    main()
