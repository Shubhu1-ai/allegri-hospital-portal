import React, { useState } from 'react';
import { ArrowLeft, Search, Microscope, Calendar, Trash2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HistoryViewProps {
  results: AnalysisResult[];
  onBack: () => void;
  onClearHistory: () => void;
  onDeleteHistory: (ids: string[]) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ results, onBack, onClearHistory, onDeleteHistory }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredResults = results.filter((result) => {
    if (filter === 'all') return true;
    return result.status === filter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleClearAllClick = () => {
    if (results.length === 0) return;
    if (window.confirm("Are you sure you want to delete ALL history records? This cannot be undone.")) {
      onClearHistory();
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected records?`)) {
      onDeleteHistory(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Calculation History</h2>
              <div className="text-sm text-slate-500">
                Total Records: {results.length}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                <span>Delete ({selectedIds.size})</span>
              </button>
            )}
            
            {results.length > 0 && (
              <button 
                onClick={handleClearAllClick}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'completed', 'pending', 'failed'] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize whitespace-nowrap ${
                 filter === f 
                   ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                   : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
               }`}
             >
               {f}
             </button>
          ))}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No {filter !== 'all' ? filter : ''} records found</h3>
          <p className="text-slate-500 mt-1">
            {results.length === 0 
              ? "Capture a photo to start a new analysis." 
              : "Try adjusting your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredResults.slice().reverse().map((result) => (
            <div 
              key={result.id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative group flex ${selectedIds.has(result.id) ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}
              onClick={() => toggleSelection(result.id)}
            >
              {/* Checkbox Overlay */}
              <div className="absolute top-3 left-3 z-20">
                 <input 
                   type="checkbox" 
                   checked={selectedIds.has(result.id)} 
                   onChange={() => toggleSelection(result.id)}
                   className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                 />
              </div>

              {/* Status Badge */}
              <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-sm ${getStatusBadgeColor(result.status)}`}>
                {result.status}
              </div>

              <div className="w-1/3 bg-slate-100 relative h-32">
                <img src={result.imageUrl} alt="Sample" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="w-2/3 p-4 pl-4 flex flex-col justify-between h-32">
                <div>
                  <div className="flex items-start justify-between pr-12">
                    <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{result.bacteriaType}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      result.confidence > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.confidence}% Conf.
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 mt-2 gap-1">
                    <Calendar size={12} />
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-emerald-600 font-medium">
                  <Microscope size={16} className="mr-1" />
                  <span>Analyzed by Pi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;