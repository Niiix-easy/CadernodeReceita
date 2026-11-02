import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            manifest: {
                name: "Caderno de Receitas",
                short_name: "CadernoRec",
                description: "Aplicativo de receitas, dicas de saúde e sabão artesanal.",
                theme_color: "#E28B6E",
                background_color: "#FDFBF7",
                display: "standalone",
                start_url: "/",
                scope: "/",
                icons: [
                    { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" }
                ]
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
