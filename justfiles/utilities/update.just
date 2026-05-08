# Update mirrored third-party Nexus vendor extensions and package dependencies
update:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags
    npx npm-check-updates -u
    npm install

# Update only mirrored third-party Nexus vendor extensions
update-vendor:
    node scripts/vendor/updateVendorExtensions.mjs
    npm run generate:feature-flags
