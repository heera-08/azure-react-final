import React, { useState } from 'react';
import FileValidationAgent from './components/agents/FileValidationAgent';
import LLMConversionAgent from './components/agents/LLMConversionAgent';
import ApprovalAgent from './components/agents/ApprovalAgent';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [convertedYaml, setConvertedYaml] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFile({
        name: selectedFile.name,
        size: selectedFile.size,
        content: content,
      });
      setValidationResult(null);
      setConvertedYaml('');
      setCurrentStep(1);
    };
    reader.readAsText(selectedFile);
  };

  const handleValidationComplete = (result) => {
    setValidationResult(result);
    if (result.isValid) {
      setCurrentStep(2);
    }
  };

  const handleConversionComplete = (yaml) => {
    setConvertedYaml(yaml);
    if (yaml && !yaml.startsWith('Error')) {
      setCurrentStep(5);
    }
  };

  const handleApprove = () => {
    console.log('Pipeline approved');
    setCurrentStep(6);
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'in-progress';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#124E66';
      case 'in-progress': return '#748D92';
      case 'pending': return '#D3D9D4';
      default: return '#D3D9D4';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  const acceptedFileTypes = '.groovy,.xml,Jenkinsfile';

  const steps = [
    { name: 'Import Jenkinsfile', agent: 'File Import Agent' },
    { name: 'Validate Jenkins Schema', agent: 'Jenkins Validation Agent' },
    { name: 'Generate Azure DevOps YAML using Button at the end', agent: 'YAML Generation Agent' },
    { name: 'Validate YAML', agent: 'YAML Validation Agent' },
    { name: 'Evaluate YAML with LLM', agent: 'LLM Evaluation Agent' },
    { name: 'Awaiting Human Approval', agent: 'Human Approval Gate' },
    { name: 'Deploy to Azure', agent: 'Azure Deployment Agent' }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#212A31' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#D3D9D4' }}>
            Jenkins to Azure DevOps Pipeline Converter
          </h1>
          <p className="text-lg" style={{ color: '#748D92' }}>
            Automated pipeline conversion using LangGraph agents
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-12">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            style={{ 
              borderColor: file ? '#124E66' : '#748D92',
              backgroundColor: '#2E3944'
            }}
          >
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span 
                  className="text-white px-8 py-3 rounded-lg transition-colors inline-block font-medium text-lg"
                  style={{ backgroundColor: '#124E66' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#748D92'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#124E66'}
                >
                  Import Jenkins File
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm mb-2" style={{ color: '#D3D9D4' }}>
              Supported file types: Jenkinsfile, .groovy, .xml
            </p>
            {file && (
              <p className="mt-4 text-sm font-medium" style={{ color: '#124E66' }}>
                ✓ {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#D3D9D4' }}>
            Pipeline Conversion Progress
          </h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const statusColor = getStatusColor(status);
              
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg transition-all"
                  style={{ 
                    backgroundColor: '#2E3944',
                    border: `1px solid ${status === 'in-progress' ? '#124E66' : '#748D92'}`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: statusColor }}
                    >
                      {status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#D3D9D4' }}>
                        {step.name}
                      </h3>
                      <p className="text-sm" style={{ color: '#748D92' }}>
                        Agent: {step.agent}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: statusColor,
                      color: status === 'pending' ? '#2E3944' : 'white'
                    }}
                  >
                    Status: {getStatusText(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Components */}
        <div className="space-y-6" style={{ backgroundColor: '#2E3944', padding: '24px', borderRadius: '8px' }}>
          <FileValidationAgent 
            file={file} 
            onValidationComplete={handleValidationComplete} 
          />

          {validationResult && (
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: validationResult.isValid ? '#124E66' : '#748D92',
                color: 'white'
              }}
            >
              <div className="font-medium mb-2">
                {validationResult.isValid 
                  ? 'Jenkins file validation completed successfully' 
                  : 'Jenkins file validation found issues'}
              </div>
              
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-sm mb-1">Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-1">Warnings:</p>
                  <ul className="list-disc list-inside text-sm opacity-90">
                    {validationResult.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <LLMConversionAgent
            fileContent={file?.content}
            isValid={validationResult?.isValid}
            onConversionComplete={handleConversionComplete}
          />

          <ApprovalAgent 
            convertedYaml={convertedYaml} 
            onApprove={handleApprove} 
          />
        </div>

        {/* YAML Output */}
        {convertedYaml && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#D3D9D4' }}>
              Converted Azure DevOps YAML
            </h3>
            <textarea
              value={convertedYaml}
              readOnly
              className="w-full h-64 p-4 border rounded-lg font-mono text-sm resize-none"
              style={{
                backgroundColor: '#2E3944',
                borderColor: '#748D92',
                color: '#D3D9D4'
              }}
              placeholder="The converted YAML will appear here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;