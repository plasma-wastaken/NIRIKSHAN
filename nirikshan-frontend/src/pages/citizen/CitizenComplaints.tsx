import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';


export const CitizenComplaints: React.FC = () => {
  const { complaints } = useComplaints();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  
  const myComplaints = complaints.filter(c => c.citizen_id === currentUser.user_id);
  
  const filtered = myComplaints.filter(c => 
    c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Complaints</h1>
          <p className="text-sm text-surface-500 mt-1">View and track all your submitted reports.</p>
        </div>
      </div>

      {/* Filters (Mock UI) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search by ID, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="outline" className="shrink-0 bg-white">
          <Filter className="mr-2 h-4 w-4" /> Filter Status
        </Button>
        <Button variant="outline" className="shrink-0 bg-white">
          <Calendar className="mr-2 h-4 w-4" /> Date Range
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(comp => (
          <Card 
            key={comp.complaint_id} 
            className="hover:border-primary-300 transition-colors cursor-pointer group"
            onClick={() => navigate(`/citizen/complaints/${comp.complaint_id}`)}
          >
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {comp.complaint_id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    comp.status === 'RESOLVED' ? 'bg-green-100 text-green-800 border border-green-200' :
                    comp.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    'bg-surface-100 text-surface-700 border border-surface-200'
                  }`}>
                    {comp.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-surface-900 truncate">{comp.category}</h3>
                <p className="text-sm text-surface-500 mt-1 line-clamp-2">{comp.description}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right text-xs text-surface-500">
                <p>Submitted: {new Date(comp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="mt-1">Location: {comp.latitude.toFixed(4)}, {comp.longitude.toFixed(4)}</p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-500 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            No complaints found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
