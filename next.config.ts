import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	// Parent directories have their own package-lock.json; without this, Turbopack
	// resolves CSS packages from the wrong workspace root and the app won't boot.
	turbopack: {
		root: projectRoot,
	},
};

export default nextConfig;
