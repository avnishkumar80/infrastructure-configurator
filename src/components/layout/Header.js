import React, { useState, useRef, useMemo } from 'react';
import { FileText, X, Upload, Download, Check, Menu } from 'lucide-react';
import { calculatePrice } from '../../utils/pricing';

const Header = ({
    configData,
    configuration,
    isConfigLoading,
    configError,
    uploadSuccess,
    handleFileUpload,
    downloadConfiguration,
    resetToDefault,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userIntent,
    onOpenIntentSelector
}) => {
    const [showConfigPanel, setShowConfigPanel] = useState(false);
    const fileInputRef = useRef(null);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    // Close panel when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showConfigPanel &&
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowConfigPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showConfigPanel]);

    const total = useMemo(() => {
        let total = 0;
        Object.entries(configuration).forEach(([category, categoryConfig]) => {
            Object.entries(categoryConfig).forEach(([subItem, config]) => {
                if (config.selections) {
                    total += config.selections.reduce((sum, selection) => {
                        return sum + calculatePrice(selection.product, selection.config, selection.quantity);
                    }, 0);
                }
            });
        });
        return total;
    }, [configuration]);

    const onFileUpload = (e) => {
        handleFileUpload(e.target.files[0]);
    }

    // Find current intent label
    const currentIntentLabel = useMemo(() => {
        if (!userIntent || !configData.intentQuestions) return null;

        // If userIntent is object, map keys to labels
        return Object.entries(userIntent)
            .map(([key, value]) => {
                const question = configData.intentQuestions.find(q => q.id === key);
                const option = question?.options.find(o => o.value === value);
                return option?.label;
            })
            .filter(Boolean)
            .join(' | ');
    }, [userIntent, configData.intentQuestions]);

    return (
        <div className="bg-white border-b shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                {configData.productInfo?.name || 'Product Configurator'}
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">
                                {configData.productInfo?.subtitle || 'Configuration'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-8">
                        {/* Intent Display */}
                        {userIntent && (
                            <button
                                onClick={onOpenIntentSelector}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {currentIntentLabel}
                                <span className="text-blue-400">| Change</span>
                            </button>
                        )}

                        <div className="hidden md:flex items-center space-x-6">
                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Subtotal</div>
                                <div className="text-sm font-semibold text-blue-600">
                                    ${(configData.productInfo?.salesPrice || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Estimate</div>
                                <div className="text-lg font-bold text-green-600">
                                    ${total.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Price Summary (Compact) */}
                        <div className="md:hidden text-right">
                            <div className="text-xs text-gray-500">Estimate</div>
                            <div className="text-sm font-bold text-green-600">
                                ${total.toLocaleString()}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                ref={buttonRef}
                                onClick={() => setShowConfigPanel(!showConfigPanel)}
                                className={`p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showConfigPanel ? 'bg-gray-100 ring-2 ring-blue-500' : ''}`}
                                title="Configuration Options"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Configuration Panel Dropdown */}
                    {showConfigPanel && (
                        <div ref={panelRef} className="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Configuration Management</h3>

                            {configError && (
                                <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700 flex items-start gap-2">
                                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{configError}</span>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded-md text-sm text-green-700 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    <span>Uploaded successfully!</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onFileUpload}
                                    accept=".json"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isConfigLoading}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{isConfigLoading ? 'Loading...' : 'Upload Configuration'}</span>
                                </button>

                                <button
                                    onClick={downloadConfiguration}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download JSON</span>
                                </button>

                                <div className="pt-2 mt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to reset? This action cannot be undone.")) {
                                                resetToDefault();
                                                setShowConfigPanel(false);
                                            }
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Reset All</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
