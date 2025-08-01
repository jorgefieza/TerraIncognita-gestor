// src/components/management/ResourceSearchableList.js
import React, { useState, useMemo, useRef } from 'react';
import useClickOutside from '../../utils/useClickOutside';
import { XCircleIcon } from '../core/Icons';

const ResourceSearchableList = ({ allResources, selectedResources, onToggle, placeholder }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    useClickOutside(searchRef, () => setIsOpen(false));

    const filteredResources = useMemo(() => {
        if (!search) return allResources;
        return allResources.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, allResources]);

    return (
        <div className="relative" ref={searchRef}>
            <input type="text" placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setIsOpen(true)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredResources.map(r => {
                        const isSelected = selectedResources.includes(r.name);
                        return (
                            <button key={r.id} onClick={() => { onToggle(r.name); setSearch(''); }} disabled={isSelected} className={`w-full text-left p-2 ${isSelected ? 'bg-indigo-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                                {r.name}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                {selectedResources.map(name => (
                    <div key={name} className="flex justify-between items-center bg-gray-100 rounded p-1.5 text-sm">
                        <span>{name}</span>
                        <button onClick={() => onToggle(name)} className="text-gray-500 hover:text-red-600"><XCircleIcon /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceSearchableList;