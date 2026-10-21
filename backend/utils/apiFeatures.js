product = require("../models/product");
class APIFeatures {

    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    // http://localhost:2173?keyword=apple&price[]
    // http://localhost:4001/api/v1/products?page=1&keyword=apple&price[lte]=1000&price[gte]=10
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}
        console.log(this.query, this.queryStr);
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        // { 'price[gte]': '100', 'price[lte]': '1000' }
        const queryCopy = { ...this.queryStr };
        // console.log(queryCopy);
        // Removing fields from the query
        const removeFields = ['keyword', 'page']
        removeFields.forEach(el => delete queryCopy[el]);

        const clauses = [];
        const pullRange = (field) => {
            const range = {};
            const nested = queryCopy[field];
            if (nested && typeof nested === 'object') {
                if (nested.gte !== undefined) range.$gte = Number(nested.gte);
                if (nested.lte !== undefined) range.$lte = Number(nested.lte);
                delete queryCopy[field];
            }
            if (queryCopy[`${field}[gte]`] !== undefined) {
                range.$gte = Number(queryCopy[`${field}[gte]`]);
                delete queryCopy[`${field}[gte]`];
            }
            if (queryCopy[`${field}[lte]`] !== undefined) {
                range.$lte = Number(queryCopy[`${field}[lte]`]);
                delete queryCopy[`${field}[lte]`];
            }
            return Object.keys(range).length ? range : null;
        }
        const price = pullRange('price');
        if (price) {
            clauses.push({
                $or: [
                    { price },
                    { listingType: 'trade' }
                ]
            });
        }
        const ratings = pullRange('ratings');
        if (ratings) clauses.push({ ratings });
        const numOfReviews = pullRange('numOfReviews');
        if (numOfReviews) clauses.push({ numOfReviews });

        console.log(queryCopy);
        if (Object.keys(queryCopy).length) {
            clauses.push(queryCopy);
        }
        if (clauses.length) {
            this.query = this.query.find({ $and: clauses });
        }
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
module.exports = APIFeatures