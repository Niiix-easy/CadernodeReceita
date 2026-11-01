import React from 'react';
import { CATEGORY_LABEL, type Category } from "@/lib/types";

interface CategorySelectorProps {
  selected: string[];
  onSelect: (categories: string[]) => void;
  categories: string[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect, categories }) => {
  return (
    <div role="tablist" aria-label="Categorias" className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button 
          key={c} 
          role="tab" 
          aria-selected={selected.includes(c)} 
          onClick={() => {
              if (selected.includes(c)) {
                  onSelect(selected.filter(s => s !== c));
              } else {
                  onSelect([...selected, c]);
              }
          }}
          className={`btn ${selected.includes(c) ? "bg-terracotta text-white" : "border border-ink/15 bg-white hover:bg-sand"}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
};
