#!/usr/bin/env python3
"""Refresh api/internal/analytics/data/climate_snip.json from stroydocs.com."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UPDATER = ROOT / "scripts" / "update_climate_snip_from_stroydocs.py"

raise SystemExit(subprocess.call([sys.executable, str(UPDATER), *sys.argv[1:]]))
