# Build playground/chats.json from pi and nexus agent session files.
# Usage: just chat-build [ARGS...]
# Example: just chat-build
# Example: just chat-build --source pi
# Example: just chat-build --output /tmp/chats.json

[positional-arguments]
chat-build *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    npx tsx playground/build-chats.ts "$@"
