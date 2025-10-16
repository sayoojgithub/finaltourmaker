import React from 'react';
import {
  Lock, MapPin, Image, Code2, Smile,
  List, Settings, CalendarDays, Download, Maximize2,
} from 'lucide-react';

const TextEditor = ({ label, value, onChange }) => {
  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x sm:rtl:divide-x-reverse">
          <div className="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
            {[Lock, MapPin, Image, Code2, Smile].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4">
            {[List, Settings, CalendarDays, Download].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="p-2 text-gray-500 rounded-sm cursor-pointer sm:ms-auto hover:text-gray-900 hover:bg-gray-100"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 bg-white rounded-b-lg">
        <label htmlFor={label} className="sr-only">{label}</label>
        <textarea
          id={label}
          rows="8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-0 text-sm text-gray-800 bg-white border-0 focus:ring-0 placeholder-gray-400"
          placeholder={label}
          required
        ></textarea>
      </div>
    </div>
  );
};

export default TextEditor;