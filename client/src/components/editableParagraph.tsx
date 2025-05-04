import React, { useRef, useState, useEffect } from "react";

const autoResizeTextArea = (el: HTMLTextAreaElement) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

interface EditableParagraphProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EditableParagraph: React.FC<EditableParagraphProps> = ({
  value,
  onChange,
  placeholder = "Click to edit...",
  className = "",
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      autoResizeTextArea(textareaRef.current);
    }
  }, [editing]);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    onChange(text.trim());
  };

  return editing ? (
    <textarea
      autoFocus
      ref={textareaRef}
      className={`min-h-0 -m-1 p-1 w-full border-0 outline-neutral rounded-lg outline resize-none ${className}`}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        if (textareaRef.current) autoResizeTextArea(textareaRef.current);
      }}
      onBlur={handleBlur}
      rows={1}
    />
  ) : (
    <p
      className={`cursor-pointer whitespace-pre-wrap break-words ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-neutral-400">{placeholder}</span>}
    </p>
  );
};
