// next.config.mjs
import unTypiaNext from '@ryoppippi/unplugin-typia/next';

/** @type {import('next').NextConfig} */
const nextConfig = { /* your next.js config */};

/** @type {import("unplugin-typia").Options} */
const unpluginTypiaOptions = { /* your unplugin-typia options */ };

export default unTypiaNext(nextConfig, unpluginTypiaOptions);
