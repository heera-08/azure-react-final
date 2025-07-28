import React, { useState } from 'react';

const LLMConversionAgent = ({ fileContent, isValid, onConversionComplete }) => {
  const [isConverting, setIsConverting] = useState(false);

  const callGeminiAPI = async () => {
    if (!fileContent || !isValid) return;

    setIsConverting(true);
    
    try {
      const prompt = `Convert this Jenkins pipeline to Azure DevOps YAML format. Please provide only the YAML output without explanations:

${fileContent}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
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
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from conversion service');
      }

      const convertedContent = data.candidates[0]?.content?.parts[0]?.text || 'No conversion result available';
      onConversionComplete(convertedContent);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage = `Conversion Error: ${error.message}\n\nPlease verify your API configuration and network connection.`;
      onConversionComplete(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: '#124E66' }}
        >
          Y
        </div>
        <span className="font-medium" style={{ color: '#D3D9D4' }}>
          YAML Generation Agent
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {isConverting && (
          <span className="text-sm" style={{ color: '#748D92' }}>
            Converting pipeline...
          </span>
        )}
        
        <button
          onClick={callGeminiAPI}
          disabled={!fileContent || !isValid || isConverting}
          className="px-4 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (!fileContent || !isValid || isConverting) ? '#748D92' : '#124E66',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (fileContent && isValid && !isConverting) {
              e.target.style.backgroundColor = '#2E3944';
            }
          }}
          onMouseLeave={(e) => {
            if (fileContent && isValid && !isConverting) {
              e.target.style.backgroundColor = '#124E66';
            }
          }}
        >
          {isConverting ? 'Converting...' : 'Generate YAML'}
        </button>
      </div>
    </div>
  );
};

export default LLMConversionAgent;