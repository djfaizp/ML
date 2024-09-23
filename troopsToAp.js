// troopsToAp.js
module.exports = function troopsToAp(troops, strikerPercentage) {
    // Convert troops to M
    const troopsInM = convertToM(troops.value, troops.unit);

    // Calculate AP using the formula: troops + (troops * strikerPercentage / 100)
    const ap = troopsInM + (troopsInM * strikerPercentage / 100);
    return ap;
};

function convertToM(value, unit) {
    switch(unit) {
        case 'G':
            return value * 1000;
        case 'T':
            return value * 1000000;
        case 'P':
            return value * 1000000000;
        default:
            return value;
    }
}

function convertFromM(value, unit) {
    switch(unit) {
        case 'G':
            return { responseValue: value / 1000, responseUnit: 'G' };
        case 'T':
            return { responseValue: value / 1000000, responseUnit: 'T' };
        case 'P':
            return { responseValue: value / 1000000000, responseUnit: 'P' };
        default:
            return { responseValue: value, responseUnit: 'M' };
    }
}

// Export the conversion functions for use in the main script
module.exports.convertToM = convertToM;
module.exports.convertFromM = convertFromM;