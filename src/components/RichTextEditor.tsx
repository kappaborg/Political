"use client";

import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Basit bir zengin metin editörü - üretim için daha gelişmiş editörler kullanılabilir
const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      className="min-h-[300px] p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 overflow-auto"
      contentEditable
      ref={editorRef}
      onInput={handleInput}
      style={{ lineHeight: '1.5' }}
    />
  );
};

export default RichTextEditor; 