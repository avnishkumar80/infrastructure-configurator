export const validateConfigStructure = (config) => {
    if (!config || typeof config !== 'object') return false;

    const requiredKeys = ['productInfo', 'steps', 'subItems', 'products'];
    const hasRequiredKeys = requiredKeys.every(key => key in config);

    if (!hasRequiredKeys) return false;

    // Additional validation
    if (!config.productInfo || typeof config.productInfo !== 'object') return false;
    if (!Array.isArray(config.steps)) return false;
    if (!config.subItems || typeof config.subItems !== 'object') return false;
    if (!config.products || typeof config.products !== 'object') return false;

    return true;
};

export const getValidationStatus = (config) => {
    if (!config || !config.selections || config.selections.length === 0) return 'incomplete';

    const hasErrors = config.selections.some(sel => !sel.configured);
    if (hasErrors) return 'error';

    const hasWarnings = config.selections.some(sel =>
        sel.quantity < 1 || Object.keys(sel.config || {}).length === 0
    );
    if (hasWarnings) return 'warning';

    return 'valid';
};

export const getAllMessages = (configuration, configData) => {
    const messages = [];

    Object.entries(configuration).forEach(([category, categoryConfig]) => {
        Object.entries(categoryConfig).forEach(([subItem, config]) => {
            if (subItem === 'step-review') return;

            const status = getValidationStatus(config);
            const itemName = configData.subItems?.[category]?.find(item => item.id === subItem)?.label || subItem;
            const availableProducts = configData.products?.[subItem] || [];

            const hasRequiredElements = availableProducts.some(product =>
                product.modules && Object.values(product.modules).some(module => module.required)
            );

            if (status === 'incomplete') {
                if (hasRequiredElements) {
                    messages.push({
                        type: 'error',
                        category,
                        subItem,
                        title: `${itemName} required`,
                        message: `This section is mandatory and needs configuration`,
                        severity: 'high'
                    });
                } else {
                    messages.push({
                        type: 'info',
                        category,
                        subItem,
                        title: `${itemName} available`,
                        message: `Optional section ready for configuration`,
                        severity: 'low'
                    });
                }
            } else if (status === 'error') {
                config.selections.forEach((selection, index) => {
                    if (!selection.configured) {
                        messages.push({
                            type: 'error',
                            category,
                            subItem,
                            title: `${selection.product.name} incomplete`,
                            message: `Required configuration options are missing`,
                            severity: 'high'
                        });
                    }
                });
            } else if (status === 'warning') {
                config.selections.forEach((selection, index) => {
                    if (selection.quantity < 1) {
                        messages.push({
                            type: 'warning',
                            category,
                            subItem,
                            title: `${selection.product.name} quantity issue`,
                            message: `Quantity should be at least 1`,
                            severity: 'medium'
                        });
                    }
                });
            }
        });
    });

    return messages;
};
