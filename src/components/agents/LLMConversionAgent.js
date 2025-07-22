import React, { useState } from 'react';
import { Bot } from 'lucide-react';

const LLMConversionAgent = ({ fileContent, isValid, onConversionComplete }) => {
  const [isConverting, setIsConverting] = useState(false);

  const callGeminiAPI = async () => {
    if (!fileContent || !isValid) return;

    setIsConverting(true);
    
    try {
      const prompt = `Convert this Jenkins pipeline to Azure DevOps YAML format. Please provide only the YAML output without explanations:

${fileContent}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const convertedContent = data.candidates[0]?.content?.parts[0]?.text || 'No conversion result';
      onConversionComplete(convertedContent);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      onConversionComplete(`Error calling Gemini API: ${error.message}\n\nPlease check your API key and try again.`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Bot className="h-5 w-5 text-purple-600 mr-2" />
        <span className="font-medium text-purple-800">LLM Conversion Agent</span>
      </div>
      {isValid ? (
        <div>
          <button
            onClick={callGeminiAPI}
            disabled={isConverting}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConverting ? '🤖 Converting with Gemini...' : '🔄 Start Conversion'}
          </button>
          {isConverting && (
            <p className="text-purple-700 mt-2">⚡ AI agent is converting Jenkins to Azure DevOps...</p>
          )}
        </div>
      ) : (
        <p className="text-purple-700">⏳ Waiting for valid file...</p>
      )}
    </div>
  );
};

export default LLMConversionAgent;