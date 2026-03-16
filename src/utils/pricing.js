export const calculatePrice = (product, config, quantity) => {
    let total = product.basePrice;

    if (config && product.modules) {
        Object.entries(product.modules).forEach(([moduleId, module]) => {
            const moduleConfig = config[moduleId];

            if (module.type === 'single-select' && moduleConfig) {
                const selectedOption = module.options.find(opt => opt.id === moduleConfig);
                if (selectedOption) total += selectedOption.price;
            } else if (module.type === 'multi-select-quantity' && moduleConfig) {
                moduleConfig.forEach(selection => {
                    const option = module.options.find(opt => opt.id === selection.optionId);
                    if (option) total += option.price * selection.quantity;
                });
            }
        });
    }

    return total * (quantity || 1);
};
