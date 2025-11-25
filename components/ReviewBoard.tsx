import React from 'react';
import { TextSegment } from '../types';
import { ERROR_COLORS, ERROR_LABELS } from '../constants';

interface ReviewBoardProps {
  segments: TextSegment[];
  onSegmentClick: (segment: TextSegment) => void;
  selectedSegmentId: string | null;
}

const ReviewBoard: React.FC<ReviewBoardProps> = ({ segments, onSegmentClick, selectedSegmentId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-inner min-h-[400px] font-mono text-base leading-relaxed border border-gray-200">
        <div className="flex flex-wrap gap-1">
            {segments.map((segment) => {
                if (!segment.isError) {
                    return <span key={segment.id} className="text-gray-800">{segment.text} </span>;
                }

                const colorClass = ERROR_COLORS[segment.type] || ERROR_COLORS['none'];
                const isSelected = selectedSegmentId === segment.id;

                return (
                    <span
                        key={segment.id}
                        onClick={() => onSegmentClick(segment)}
                        className={`
                            px-1 rounded cursor-pointer transition-all border-b-2
                            ${colorClass}
                            ${isSelected ? 'ring-2 ring-offset-1 ring-orange-500 font-bold scale-105 shadow-md z-10' : 'opacity-90 hover:opacity-100'}
                        `}
                        title={ERROR_LABELS[segment.type]}
                    >
                        {segment.text}
                    </span>
                );
            })}
        </div>
    </div>
  );
};

export default ReviewBoard;