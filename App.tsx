import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ItemList from './components/ItemList';
import Spinner from './components/Spinner';
import { Item, Match, ItemReportType, AppView } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { analyzeItem, findMatches } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FORM);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleReportSubmit = useCallback(async (data: {
    reportType: ItemReportType;
    description: string;
    location: string;
    imageFile: File;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Analyzing item details with AI...');
      const imageBase64 = await fileToBase64(data.imageFile);
      const features = await analyzeItem(
        imageBase64,
        data.imageFile.type,
        data.description,
        data.location
      );

      const newItem: Item = {
        id: new Date().toISOString() + Math.random(),
        reportType: data.reportType,
        description: data.description,
        location: data.location,
        imageBase64: imageBase64,
        imageMimeType: data.imageFile.type,
        features: features,
        timestamp: Date.now(),
      };
      
      const updatedItems = [...items, newItem];
      setItems(updatedItems);

      if (newItem.reportType === ItemReportType.LOST) {
        setLoadingMessage('Searching for potential matches...');
        const foundItems = updatedItems.filter(item => item.reportType === ItemReportType.FOUND);
        const matches = await findMatches(newItem, foundItems);
        setCurrentMatches(matches);
        setCurrentView(AppView.MATCHING);
      } else {
        // For a "found" item, just show the history
        setCurrentView(AppView.HISTORY);
      }

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
      setCurrentView(AppView.FORM); // Go back to form on error
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [items]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-md">
          <Spinner size="h-12 w-12" color="text-blue-600" />
          <p className="mt-4 text-lg font-semibold text-gray-700">{loadingMessage}</p>
          <p className="text-sm text-gray-500">This may take a moment...</p>
        </div>
      );
    }

    switch (currentView) {
      case AppView.FORM:
        return (
          <>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>}
            <ReportForm onSubmit={handleReportSubmit} isLoading={isLoading} />
          </>
        );
      case AppView.MATCHING:
        return <ItemList 
                    title="Potential Matches Found!" 
                    items={currentMatches} 
                    emptyMessage="We searched our database of found items, but couldn't find a strong match for your item yet. We'll keep looking!"
                />;
      case AppView.HISTORY:
        const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);
        return <ItemList title="My Reported Items" items={sortedItems} />;
      default:
        return <ReportForm onSubmit={handleReportSubmit} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        hasHistory={items.length > 0} 
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow w-full">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;