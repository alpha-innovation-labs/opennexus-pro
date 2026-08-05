# Update mirrored third-party Nexus vendor extensions and package dependencies.
# Usage: just upgrade-vendors
# Example: just upgrade-vendors

upgrade-vendors:
    node scripts/vendor/updateVendorExtensions.mjs
    npx npm-check-updates -u
    pnpm install
