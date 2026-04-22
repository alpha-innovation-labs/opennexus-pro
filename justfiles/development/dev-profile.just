# Run just dev with full-session Node CPU profiling and print the generated profile files.
# Usage: just dev-profile [APP_ARGS...]
# Example: just dev-profile --resume

dev-profile *APP_ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    PROFILE_DIR="${NEXUS_PROFILE_DIR:-$PWD/.nexus/cpu-profiles}"
    RUN_ID="$(date +%Y%m%d-%H%M%S)"
    MARKER_FILE="${PROFILE_DIR}/.${RUN_ID}.start"

    mkdir -p "${PROFILE_DIR}"
    touch "${MARKER_FILE}"

    export NODE_OPTIONS="--cpu-prof --cpu-prof-dir=${PROFILE_DIR}${NODE_OPTIONS:+ ${NODE_OPTIONS}}"

    echo "🚀 Starting just dev with CPU profiling"
    echo "📁 Profiles will be written under ${PROFILE_DIR}"
    echo "🛑 Quit the dev app normally to finish profiling"

    if [ "{{APP_ARGS}}" != "" ]; then
        npm run dev -- {{APP_ARGS}}
    else
        npm run dev
    fi

    PROFILE_FILES="$(find "${PROFILE_DIR}" -type f -name '*.cpuprofile' -newer "${MARKER_FILE}" | sort)"
    rm -f "${MARKER_FILE}"

    if [ -z "${PROFILE_FILES}" ]; then
        echo "❌ No CPU profile files were generated"
        exit 1
    fi

    echo ""
    echo "✅ CPU profile files:"
    while IFS= read -r profile_file; do
        [ -z "${profile_file}" ] && continue
        echo " - ${profile_file}"
    done <<< "${PROFILE_FILES}"
