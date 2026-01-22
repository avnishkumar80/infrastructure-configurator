import { useState } from 'react';
import { defaultConfigData } from '../data/configData';
import { validateConfigStructure } from '../utils/validation';

export const useConfiguration = () => {
    // Configuration data state
    const [configData, setConfigData] = useState(defaultConfigData);
    const [isConfigLoading, setIsConfigLoading] = useState(false);
    const [configError, setConfigError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Filter Intent State
    const [userIntent, setUserIntent] = useState(null);

    // UI state
    const [currentStep, setCurrentStep] = useState('hardware');
    const [currentSubItem, setCurrentSubItem] = useState('server-nodes');
    const [selectedProductIndex, setSelectedProductIndex] = useState(null);

    // Configuration state
    const [configuration, setConfiguration] = useState({
        hardware: {
            'server-nodes': { selections: [], configured: false },
            'enclosures': { selections: [], configured: false },
            'storage': { selections: [], configured: false }
        },
        software: {
            'operating-system': { selections: [], configured: false },
            'middleware': { selections: [], configured: false },
            'licensing': { selections: [], configured: false }
        },
        services: {
            'installation': { selections: [], configured: false },
            'support': { selections: [], configured: false },
            'training': { selections: [], configured: false }
        }
    });

    const updateConfiguration = (category, subItem, selections) => {
        setConfiguration(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [subItem]: {
                    selections,
                    configured: selections.length > 0 && selections.every(s => s.configured)
                }
            }
        }));
    };

    const resetConfiguration = (newConfigData = configData) => {
        const newConfig = {};
        Object.keys(newConfigData?.subItems || {}).forEach(category => {
            newConfig[category] = {};
            (newConfigData.subItems[category] || []).forEach(item => {
                if (item.id !== 'step-review') {
                    newConfig[category][item.id] = { selections: [], configured: false };
                }
            });
        });
        setConfiguration(newConfig);

        // Reset to first step and sub-item
        const firstStep = Object.keys(newConfigData?.subItems || {})[0] || 'hardware';
        const firstSubItem = newConfigData?.subItems?.[firstStep]?.[0]?.id || 'server-nodes';
        setCurrentStep(firstStep);
        setCurrentSubItem(firstSubItem);
        setSelectedProductIndex(null);
        // Note: We deliberately do NOT reset userIntent here to persist it across resets unless fully wiping
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        setIsConfigLoading(true);
        setConfigError(null);
        setUploadSuccess(false);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const uploadedConfig = JSON.parse(e.target.result);

                if (validateConfigStructure(uploadedConfig)) {
                    setConfigData(uploadedConfig);

                    // Reset first to ensure clean state derived from config structure
                    resetConfiguration(uploadedConfig);

                    // Then restore active configuration if present
                    if (uploadedConfig.savedConfiguration) {
                        setConfiguration(uploadedConfig.savedConfiguration);
                    }

                    // Restore intent if present
                    if (uploadedConfig.userIntent) {
                        setUserIntent(uploadedConfig.userIntent);
                    }

                    setConfigError(null);
                    setUploadSuccess(true);

                    setTimeout(() => setUploadSuccess(false), 3000);
                } else {
                    setConfigError('Invalid configuration file structure. Please ensure the file contains all required sections: productInfo, steps, subItems, and products.');
                }
            } catch (error) {
                setConfigError('Failed to parse JSON file: ' + error.message);
            } finally {
                setIsConfigLoading(false);
            }
        };

        reader.onerror = () => {
            setConfigError('Failed to read the file. Please try again.');
            setIsConfigLoading(false);
        };

        reader.readAsText(file);
    };

    const downloadConfiguration = () => {
        try {
            const exportData = {
                ...configData,
                savedConfiguration: configuration,
                userIntent // Save intent to file
            };
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

            const exportFileDefaultName = `infrastructure-config-${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            setConfigError('Failed to download configuration: ' + error.message);
        }
    };

    const resetToDefault = () => {
        setConfigData(defaultConfigData);
        resetConfiguration(defaultConfigData);
        setUserIntent(null); // Full reset includes clearing intent
        setConfigError(null);
        setUploadSuccess(false);
    };

    return {
        configData,
        configuration,
        currentStep,
        currentSubItem,
        selectedProductIndex,
        userIntent,
        isConfigLoading,
        configError,
        uploadSuccess,
        setCurrentStep,
        setCurrentSubItem,
        setSelectedProductIndex,
        setUserIntent,
        setConfiguration, // Exposed if needed, but prefer updateConfiguration
        updateConfiguration,
        resetConfiguration,
        handleFileUpload,
        downloadConfiguration,
        resetToDefault
    };
};
