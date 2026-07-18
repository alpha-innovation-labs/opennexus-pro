# Update only mirrored third-party Nexus vendor extensions.
# Usage: just update-vendor
# Example: just update-vendor

update-vendor:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags
