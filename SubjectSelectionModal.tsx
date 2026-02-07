import React from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import { StaffAssignment } from '../types';

interface SubjectSelectionModalProps {
  assignments: StaffAssignment[];
  onSelect: (assignment: StaffAssignment) => void;
  onClose: () => void;
}

const SubjectSelectionModal: React.FC<SubjectSelectionModalProps> = ({ assignments, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" /> Select Subject
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {assignments.length > 0 ? (
            <div className="space-y-1">
              {assignments.map((assign) => (
                <button
                  key={assign.id}
                  onClick={() => onSelect(assign)}
                  className="w-full text-left p-4 hover:bg-indigo-50 rounded-lg group transition-colors flex justify-between items-center border border-transparent hover:border-indigo-100"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700">{assign.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {assign.year} • {assign.section}
                    </p>
                    <span className="text-xs text-indigo-400 font-medium">{assign.staffName}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              No subjects found for this section.
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-xs text-center text-gray-500 border-t border-gray-100">
           Select the subject you wish to manage.
        </div>
      </div>
    </div>
  );
};

export default SubjectSelectionModal;