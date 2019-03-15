(async function () {
    const CubicWeightCalculatingService = require('./service/cubic-weight-calculating-service.js');

    const baseUrl = 'http://wp8m3he1wt.s3-website-ap-southeast-2.amazonaws.com';
    const initialPath = '/api/products/1';
    const category = 'Air Conditioners';

    // const avgCubicWeight = await CubicWeightCalculatingService.calculate(baseUrl, initialPath, category);
    const avgCubicWeight = await CubicWeightCalculatingService.calculate(baseUrl, initialPath, null);

    if (avgCubicWeight <= 0.0) {
        console.log(`Error: no available data for Average Cubic Weight of product category: [${category}]`);
    } else {
        console.log(`Average Cubic Weight of product category [${category}] is: ${avgCubicWeight}`);
    }
})();