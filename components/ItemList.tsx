
import React from 'react';
import { Item, Match } from '../types';
import ItemCard from './ItemCard';

interface ItemListProps {
  title: string;
  items: (Item | Match)[];
  emptyMessage?: string;
}

const ItemList: React.FC<ItemListProps> = ({ title, items, emptyMessage = "No items to display." }) => {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">{title}</h2>
      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ItemList;
