import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, 
  Quote, Undo, Redo, Type, Link as LinkIcon, ImagePlus 
} from "lucide-react";

// Sous-composant pour la barre d'outils
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL de l\'image');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const btnClass = (active) => `
    p-2 rounded-lg transition-all 
    ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}
  `;

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-100 rounded-t-[2rem]">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}><Type size={16} /></button>
      <div className="w-[1px] h-6 bg-slate-200 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}><Quote size={16} /></button>
      <div className="w-[1px] h-6 bg-slate-200 mx-1 self-center" />
      <button type="button" onClick={addImage} className={btnClass(false)}><ImagePlus size={16} /></button>
      <div className="flex-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}><Undo size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}><Redo size={16} /></button>
    </div>
  );
};

export default function DescriptionSection({ form, setForm }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: form.description,
    onUpdate: ({ editor }) => {
      // Met à jour le state du formulaire parent avec le HTML généré
      setForm(prev => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-6 min-h-[250px] max-h-[500px] overflow-y-auto cursor-text',
      },
    },
  });

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Description Professionnelle
        </label>
        <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase">TipTap Editor</span>
      </div>
      
      <MenuBar editor={editor} />
      
      <div className="relative">
        <EditorContent editor={editor} />
        {editor && editor.isEmpty && (
          <div className="absolute top-6 left-6 text-slate-300 pointer-events-none text-sm italic">
            Décrivez votre produit ici (caractéristiques, avantages, matière...)
          </div>
        )}
      </div>
    </div>
  );
}