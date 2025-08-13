'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';

interface PostmanSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostmanSetupGuide({ isOpen, onClose }: PostmanSetupGuideProps) {
  const [copied, setCopied] = useState(false);

  const copyApiKeyInstructions = () => {
    const instructions = `1. Go to https://www.postman.com and sign in
2. Click your profile picture → Settings
3. Click "API Keys" in the left sidebar
4. Click "Generate API Key"
5. Name it "LLM Prompt Lab" and select your workspace
6. Copy the generated key and add to your .env.local file:
   POSTMAN_API_KEY=your_key_here`;
    
    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Set Up Postman Integration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Why Set Up Postman Integration?</h3>
                <p className="text-blue-700 text-sm mt-1">
                  With Postman API integration, collections are created directly in your workspace instead of downloading files. 
                  This provides a seamless experience with automatic environment setup and team sharing.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Step-by-Step Setup:</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span className="text-gray-700">Go to <a href="https://www.postman.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1"><span>postman.com</span><ExternalLink className="w-3 h-3" /></a> and sign in</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span className="text-gray-700">Click your profile picture in the top-right corner</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span className="text-gray-700">Select "Settings" from the dropdown menu</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <span className="text-gray-700">Click "API Keys" in the left sidebar</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">5</span>
                <span className="text-gray-700">Click "Generate API Key"</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">6</span>
                <span className="text-gray-700">Configure the key:</span>
              </div>
              
              <div className="ml-9 space-y-1">
                <div className="text-sm text-gray-600">• Name: "LLM Prompt Lab"</div>
                <div className="text-sm text-gray-600">• Workspace: Select your preferred workspace</div>
                <div className="text-sm text-gray-600">• Permissions: "Read & Write"</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">7</span>
                <span className="text-gray-700">Copy the generated key and add it to your <code className="bg-gray-100 px-1 rounded text-sm">.env.local</code> file</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Environment Variable:</h4>
              <button
                onClick={copyApiKeyInstructions}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Instructions</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-sm bg-white border border-gray-300 rounded px-2 py-1 block">
              POSTMAN_API_KEY=your_generated_api_key_here
            </code>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ What You'll Get:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Collections created directly in your Postman workspace</li>
              <li>• Automatic environment setup with API key placeholders</li>
              <li>• Pre-configured test scripts for response validation</li>
              <li>• Team sharing capabilities</li>
              <li>• No manual file downloads or imports</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <a
            href="https://www.postman.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Go to Postman</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
