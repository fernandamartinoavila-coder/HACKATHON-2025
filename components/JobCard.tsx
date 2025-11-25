import React from 'react';
import { JobAd } from '../types';
import { MapPin, Briefcase } from 'lucide-react';

interface JobCardProps {
  job: JobAd;
  onSelect: (job: JobAd) => void;
  isSelected?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSelect, isSelected }) => {
  return (
    <div 
      className={`border rounded-lg p-5 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-orange-500 ring-2 ring-orange-100 bg-white' : 'border-gray-200 bg-white'
      }`}
      onClick={() => onSelect(job)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
          {job.country}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 font-medium mb-3 flex items-center gap-1">
        <Briefcase size={14} /> {job.company}
      </p>
      
      <p className="text-sm text-gray-500 mb-4 line-clamp-3">{job.description}</p>
      
      <div className="flex items-center text-xs text-gray-400 gap-4">
        <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
        </span>
      </div>
    </div>
  );
};

export default JobCard;