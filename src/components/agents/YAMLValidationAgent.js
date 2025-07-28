import React, { useState, useEffect } from 'react';

const YAMLValidationAgent = ({ convertedYaml, onValidationComplete }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [fixedYaml, setFixedYaml] = useState('');

  const validateYAML = (yamlContent) => {
    if (!yamlContent || yamlContent.startsWith('Error')) return;
    
    setIsValidating(true);
    
    setTimeout(() => {
      const errors = [];
      const warnings = [];
      let autoFixedYaml = yamlContent;


      const lines = yamlContent.split('\n');
      let indentationErrors = [];
      let missingRequiredFields = [];


      if (!yamlContent.includes('trigger:') && !yamlContent.includes('trigger')) {
        missingRequiredFields.push('trigger');
        autoFixedYaml = `trigger:\n- main\n\n${autoFixedYaml}`;
      }

      if (!yamlContent.includes('pool:') && !yamlContent.includes('vmImage')) {
        missingRequiredFields.push('pool/vmImage');
        autoFixedYaml = autoFixedYaml.replace(
          /^/m, 
          `pool:\n  vmImage: 'ubuntu-latest'\n\n`
        );
      }

      if (!yamlContent.includes('jobs:') && !yamlContent.includes('steps:')) {
        missingRequiredFields.push('jobs or steps');
        errors.push('Missing jobs or steps section - required for Azure DevOps pipeline');
      }

      // Validate YAML indentation (basic check)
      lines.forEach((line, index) => {
        if (line.trim() && !line.startsWith('#')) {
          const leadingSpaces = line.length - line.trimStart().length;
          
          // Check for tabs (should use spaces)
          if (line.includes('\t')) {
            indentationErrors.push(`Line ${index + 1}: Uses tabs instead of spaces`);
            autoFixedYaml = autoFixedYaml.replace(/\t/g, '  ');
          }
          
          // Check for inconsistent indentation (not multiple of 2)
          if (leadingSpaces % 2 !== 0) {
            indentationErrors.push(`Line ${index + 1}: Inconsistent indentation (not multiple of 2)`);
          }
        }
      });

      // Check for common Azure DevOps YAML issues
      const commonIssues = [
        {
          pattern: /script:\s*\|\s*$/m,
          fix: (yaml) => yaml.replace(/script:\s*\|\s*$/gm, 'script: |'),
          error: 'Invalid script block syntax'
        },
        {
          pattern: /task:\s*([^@\n]+)$/m,
          fix: (yaml) => yaml.replace(/task:\s*([^@\n]+)$/gm, 'task: $1@2'),
          warning: 'Task missing version specification'
        },
        {
          pattern: /variables:\s*$/m,
          fix: (yaml) => yaml.replace(/variables:\s*$/gm, 'variables:\n  # Add your variables here'),
          warning: 'Empty variables section'
        }
      ];

      commonIssues.forEach(issue => {
        if (issue.pattern.test(yamlContent)) {
          if (issue.error) {
            errors.push(issue.error);
            autoFixedYaml = issue.fix(autoFixedYaml);
          } else if (issue.warning) {
            warnings.push(issue.warning);
            autoFixedYaml = issue.fix(autoFixedYaml);
          }
        }
      });


      missingRequiredFields.forEach(field => {
        warnings.push(`Added missing required field: ${field}`);
      });


      indentationErrors.forEach(error => {
        errors.push(error);
      });


      if (yamlContent.includes('jenkinsfile') || yamlContent.includes('Jenkins')) {
        warnings.push('YAML may contain Jenkins-specific references that need manual review');
      }
      const taskPattern = /task:\s*([^\s@]+)/g;
      let taskMatch;
      const validTasks = [
        'UsePythonVersion', 'NodeTool', 'DotNetCoreCLI', 'Maven', 'Gradle',
        'PowerShell', 'Bash', 'CmdLine', 'PublishTestResults', 'PublishBuildArtifacts',
        'DownloadBuildArtifacts', 'Docker', 'KubernetesManifest'
      ];
      
      while ((taskMatch = taskPattern.exec(yamlContent)) !== null) {
        const taskName = taskMatch[1];
        if (!validTasks.some(validTask => taskName.includes(validTask))) {
          warnings.push(`Unknown or custom task detected: ${taskName} - verify this is a valid Azure DevOps task`);
        }
      }

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings,
        autoFixed: autoFixedYaml !== yamlContent,
        fixedYaml: autoFixedYaml
      };

      setValidationResult(result);
      setFixedYaml(autoFixedYaml);
      onValidationComplete(result);
      setIsValidating(false);
    }, 1500);
  };

  useEffect(() => {
    if (convertedYaml && !convertedYaml.startsWith('Error')) {
      validateYAML(convertedYaml);
    }
  }, [convertedYaml]);

  if (!convertedYaml || convertedYaml.startsWith('Error')) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ 
            backgroundColor: isValidating ? '#748D92' : 
              (validationResult?.isValid ? '#124E66' : '#2E3944')
          }}
        >
          {isValidating ? '...' : validationResult?.isValid ? '✓' : '!'}
        </div>
        <span className="font-medium" style={{ color: '#D3D9D4' }}>
          YAML Validation Agent
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {isValidating && (
          <span className="text-sm" style={{ color: '#748D92' }}>
            Validating YAML structure...
          </span>
        )}
        
        {!isValidating && validationResult && (
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: validationResult.isValid ? '#124E66' : '#748D92',
                color: 'white'
              }}
            >
              {validationResult.errors.length} errors, {validationResult.warnings.length} warnings
            </span>
            
            {validationResult.autoFixed && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: '#124E66',
                  color: 'white'
                }}
              >
                Auto-fixed
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YAMLValidationAgent;
