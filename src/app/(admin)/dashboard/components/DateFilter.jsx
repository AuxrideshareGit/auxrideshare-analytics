'use client';

import React from 'react';
import Flatpickr from 'react-flatpickr';
import { LuCalendar } from 'react-icons/lu';

const DateFilter = ({ value, onDateChange, disabled }) => {
    const handleChange = (selectedDates, dateStr) => {
        if (!disabled && selectedDates.length > 0) {
            onDateChange(dateStr);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <Flatpickr
                    value={value}
                    options={{
                        dateFormat: 'Y-m-d',
                        maxDate: 'today',
                    }}
                    disabled={disabled}
                    className="form-input form-input-sm ps-9 w-44 cursor-pointer disabled:cursor-not-allowed"
                    placeholder="Select date"
                    onChange={handleChange}
                />
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <LuCalendar className="size-4 text-default-500" />
                </div>
            </div>
            {disabled && (
                <p className="text-[10px] font-medium text-primary animate-pulse tracking-wide">
                    Loading in progress, please wait...
                </p>
            )}
        </div>
    );
};

export default DateFilter;
