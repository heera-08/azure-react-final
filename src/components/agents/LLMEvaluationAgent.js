import React, { useState, useEffect } from 'react';

const LLMEvaluationAgent = ({ validatedYaml, originalJenkinsContent, onEvaluationComplete }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const evaluateYAMLWithLLM = async (yamlContent, jenkinsContent) => {
    if (!yamlContent || yamlContent.startsWith('Error')) return;
    
    setIsEvaluating(true);

    try {
      const prompt = `You are an expert in CI/CD pipelines (Jenkins + Azure DevOps YAML).

Task: Evaluate the conversion of a Jenkins pipeline into Azure DevOps YAML.
 

Original Jenkins Pipeline:
${jenkinsContent}

Converted Azure DevOps YAML:
${yamlContent}

Please evaluate and provide short and concise:
1. QUALITY_SCORE (1-10): Overall conversion quality
2. COMPLETENESS (1-10): How complete is the conversion
3. BEST_PRACTICES (1-10): Adherence to Azure DevOps best practices
4. ISSUES: List any critical issues or missing elements
5. RECOMMENDATIONS: Specific short improvements
6. SUMMARY: Brief overall assessment

Use a **formal, basic vocabulary and technical tone**, as if you are preparing a short review for a DevOps team in a corporate environment.  
Format the structured short response as:
QUALITY_SCORE: X
COMPLETENESS: X  
BEST_PRACTICES: X
ISSUES: 1.issue 1
2.issue 2
RECOMMENDATIONS: 
 - short recommendation 1
 - short recommendation 2
SUMMARY: [brief summary]`;

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
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const evaluationText = data.candidates[0]?.content?.parts[0]?.text || 'No evaluation available';
      
      // Parse the structured response
      const parseEvaluation = (text) => {
        const qualityMatch = text.match(/QUALITY_SCORE:\s*(\d+)/);
        const completenessMatch = text.match(/COMPLETENESS:\s*(\d+)/);
        const bestPracticesMatch = text.match(/BEST_PRACTICES:\s*(\d+)/);
        const issuesMatch = text.match(/ISSUES:\s*(.*?)(?=RECOMMENDATIONS:|SUMMARY:|$)/s);
        const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*(.*?)(?=SUMMARY:|$)/s);
        const summaryMatch = text.match(/SUMMARY:\s*(.*?)$/s);

        return {
          qualityScore: qualityMatch ? parseInt(qualityMatch[1]) : 0,
          completeness: completenessMatch ? parseInt(completenessMatch[1]) : 0,
          bestPractices: bestPracticesMatch ? parseInt(bestPracticesMatch[1]) : 0,
          issues: issuesMatch ? issuesMatch[1].trim() : 'No issues identified',
          recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : 'No recommendations',
          summary: summaryMatch ? summaryMatch[1].trim() : 'No summary available',
          rawEvaluation: text
        };
      };

      const evaluation = parseEvaluation(evaluationText);
      
      // Calculate overall score
      const overallScore = Math.round((evaluation.qualityScore + evaluation.completeness + evaluation.bestPractices) / 3);
      
      const result = {
        ...evaluation,
        overallScore,
        passed: overallScore >= 7 
      };

      setEvaluationResult(result);
      onEvaluationComplete(result);
      
    } catch (error) {
      console.error('LLM Evaluation Error:', error);
      const errorResult = {
        qualityScore: 0,
        completeness: 0,
        bestPractices: 0,
        overallScore: 0,
        passed: false,
        issues: `Evaluation failed: ${error.message}`,
        recommendations: 'Please check API configuration and try again',
        summary: 'Evaluation could not be completed',
        rawEvaluation: `Error: ${error.message}`
      };
      setEvaluationResult(errorResult);
      onEvaluationComplete(errorResult);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (validatedYaml && originalJenkinsContent && !validatedYaml.startsWith('Error')) {
      evaluateYAMLWithLLM(validatedYaml, originalJenkinsContent);
    }
  }, [validatedYaml, originalJenkinsContent]);

  if (!validatedYaml || validatedYaml.startsWith('Error')) return null;

  const getScoreColor = (score) => {
    if (score >= 8) return '#124E66'; // Excellent
    if (score >= 6) return '#748D92'; // Good
    return '#2E3944'; // Needs improvement
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ 
              backgroundColor: isEvaluating ? '#748D92' : 
                (evaluationResult?.passed ? '#124E66' : '#2E3944')
            }}
          >
            {isEvaluating ? '...' : evaluationResult?.passed ? '✓' : 'E'}
          </div>
          <span className="font-medium" style={{ color: '#D3D9D4' }}>
            LLM Evaluation Agent
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEvaluating && (
            <span className="text-sm" style={{ color: '#748D92' }}>
              Evaluating conversion quality...
            </span>
          )}
          
          {!isEvaluating && evaluationResult && (
            <div className="flex items-center space-x-2">
              <span 
                className="text-sm px-2 py-1 rounded"
                style={{
                  backgroundColor: getScoreColor(evaluationResult.overallScore),
                  color: 'white'
                }}
              >
                Score: {evaluationResult.overallScore}/10
              </span>
              
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: evaluationResult.passed ? '#124E66' : '#748D92',
                  color: 'white'
                }}
              >
                {evaluationResult.passed ? 'Passed' : 'Needs Review'}
              </span>
            </div>
          )}
        </div>
      </div>

      {evaluationResult && !isEvaluating && (
        <div 
          className="p-4 rounded-lg space-y-3"
          style={{ backgroundColor: '#2E3944' }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: getScoreColor(evaluationResult.qualityScore) }}
              >
                {evaluationResult.qualityScore}/10
              </div>
              <div className="text-xs" style={{ color: '#748D92' }}>Quality</div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: getScoreColor(evaluationResult.completeness) }}
              >
                {evaluationResult.completeness}/10
              </div>
              <div className="text-xs" style={{ color: '#748D92' }}>Completeness</div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: getScoreColor(evaluationResult.bestPractices) }}
              >
                {evaluationResult.bestPractices}/10
              </div>
              <div className="text-xs" style={{ color: '#748D92' }}>Best Practices</div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: '#D3D9D4' }}>
                Summary
              </h4>
              <p className="text-sm" style={{ color: '#748D92' }}>
                {evaluationResult.summary}
              </p>
            </div>

            {evaluationResult.issues !== 'No issues identified' && (
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: '#D3D9D4' }}>
                  Issues
                </h4>
                <p className="text-sm" style={{ color: '#748D92' }}>
                  {evaluationResult.issues}
                </p>
              </div>
            )}

            {evaluationResult.recommendations !== 'No recommendations' && (
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: '#D3D9D4' }}>
                  Recommendations
                </h4>
                <p className="text-sm" style={{ color: '#748D92' }}>
                  {evaluationResult.recommendations}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMEvaluationAgent;
