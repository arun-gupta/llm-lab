import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Explorer Playground - Compare LLM APIs",
  description: "Compare responses from multiple LLM providers including OpenAI, Anthropic, Cohere, and Mistral. Perfect for DevRel teams and API testing.",
  keywords: ["LLM", "API", "OpenAI", "Anthropic", "Cohere", "Mistral", "comparison", "testing"],
  authors: [{ name: "API Explorer Team" }],
  openGraph: {
    title: "API Explorer Playground",
    description: "Compare responses from multiple LLM providers side by side",
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
