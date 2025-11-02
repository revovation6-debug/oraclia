import React from 'react';

const EMOJIS = [
  '😀', '😂', '😍', '🤔', '😢', '🙏', '👍', '❤️', '✨', '⭐', '🔮', '🌙',
  '😇', '😊', '🥳', '🤯', '😭', '😱', '😮', '🙄', '😕', '😟', '🥺', '🔥',
  '💔', '💯', '👋', '🤞', '🙌', '🤷', '✅', '❌', '❓', '❗'
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={pickerRef} className="absolute bottom-full mb-2 bg-brand-bg-white dark:bg-dark-bg-secondary p-2 rounded-lg shadow-xl border border-brand-primary z-10 w-64">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className="text-2xl p-1 rounded-md hover:bg-brand-primary-light dark:hover:bg-dark-bg-primary transition-colors"
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};