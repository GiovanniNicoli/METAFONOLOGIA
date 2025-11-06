
import React from 'react';

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    unit?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, id, unit, ...props }) => {
    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type="number"
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    {...props}
                />
                {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500">{unit}</span>}
            </div>
        </div>
    );
};

export default NumberInput;
