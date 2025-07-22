import React, { useState } from 'react';
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
        content: content,
      });
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
    console.log('Pipeline approved');
  };

  const acceptedFileTypes = '.groovy,.xml,Jenkinsfile';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <header className="bg-gradient-to-r from-pink-600 to-pink-400 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-semibold">Jenkins to Azure DevOps Automation</h1>
      </header>

      <section
        className="bg-pink-50 border-2 border-pink-300 rounded-lg p-8 mb-6 text-center hover:border-pink-500 transition-colors"
      >
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors inline-block">
              Select File
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
        <p className="text-sm text-pink-700">
          Supported file types: Jenkinsfile, .groovy, .xml
        </p>
        {file && (
          <p className="mt-2 text-sm text-pink-600 font-medium">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </section>

      <section className="space-y-6 mb-6">
        <FileValidationAgent file={file} onValidationComplete={handleValidationComplete} />

        {validationResult && (
          <div
            className={`p-4 rounded-lg ${
              validationResult.isValid ? 'bg-pink-50 border border-pink-200' : 'bg-pink-100 border border-pink-300'
            }`}
          >
            <div className="mb-2 font-medium text-pink-700">
              {validationResult.isValid
                ? 'The file has been validated successfully.'
                : 'There were issues with the file validation.'}
            </div>

            {validationResult.errors.length > 0 && (
              <div className="mb-2">
                <p className="text-pink-800 font-semibold text-sm">Errors:</p>
                <ul className="list-disc list-inside text-pink-700 text-sm">
                  {validationResult.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div>
                <p className="text-pink-600 font-semibold text-sm">Warnings:</p>
                <ul className="list-disc list-inside text-pink-500 text-sm">
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

        <ApprovalAgent convertedYaml={convertedYaml} onApprove={handleApprove} />
      </section>

      {convertedYaml && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-pink-800">Converted Azure DevOps YAML</h3>
          <textarea
            value={convertedYaml}
            readOnly
            className="w-full h-64 p-4 border border-pink-300 rounded-lg font-mono text-sm bg-pink-50"
            placeholder="The converted YAML will appear here."
          />
        </section>
      )}
    </div>
  );
}

export default App;
