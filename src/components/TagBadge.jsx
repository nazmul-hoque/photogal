import React from 'react';

const tagColors = {
  beach: 'bg-secondary-100 text-secondary-700',
  sunset: 'bg-primary-100 text-primary-700',
  nature: 'bg-accent-100 text-accent-700',
  dog: 'bg-yellow-100 text-yellow-700',
  pet: 'bg-pink-100 text-pink-700',
  food: 'bg-orange-100 text-orange-700',
  family: 'bg-purple-100 text-purple-700',
  city: 'bg-gray-100 text-gray-700',
  code: 'bg-blue-100 text-blue-700',
  cat: 'bg-indigo-100 text-indigo-700',
  'golden retriever': 'bg-amber-100 text-amber-700',
  dinner: 'bg-red-100 text-red-700',
  restaurant: 'bg-emerald-100 text-emerald-700',
  forest: 'bg-green-100 text-green-700',
  hiking: 'bg-teal-100 text-teal-700',
  birthday: 'bg-rose-100 text-rose-700',
  celebration: 'bg-violet-100 text-violet-700',
  architecture: 'bg-slate-100 text-slate-700',
  urban: 'bg-zinc-100 text-zinc-700',
  work: 'bg-cyan-100 text-cyan-700',
  programming: 'bg-sky-100 text-sky-700',
  cute: 'bg-fuchsia-100 text-fuchsia-700'
};

const TagBadge = ({ tag, className = '' }) => {
  const colorClass = tagColors[tag] || 'bg-neutral-100 text-neutral-700';
  
  return (
    <span className={`tag-chip ${colorClass} ${className}`}>
      {tag}
    </span>
  );
};

export default TagBadge;
