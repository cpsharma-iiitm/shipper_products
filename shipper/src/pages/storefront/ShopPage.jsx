import { useParams } from 'react-router-dom'
import { ShopCatalog } from '@/features/catalog'

/** /shop, /category/:slug — catalogue browsing (search comes in as ?q=). */
export default function ShopPage() {
  const { slug } = useParams()
  return <ShopCatalog categorySlug={slug} />
}
