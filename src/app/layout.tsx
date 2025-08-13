import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Prompt Lab - Test and Compare AI Prompts",
  description: "Test and compare prompts across multiple LLM providers including OpenAI, Anthropic, and Ollama. Perfect for prompt engineering and AI experimentation.",
  keywords: ["LLM", "prompts", "prompt engineering", "OpenAI", "Anthropic", "Ollama", "AI", "comparison", "testing"],
  authors: [{ name: "LLM Prompt Lab Team" }],
  openGraph: {
    title: "LLM Prompt Lab",
    description: "Test and compare prompts across multiple LLM providers side by side",
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
