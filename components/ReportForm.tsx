
import React, { useState, useRef } from 'react';
import { ItemReportType } from '../types';
import Spinner from './Spinner';

interface ReportFormProps {
  onSubmit: (data: {
    reportType: ItemReportType;
    description: string;
    location: string;
    imageFile: File;
  }) => void;
  isLoading: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, isLoading }) => {
  const [reportType, setReportType] = useState<ItemReportType>(ItemReportType.LOST);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('Image size cannot exceed 4MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!description || !location || !imageFile) {
      setError('Please fill out all fields and upload an image.');
      return;
    }
    setError(null);
    onSubmit({ reportType, description, location, imageFile });
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Report an Item</h2>
      <p className="text-center text-gray-500 mb-8">Help us find your item by providing as much detail as possible.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Is the item Lost or Found?</label>
          <div className="flex rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => setReportType(ItemReportType.LOST)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                reportType === ItemReportType.LOST
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setReportType(ItemReportType.FOUND)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                reportType === ItemReportType.FOUND
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I Found Something
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-bold text-gray-700 block mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Black leather wallet with a silver clasp, containing student ID."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="text-sm font-bold text-gray-700 block mb-2">Location {reportType}</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Near the main library entrance"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        
        <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Upload an Image</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition"
              onClick={triggerFileSelect}
            >
                {imagePreview ? (
                     <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <p className="pl-1">Click to upload a file</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
                    </div>
                )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
              required
            />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300"
        >
          {isLoading ? <><Spinner /> <span className="ml-2">Analyzing...</span></> : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
