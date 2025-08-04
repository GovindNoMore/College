import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Filter, Check, X } from 'lucide-react';
import { TaskColumn, ApplicationTask, College } from '../types';

interface TaskTrackerProps {
  columns: TaskColumn[];
  tasks: ApplicationTask[];
  colleges: College[];
  onUpdateColumns: (columns: TaskColumn[]) => void;
  onUpdateTasks: (tasks: ApplicationTask[]) => void;
}

export default function TaskTracker({ 
  columns, 
  tasks, 
  colleges, 
  onUpdateColumns, 
  onUpdateTasks 
}: TaskTrackerProps) {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => {
        const college = colleges.find(c => c.id === task.collegeId);
        return college?.status === filterStatus;
      });

  const handleCellUpdate = (taskIndex: number, columnId: string, value: any) => {
    const updatedTasks: ApplicationTask[] = tasks.map((task, idx) =>
      idx === taskIndex ? { ...task, [columnId]: value } : task
    );

    // If the column is 'admissionResult' or 'status', update the college status as well
    if (columnId === 'admissionResult' || columnId === 'status') {
      const collegeId = updatedTasks[taskIndex].collegeId;
      let newStatus = value;
      // Map admissionResult to college status if needed
      if (columnId === 'admissionResult') {
        switch (value) {
          case 'Admitted': newStatus = 'admitted'; break;
          case 'Rejected': newStatus = 'rejected'; break;
          case 'Waitlisted': newStatus = 'waitlisted'; break;
          case 'Pending': newStatus = 'in-progress'; break;
          default: newStatus = value;
        }
      }
      // Find the college and update its status
      const collegeIndex = colleges.findIndex(c => c.id === collegeId);
      if (collegeIndex !== -1 && colleges[collegeIndex].status !== newStatus) {
        // Create a shallow copy and update status
        const updatedColleges = [...colleges];
        updatedColleges[collegeIndex] = { ...updatedColleges[collegeIndex], status: newStatus };
        // Call a global update if available (should be handled in parent App)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('collegeStatusUpdate', { detail: { colleges: updatedColleges } }));
        }
      }
    }
    onUpdateTasks(updatedTasks);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn: TaskColumn = {
      id: Date.now().toString(),
      name: newColumnName,
      type: 'checkbox'
    };
    
    onUpdateColumns([...columns, newColumn]);
    setNewColumnName('');
    setShowAddColumn(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columnId === 'college') return; // Can't delete college column
    
    const updatedColumns = columns.filter(col => col.id !== columnId);
    const updatedTasks = tasks.map(task => {
      const { [columnId]: deleted, ...rest } = task;
      // Ensure collegeId is always present in the returned object
      return { ...rest, collegeId: task.collegeId };
    });
    
    onUpdateColumns(updatedColumns);
    onUpdateTasks(updatedTasks);
  };

  const renderCell = (task: ApplicationTask, column: TaskColumn, taskIndex: number) => {
    const value = task[column.id];

    if (column.type === 'checkbox') {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleCellUpdate(taskIndex, column.id, !value)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              value 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-700'
            }`}
          >
            {value && <Check className="w-3 h-3" />}
          </button>
        </div>
      );
    }

    if (column.type === 'select' && column.options) {
      return (
        <select
          value={value || column.options[0]}
          onChange={(e) => handleCellUpdate(taskIndex, column.id, e.target.value)}
          className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent text-sm"
        >
          {column.options.map(option => (
            <option key={option} value={option} className="bg-gray-700">{option}</option>
          ))}
        </select>
      );
    }

    if (column.type === 'date') {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleCellUpdate(taskIndex, column.id, e.target.value)}
          className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent text-sm"
        />
      );
    }

    // Text type
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleCellUpdate(taskIndex, column.id, e.target.value)}
        className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent text-sm"
        readOnly={column.id === 'college'}
      />
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden backdrop-blur-sm bg-opacity-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Application Progress Tracker</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
            >
              <option value="all">All Colleges</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
            <button
              onClick={() => setShowAddColumn(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
            <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-1">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-800/50">
              {columns.map((column) => (
                <th key={column.id} className="px-4 py-3 text-left text-sm font-medium text-gray-300 min-w-32">
                  <div className="flex items-center justify-between group">
                    {editingColumn === column.id ? (
                      <input
                        type="text"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onBlur={() => {
                          if (newColumnName.trim()) {
                            const updatedColumns = columns.map(col =>
                              col.id === column.id ? { ...col, name: newColumnName } : col
                            );
                            onUpdateColumns(updatedColumns);
                          }
                          setEditingColumn(null);
                          setNewColumnName('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (newColumnName.trim()) {
                              const updatedColumns = columns.map(col =>
                                col.id === column.id ? { ...col, name: newColumnName } : col
                              );
                              onUpdateColumns(updatedColumns);
                            }
                            setEditingColumn(null);
                            setNewColumnName('');
                          }
                        }}
                        className="text-sm border border-gray-300 rounded px-1"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span>{column.name}</span>
                        {column.id !== 'college' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingColumn(column.id);
                                setNewColumnName(column.name);
                              }}
                              className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(column.id)}
                              className="p-1 hover:bg-gray-600 rounded text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, taskIndex) => (
              <tr key={task.collegeId} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-gray-300">
                    {renderCell(task, column, tasks.findIndex(t => t.collegeId === task.collegeId))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Add New Column</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Column Name</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="e.g., Portfolio Uploaded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}