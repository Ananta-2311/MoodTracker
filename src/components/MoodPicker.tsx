import { useState } from 'react';

export type MoodOption = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface PickerPosition {
  x: number;
  y: number;
}

interface MoodPickerProps {
  onSelect: (mood: MoodOption) => void;
  onDelete?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  position?: PickerPosition | null;
  showDelete?: boolean;
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

function MoodPicker({ onSelect, onDelete, isOpen = true, onClose, position, showDelete = false }: MoodPickerProps) {
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      if (onClose) {
        setTimeout(() => {
          onClose();
          setSelectedMood(null);
        }, 200);
      }
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

    const pickerWidth = 512; // max-w-lg = 512px
    const pickerHeight = 350; // Approximate height including padding
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
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 w-full max-w-lg transform transition-all duration-200 animate-scale-in ${
          position ? '' : 'mx-auto'
        }`}
        style={getPickerStyle()}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside picker
      >
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
            How are you feeling?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                ${option.bgColor}
                ${option.color}
                ${option.hoverColor}
                px-4 py-5 rounded-xl
                font-semibold text-sm
                transition-all duration-200
                transform hover:scale-105 active:scale-95
                shadow-md hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-gray-400 dark:focus:ring-gray-500
                min-h-[60px]
                flex items-center justify-center
                break-words overflow-hidden
                ${selectedMood === option.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-105 shadow-lg' : ''}
              `}
              aria-label={`Select ${option.label} mood`}
            >
              <span className="text-center leading-tight">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {showDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-base font-medium py-3 transition-colors rounded-lg border border-red-200 dark:border-red-800"
              aria-label="Delete mood"
            >
              🗑️ Delete Mood
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-base font-medium py-3 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close mood picker"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MoodPicker;
