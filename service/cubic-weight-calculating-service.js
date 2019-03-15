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
      console.log(`calling next path: ${this.nextPath}`)
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

    const response = await Request.get(fullUrl).catch((err) => {
      console.log(`Error: failed to Get from Url: ${fullUrl}`);
      this.nextPath = undefined;
    });

    if(!response) return;

    const jsonResponse = JSON.parse(response);
    this.nextPath = jsonResponse.next;

    // Check each product on the page
    for(const product of jsonResponse.objects) {
      // Filter by category
      if (!this.category || (this.category && this.category === product.category)) {
        // Filter by
        pageProductCount ++;
        const productCubicWeight = this.calculateCubicWeight(product.size);
        console.log(`!!!cubic weight: ${productCubicWeight}`);
        pageTotalCubicWeight += productCubicWeight;
      }
    }

    // Calculate page count
    if (pageProductCount !== 0) {
      pageAvgCubicWeight = pageTotalCubicWeight / pageProductCount;
    }

    console.log(`!!! pre: ${this.totalProductCount} - ${this.totalAvgCubicWeight}`)
    console.log(`!!! this: ${pageProductCount} - ${pageAvgCubicWeight}`)
    this.updateAvgCubicWeight(pageAvgCubicWeight, pageProductCount);
    console.log(`!!! post: ${this.totalProductCount} - ${this.totalAvgCubicWeight}`)

  }

  // Util: calculate cubic weight for a single product
  calculateCubicWeight (size) {
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