# Releasing and versioning (Forgejo + WordPress)

## Goals

- **Semantic versioning** (`MAJOR.MINOR.PATCH`), starting at **4.0.0** for this fork’s first maintained line.
- **One build artifact** (installable ZIP) produced on every push to **`main`**, using the version in **`package.json`** (same name as `npm run zip`: `jquery-pin-it-button-for-images-<version>.zip`).
- **Forgejo Actions** (see `.forgejo/workflows/build-main.yaml`) uploads that ZIP as a **workflow artifact** on the Actions run for that commit.

Your Forgejo server must have **Actions enabled** for the repo and at least one **runner** whose label matches `runs-on` in the workflow (default: `docker`). If your runner uses another label (e.g. `ubuntu`), edit the workflow file.

The workflow installs **`zip`** on first use if the job image is Debian/Alpine/Fedora-like; if your image is minimal and uses something else, bake `zip` into the runner image or extend the install step.

**Artifacts:** the workflow uses **`actions/upload-artifact@v3`** because Forgejo (and GHES) do not support the v4+ artifact backend; do not bump that action to v4 unless your Forgejo release docs say otherwise.

**Artifact upload `ENOTFOUND` for your Forgejo hostname:** job containers often cannot resolve **Tailscale-only** (`*.ts.net`) names. Fix **runner** DNS, `container.options` / `--add-host`, or Forgejo internal URL settings — see **`docs/forgejo-actions-networking.md`**.

## Where the version lives

| Location | Role |
|----------|------|
| **`package.json` → `"version"`** | **Source of truth** for the ZIP filename (`npm run zip`). |
| **`plugin/jquery-pin-it-button-for-images.php`** | `Version:` header (WordPress reads this) + `JPIBFI_VERSION` fallback string. |
| **`plugin/readme.txt` → `Stable tag:`** | WordPress.org-style readme; should match the plugin zip you ship. |

After changing **`package.json`**, run:

```bash
npm run sync-version
```

That runs `scripts/sync-version-from-package.mjs` to align the PHP header and readme. Then commit all touched files together.

## First release as 4.0.0

1. Ensure **`package.json`**, plugin **`Version:`**, readme **`Stable tag:`**, and changelog are all **4.0.0** (they should be already, or run `npm run sync-version` once).
2. Merge to **`main`**.
3. Confirm the **Actions** run on `main` succeeds and download the **artifact** ZIP from the run UI.
4. **Optional but recommended:** create a git tag so you can point releases at commits:
   ```bash
   git checkout main && git pull
   git tag -a v4.0.0 -m "Release 4.0.0"
   git push origin v4.0.0
   ```
   In Forgejo you can then attach the same ZIP to a **Release** for `v4.0.0` if you want a stable download URL (artifacts expire or are less visible than Releases, depending on settings).

## Bumping the version later

**Patch** (bugfixes, e.g. 4.0.0 → 4.0.1):

```bash
npm version patch --no-git-tag-version   # bumps package.json only
npm run sync-version
# edit plugin/readme changelog (= 4.0.1 =)
git add package.json package-lock.json plugin/jquery-pin-it-button-for-images.php plugin/readme.txt
git commit -m "chore(release): 4.0.1"
```

**Minor** (4.0.x → 4.1.0): use `npm version minor --no-git-tag-version` instead.

Then merge to **`main`**; CI will produce **`jquery-pin-it-button-for-images-4.0.1.zip`** (or whatever version you set).

If you prefer **git-tag-driven** versions later, you can adopt `npm version patch` *with* tags (`git push --follow-tags`) and teach CI to read the tag—optional follow-up.

## Changelog

Add a **`= X.Y.Z =`** block under `== Changelog ==` in **`plugin/readme.txt`** for each release users should notice.

## Compatibility line

Update **`Tested up to:`** in **`plugin/readme.txt`** when you smoke-test on a new WordPress release.
