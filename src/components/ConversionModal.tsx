import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({ isOpen, onClose }) => {
  const [value, setValue] = useState<number>(0);
  const [type, setType] = useState<'temp' | 'weight' | 'volume'>('temp');

  const convert = () => {
    if (type === 'temp') {
      return { label: 'Fahrenheit', result: (value * 9/5 + 32).toFixed(1) + '°F' };
    }
    if (type === 'weight') {
      return { label: 'Gramas', result: (value * 28.35).toFixed(1) + 'g' };
    }
    return { label: 'Litros', result: (value * 0.236).toFixed(1) + 'L' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Conversão Rápida</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex gap-2">
          <button className={`btn-secondary flex-1 text-xs ${type === 'temp' ? 'bg-terracotta text-white' : ''}`} onClick={() => setType('temp')}>Temp (°C → °F)</button>
          <button className={`btn-secondary flex-1 text-xs ${type === 'weight' ? 'bg-terracotta text-white' : ''}`} onClick={() => setType('weight')}>Peso (oz → g)</button>
          <button className={`btn-secondary flex-1 text-xs ${type === 'volume' ? 'bg-terracotta text-white' : ''}`} onClick={() => setType('volume')}>Vol (cups → L)</button>
        </div>
        <input 
          type="number" 
          className="input w-full" 
          value={value} 
          onChange={(e) => setValue(Number(e.target.value))}
          placeholder="Valor"
        />
        <div className="p-3 bg-sand rounded-lg text-center">
          <p className="text-sm font-semibold text-muted uppercase">{convert().label}</p>
          <p className="text-2xl font-bold">{convert().result}</p>
        </div>
      </div>
    </div>
  );
};
