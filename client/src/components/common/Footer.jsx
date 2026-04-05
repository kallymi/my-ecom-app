import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Facebook, 
  Twitter as XIcon, 
  ArrowUpRight, 
  Mail, 
  MessageSquare, 
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020202] text-white pt-20 pb-6 overflow-hidden border-t border-white/5">
      {/* EFFET DE FOND : Grille et Lumière */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* SECTION 1 : BRAND & MANIFESTO */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Link to="/" className="inline-block group">
                <span className="text-2xl md:text-3xl font-[1000] tracking-[-0.08em] italic uppercase leading-none block">
                  CHEEL<span className="text-indigo-600 transition-all duration-500 group-hover:text-white group-hover:drop-shadow-[0_0_20px_rgba(79,70,229,1)]">.</span>
                </span>
              </Link>
              
              {/* <p className="text-gray-500 font-medium text-xs md:text-sm uppercase leading-relaxed max-w-sm tracking-[0.1em]">
                <span className="text-white"> MANIFESTO :</span> Propulser votre style dans une nouvelle dimension. 
                Curateurs de technologies avant-gardistes et d'esthétiques néo-cyber.
              </p> */}

              <div className="flex gap-4">
                <SocialButton href="#" icon={<Instagram size={18} />} label="IG" />
                <SocialButton href="#" icon={<Facebook size={18} />} label="FB" />
                <SocialButton href="#" icon={<XIcon size={18} />} label="X" />
              </div>
            </motion.div>
          </div>

          {/* SECTION 2 : NAVIGATION (Style Bento) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-indigo-500" />
              <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em]">System.Nav</h3>
            </div>
            <ul className="space-y-4">
              <FooterLink to="/shop" label="Boutique_Alpha" />
              <FooterLink to="/my-orders" label="Trace_Commandes" />
              <FooterLink to="/cart" label="Panier_Data" />
              <FooterLink to="/support" label="Assistance_Core" />
            </ul>
          </div>

          {/* SECTION 3 : CONTACT TERMINAL */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-indigo-500" />
              <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em]">Contact.Log</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <ContactCard 
                href="mailto:cheel.infos@gmail.com" 
                icon={<Mail size={16} />} 
                title="Direct_Mail" 
                value="cheel.infos@gmail.com" 
              />
              <ContactCard 
                href="https://wa.me/23566000000" 
                icon={<MessageSquare size={16} />} 
                title="Secure_Chat" 
                value="WhatsApp.Business" 
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - STATUS BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">System_Status: <span className="text-white">Online</span></span>
            </div>
            <span className="text-gray-600 font-bold text-[9px] uppercase tracking-[0.2em]">© {currentYear} CHEEL_LABS</span>
          </div>

          <div className="flex gap-8 items-center text-gray-500">
            <Link to="/terms" className="hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Politiques_Sécurité</Link>
            <div className="flex items-center gap-2 group cursor-crosshair">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                   <Cpu size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500 text-white" />
                </div>
                <span className="text-[10px] font-black text-white italic tracking-tighter">CH_0.1</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

/* COMPOSANTS AUXILIAIRES AVEC ANIMATION */

const SocialButton = ({ href, icon, label }) => (
  <motion.a 
    whileHover={{ y: -5, scale: 1.1 }}
    href={href} 
    className="group relative w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10"
  >
    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[8px] font-black text-indigo-500">{label}</span>
    </div>
    {icon}
  </motion.a>
);

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-white transition-all">
      <ArrowRight size={12} className="-ml-5 opacity-0 group-hover:ml-0 group-hover:opacity-100 transition-all text-indigo-500" />
      <span className="group-hover:translate-x-1 transition-transform">{label}</span>
    </Link>
  </li>
);

const ContactCard = ({ href, icon, title, value }) => (
  <motion.a 
    whileHover={{ x: 5 }}
    href={href} 
    target="_blank"
    className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/20 transition-all shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{title}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{value}</span>
      </div>
    </div>
    <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
  </motion.a>
);

export default Footer;