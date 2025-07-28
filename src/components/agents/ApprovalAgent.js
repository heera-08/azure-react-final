import React, { useState } from 'react';

const ApprovalAgent = ({ convertedYaml, onApprove }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleApprove = async () => {
    if (!convertedYaml || convertedYaml.startsWith('Error')) return;
    
    setIsDownloading(true);
    
    try {
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
      if (onApprove) {
        onApprove();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!convertedYaml || convertedYaml.startsWith('Error')) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: isApproved ? '#124E66' : '#748D92' }}
        >
          {isApproved ? '✓' : 'A'}
        </div>
        <span className="font-medium" style={{ color: '#D3D9D4' }}>
          Human Approval Gate
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {isApproved && (
          <span className="text-sm" style={{ color: '#124E66' }}>
            Pipeline approved
          </span>
        )}
        
        <button
          onClick={handleApprove}
          disabled={isDownloading || isApproved}
          className="px-4 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isApproved ? '#748D92' : '#124E66',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (!isDownloading && !isApproved) {
              e.target.style.backgroundColor = '#2E3944';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDownloading && !isApproved) {
              e.target.style.backgroundColor = '#124E66';
            }
          }}
        >
          {isDownloading ? 'Downloading...' : isApproved ? 'Downloaded' : 'Approve & Download'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalAgent;