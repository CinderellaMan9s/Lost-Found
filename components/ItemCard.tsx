
import React from 'react';
import { Item, Match, ItemReportType } from '../types';

interface ItemCardProps {
  item: Item | Match;
}

const isMatch = (item: Item | Match): item is Match => {
  return 'matchScore' in item;
};

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const reportTypeColor = item.reportType === ItemReportType.LOST ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  
  const renderMatchDetails = (matchItem: Match) => {
    const scorePercentage = Math.round(matchItem.matchScore * 100);
    let scoreColor = 'bg-green-500';
    if (scorePercentage < 85) scoreColor = 'bg-yellow-500';
    if (scorePercentage < 65) scoreColor = 'bg-orange-500';

    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-sm text-blue-900">Match Details</h4>
        <div className="flex items-center mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${scorePercentage}%` }}></div>
          </div>
          <span className="text-sm font-medium text-blue-800 ml-3">{scorePercentage}%</span>
        </div>
        <p className="text-xs text-blue-700 mt-2 italic">"{matchItem.reasoning}"</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1">
          <img className="h-full w-full object-cover" src={`data:${item.imageMimeType};base64,${item.imageBase64}`} alt={item.features.itemName} />
        </div>
        <div className="p-6 md:col-span-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${reportTypeColor}`}>
                {item.reportType.toUpperCase()}
              </div>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{item.features.itemName}</h3>
              <p className="text-sm text-gray-500">{item.features.category} &bull; {item.features.brand}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-700">{item.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold">Last Seen:</span> {item.location}
            </div>
             <div className="mt-1 text-sm text-gray-600">
              <span className="font-semibold">Color:</span> {item.features.primaryColor}
            </div>
            {item.features.distinguishingFeatures.length > 0 && (
                 <div className="mt-3">
                    <h4 className="font-semibold text-sm text-gray-800">Key Features:</h4>
                    <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                        {item.features.distinguishingFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          {isMatch(item) && renderMatchDetails(item)}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
