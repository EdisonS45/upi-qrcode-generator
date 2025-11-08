// A simple converter. For production, a more robust library might be needed.
function amountToWords(num) {
    if (num === null || num === undefined) {
        return '';
    }

    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen'
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    const convert = (n) => {
        if (n < 0) return ''; // Handle negative numbers
        if (n < 20) {
            return a[n];
        }
        if (n < 100) {
            return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        }
        if (n < 1000) {
            return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        }
        if (n < 100000) {
            return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        }
        if (n < 10000000) {
            return convert(Math.floor(n / 100000)) + ' lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        }
        // Extend for crore if needed
        if (n < 1000000000) {
             return convert(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
        }
        return '';
    };

    const numStr = Number(num).toFixed(2);
    const [rupees, paise] = numStr.split('.').map(Number);
    
    let words = convert(rupees);
    
    // Capitalize
    words = words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Zero';
    
    let result = `Rupees ${words}`;
    
    if (paise > 0) {
        // Handle paise conversion
        let paiseWords = convert(paise);
        paiseWords = paiseWords.charAt(0).toUpperCase() + paiseWords.slice(1);
        result += ` and ${paiseWords} Paise`;
    }
    
    result += ' Only';
    return result;
}

export { amountToWords };