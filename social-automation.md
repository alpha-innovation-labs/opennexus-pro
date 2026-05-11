# Social Automation Mini-App Plan

## Objective

Build a Nexus mini-app named `social-automation` that can be invoked as:

```bash
nexus social-automation ...
```

The mini-app tracks social sources passed at runtime, persists deduped items into SQLite, and prepares YouTube audio artifacts for later transcription and summarization workflows.

## Scope

### In scope for the first implementation

- Add a bundled mini-app exposed through `nexus social-automation`.
- Support Twitter/X account timeline ingestion through Nitter RSS.
- Support YouTube channel upload ingestion through public YouTube RSS feeds.
- Persist all fetched records in SQLite under:

```text
~/.local/share/nexus/social-automation/db.sqlite
```

- Deduplicate Twitter items by status ID.
- Deduplicate YouTube uploads by video ID.
- Download YouTube audio-only files with `yt-dlp`.
- Store downloaded audio files under:

```text
~/.local/share/nexus/social-automation/audio/<videoId>/
```

- Accept accounts and channels as CLI parameters, not hardcoded watchlists.
- Provide machine-readable command output for automation use.
- Add deterministic e2e coverage with the virtual-terminal harness.

### Explicitly out of scope for the first implementation

- Transcribing YouTube audio.
- Summarizing tweets or videos.
- Building a dashboard UI.
- Managing a persistent watchlist inside the mini-app.
- Posting, replying, liking, or reposting to X/Twitter.
- OAuth-based YouTube Data API fetching.
- Authenticated X/Twitter API fetching.

## Command Design

Use subcommands because the Twitter and YouTube flows have different parameters and future behavior.

### Root help

```bash
nexus social-automation --help
```

Shows available methods:

```text
nexus social-automation twitter fetch --account <handle> [--account <handle> ...]
nexus social-automation youtube fetch --channel <url-or-handle> [--channel <url-or-handle> ...]
nexus social-automation status
```

### Twitter fetch

```bash
nexus social-automation twitter fetch \
  --account badlogicgames \
  --account anotherHandle
```

Optional flags:

```text
--db <path>                 Override SQLite path.
--nitter-base <url>         Default: https://nitter.net
--limit <number>            Optional max number of items to store per account.
--json                      Emit JSON summary.
```

Default behavior:

- Normalize handles by removing any leading `@`.
- Fetch `https://nitter.net/<handle>/rss`.
- Parse RSS items.
- Classify each item:
  - `repost` if title starts with `RT by @<handle>:`.
  - `reply` if title starts with `R to @`.
  - `post` otherwise.
- Insert with conflict-ignore semantics.
- Report fetched, inserted, skipped duplicate, and failed counts.

### YouTube fetch

```bash
nexus social-automation youtube fetch \
  --channel https://www.youtube.com/@NateBJones \
  --channel https://www.youtube.com/@t3dotgg
```

Optional flags:

```text
--db <path>                 Override SQLite path.
--audio-dir <path>          Override audio artifact directory.
--no-download-audio         Store metadata only.
--max-downloads <number>    Cap audio downloads per channel; default 5.
--yt-dlp-path <path>        Override yt-dlp binary path.
--youtube-feed-base <url>   Test/fixture override for feed fetching.
--youtube-page-base <url>   Test/fixture override for handle resolution.
--json                      Emit JSON summary.
```

Default behavior:

- Accept `https://www.youtube.com/@handle`, `@handle`, or channel URLs.
- Resolve a channel RSS feed.
- Fetch the public YouTube RSS feed.
- Parse recent uploads.
- Insert upload metadata with conflict-ignore semantics.
- For newly inserted videos, download audio-only using `yt-dlp`, capped by `--max-downloads`.
- Store the final verified audio path in SQLite.
- Report channels checked, videos fetched, inserted, skipped duplicate, downloaded, and failed counts.

## Input Validation

- Twitter accepts bare handles, `@handle`, `https://x.com/<handle>`, `https://twitter.com/<handle>`, and Nitter profile URLs.
- Twitter rejects empty values and handles outside `^[A-Za-z0-9_]{1,15}$`.
- YouTube accepts `@handle`, `https://www.youtube.com/@handle`, `https://www.youtube.com/channel/<UC...>`, and direct `UC...` channel IDs.
- YouTube rejects arbitrary hosts, playlist URLs, video URLs, and empty values.
- Duplicate inputs are allowed but deduplication still happens at SQLite insert time.

## JSON and Exit Semantics

JSON summaries must include requested source count, fetched count, inserted count, duplicate skipped count, and per-source failures.

Exit policy:

- `0`: at least one requested source succeeded.
- `1`: validation failed or every requested source failed.
- Audio download failures are reported as source failures unless metadata was intentionally fetched with `--no-download-audio`.

## Storage

### Database path

Default:

```text
~/.local/share/nexus/social-automation/db.sqlite
```

The mini-app must create the parent directory and initialize schema automatically. Data directories should be created with user-only permissions where the runtime supports it.

