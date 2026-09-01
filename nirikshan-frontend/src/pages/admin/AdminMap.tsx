import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SiteMap } from '../../components/map/SiteMap';
import { mockMapSites } from '../../data/mockMapSites';
import { ArrowLeft, Filter, Layers } from 'lucide-react';

export const AdminMap: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSiteId, setSelectedSiteId] = React.useState<string | undefined>();
  const [filterRisk, setFilterRisk] = React.useState<string>('ALL');

  const filteredSites = filterRisk === 'ALL' 
    ? mockMapSites 
    : mockMapSites.filter(site => site.risk_level === filterRisk);

  const handleSiteClick = (site: typeof mockMapSites[0]) => {
    setSelectedSiteId(site.id);
    // Navigate to inspection detail
    navigate(`/admin/inspections/${site.inspection_id}`);
  };

  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNASSESSED'] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')} className="px-2">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Inspection Map
            </h1>
            <p className="text-sm text-surface-500 mt-1">Geospatial view of all inspection sites</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-100 rounded-lg p-1">
            <Filter className="h-4 w-4 text-surface-500 ml-2" />
            {riskLevels.map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterRisk === level
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-surface-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.length}</p>
            <p className="text-xs text-surface-500 mt-1">Total Sites</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.filter(s => s.risk_level === 'CRITICAL').length}</p>
            <p className="text-xs text-surface-500 mt-1">Critical</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.filter(s => s.risk_level === 'HIGH').length}</p>
            <p className="text-xs text-surface-500 mt-1">High Risk</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.filter(s => s.risk_level === 'MEDIUM').length}</p>
            <p className="text-xs text-surface-500 mt-1">Medium</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.filter(s => s.risk_level === 'LOW').length}</p>
            <p className="text-xs text-surface-500 mt-1">Low Risk</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-900">{mockMapSites.filter(s => s.risk_level === 'UNASSESSED').length}</p>
            <p className="text-xs text-surface-500 mt-1">Unassessed</p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card className="border-surface-200 overflow-hidden">
        <CardHeader className="bg-surface-50 border-b border-surface-100 flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-600" />
            Site Locations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredSites.length} sites visible</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SiteMap
            sites={filteredSites}
            height="600px"
            selectedSiteId={selectedSiteId}
            onSiteClick={handleSiteClick}
            showLegend={true}
          />
        </CardContent>
      </Card>

      {/* Site List */}
      <Card>
        <CardHeader className="bg-surface-50 border-b border-surface-100 pb-4">
          <CardTitle>Site Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-surface-100">
            {filteredSites.map((site) => (
              <div
                key={site.id}
                className="p-4 hover:bg-surface-50 cursor-pointer transition-colors"
                onClick={() => handleSiteClick(site)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-primary-700">
                        {site.site_id}
                      </span>
                      <Badge
                        variant={
                          site.risk_level === 'CRITICAL' ? 'danger' :
                          site.risk_level === 'HIGH' ? 'danger' :
                          site.risk_level === 'MEDIUM' ? 'warning' :
                          site.risk_level === 'LOW' ? 'success' : 'default'
                        }
                      >
                        {site.risk_level}
                      </Badge>
                      <Badge variant="info">{site.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-surface-900">{site.name}</p>
                    <p className="text-xs text-surface-600">{site.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                      <span>Inspector: {site.inspector}</span>
                      <span>Category: {site.category}</span>
                      <span>Last: {site.last_inspected}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredSites.length === 0 && (
              <div className="p-8 text-center text-surface-500">
                No sites match the current filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
