#!/usr/bin/env python3
"""Bundle the site into one self-contained file: portfolio-single.html.

Handy for pasting into Emergent or hosting anywhere. Run: python3 build.py
"""
import re
from pathlib import Path

root = Path(__file__).parent
html = (root / "index.html").read_text()
css = (root / "styles.css").read_text()
data = (root / "data.js").read_text()
app = (root / "app.js").read_text()

html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
html = html.replace('<script src="data.js"></script>', f"<script>\n{data}\n</script>")
html = html.replace('<script src="app.js"></script>', f"<script>\n{app}\n</script>")
assert 'href="styles.css"' not in html and 'src="app.js"' not in html and 'src="data.js"' not in html

out = root / "portfolio-single.html"
out.write_text(html)
print(f"wrote {out.name} ({len(html) / 1024:.0f} KB)")
