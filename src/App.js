import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import FileValidationAgent from './components/agents/FileValidationAgent';
import LLMConversionAgent from './components/agents/LLMConversionAgent';
import ApprovalAgent from './components/agents/ApprovalAgent';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [convertedYaml, setConvertedYaml] = useState('');

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFile({
        name: selectedFile.name,
        size: selectedFile.size,
        content: content
      });
      
      // Reset previous states
      setValidationResult(null);
      setConvertedYaml('');
    };
    reader.readAsText(selectedFile);
  };

  const handleValidationComplete = (result) => {
    setValidationResult(result);
  };

  const handleConversionComplete = (yaml) => {
    setConvertedYaml(yaml);
  };

  const handleApprove = () => {
    console.log('Pipeline approved by approval agent');
  };

  const acceptedFileTypes = '.groovy,.xml,Jenkinsfile';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Jenkins to Azure DevOps automation</h1>
        <p className="text-blue-100">AI Agents Pipeline: File → Validation → LLM Conversion → Approval</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center hover:border-blue-400 transition-colors">
       
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
              Choose File
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
        <p className="text-sm text-gray-600">
          Supported files: Jenkinsfile, .groovy, .xml
        </p>
        {file && (
          <p className="mt-2 text-sm text-blue-600 font-medium">
            <FileText className="inline h-4 w-4 mr-1" />
            {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </div>

      {/* AI Agents Pipeline */}
      <div className="space-y-4 mb-6">
        
        {/* File Validation Agent */}
        <FileValidationAgent 
          file={file} 
          onValidationComplete={handleValidationComplete}
        />

        {/* Validation Results Display */}
        {validationResult && (
          <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center mb-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                {validationResult.isValid ? 'File validation passed' : 'File validation failed'}
              </span>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div className="mb-2">
                <p className="text-red-700 font-medium text-sm">Errors:</p>
                <ul className="list-disc list-inside text-red-600 text-sm">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <p className="text-yellow-700 font-medium text-sm">Warnings:</p>
                <ul className="list-disc list-inside text-yellow-600 text-sm">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
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

        {/* Approval Agent */}
        <ApprovalAgent 
          convertedYaml={convertedYaml}
          onApprove={handleApprove}
        />
      </div>

      {/* Converted Results Display */}
      {convertedYaml && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">📄 Converted Azure DevOps YAML:</h3>
          <textarea
            value={convertedYaml}
            readOnly
            className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
            placeholder="Converted YAML will appear here..."
          />
        </div>
      )}

    
      
    </div>
  );
}

export default App;