# Update mirrored third-party Nexus vendor extensions and package dependencies.
# Usage: just update
# Example: just update

update:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags
    npx npm-check-updates -u
    npm install
