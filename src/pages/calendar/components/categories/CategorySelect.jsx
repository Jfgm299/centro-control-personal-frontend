import { useTranslation } from 'react-i18next'
import SelectInput from '../../../../components/ui/SelectInput'

export default function CategorySelect({ categories, value, onChange, placeholder }) {
  const { t } = useTranslation('calendar')

  const options = categories.map(c => ({
    value: c.id,
    label: c.name,
    color: c.color,
    icon:  c.icon,
  }))

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t('event.fields.categoryNone')}
      labelKey="label"
      optionIconKey="icon"
    />
  )
}
