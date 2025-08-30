import React from 'react';
import { 
  Clock, 
  Heart, 
  Users, 
  MapPin, 
  Album,
  X
} from 'lucide-react';

const sidebarSections = [
  { id: 'recent', label: 'Recently Added', icon: Clock, count: 8 },
  { id: 'favorites', label: 'Favorites', icon: Heart, count: 3 },
  { id: 'people', label: 'People', icon: Users, count: 5 },
  { id: 'places', label: 'Places', icon: MapPin, count: 6 },
  { id: 'albums', label: 'Auto Albums', icon: Album, count: 4 }
];

const Sidebar = ({ 
  selectedSection, 
  onSectionChange, 
  isMobileMenuOpen, 
  onMobileMenuClose,
  className = '' 
}) => {
  const SidebarContent = () => (
    <div className="bg-white border-r border-neutral-200 h-full">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            PhotoGal
          </h1>
          <p className="text-sm text-neutral-500 font-medium">Smart Photo Organizer</p>
        </div>
        <nav className="space-y-2">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  if (onMobileMenuClose) onMobileMenuClose();
                }}
                className={`sidebar-item group relative overflow-hidden ${selectedSection === section.id ? 'active' : ''}`}
              >
                {/* Background gradient for active state */}
                {selectedSection === section.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl" />
                )}
                
                <div className="relative flex items-center">
                  <div className="w-10 h-10 mr-3 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center group-hover:from-primary-200 group-hover:to-secondary-200 transition-all duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium">{section.label}</span>
                  <span className="text-sm bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold shadow-sm border border-white/50">
                    {section.count}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );

  if (isMobileMenuOpen) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50" 
          onClick={onMobileMenuClose} 
        />
        <div className="relative w-64 h-full">
          <SidebarContent />
          <button
            onClick={onMobileMenuClose}
            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`hidden lg:block w-64 flex-shrink-0 ${className}`}>
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
