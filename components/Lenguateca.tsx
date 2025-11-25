import React, { useState } from 'react';
import { LENGUATECA } from '../constants';
import { BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';

interface LenguatecaProps {
  isOpen: boolean;
  onClose: () => void;
}

const Lenguateca: React.FC<LenguatecaProps> = ({ isOpen, onClose }) => {
  const [openCategory, setOpenCategory] = useState<string | null>("Aanleiding");

  const categories = Array.from(new Set(LENGUATECA.map(item => item.category)));

  const toggleCategory = (cat: string) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto border-l border-gray-200">
      <div className="p-4 bg-orange-600 text-white flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen size={20} />
          <h2 className="font-bold text-lg">Lenguateca B</h2>
        </div>
        <button onClick={onClose} className="hover:bg-orange-700 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Gebruik deze standaardzinnen om je brief formeler en correcter te maken.
        </p>

        {categories.map(category => (
          <div key={category} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
            >
              {category}
              {openCategory === category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {openCategory === category && (
              <div className="bg-white divide-y divide-gray-100">
                {LENGUATECA.filter(i => i.category === category).map((item, idx) => (
                  <div key={idx} className="p-3 text-sm hover:bg-orange-50 transition-colors cursor-copy group relative">
                     <div className="text-gray-500 mb-1 text-xs italic">{item.dutch}</div>
                     <div className="font-medium text-gray-800 text-base">{item.spanish}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lenguateca;
