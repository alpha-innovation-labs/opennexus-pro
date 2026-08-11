/** @type {import('next').NextConfig} */
const nextConfig = {
	allowedDevOrigins: ["127.0.0.1"],
	output: "export",
	trailingSlash: true,
	productionBrowserSourceMaps: false,
};

export default nextConfig;
