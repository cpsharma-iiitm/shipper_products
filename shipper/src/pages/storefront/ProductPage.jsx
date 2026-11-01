import { useParams } from 'react-router-dom'
import { ProductDetail } from '@/features/catalog'

/** /products/:slug — product detail. */
export default function ProductPage() {
  const { slug } = useParams()
  return <ProductDetail slug={slug} />
}
