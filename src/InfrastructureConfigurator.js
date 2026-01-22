import React from 'react';
import { useConfiguration } from './hooks/useConfiguration';
import Header from './components/layout/Header';
import StepNavigator from './components/common/StepNavigator';
import Sidebar from './components/layout/Sidebar';
import ProductSelector from './components/features/ProductSelector';
import Summary from './components/features/Summary';
import AIConfigurationAssistant from './components/features/AIConfigurationAssistant';
import IntentSelector from './components/features/IntentSelector';

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
    setUserIntent,
    updateConfiguration,
    handleFileUpload,
    downloadConfiguration,
    resetToDefault
  } = useConfiguration();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isIntentModalOpen, setIsIntentModalOpen] = React.useState(false);

  // Check if configuration has any items
  const hasActiveConfig = React.useMemo(() => {
    return Object.values(configuration).some(category =>
      Object.values(category).some(subItem =>
        subItem.selections && subItem.selections.length > 0
      )
    );
  }, [configuration]);

  const handleIntentSelect = (intentId) => {
    // If hasActiveConfig and intent is changing, we assume user confirmed via modal UI
    if (userIntent && hasActiveConfig && JSON.stringify(userIntent) !== JSON.stringify(intentId)) {
      resetToDefault();
    }
    setUserIntent(intentId);
    setIsIntentModalOpen(false);
  };

  const handleAINavigateToStep = (category, subItem) => {
    setCurrentStep(category);
    setCurrentSubItem(subItem);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const handleAIApplyConfiguration = (suggestion) => {
    const { category, subItem, productId, config } = suggestion;

    // Find the product
    const product = configData.products[subItem]?.find(p => p.id === productId);
    if (!product) return;

    // Create new selection with AI suggestion
    const newSelection = {
      productId: product.id,
      product,
      config: config,
      quantity: 1,
      configured: true
    };

    // Get current selections and add the new one
    const currentSelections = configuration[category]?.[subItem]?.selections || [];
    const newSelections = [...currentSelections, newSelection];

    // Update configuration
    updateConfiguration(category, subItem, newSelections);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden font-sans">
      {(!userIntent || isIntentModalOpen) && (
        <IntentSelector
          intentQuestions={configData.intentQuestions}
          currentIntent={userIntent}
          onSelect={handleIntentSelect}
          onClose={userIntent ? () => setIsIntentModalOpen(false) : undefined}
          hasActiveConfig={hasActiveConfig}
        />
      )}

      <Header
        configData={configData}
        configuration={configuration}
        isConfigLoading={isConfigLoading}
        configError={configError}
        uploadSuccess={uploadSuccess}
        handleFileUpload={handleFileUpload}
        downloadConfiguration={downloadConfiguration}
        resetToDefault={resetToDefault}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userIntent={userIntent}
        onOpenIntentSelector={() => setIsIntentModalOpen(true)}
      />

      <StepNavigator
        configData={configData}
        configuration={configuration}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        setCurrentSubItem={setCurrentSubItem}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          configData={configData}
          configuration={configuration}
          currentStep={currentStep}
          currentSubItem={currentSubItem}
          setCurrentSubItem={(subItem) => {
            setCurrentSubItem(subItem);
            setIsMobileMenuOpen(false);
          }}
          setSelectedProductIndex={setSelectedProductIndex}
          updateConfiguration={updateConfiguration}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 bg-slate-50 overflow-y-auto w-full">
          <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto">
            <div className="max-w-none">
              {currentStep === 'review' ? (
                <Summary
                  configData={configData}
                  configuration={configuration}
                />
              ) : (
                <ProductSelector
                  category={currentStep}
                  subItem={currentSubItem}
                  configData={configData}
                  configuration={configuration}
                  updateConfiguration={updateConfiguration}
                  selectedProductIndex={selectedProductIndex}
                  setSelectedProductIndex={setSelectedProductIndex}
                  userIntent={userIntent}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <AIConfigurationAssistant
        onApplyConfiguration={handleAIApplyConfiguration}
        onNavigateToStep={handleAINavigateToStep}
      />
    </div>
  );
};

export default InfrastructureConfigurator;