import { ProductData } from './productDataInterface'

import {
  PRODUCT_ID,
  PRODUCT_NAME,
  PRODUCT_FROM,
  PRODUCT_PRICE,
  PRODUCT_QUANTITY,
  PRODUCT_NUTRIENTS,
  PRODUCT_DESCRIPTION,
  PRODUCT_IMAGE,
  CL_NOT_ORGANIC,
  PRODUCT_NOT_ORGANIC,
} from './constants'

// *****************************************************************************
// UTILITY

export const rxSub = (templateVariable: string): RegExp =>
  new RegExp(`\{%${templateVariable}%\}`, 'g')
// const compileTemplate: (template: string, vals: ProductData) => string = (template, vals) => {
export const compileTemplate = (
  template: string,
  product: ProductData
): string => {
  let output = template.replace(rxSub(PRODUCT_ID), product.id.toString())
  output = output.replace(rxSub(PRODUCT_NAME), product.productName)
  output = output.replace(rxSub(PRODUCT_IMAGE), product.image)
  output = output.replace(rxSub(PRODUCT_FROM), product.from)
  output = output.replace(rxSub(PRODUCT_NUTRIENTS), product.nutrients)
  output = output.replace(rxSub(PRODUCT_QUANTITY), product.quantity)
  output = output.replace(rxSub(PRODUCT_PRICE), product.price.toString())
  output = output.replace(rxSub(PRODUCT_DESCRIPTION), product.description)

  if (!product.organic)
    output = output.replace(rxSub(PRODUCT_NOT_ORGANIC), CL_NOT_ORGANIC)

  return output
}
