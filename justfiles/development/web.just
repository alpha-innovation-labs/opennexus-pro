# Start the landing page web app and open it in the default browser.
# Usage: just web [PORT]
# Example: just web 4321

web PORT="4321":
    #!/usr/bin/env bash
    set -euo pipefail

    URL="http://localhost:{{PORT}}"
    echo "🌐 Starting Nexus landing page at ${URL}"

    (
        for _ in {1..80}; do
            if curl -fsS "${URL}" >/dev/null 2>&1; then
                if command -v open >/dev/null 2>&1; then
                    open "${URL}"
                elif command -v xdg-open >/dev/null 2>&1; then
                    xdg-open "${URL}" >/dev/null 2>&1 || true
                else
                    echo "Open ${URL} in your browser."
                fi
                exit 0
            fi
            sleep 0.25
        done

        echo "Timed out waiting for ${URL}."
    ) &

    PORT="{{PORT}}" npm --workspace landing-page run dev
