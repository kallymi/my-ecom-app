import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Twitter as XIcon, // On renomme l'import pour la clarté
  ArrowUpRight, 
  Mail, 
  Phone, 
  MessageSquare, // Pour WhatsApp
  ShieldCheck 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-20 pb-10 px-4 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HAUTE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* LOGO CHEEL & RÉSEAUX */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="text-5xl font-[900] tracking-tighter italic uppercase group flex items-center gap-2">
              CHEEL<span className="text-blue-600 group-hover:text-white transition-colors">.</span>
            </Link>
            <p className="text-gray-400 font-bold text-sm uppercase leading-relaxed max-w-sm tracking-tighter">
              L'excellence à votre portée. Nous sélectionnons les meilleurs produits 
              pour une expérience shopping d'exception.
            </p>
            
            {/* RÉSEAUX SOCIAUX MIS À JOUR */}
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-pink-600 transition-all group">
                <Instagram size={20} className="text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all group">
                <Facebook size={20} className="text-gray-400 group-hover:text-white" />
              </a>
              {/* LIEN X (Twitter) */}
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all group">
                <XIcon size={20} className="text-gray-400 group-hover:text-black" />
              </a>
              {/* LIEN WHATSAPP */}
              <a href="https://wa.me/23566000000" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all group">
                <MessageSquare size={20} className="text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* LIENS RAPIDES */}
          <div className="md:col-span-3 grid grid-cols-1 gap-4">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4">Navigation</h3>
            <Link to="/shop" className="group flex items-center gap-2 font-bold text-sm uppercase tracking-widest hover:text-blue-500 transition-colors">
              Boutique <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
            <Link to="/order-history" className="group flex items-center gap-2 font-bold text-sm uppercase tracking-widest hover:text-blue-500 transition-colors">
              Mes Commandes <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
            <Link to="/cart" className="group flex items-center gap-2 font-bold text-sm uppercase tracking-widest hover:text-blue-500 transition-colors">
              Panier <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          </div>

          {/* CONTACT & WHATSAPP DIRECT */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4">Assistance</h3>
            <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tighter">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-500">
                <Mail size={18} />
              </div>
              contact@cheel.shop
            </div>
            <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tighter">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-green-500">
                <MessageSquare size={18} />
              </div>
              WhatsApp : +235 66 00 00 00
            </div>
          </div>

        </div>

        {/* SECTION BASSE */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
            <ShieldCheck size={16} className="text-green-500" />
            Paiements 100% Sécurisés
          </div>

          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
            © {currentYear} CHEEL. TOUS DROITS RÉSERVÉS.
          </p>

          <div className="flex gap-6">
            <Link to="/terms" className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-tighter">Conditions</Link>
            <Link to="/privacy" className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-tighter">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;