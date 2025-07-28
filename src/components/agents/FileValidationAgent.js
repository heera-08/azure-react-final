import React, { useState, useEffect } from 'react';

const FileValidationAgent = ({ file, onValidationComplete }) => {
  const [isValidating, setIsValidating] = useState(false);

  const validateJenkinsFile = (content, filename) => {
    setIsValidating(true);
    
    setTimeout(() => {
      const errors = [];
      const warnings = [];

      if (filename.toLowerCase().includes('jenkinsfile') || filename.endsWith('.groovy')) {
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
        if (content.includes('pipeline') && !content.includes('steps')) {
          warnings.push('No step definitions found in pipeline stages');
        }
        if (!content.includes('checkout') && !content.includes('git')) {
          warnings.push('No source code checkout detected');
        }
      } else if (filename.endsWith('.xml')) {
        if (!content.includes('<project>') && !content.includes('<flow-definition>')) {
          errors.push('Invalid Jenkins XML - missing project or flow-definition root element');
        }
        if (!content.includes('<builders>') && !content.includes('<script>')) {
          warnings.push('No build steps or script found in XML configuration');
        }
        if (!content.includes('<scm>') && !content.includes('<definition>')) {
          warnings.push('No source control management configuration found');
        }
      }

      if (content.trim().length === 0) {
        errors.push('File appears to be empty');
      }
      
      if (content.length > 50000) {
        warnings.push('File size is quite large - consider breaking into smaller components');
      }

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings
      };

      onValidationComplete(result);
      setIsValidating(false);
    }, 1200);
  };

  useEffect(() => {
    if (file && file.content) {
      validateJenkinsFile(file.content, file.name);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: isValidating ? '#748D92' : '#124E66' }}
        >
          {isValidating ? '...' : 'V'}
        </div>
        <span className="font-medium" style={{ color: '#D3D9D4' }}>
          Jenkins Validation Agent
        </span>
      </div>
      
      <div className="text-sm" style={{ color: '#748D92' }}>
        {isValidating ? 'Analyzing Jenkins file...' : 'Validation complete'}
      </div>
    </div>
  );
};

export default FileValidationAgent;