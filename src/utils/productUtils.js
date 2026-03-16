export const getDefaultConfig = (product) => {
    const config = {};
    if (product.modules) {
        Object.entries(product.modules).forEach(([moduleId, module]) => {
            if (module.type === 'single-select' && module.defaultSelection) {
                config[moduleId] = module.defaultSelection;
            } else if (module.type === 'multi-select-quantity' && module.defaultSelections) {
                config[moduleId] = [...module.defaultSelections];
            }
        });
    }
    return config;
};
