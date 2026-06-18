#!/usr/bin/env python3
"""Regenerate api/internal/analytics/data/climate_snip.json"""
import json
import subprocess
import sys
from pathlib import Path

# Re-run inline generator via sibling script logic
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "api" / "internal" / "analytics" / "data" / "climate_snip.json"

# Delegate to one-liner: read existing if present, else fail
SRC = ROOT / "api" / "data" / "climate_snip.json"
if SRC.exists():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(SRC.read_text(encoding="utf-8"), encoding="utf-8")
    print("copied", OUT)
    sys.exit(0)

print("Run from repo root after updating generator", file=sys.stderr)
sys.exit(1)
