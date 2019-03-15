const Request = require('request-promise');
const CUBIC_WEIGHT_CONVERSION_FACTOR = 250;
const CUBIC_CENTIMETER_TO_CUBIC_METER_FACTOR = 0.000001;

class CubicWeightCalculatingService {

    // Init fields
    constructor() {
        this.totalProductCount = 0;
        this.totalAvgCubicWeight = 0.0;
    }

    // Main facade of the service: calculate avg cubic weight by URL, Path and Category
    async calculate(baseUrl, initialPath, category) {
        this.category = category;
        this.nextPath = initialPath;

        // Keep calculating all pages
        while (this.nextPath) {
            await this.calculatePage(baseUrl + this.nextPath);
        }

        // Return
        return this.totalAvgCubicWeight;
    }

    // Request and calculate and update avg cubic weight for a single API page
    async calculatePage(fullUrl) {
        let pageProductCount = 0;
        let pageTotalCubicWeight = 0.0;
        let pageAvgCubicWeight = 0.0;

        // Request API
        const response = await Request.get(fullUrl).catch((err) => {
            console.log(`Error: failed to Get from Url: ${fullUrl}`);
            this.nextPath = undefined;
        });

        // Init process response
        if (!response) return;
        const jsonResponse = JSON.parse(response);
        this.nextPath = jsonResponse.next;

        // Filter products by category
        let validProducts = jsonResponse.objects;
        if (this.category) {
            validProducts = validProducts.filter(product => product.category === this.category);
        }

        // Filter products by size data integrity
        validProducts = validProducts.filter(product => product.size
            && product.size.width && product.size.length && product.size.height);

        // Check each valid product on the page
        for (const product of validProducts) {
            pageProductCount++;
            const productCubicWeight = CubicWeightCalculatingService.calculateCubicWeight(product.size);
            pageTotalCubicWeight += productCubicWeight;
        }

        // Calculate page avg and count
        if (pageProductCount !== 0) {
            pageAvgCubicWeight = pageTotalCubicWeight / pageProductCount;
        }

        // Update total avg and count
        this.updateAvgCubicWeight(pageAvgCubicWeight, pageProductCount);
    }

    // Util: calculate cubic weight for a single product
    static calculateCubicWeight (size) {
        return size.width * size.length * size.height * CUBIC_CENTIMETER_TO_CUBIC_METER_FACTOR * CUBIC_WEIGHT_CONVERSION_FACTOR;
    }

    // Util: update overall avg cubic weight by considering
    updateAvgCubicWeight (pageAvgCubicWeight, pageProductCount) {
        const newTotalProductCount = this.totalProductCount + pageProductCount;
        const newTotalAvgCubicWeight = this.totalProductCount / newTotalProductCount * this.totalAvgCubicWeight
            + pageProductCount / newTotalProductCount * pageAvgCubicWeight;
        this.totalProductCount = newTotalProductCount;
        this.totalAvgCubicWeight = newTotalAvgCubicWeight;
    }

}

module.exports = new CubicWeightCalculatingService();