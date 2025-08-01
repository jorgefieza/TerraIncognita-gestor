// src/components/views/TimeAxis.js
import React from 'react';

const TimeAxis = ({ visibleHours }) => (
    <div className="w-16 text-right pr-2">
        <div className="h-20"></div>
        {visibleHours.map((hour) => (<div key={hour} className="h-[60px] relative"><span className="text-xs text-gray-400 absolute -top-2 right-2">{`${String(hour).padStart(2, '0')}:00`}</span></div>))}
    </div>
);

export default TimeAxis;