import React, { useState, useEffect } from 'react';

interface WorkflowSelectorProps {
  selectedWorkflow: 'recepcion' | 'devolucion';
  onWorkflowChange: (workflow: 'recepcion' | 'devolucion') => void;
  isLoading?: boolean;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  selectedWorkflow,
  onWorkflowChange,
  isLoading = false
}) => {
  // Restore workflow selection from sessionStorage on mount
  useEffect(() => {
    const storedWorkflow = sessionStorage.getItem('selectedWorkflow') as 'recepcion' | 'devolucion' | null;
    if (storedWorkflow && storedWorkflow !== selectedWorkflow) {
      onWorkflowChange(storedWorkflow);
    }
  }, []);

  const handleWorkflowChange = (workflow: 'recepcion' | 'devolucion') => {
    // Persist to sessionStorage
    sessionStorage.setItem('selectedWorkflow', workflow);
    onWorkflowChange(workflow);
  };

  return (
    <div className="flex gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <button
        onClick={() => handleWorkflowChange('recepcion')}
        disabled={isLoading}
        className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
          selectedWorkflow === 'recepcion'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Recepción
      </button>
      <button
        onClick={() => handleWorkflowChange('devolucion')}
        disabled={isLoading}
        className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
          selectedWorkflow === 'devolucion'
            ? 'bg-pink-600 text-white shadow-lg shadow-pink-100'
            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Devolución
      </button>
    </div>
  );
};

export default WorkflowSelector;
