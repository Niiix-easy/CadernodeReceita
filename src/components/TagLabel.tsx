import React from 'react';

interface TagLabelProps {
  label: string;
}

export const TagLabel: React.FC<TagLabelProps> = ({ label }) => {
  const getTagStyles = (label: string) => {
    switch (label.toLowerCase()) {
      case 'vegan': return 'bg-[var(--tag-vegan)] text-white';
      case 'dessert': return 'bg-[var(--tag-dessert)] text-white';
      case 'quick': return 'bg-[var(--tag-quick)] text-white';
      default: return 'bg-sand text-ink';
    }
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getTagStyles(label)}`}>
      {label}
    </span>
  );
};
