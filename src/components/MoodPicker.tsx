import { useState } from 'react';

export type MoodOption = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface PickerPosition {
  x: number;
  y: number;
}

interface MoodPickerProps {
  onSelect: (mood: MoodOption) => void;
  isOpen?: boolean;
  onClose?: () => void;
  position?: PickerPosition | null;
}

const moodOptions: { value: MoodOption; label: string; color: string; bgColor: string; hoverColor: string }[] = [
  {
    value: 'great',
    label: 'Great',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    hoverColor: 'hover:bg-emerald-200',
  },
  {
    value: 'good',
    label: 'Good',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    hoverColor: 'hover:bg-blue-200',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    hoverColor: 'hover:bg-gray-200',
  },
  {
    value: 'bad',
    label: 'Bad',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    hoverColor: 'hover:bg-orange-200',
  },
  {
    value: 'terrible',
    label: 'Terrible',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    hoverColor: 'hover:bg-red-200',
  },
];

function MoodPicker({ onSelect, isOpen = true, onClose, position }: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);

  const handleSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    onSelect(mood);
    // Auto-close after selection if onClose is provided
    if (onClose) {
      setTimeout(() => {
        onClose();
        setSelectedMood(null);
      }, 200);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Calculate position for the picker with smarter positioning logic
  const getPickerStyle = (): React.CSSProperties => {
    if (!position) {
      return {};
    }

    const pickerWidth = 384; // max-w-sm = 384px
    const pickerHeight = 280; // Approximate height including padding
    const padding = 16; // Viewport padding
    const offset = 12; // Offset from clicked cell
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate horizontal position with smart centering
    let left = position.x;
    const halfWidth = pickerWidth / 2;
    
    // Check if picker would overflow right
    if (left + halfWidth > viewportWidth - padding) {
      left = viewportWidth - halfWidth - padding;
    }
    // Check if picker would overflow left
    if (left - halfWidth < padding) {
      left = halfWidth + padding;
    }
    
    // Calculate vertical position with preference for below, fallback to above
    let top = position.y + offset;
    let placement: 'below' | 'above' | 'center' = 'below';
    
    // Check if there's enough room below
    if (top + pickerHeight > viewportHeight - padding) {
      // Try above
      const topAbove = position.y - pickerHeight - offset;
      if (topAbove >= padding) {
        top = topAbove;
        placement = 'above';
      } else {
        // Not enough room above or below, center vertically
        top = Math.max(padding, (viewportHeight - pickerHeight) / 2);
        placement = 'center';
      }
    }
    
    // Ensure we don't go below viewport
    if (top + pickerHeight > viewportHeight - padding) {
      top = viewportHeight - pickerHeight - padding;
    }
    
    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      transform: 'translate(-50%, 0)',
      zIndex: 50,
    };
  };

  const containerClass = position
    ? 'fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70'
    : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70';

  return (
    <div className={`${containerClass} animate-fade-in`} onClick={onClose}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all duration-200 animate-scale-in ${
          position ? '' : 'mx-auto'
        }`}
        style={getPickerStyle()}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside picker
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            How are you feeling?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                ${option.bgColor}
                ${option.color}
                ${option.hoverColor}
                px-5 py-4 sm:py-3 rounded-xl
                font-medium text-sm sm:text-base
                transition-all duration-200
                transform hover:scale-105 active:scale-95
                shadow-sm hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-gray-400 dark:focus:ring-gray-500
                min-h-[48px] sm:min-h-0
                ${selectedMood === option.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-105 shadow-md' : ''}
              `}
              aria-label={`Select ${option.label} mood`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium py-2 transition-colors"
            aria-label="Close mood picker"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default MoodPicker;
