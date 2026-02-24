import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Twitter as XIcon, 
  ArrowUpRight, 
  Mail, 
  MessageSquare, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] text-white pt-16 md:pt-24 pb-8 overflow-hidden">
      {/* Ligne de lumière futuriste */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-24">
          
          {/* BRAND BLOCK */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <Link to="/" className="inline-block group">
              {/* Logo réduit sur mobile : text-4xl vs text-6xl */}
              <span className="text-4xl md:text-6xl font-[1000] tracking-[-0.08em] italic uppercase leading-none">
                CHEEL<span className="text-indigo-600 group-hover:drop-shadow-[0_0_15px_rgba(79,70,229,0.6)] transition-all">.</span>
              </span>
            </Link>
            
            <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase leading-relaxed max-w-sm tracking-wider opacity-70">
              Propulser votre style dans une nouvelle dimension. 
              Curateurs de technologies avant-gardistes.
            </p>
            
            <div className="flex gap-3">
              <SocialButton href="#" icon={<Instagram size={18} />} hover="hover:bg-indigo-600" />
              <SocialButton href="#" icon={<Facebook size={18} />} hover="hover:bg-blue-600" />
              <SocialButton href="#" icon={<XIcon size={18} />} hover="hover:bg-white hover:text-black" />
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="lg:col-span-3">
            <h3 className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-2">
              <Zap size={10} fill="currentColor" /> System.Nav
            </h3>
            <ul className="grid grid-cols-1 gap-4 md:gap-5">
              <FooterLink to="/shop" label="Boutique" />
              <FooterLink to="/my-orders" label="Mes Commandes" />
              <FooterLink to="/cart" label="Panier" />
            </ul>
          </div>

          {/* CONTACT TERMINAL - Liens corrigés */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <h3 className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-2">
              <Globe size={10} /> Contact.Terminal
            </h3>
            
            <div className="space-y-3">
              {/* LIEN EMAIL CORRIGÉ */}
              <a 
                href="mailto:cheel.infos@gmail.com" 
                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Mail size={16} className="text-indigo-400" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">cheel.infos@gmail.com</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white" />
              </a>

              {/* LIEN WHATSAPP CORRIGÉ (Remplace les 0 par ton vrai numéro) */}
              <a 
                href="https://wa.me/23566000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-green-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <MessageSquare size={16} className="text-green-400" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">WhatsApp Business</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-8 p-6 md:p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-gray-500 font-bold text-[8px] md:text-[9px] uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
              <ShieldCheck size={12} className="text-indigo-500" />
              <span className="text-white/80">Secured Protocol</span>
            </div>
            <span>© {currentYear} CHEEL_LABS</span>
          </div>

          <div className="flex gap-6 items-center">
            <Link to="/terms" className="text-gray-600 hover:text-white text-[8px] font-black uppercase tracking-widest transition-colors">Legal</Link>
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
               <span className="text-[8px] font-black italic">CH.</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

/* Sub-components */
const SocialButton = ({ href, icon, hover }) => (
  <a href={href} className={`w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center transition-all ${hover}`}>
    {icon}
  </a>
);

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="group flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all">
      <span>{label}</span>
      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
    </Link>
  </li>
);

export default Footer;