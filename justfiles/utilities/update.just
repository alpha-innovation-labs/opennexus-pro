# Update mirrored third-party Nexus vendor extensions and package dependencies.
# Usage: just update-vendor
# Example: just update-vendor

update-vendor:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags
    npx npm-check-updates -u
    npm install
