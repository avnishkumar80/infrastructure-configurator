import React, { useState } from 'react';
import { useConfiguration } from './hooks/useConfiguration';
import Header from './components/layout/Header';
import Summary from './components/features/Summary';
import AIChatInterface from './components/features/AIChatInterface';
import Sidebar from './components/layout/Sidebar';
import ProductSelector from './components/features/ProductSelector';
import { Bot, SlidersHorizontal } from 'lucide-react';

const InfrastructureConfigurator = () => {
  const {
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
    setConfiguration,
    updateConfiguration,
    handleFileUpload,
    downloadConfiguration,
    resetToDefault,
    resetConfiguration
  } = useConfiguration();

  // Mode state: 'conversational' | 'manual'
  const [viewMode, setViewMode] = useState('conversational');



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden font-sans">
      <Header
        configData={configData}
        configuration={configuration}
        isConfigLoading={isConfigLoading}
        configError={configError}
        uploadSuccess={uploadSuccess}
        handleFileUpload={handleFileUpload}
        downloadConfiguration={downloadConfiguration}
        resetToDefault={resetToDefault}
        userIntent={userIntent}
      />

      {/* Mode Toggle Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-center z-10 shadow-sm">
         <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('conversational')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                viewMode === 'conversational' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 shadow-none'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Mode</span>
            </button>
            <button
              onClick={() => setViewMode('manual')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                viewMode === 'manual' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 shadow-none'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Manual Customization</span>
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative max-w-[1600px] w-full mx-auto">
        
        {viewMode === 'conversational' ? (
            // AI Chat View
            <>
                <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
                <AIChatInterface
                    configData={configData}
                    configuration={configuration}
                    updateConfiguration={updateConfiguration}
                    setConfiguration={setConfiguration}
                    resetConfiguration={resetConfiguration}
                />
                </div>
                <div className="w-1/2 bg-slate-50 overflow-y-auto">
                <div className="p-6 pb-24 h-full">
                    <Summary
                    configData={configData}
                    configuration={configuration}
                    />
                </div>
                </div>
            </>
        ) : (
            // Manual Customization View
            <>
                {/* Left Sidebar Menu */}
                <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col h-full transform transition-transform duration-300 md:relative absolute z-30 md:translate-x-0">
                    <Sidebar 
                        configData={configData}
                        configuration={configuration}
                        currentStep={currentStep}
                        currentSubItem={currentSubItem}
                        setCurrentStep={setCurrentStep}
                        setCurrentSubItem={setCurrentSubItem}
                        updateConfiguration={updateConfiguration}
                        selectedProductIndex={selectedProductIndex}
                        setSelectedProductIndex={setSelectedProductIndex}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
                    <div className="p-8 max-w-4xl mx-auto w-full">
                        <ProductSelector 
                            configData={configData}
                            category={currentStep}
                            subItem={currentSubItem}
                            configuration={configuration}
                            updateConfiguration={updateConfiguration}
                            selectedProductIndex={selectedProductIndex}
                            setSelectedProductIndex={setSelectedProductIndex}
                            userIntent={userIntent}
                        />
                    </div>
                </div>

                {/* Fixed Right Summary Panel */}
                 <div className="w-96 border-l border-gray-200 bg-white flex flex-col shadow-xl md:shadow-none flex-shrink-0 z-20 transition-all duration-300 transform translate-x-0 hidden lg:flex">
                     <Summary 
                         configData={configData}
                         configuration={configuration}
                     />
                 </div>
            </>
        )}
      </div>
    </div>
  );
};

export default InfrastructureConfigurator;