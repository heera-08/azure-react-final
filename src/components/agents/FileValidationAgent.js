import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

const FileValidationAgent = ({ file, onValidationComplete }) => {
  const [isValidating, setIsValidating] = useState(false);

  const validateJenkinsFile = (content, filename) => {
    setIsValidating(true);
    
    // Simulate agent processing time
    setTimeout(() => {
      const errors = [];
      const warnings = [];

      if (filename.toLowerCase().includes('jenkinsfile') || filename.endsWith('.groovy')) {
        // Basic Groovy declarative pipeline validation
        if (!content.includes('pipeline')) {
          errors.push('Missing "pipeline" block - declarative pipeline required');
        }
        if (!content.includes('agent')) {
          warnings.push('Missing "agent" declaration');
        }
        if (!content.includes('stages')) {
          errors.push('Missing "stages" block');
        }
        if (!content.includes('stage(')) {
          warnings.push('No stage definitions found');
        }
      } else if (filename.endsWith('.xml')) {
        // Basic Jenkins XML validation
        if (!content.includes('<project>') && !content.includes('<flow-definition>')) {
          errors.push('Invalid Jenkins XML - missing project or flow-definition root element');
        }
        if (!content.includes('<builders>') && !content.includes('<script>')) {
          warnings.push('No build steps or script found in XML');
        }
      }

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings
      };

      onValidationComplete(result);
      setIsValidating(false);
    }, 1000);
  };

  useEffect(() => {
    if (file && file.content) {
      validateJenkinsFile(file.content, file.name);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Bot className="h-5 w-5 text-yellow-600 mr-2" />
        <span className="font-medium text-yellow-800">File Validation Agent</span>
      </div>
      {isValidating ? (
        <p className="text-yellow-700">🔍 Analyzing Jenkins file structure...</p>
      ) : (
        <p className="text-yellow-700">✅ Validation complete</p>
      )}
    </div>
  );
};

export default FileValidationAgent;