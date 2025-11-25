import React from 'react';
import { JobAd } from '../types';
import { MapPin, User, Mail, Phone, CheckCircle, Gift } from 'lucide-react';

interface JobDetailProps {
  job: JobAd;
}

const JobDetail: React.FC<JobDetailProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 overflow-y-auto h-full">
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
        <div className="text-gray-600 font-medium">{job.company}</div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <MapPin size={16} />
          {job.location}, {job.country}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Descripción</h3>
          <p className="text-gray-700 leading-relaxed text-sm">{job.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-bold text-green-800 mb-2">
                    <CheckCircle size={16} /> Requisitos
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900">
                    {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                    ))}
                </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                    <Gift size={16} /> Ofrecemos
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-900">
                    {job.offer.map((off, i) => (
                        <li key={i}>{off}</li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Contacto</h3>
            <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2"><User size={14}/> {job.contactName}</div>
                <div className="flex items-center gap-2"><Mail size={14}/> {job.contactEmail}</div>
                <div className="flex items-center gap-2"><Phone size={14}/> {job.contactPhone}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
