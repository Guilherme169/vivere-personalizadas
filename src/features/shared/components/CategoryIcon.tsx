import { Beef, Wheat, Salad, Leaf, Milk, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Category } from '@/domain/catalog'

const ICON_BY_CATEGORY: Record<Category, LucideIcon> = {
  protein: Beef,
  carb: Wheat,
  vegetable: Salad,
  seasoning: Leaf,
  dairy: Milk,
  other: Plus,
}

interface CategoryIconProps {
  category: Category
  size?: number
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({
  category,
  size = 28,
  className,
  strokeWidth = 1.75,
}: CategoryIconProps) {
  const Icon = ICON_BY_CATEGORY[category]
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