### Table: `twitter_posts`

```sql
CREATE TABLE IF NOT EXISTS twitter_posts (
  source TEXT NOT NULL,
  account TEXT NOT NULL,
  status_id TEXT NOT NULL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('post', 'reply', 'repost')),
  author TEXT,
  posted_at TEXT,
  url TEXT,
  content TEXT NOT NULL,
  raw_title TEXT NOT NULL,
  raw_description TEXT,
  fetched_at TEXT NOT NULL
);
```

Recommended indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_twitter_posts_account_posted_at
ON twitter_posts(account, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_twitter_posts_type
ON twitter_posts(type);
```

### Table: `youtube_uploads`

```sql
CREATE TABLE IF NOT EXISTS youtube_uploads (
  source TEXT NOT NULL,
  channel_input TEXT NOT NULL,
  channel_title TEXT,
  channel_url TEXT,
  channel_id TEXT,
  video_id TEXT NOT NULL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'short', 'unknown')),
  title TEXT NOT NULL,
  published_at TEXT,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  audio_file_path TEXT,
  audio_downloaded_at TEXT,
  fetched_at TEXT NOT NULL
);
```

Recommended indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_youtube_uploads_channel_published_at
ON youtube_uploads(channel_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_youtube_uploads_audio_file_path
ON youtube_uploads(audio_file_path);
```

### Table: `fetch_runs`

A small run ledger helps debug automations and future dashboards.

```sql
CREATE TABLE IF NOT EXISTS fetch_runs (
  id TEXT NOT NULL PRIMARY KEY,
  method TEXT NOT NULL CHECK (method IN ('twitter', 'youtube')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial_failure', 'failure')),
  input_json TEXT NOT NULL,
  summary_json TEXT,
  error TEXT
);
```

## Twitter/Nitter Fetching Details

Primary endpoint:

```text
https://nitter.net/<handle>/rss
```

Parsing fields:

- `item/title` -> raw title and normalized content.
- `item/description` -> raw HTML description.
- `item/guid` -> status ID.
- `item/link` -> Nitter URL; optionally convert to `https://x.com/...` for stored canonical URL.
- `item/pubDate` -> posted timestamp.
- `dc:creator` -> author.

Deduplication:

```sql
INSERT INTO twitter_posts (...) VALUES (...) ON CONFLICT(status_id) DO NOTHING;
```

Failure handling:

- A failed account should not fail every other account.
- The command exits non-zero only if every requested account fails.
- Partial failures are reported in JSON and stored in `fetch_runs`.

## YouTube RSS Fetching Details

Preferred source for first implementation: public RSS.

Known public feed form:

```text
https://www.youtube.com/feeds/videos.xml?channel_id=<channelId>
```

For `@handle` URLs, implementation needs a resolver:

1. Fetch the public channel page.
2. Extract a channel ID from page metadata or embedded JSON.
3. Build the RSS feed URL from the channel ID.
4. Fetch and parse RSS entries.

RSS fields to store:

- `yt:videoId` -> video ID.
- `yt:channelId` -> channel ID.
- `title` -> video title.
- `link href` or derived watch URL -> video URL.
- `published` -> published timestamp.
- `author/name` -> channel title.
- `author/uri` -> channel URL when available.

Deduplication:

```sql
INSERT INTO youtube_uploads (...) VALUES (...) ON CONFLICT(video_id) DO NOTHING;
```

## YouTube Audio Download

Use the Nexus Pro-inspired approach, but change output location from a temp directory to the mini-app data directory.

Nexus Pro currently downloads with:

```bash
yt-dlp --audio-format mp3 --extract-audio --no-playlist --output <template> <videoUrl>
```

Social Automation should use:

```text
~/.local/share/nexus/social-automation/audio/<videoId>/<videoId>.<ext>
```

Implementation must spawn `yt-dlp` with an argv array via `execFile`/`spawn`, never through a shell. It must validate video IDs, constrain output paths under the configured audio root, and verify the final file exists before updating SQLite.

Recommended command shape:

```bash
yt-dlp \
  --audio-format mp3 \
  --extract-audio \
  --no-playlist \
  --output "~/.local/share/nexus/social-automation/audio/<videoId>/<videoId>.%(ext)s" \
  "https://www.youtube.com/watch?v=<videoId>"
```

Download policy:

- Download only newly inserted videos by default.
- Cap downloads with `--max-downloads`, defaulting to 5 per channel.
- If a row exists but `audio_file_path` is missing, a future repair command may download it.
- If the audio file path exists on disk, skip download.
- Store download failures in command summary and `fetch_runs`.

## Future Transcription Plan

Do not implement transcription in the first mini-app version.

When added, reuse the Nexus Pro Superwhisper technique:

1. Open downloaded audio with the macOS Superwhisper app.
2. Snapshot existing recording IDs from:

```text
~/Documents/superwhisper/recordings
```

3. Poll for a new recording directory.
4. Read `meta.json`.
5. Extract transcript text from `result`, `rawResult`, or joined segment text.
6. Persist transcript text, language, recording ID, and extracted timestamp.

