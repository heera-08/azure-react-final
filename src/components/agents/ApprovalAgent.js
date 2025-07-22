import React, { useState } from 'react';
import { Bot, Download } from 'lucide-react';

const ApprovalAgent = ({ convertedYaml, onApprove }) => {
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = () => {
    if (!convertedYaml || convertedYaml.startsWith('Error')) return;
    
    // Download the converted YAML file
    const blob = new Blob([convertedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'azure-pipeline.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsApproved(true);
    onApprove();
  };

  if (!convertedYaml || convertedYaml.startsWith('Error')) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Bot className="h-5 w-5 text-green-600 mr-2" />
        <span className="font-medium text-green-800">Approval Agent</span>
      </div>
      <div>
        <button
          onClick={handleApprove}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Approve & Download
        </button>
        {isApproved && (
          <p className="text-green-600 font-medium mt-2"> Pipeline approved and downloaded successfully!</p>
        )}
      </div>
    </div>
  );
};

export default ApprovalAgent;