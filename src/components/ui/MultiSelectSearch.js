// src/components/ui/MultiSelectSearch.js
import React, { useState, useMemo, useRef } from 'react';
import useClickOutside from '../../utils/useClickOutside';
import { XCircleIcon } from '../core/Icons';

const MultiSelectSearch = ({ options, selectedIds, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);
    useClickOutside(searchRef, () => setIsOpen(false));

    const selectedOptions = useMemo(() => 
        options.filter(opt => selectedIds.includes(opt.id)), 
        [options, selectedIds]
    );

    const availableOptions = useMemo(() => {
        return options.filter(opt => 
            !selectedIds.includes(opt.id) &&
            opt.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, selectedIds, searchQuery]);

    const handleSelect = (optionId) => {
        onChange([...selectedIds, optionId]);
        setSearchQuery('');
        setIsOpen(false);
    };

    const handleDeselect = (optionId) => {
        onChange(selectedIds.filter(id => id !== optionId));
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="w-full flex flex-wrap items-center gap-1 p-1 border border-gray-300 rounded-md bg-white">
                {selectedOptions.map(opt => (
                    <div key={opt.id} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-sm font-medium px-2 py-0.5 rounded-full">
                        {opt.name}
                        <button onClick={() => handleDeselect(opt.id)} className="text-indigo-600 hover:text-indigo-800">
                            <XCircleIcon />
                        </button>
                    </div>
                ))}
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="flex-grow p-1 focus:outline-none"
                />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {availableOptions.map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectSearch;