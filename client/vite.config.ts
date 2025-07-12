import { defineConfig, PluginOption } from "vite"; // Import PluginOption
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [
    react(),
  ];

  if (mode === 'development') {
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins, // Use the constructed plugins array
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
