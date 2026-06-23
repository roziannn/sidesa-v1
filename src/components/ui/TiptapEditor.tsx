'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Blockquote from '@tiptap/extension-blockquote';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowRightToLine, ArrowLeftToLine 
} from 'lucide-react';

export default function TiptapEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: false }),
      Image,
      Blockquote,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  const handleIndent = () => {
  const { state, dispatch } = editor.view;
  const { selection } = state;
  const { $from } = selection;
  const node = $from.node($from.depth);
  
  // Ambil padding saat ini, default ke 0
  const currentPadding = parseInt(node.attrs.paddingLeft || '0');
  editor.chain().focus().updateAttributes(node.type.name, { 
    paddingLeft: `${currentPadding + 20}px` 
  }).run();
};

const handleOutdent = () => {
  const { state } = editor.view;
  const { selection } = state;
  const { $from } = selection;
  const node = $from.node($from.depth);
  
  const currentPadding = parseInt(node.attrs.paddingLeft || '0');
  editor.chain().focus().updateAttributes(node.type.name, { 
    paddingLeft: `${Math.max(0, currentPadding - 20)}px` 
  }).run();
};

  const toggleLinkInput = () => {
    const previousUrl = editor?.getAttributes('link').href;
    setUrlInput(previousUrl || '');
    setShowLinkInput(!showLinkInput);
  };

  const applyLink = () => {
    if (urlInput === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: urlInput, target: '_blank' }).run();
    }
    setShowLinkInput(false);
  };

  const ToolbarButton = ({ onClick, isActive, children, disabled }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-30 ${isActive ? 'bg-slate-200 text-emerald-600' : 'text-slate-600'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
      
      {/* Area Input Link */}
      {showLinkInput && (
        <div className="flex gap-2 p-2 border-b border-slate-200 bg-white">
          <input
            type="text"
            placeholder="Masukkan URL (https://...)"
            className="flex-1 px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-emerald-500"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyLink()}
          />
          <button onClick={applyLink} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
            Simpan
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-1 flex flex-wrap gap-0.5 items-center">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}> <Undo className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}> <Redo className="w-4 h-4" /> </ToolbarButton>
        
        <div className="w-px bg-slate-300 mx-1 h-5" />

        <ToolbarButton onClick={toggleLinkInput} isActive={editor.isActive('link')}> <LinkIcon className="w-4 h-4" /> </ToolbarButton>
        
        <div className="w-px bg-slate-300 mx-1 h-5" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}> <Heading1 className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}> <Heading2 className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}> <Heading3 className="w-4 h-4" /> </ToolbarButton>
        
        <div className="w-px bg-slate-300 mx-1 h-5" />
        
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}> <AlignLeft className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}> <AlignCenter className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}> <AlignRight className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}> <AlignJustify className="w-4 h-4" /> </ToolbarButton>

        <div className="w-px bg-slate-300 mx-1 h-5" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}> <Bold className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}> <Italic className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}> <UnderlineIcon className="w-4 h-4" /> </ToolbarButton>
        
        <div className="w-px bg-slate-300 mx-1 h-5" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}> <List className="w-4 h-4" /> </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}> <ListOrdered className="w-4 h-4" /> </ToolbarButton>
        
      <ToolbarButton onClick={handleIndent}> <ArrowRightToLine className="w-4 h-4" /> </ToolbarButton>
      <ToolbarButton onClick={handleOutdent}> <ArrowLeftToLine className="w-4 h-4" /> </ToolbarButton>
      </div>
      
      <EditorContent editor={editor} />
      
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-1.5 flex justify-end">
        <span className="text-xs text-slate-500 font-medium">{wordCount} Kata</span>
      </div>
    </div>
  );
}