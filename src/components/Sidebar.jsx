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
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">PhotoGal</h1>
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
                className={`sidebar-item ${selectedSection === section.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{section.label}</span>
                <span className="text-sm bg-neutral-100 px-2 py-1 rounded-full">
                  {section.count}
                </span>
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
