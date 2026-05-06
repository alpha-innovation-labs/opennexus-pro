# Update mirrored third-party Nexus vendor extensions
update:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags

# Alias for updating mirrored third-party Nexus vendor extensions
update-vendor:
    just update
