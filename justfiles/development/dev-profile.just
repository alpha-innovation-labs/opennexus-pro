# Run the dev startup path twice to confirm whether bundled extension registration changes
# the startup CPU spike. Each run enables Nexus startup profiling and snapshots the log.
# Usage: just dev-profile [APP_ARGS...]
# Example: just dev-profile --help

dev-profile *APP_ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    PROFILE_DIR="${NEXUS_PROFILE_DIR:-$PWD/.nexus/startup-profiles}"
    RUN_ID="$(date +%Y%m%d-%H%M%S)"
    RUN_DIR="${PROFILE_DIR}/${RUN_ID}"
    STARTUP_LOG="/tmp/nexus-startup-profile.log"

    mkdir -p "${RUN_DIR}"

    if [ "{{APP_ARGS}}" != "" ]; then
        ARGS=( {{APP_ARGS}} )
    else
        ARGS=( --help )
    fi

    run_profile() {
        local label="$1"
        shift

        echo ""
        echo "🚀 ${label}"
        echo "   Command: just dev -- --startup-profile ${ARGS[*]}"

        /usr/bin/time -l "$@" just dev -- --startup-profile "${ARGS[@]}" \
            >"${RUN_DIR}/${label}.stdout" \
            2>"${RUN_DIR}/${label}.stderr"

        cp "${STARTUP_LOG}" "${RUN_DIR}/${label}.startup-profile.log"
    }

    run_profile baseline env
    run_profile no-bundled-extensions env NEXUS_DISABLE_BUNDLED_EXTENSIONS=1

    echo ""
    echo "✅ Startup confirmation artifacts:"
    echo " 1. ${RUN_DIR}/baseline.stderr"
    echo " 2. ${RUN_DIR}/baseline.startup-profile.log"
    echo " 3. ${RUN_DIR}/no-bundled-extensions.stderr"
    echo " 4. ${RUN_DIR}/no-bundled-extensions.startup-profile.log"
    echo ""
    echo "Compare the user/sys time in the two *.stderr files."
    echo "If they stay close, the spike is from eager dev-time module loading, not enabled extension registration."
