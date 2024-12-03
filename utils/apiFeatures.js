class ApiFeature {
  constructor(reqQuery, mongooseQuery) {
    this.reqQuery = reqQuery;
    this.mongooseQuery = mongooseQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    const options = ["keyword", "fields", "sort", "page", "limit"];
    options.forEach((element) => {
      delete queryObj[element];
    });
    let queryObjStr = JSON.stringify(queryObj);
    queryObjStr = queryObjStr.replace(/\b(gte|gt|lt|lte)\b/gi, (e) => `$${e}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryObjStr));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortOption = this.reqQuery.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortOption);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fieldOption = this.reqQuery.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(`${fieldOption} -_id`);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-__v");
    }
    return this;
  }

  search() {
    if (this.reqQuery.keyword) {
      let query = {};
      query = { desc: { $regex: this.reqQuery.keyword, $options: "i" } };
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDoc) {
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit || 3;
    const skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
    const endEndex = page * limit;

    const pagination = {};
    pagination.totalPages = Math.ceil(countDoc / limit);
    pagination.currentPage = page;
    if (skip > 0) {
      pagination.previous = page - 1;
    }
    if (endEndex < countDoc) {
      pagination.next = page + 1;
    }
    this.paginationResult = pagination;
    return this;
  }

  async count() {
    const clone = this.mongooseQuery.clone();
    const count = await clone.countDocuments();
    return count;
  }
}

module.exports = ApiFeature;
