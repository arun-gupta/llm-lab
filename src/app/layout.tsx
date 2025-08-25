import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postman Labs - Advanced Platform for GraphRAG, Protocol Comparison, and MCP Integration",
  description: "Advanced platform for GraphRAG development, protocol comparison, model monitoring, and MCP integration. Test REST, GraphQL, gRPC, WebSocket, and SSE protocols.",
  keywords: ["GraphRAG", "MCP", "Postman", "protocol comparison", "gRPC", "GraphQL", "WebSocket", "SSE", "model monitoring", "AI", "development"],
  authors: [{ name: "Postman Labs Team" }],
  openGraph: {
    title: "Postman Labs",
    description: "Advanced platform for GraphRAG development, protocol comparison, model monitoring, and MCP integration",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
