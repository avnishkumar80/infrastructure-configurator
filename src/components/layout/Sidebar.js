import React, { useRef, useEffect } from 'react';
import { Settings, Trash2, Minus, Plus, AlertCircle } from 'lucide-react';
import StatusIcon from '../common/StatusIcon';
import { getValidationStatus } from '../../utils/validation';
import { calculatePrice } from '../../utils/pricing';

const Sidebar = ({
    configData,
    configuration,
    currentStep,
    currentSubItem,
    setCurrentSubItem,
    setSelectedProductIndex,
    updateConfiguration,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) => {
    const sidebarRef = useRef(null);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen, setIsMobileMenuOpen]);


    const updateSelectionFromSidebar = (category, subItem, selectionIndex, updates) => {
        const currentSelections = configuration[category]?.[subItem]?.selections || [];
        const updated = [...currentSelections];
        updated[selectionIndex] = { ...updated[selectionIndex], ...updates };
        updateConfiguration(category, subItem, updated);
    };

    const removeSelectionFromSidebar = (category, subItem, selectionIndex) => {
        const currentSelections = configuration[category]?.[subItem]?.selections || [];
        const updated = currentSelections.filter((_, i) => i !== selectionIndex);
        updateConfiguration(category, subItem, updated);
    };

    if (currentStep === 'review') return null;

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:h-full md:shadow-none md:border-r border-gray-200
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden transition-opacity" />
            )}

            {/* Sidebar Content */}
            <div className={sidebarClasses} ref={sidebarRef}>
                <div className="flex flex-col h-full pt-16 md:pt-0"> {/* Padding top for mobile header */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <nav className="p-4 space-y-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                {configData.steps?.find(s => s.id === currentStep)?.label} Components
                            </h3>

                            {(configData.subItems?.[currentStep] || []).map((item) => {
                                const isActive = currentSubItem === item.id;

                                // Get validation status
                                const itemConfig = configuration[currentStep]?.[item.id];
                                const status = item.id !== 'step-review'
                                    ? getValidationStatus(itemConfig)
                                    : 'valid';

                                const selections = itemConfig?.selections || [];

                                const availableProducts = configData.products[item.id] || [];
                                const isRequired = availableProducts.some(product =>
                                    product.modules && Object.values(product.modules).some(module => module.required)
                                );

                                return (
                                    <div key={item.id} className="group">
                                        <button
                                            onClick={() => setCurrentSubItem(item.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-1 h-8 rounded-full ${isActive ? 'bg-blue-500' : 'bg-transparent group-hover:bg-gray-200'}`} />
                                                <div className="flex flex-col items-start">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                        {isRequired && item.id !== 'step-review' && (
                                                            <span className="text-red-500 ml-1" title="Required">*</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusIcon status={status} />
                                        </button>

                                        {item.id !== 'step-review' && selections.length > 0 && (
                                            <div className="ml-5 mt-2 pl-4 border-l-2 border-gray-100 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                                {selections.map((selection, index) => (
                                                    <div key={index} className="bg-white rounded-md p-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-gray-900 truncate text-xs max-w-[120px]" title={selection.product.name}>
                                                                {selection.product.name}
                                                            </span>
                                                            <div className="flex items-center space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCurrentSubItem(item.id);
                                                                        setSelectedProductIndex(index);
                                                                        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                                                                    }}
                                                                    className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                                                    title="Configure"
                                                                >
                                                                    <Settings className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeSelectionFromSidebar(currentStep, item.id, index);
                                                                    }}
                                                                    className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newQty = Math.max(1, selection.quantity - 1);
                                                                        updateSelectionFromSidebar(currentStep, item.id, index, { quantity: newQty });
                                                                    }}
                                                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white rounded shadow-sm transition-all"
                                                                >
                                                                    <Minus className="w-2.5 h-2.5" />
                                                                </button>
                                                                <span className="font-semibold w-7 text-center text-gray-700">{selection.quantity}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateSelectionFromSidebar(currentStep, item.id, index, { quantity: selection.quantity + 1 });
                                                                    }}
                                                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white rounded shadow-sm transition-all"
                                                                >
                                                                    <Plus className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                            <span className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-full">
                                                                ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                        {(() => {
                            const categoryTotal = Object.entries(configuration[currentStep] || {}).reduce((sum, [subItem, config]) => {
                                if (config.selections) {
                                    return sum + config.selections.reduce((subSum, selection) => {
                                        return subSum + calculatePrice(selection.product, selection.config, selection.quantity);
                                    }, 0);
                                }
                                return sum;
                            }, 0);

                            if (categoryTotal > 0) {
                                return (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium capitalize">{currentStep} Total</span>
                                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                            ${categoryTotal.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <div className="flex items-center text-xs text-gray-400 italic">
                                    <AlertCircle className="w-3 h-3 mr-1.5" />
                                    No items selected
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
