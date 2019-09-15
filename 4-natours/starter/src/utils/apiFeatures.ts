import { DocumentQuery, Document } from 'mongoose'

export default class APIFeatures {
  query: DocumentQuery<Document[], Document, {}>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryObj: Record<string, any>

  constructor(
    query: DocumentQuery<Document[], Document, {}>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryObj: Record<string, any>
  ) {
    this.query = query
    this.queryObj = { ...queryObj }
  }

  filter(): APIFeatures {
    const queryCopy = { ...this.queryObj }
      // 1) filter out fields
    ;['page', 'sort', 'limit', 'fields'].forEach(el => delete queryCopy[el])

    // 2) advanced filtering
    let queryString = JSON.stringify(queryCopy)
    queryString = queryString.replace(
      /\b(lt|lte|gt|gte)\b/g,
      match => `$${match}`
    )

    this.query = this.query.find(JSON.parse(queryString))

    // allow chaining
    return this
  }

  sort(): APIFeatures {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    // allow chaining
    return this
  }

  limitFields(): APIFeatures {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' ')
      this.query = this.query.select(fields) // projecting
    } else {
      this.query = this.query.select('-__v') // exclude '__v' from projections by default
    }

    // allow chaining
    return this
  }

  paginate(): APIFeatures {
    const page = this.queryObj.page ? parseInt(this.queryObj.page) : 1
    const limit = parseInt(this.queryObj.limit) || 100
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    // allow chaining
    return this
  }
}
