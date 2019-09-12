import { RequestHandler } from 'express'

// TODO: switch to using AppRequest, create AppRequestHandler

// 1. g takes a RequestHandler, fn
// 2. returns a new anonymous RequestHandler function that original fn
// 3. This new RequestHandler, when called by Express, calls original
//    RequestHandler fn and additionally issues .catch on a returned
//    promisse to forward errors to the global error handling middleware
// const g = (f: Rq): Rq => (rq, rs, nx): Promise<void> => f(rq, rs, nx).catch(nx)
const g = (fn: RequestHandler): RequestHandler => {
  return (req, res, next): any => {
    fn(req, res, next).catch(next)
    // we do not want next() here, it's fn's job to call it, we're just a wrapper
    // next()
  }
}

// reduction inside catch, from:
//   fn(req, res, next).catch(err => next(err))
// to:
//   fn(req, res, next).catch(next)

// @declare const g = (_: Rq) => Rq
// g = f => (rq, rs, nxt): Rp => f(rq, rs, nxt).catch(nxt)

// req: express.Request,
// res: express.Response,
// next: express.NextFunction
export default g
