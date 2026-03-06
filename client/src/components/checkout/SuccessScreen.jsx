import React from 'react';
import { 
  Package, ChevronRight, Phone, Truck, CheckCircle2 
} from 'lucide-react';

const SuccessScreen = ({ onNavigate, customerPhone }) => {
  return (
    <div className="fixed inset-0 z-[999] bg-white flex items-center justify-center p-6 overflow-hidden">
      {/* Background Soft Gradients - Très discret */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-slate-50/60 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-sm w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Icon Header - Style Verre/Glassmorphism */}
        <div className="relative w-24 h-24 mx-auto mb-12">
          <div className="w-full h-full bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-sm">
            <Package size={32} strokeWidth={1.2} className="text-slate-900" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-black text-white p-1.5 rounded-full ring-4 ring-white">
            <CheckCircle2 size={16} strokeWidth={3} />
          </div>
        </div>

        {/* Text Content - Typographie Premium */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-[1000] uppercase tracking-tighter leading-none mb-4 italic">
            Commande<br/>
            <span className="text-indigo-600">Recue.</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            Cheel • Express Delivery
          </p>
        </div>

        {/* Info Blocks - Discrets et alignés */}
        <div className="space-y-6 mb-12">
          <div className="flex items-start gap-4 group">
            <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
              <Phone size={18} strokeWidth={1.5} className="text-slate-900" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-0.5">Confirmation vocale</p>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wide">
                Notre equipe vous appelera au <span className="text-black font-bold">{customerPhone}</span> pour finaliser la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
              <Truck size={18} strokeWidth={1.5} className="text-slate-900" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-0.5">Expédition prioritaire</p>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wide">
                Préparation immédiate par notre équipe logistique.
              </p>
            </div>
            
          </div>
          <div className="flex items-start gap-4 group">
            
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-0.5">Merci pour la confiance ! </p>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wide">
                vote store en ligne <span className="text-black font-bold">Cheel</span>  concu pour votre bonheur.
              </p>
            </div>
            
          </div>
        </div>

        {/* Action Buttons - Style Cheel (Noir pur & Outline) */}
        <div className="space-y-3">
          <button 
            onClick={onNavigate} 
            className="w-full bg-black text-white py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Suivre mon colis <ChevronRight size={14} />
          </button>
          
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-colors"
          >
            Retour au catalogue
          </button>
        </div>

        {/* Bottom Footer */}
        <div className="mt-16 opacity-20">
            <p className="text-[8px] text-center font-black uppercase tracking-[0.5em]"> Cheel-Exclusive Experience</p>
        </div>

      </div>
    </div>
  );
};

export default SuccessScreen;