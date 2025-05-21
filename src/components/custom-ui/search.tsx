import { CiSearch } from 'react-icons/ci'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface SearchProps {
  onSearch?: (value: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    setSearchValue('')
    onSearch?.('')
  }

  const handleChange = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between border rounded-lg transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary',
        'hover:border-primary/50',
        'dark:border-gray-800 bg-background',
        isFocused && 'shadow-sm'
      )}
    >
      <div className="flex items-center flex-1 px-3">
        <CiSearch className={cn(
          'h-4 w-4 text-muted-foreground transition-colors duration-200',
          isFocused && 'text-primary'
        )} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'border-0 focus:outline-none focus:ring-0 focus:placeholder:text-primary',
            'bg-transparent placeholder:text-muted-foreground',
            'text-sm px-2 p-2',
            'appearance-none'
          )}
          placeholder='Search...'
        />
      </div>
      
      <AnimatePresence mode="wait">
        {searchValue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