Future table:

```sql
CREATE TABLE IF NOT EXISTS youtube_transcripts (
  video_id TEXT NOT NULL PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'failed')),
  text TEXT,
  language_code TEXT,
  superwhisper_recording_id TEXT,
  extracted_at TEXT NOT NULL,
  error TEXT,
  FOREIGN KEY(video_id) REFERENCES youtube_uploads(video_id) ON DELETE CASCADE
);
```

## Mini-App Integration

Follow the existing mini-app pattern under `packages/mini-apps`.

Expected structure:

```text
packages/mini-apps/src/social-automation/
  command/
    manifest.ts
    runSocialAutomationCommand.ts
    createSocialAutomationUsageText.ts
    twitter/runTwitterFetchCommand.ts
    youtube/runYoutubeFetchCommand.ts
    status/runSocialAutomationStatusCommand.ts
  core/
    paths/getSocialAutomationRootPath.ts
    paths/getSocialAutomationDbPath.ts
    paths/getSocialAutomationAudioRootPath.ts
    storage/initializeSocialAutomationSchema.ts
    storage/openSocialAutomationDatabase.ts
    storage/insertTwitterPost.ts
    storage/insertYoutubeUpload.ts
    twitter/fetchTwitterAccounts.ts
    twitter/parseNitterRssItems.ts
    twitter/classifyTwitterItem.ts
    youtube/resolveYoutubeChannelFeed.ts
    youtube/parseYoutubeFeedItems.ts
    youtube/downloadYoutubeAudio.ts
```

Do not create a nested `packages/mini-apps/social-automation/package.json`; this repo uses one `@nexus/mini-apps` package.

Register the mini-app in `packages/mini-apps/src/registry/getMiniAppManifests.ts`, add `other.social-automation` to `feature-flags.json`, and regenerate compiled feature flags so the root CLI routes:

```bash
nexus social-automation ...
```

## Automation Usage Examples

Hourly Twitter ingestion:

```bash
nexus automations create "hourly mario twitter fetch" \
  --schedule "every 1h" \
  --cwd "$HOME" \
  --prompt "Run nexus social-automation twitter fetch --account badlogicgames --json"
```

Hourly YouTube ingestion:

```bash
nexus automations create "hourly youtube fetch" \
  --schedule "every 1h" \
  --cwd "$HOME" \
  --prompt "Run nexus social-automation youtube fetch --channel https://www.youtube.com/@NateBJones --channel https://www.youtube.com/@ThePrimeTimeagen --channel https://www.youtube.com/@atmoio --channel https://www.youtube.com/@t3dotgg --json"
```

## E2E Coverage Requirements

This project requires deterministic e2e coverage for new features.

Required e2e cases:

1. `nexus social-automation --help` shows the mini-app command help.
2. `twitter fetch` with a fixture RSS response creates `twitter_posts` rows.
3. Running `twitter fetch` twice does not duplicate rows.
4. `youtube fetch` with a fixture RSS response creates `youtube_uploads` rows.
5. Running `youtube fetch` twice does not duplicate rows.
6. YouTube audio download invokes `yt-dlp` through a controlled fixture/stub command and stores `audio_file_path`.
7. Partial source failures are reported and do not erase successful inserts.
8. Invalid Twitter/YouTube inputs return non-zero with a clear error.
9. Missing or stubbed `yt-dlp` behavior is deterministic and does not hit the network.
10. Custom `--db`, `--audio-dir`, and fixture URL flags are honored.

Tests must use the virtual-terminal harness and deterministic local fixtures. Do not add non-e2e tests.

## Operational Risks

### Nitter reliability

Public Nitter instances may rate-limit, block, or return empty responses. The CLI should accept `--nitter-base` so users can self-host or switch instances.

### YouTube RSS resolution

Handle-to-channel-ID resolution from public HTML may break if YouTube changes page structure. Keep this logic isolated in one module.

### `yt-dlp` dependency

Audio downloading requires `yt-dlp` on PATH unless `--yt-dlp-path` is passed. The command should detect missing `yt-dlp`, preserve stderr in diagnostics, enforce a timeout, and return a clear error.

### Disk usage

Audio files can grow quickly. A future cleanup command should prune old audio files after transcripts exist.

### Privacy and terms

The mini-app stores local copies of public social content, raw feed descriptions, and YouTube audio artifacts. Documentation must tell users what is stored, where it is stored, and that they are responsible for respecting source-site terms and local retention requirements.

## Done Criteria

- `nexus social-automation twitter fetch --account badlogicgames --json` stores deduped posts.
- `nexus social-automation youtube fetch --channel https://www.youtube.com/@NateBJones --json` stores deduped uploads and downloads audio for new videos.
- Database lives at the default requested path unless overridden.
- No hardcoded accounts or channels exist in the mini-app command behavior.
- E2E tests cover command routing, persistence, dedupe, and audio download behavior.
- Documentation includes command examples and storage locations.
