# Forgejo Actions: artifact upload & Tailscale / Docker DNS

## Symptom

`upload-artifact` (or similar) fails with:

```text
Error: getaddrinfo ENOTFOUND mintie.grouse-matrix.ts.net
```

The **step container** can run `npm` and `zip`, but when the action tries to **upload** the artifact it calls your Forgejo HTTP API using the instance hostname from the job environment (often the same as **`ROOT_URL`**). Inside a generic **Docker** job image, **MagicDNS** for `*.ts.net` may not be configured, so the hostname does not resolve.

## Fix (pick one that fits your layout)

### 1. Runner: map hostname to a reachable IP (simplest for same-host Forgejo)

In **Forgejo Runner** `config.yaml`, under `container:`, add Docker options so job containers resolve your Forgejo host:

```yaml
container:
  network: host   # only if acceptable for your security model; skips isolated bridge DNS issues
```

Or keep the default network and add a static host entry (replace the IP with your Forgejo host’s **LAN** or **Tailscale** IP as appropriate):

```yaml
container:
  options: '--add-host=mintie.grouse-matrix.ts.net:100.x.y.z'
```

Use the IP where **HTTP(S) for Forgejo** actually listens. If Forgejo is on the same machine as the runner, `host-gateway` sometimes works for the reverse proxy in front of Forgejo:

```yaml
container:
  options: '--add-host=mintie.grouse-matrix.ts.net:host-gateway'
```

(Exact behavior depends on your Docker version and whether traffic reaches nginx/Forgejo on the host.)

### 2. Runner: use Tailscale DNS inside job containers

If your runner host resolves `mintie.grouse-matrix.ts.net` via Tailscale’s DNS (`100.100.100.100`), configure the runner so **job containers** use that resolver (Forgejo runner’s `container.options` / custom network). Details depend on your runner version; see [Forgejo Runner installation](https://forgejo.org/docs/latest/admin/actions/runner-installation/) (`container` / `options`).

### 3. Forgejo: internal vs public URL (Gitea/Forgejo pattern)

Some setups need Forgejo to advertise an **internal** base URL for Actions callbacks while browsers still use **`ROOT_URL`**. See discussion: [Gitea issue #35619](https://github.com/go-gitea/gitea/issues/35619) (`PUBLIC_URL_DETECTION`, internal instance URL for runners). Check your Forgejo version’s **admin config cheat sheet** for the supported keys (naming differs between Gitea and Forgejo).

### 4. Workflow workaround (last resort)

Avoid `upload-artifact` and **`curl`** the ZIP to storage you control, or **`scp`** to a known host—only if you cannot fix DNS/network for the official artifact API.

## Verify

From a throwaway workflow:

```yaml
- run: getent hosts mintie.grouse-matrix.ts.net || true
- run: ping -c1 mintie.grouse-matrix.ts.net || true
```

After fixing runner DNS/`add-host`, the upload step should succeed without repo changes.
