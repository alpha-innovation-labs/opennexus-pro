# Run the dev startup path twice to confirm whether disabling extensions changes
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
        echo "   Command: just dev -- --startup-profile $*"

        /usr/bin/time -l just dev -- --startup-profile "$@" \
            >"${RUN_DIR}/${label}.stdout" \
            2>"${RUN_DIR}/${label}.stderr"

        cp "${STARTUP_LOG}" "${RUN_DIR}/${label}.startup-profile.log"
    }

    NO_EXT_ARGS=( "${ARGS[@]}" )
    if [[ ! " ${NO_EXT_ARGS[*]} " =~ " --no-extensions " ]] && [[ ! " ${NO_EXT_ARGS[*]} " =~ " -ne " ]]; then
        NO_EXT_ARGS=( --no-extensions "${NO_EXT_ARGS[@]}" )
    fi

    run_profile baseline "${ARGS[@]}"
    run_profile no-extensions "${NO_EXT_ARGS[@]}"

    echo ""
    echo "✅ Startup confirmation artifacts:"
    echo " 1. ${RUN_DIR}/baseline.stderr"
    echo " 2. ${RUN_DIR}/baseline.startup-profile.log"
    echo " 3. ${RUN_DIR}/no-extensions.stderr"
    echo " 4. ${RUN_DIR}/no-extensions.startup-profile.log"
    echo ""
    echo "Compare the user/sys time in the two *.stderr files."
    echo "If no-extensions drops the spike, Nexus is now respecting the same flag passed through to Pi."
