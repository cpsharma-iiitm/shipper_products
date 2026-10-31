/**
 * True when a cart line cannot be bought as it stands: the product is out of stock, or the customer asked
 * for more than the backend allows (`maxQuantity` on the quote line).
 */
export function lineHasStockProblem(line, quantity) {
  return line.maxQuantity === 0 || quantity > line.maxQuantity
}
