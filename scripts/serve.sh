#!/usr/bin/env bash
# Static server for the Vitall site on 3021.
# Registered as :3021 in ../_infra/endpoints.csv; supervised as proj-vitall.service.
#
# Serves site/ only — not the project root — so docs, scripts and logs are
# never reachable over the tailnet.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec python3 -m http.server 3021 --bind 0.0.0.0 --directory "$REPO_DIR/site"
