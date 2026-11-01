import { useForm } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import styles from './ShopSearch.module.scss'

/** In-page search for the catalogue ("Search products"). `value` follows the URL; submitting updates it. */
export default function ShopSearch({ value, onSearch, className }) {
  const { register, handleSubmit } = useForm({ values: { q: value ?? '' } })

  return (
    <form role="search" className={className} onSubmit={handleSubmit(({ q }) => onSearch(q))}>
      <FormField label="Search products">
        {(control) => (
          <div className={styles.row}>
            <Input {...control} type="search" placeholder="Search for haldi, shampoo, everyday essentials…" autoComplete="off" {...register('q')} />
            <Button type="submit" size="lg">
              Search
            </Button>
          </div>
        )}
      </FormField>
    </form>
  )
}
