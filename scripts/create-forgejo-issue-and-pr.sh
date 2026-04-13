#!/usr/bin/env bash
# Create a Forgejo issue, then open a PR that references it (Closes #N).
#
# Usage:
#   cp .env.local.example .env.local   # once; edit and set FORGEJO_TOKEN
#   ./scripts/create-forgejo-issue-and-pr.sh
#
# Or: export FORGEJO_TOKEN='…' for a single shell session.
#
# Optional overrides:
#   FORGEJO_API_ROOT  default https://mintie.grouse-matrix.ts.net/forgejo/api/v1
#   FORGEJO_REPO      default doug/jquery-pin-it-button-for-images

set -euo pipefail

REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
if [[ -f "${REPO_ROOT}/.env.local" ]]; then
	set -a
	# shellcheck disable=SC1090
	source "${REPO_ROOT}/.env.local"
	set +a
fi

API_ROOT="${FORGEJO_API_ROOT:-https://mintie.grouse-matrix.ts.net/forgejo/api/v1}"
REPO="${FORGEJO_REPO:-doug/jquery-pin-it-button-for-images}"
: "${FORGEJO_TOKEN:?Set FORGEJO_TOKEN (Forgejo web UI → Applications → access token with repo + issue permissions)}"

AUTH=( -H "Authorization: token ${FORGEJO_TOKEN}" -H 'Content-Type: application/json' )

read -r -d '' ISSUE_BODY <<'EOF' || true
## Summary

Track hardening and testability work for modern WordPress-style deployments.

## Scope (completed on branch `feat/hardening-and-tests`)

- **Uninstall:** Delete `jpibfi_advanced_options` in `uninstall.php` so settings do not linger after removal.
- **Version:** `JPIBFI_VERSION` is read from the plugin file header via `get_file_data()` so script/style versions stay aligned with the declared `Version`.
- **Content filter:** New `JPIBFI_Content_Image_Pin_Attributes` class; `preg_replace_callback` injects `data-jpibfi-*` per `<img>` match so duplicate identical image tags are not all rewritten like the old `str_replace` loop.
- **Robustness:** Safer handling when `global $post` is missing during the filter.
- **Tests:** Composer + PHPUnit, `tests/bootstrap.php` minimal WP stubs, `tests/php/ContentImagePinAttributesTest.php`, and `npm run test:php`.
- **Docs / hygiene:** `BUILD.md` PHP/Composer notes; `.gitignore` for `/vendor/`, `/.cursor/`, `.phpunit.result.cache`.

## Verification

- [ ] `composer install && npm run test:php`
- [ ] `npm run zip` → upload in WordPress → Pin It hover still works
EOF

ISSUE_TITLE='Hardening: uninstall, version source, safe img injection, PHPUnit'

ISSUE_PAYLOAD=$( jq -n --arg title "$ISSUE_TITLE" --arg body "$ISSUE_BODY" '{title:$title, body:$body}' )

echo "Creating issue…"
ISSUE_RESPONSE=$( curl -sS -X POST "${API_ROOT}/repos/${REPO}/issues" "${AUTH[@]}" -d "$ISSUE_PAYLOAD" )
ISSUE_NUMBER=$( echo "$ISSUE_RESPONSE" | jq -r '.number // empty' )
if [[ -z "$ISSUE_NUMBER" || "$ISSUE_NUMBER" == 'null' ]]; then
	echo "Failed to create issue. Response:" >&2
	echo "$ISSUE_RESPONSE" | jq . >&2 || echo "$ISSUE_RESPONSE" >&2
	exit 1
fi

ISSUE_URL=$( echo "$ISSUE_RESPONSE" | jq -r '.html_url' )
echo "Issue: $ISSUE_URL"

read -r -d '' PR_BODY <<EOF || true
Closes #${ISSUE_NUMBER}

## Summary

Implements the work described in #${ISSUE_NUMBER}.

## Test plan

- [ ] \`composer install && npm run test:php\`
- [ ] \`npm run zip\` → install in WordPress → hover Pin It on a post image
EOF

PR_TITLE='feat: hardening, PHPUnit, and per-match img pin attributes'

PR_PAYLOAD=$( jq -n \
	--arg title "$PR_TITLE" \
	--arg body "$PR_BODY" \
	--arg head 'feat/hardening-and-tests' \
	--arg base 'main' \
	'{title:$title, body:$body, head:$head, base:$base}' )

echo "Creating pull request…"
PR_RESPONSE=$( curl -sS -X POST "${API_ROOT}/repos/${REPO}/pulls" "${AUTH[@]}" -d "$PR_PAYLOAD" )
PR_URL=$( echo "$PR_RESPONSE" | jq -r '.html_url // empty' )
if [[ -z "$PR_URL" || "$PR_URL" == 'null' ]]; then
	echo "Failed to create pull request. Response:" >&2
	echo "$PR_RESPONSE" | jq . >&2 || echo "$PR_RESPONSE" >&2
	exit 1
fi

echo "Pull request: $PR_URL"
echo
echo "Done. The PR body includes: Closes #${ISSUE_NUMBER}"
