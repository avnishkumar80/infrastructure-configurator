import React from 'react';
import { useMCPIntegration } from '../hooks/useMCPIntegration';

/**
 * Simple debug component to inspect MCP tools data
 */
export const MCPToolsDebug = () => {
  const { isConnected, availableTools, connectionError } = useMCPIntegration();

  return (
    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
      <h3 className="font-bold mb-2">🔍 MCP Tools Debug</h3>
      
      <div className="mb-2">
        <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
      </div>
      
      {connectionError && (
        <div className="mb-2 text-red-600">
          <strong>Error:</strong> {connectionError}
        </div>
      )}
      
      <div className="mb-2">
        <strong>Tool Count:</strong> {availableTools.length}
      </div>
      
      <div className="mb-2">
        <strong>Raw Tools Data:</strong>
        <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-60">
          {JSON.stringify(availableTools, null, 2)}
        </pre>
      </div>
      
      <div>
        <strong>Individual Tools:</strong>
        {availableTools.map((tool, index) => (
          <div key={index} className="bg-white p-2 rounded mt-1">
            <div><strong>Name:</strong> {tool.name || 'Missing'}</div>
            <div><strong>Description:</strong> {tool.description || 'Missing'}</div>
            <div><strong>Input Schema:</strong> {tool.inputSchema ? 'Present' : 'Missing'}</div>
            <div className="text-xs mt-1">
              <strong>Full Object:</strong> {JSON.stringify(tool)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCPToolsDebug;