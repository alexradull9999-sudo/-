import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Phone, MessageCircle, Shield, Clock, ThermometerSnowflake, Ruler, Factory, MapPin, Star, ArrowRight, Menu, X, Home, Building2, Tent, Maximize, CloudRain, Sun, DoorOpen, Leaf, Waves, Utensils, Briefcase, ArrowUpCircle } from "lucide-react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Оставить заявку');

  const openModal = (title: string = 'Оставить заявку') => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">Б</div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">БЕЗРАМ</span>
            </div>
            
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('advantages')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Преимущества</button>
                <button onClick={() => scrollToSection('portfolio')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Работы</button>
                <button onClick={() => scrollToSection('prices')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Цены</button>
                <button onClick={() => scrollToSection('faq')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">FAQ</button>
                <div className="flex flex-col items-end">
                  <a href="tel:+79519387178" className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">+7 (951) 938-71-78</a>
                  <span className="text-xs text-slate-500">Пермь и край</span>
                </div>
              </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <button onClick={() => scrollToSection('advantages')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Преимущества</button>
            <button onClick={() => scrollToSection('portfolio')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Работы</button>
            <button onClick={() => scrollToSection('prices')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Цены</button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">FAQ</button>
              <div className="mt-4 px-3">
                <a href="tel:+79519387178" className="block text-lg font-bold text-slate-900">+7 (951) 938-71-78</a>
              </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        <HeroSection 
          onScrollToQuiz={() => scrollToSection('quiz')} 
          onScrollToPortfolio={() => scrollToSection('portfolio')} 
          onOpenModal={openModal}
        />
        <WhatWeGlazeSection onOpenModal={openModal} onScrollToQuiz={() => scrollToSection('quiz')} />
        <PainSolutionSection />
        <AdvantagesSection />
        <QuizSection />
        <PortfolioSection />
        <HowWeWorkSection />
        <ReviewsSection />
        <PricesSection onOpenModal={openModal} />
        <FaqSection />
        <FinalCtaSection onOpenModal={openModal} />
      </main>

      <Footer onOpenModal={openModal} />

      <AnimatePresence>
        {isModalOpen && (
          <LeadModal 
            title={modalTitle} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadModal({ title, isOpen, onClose }: { title: string, isOpen: boolean, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      source: `Модальное окно: ${title}`
    };

    // Yandex Metrika Goal
    if (typeof (window as any).ym !== 'undefined') {
      (window as any).ym(108711441, 'reachGoal', 'send');
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to send lead');
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {!isSuccess ? (
            <>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 mb-8 text-sm">Оставьте ваши контакты, и мы свяжемся с вами в течение 15 минут для консультации.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-name">Ваше имя</Label>
                  <Input name="name" id="modal-name" placeholder="Иван" required className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-phone">Телефон</Label>
                  <Input name="phone" id="modal-phone" type="tel" placeholder="+7 (___) ___-__-__" required className="h-12 rounded-xl" />
                </div>
                <div className="flex items-start space-x-2 py-2">
                  <input type="checkbox" id="modal-consent" defaultChecked required className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <Label htmlFor="modal-consent" className="text-[10px] leading-tight text-slate-500 cursor-pointer">
                    Я соглашаюсь на обработку персональных данных и принимаю условия политики конфиденциальности
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-lg font-bold mt-2"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>
                <p className="text-[10px] text-slate-400 text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка принята!</h3>
              <p className="text-slate-600">Мы перезвоним вам в ближайшее время.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function HeroSection({ onScrollToQuiz, onScrollToPortfolio, onOpenModal }: { onScrollToQuiz: () => void, onScrollToPortfolio: () => void, onOpenModal: (t?: string) => void }) {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero.webp" 
          alt="Застекленная веранда" 
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              <span>Работаем в Перми и Пермском крае</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Безрамное остекление <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">в Перми</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-10 leading-relaxed font-light max-w-2xl">
              От 120 000 ₽. Напрямую от производителя. Монтаж за 1–3 дня. Гарантия 25 лет.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" onClick={onScrollToQuiz} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                Рассчитать стоимость
              </Button>
              <Button size="lg" variant="outline" onClick={onScrollToPortfolio} className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg px-8 py-6 h-auto rounded-xl backdrop-blur-sm transition-all">
                Смотреть работы
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Более 200 объектов в крае</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="tel:+79519387178" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">+7 (951) 938-71-78</span>
                </a>
                <button 
                  onClick={() => onOpenModal('Написать в Telegram')}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Telegram</span>
                </button>
                <button 
                  onClick={() => onOpenModal('Написать Max')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Написать Max</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <VerandaAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerandaAnimation() {
  return (
    <div className="relative w-full max-w-lg aspect-[4/3] mx-auto mt-8 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-white border border-slate-200 shadow-2xl">
      {/* Sun / Sky glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/20 blur-3xl rounded-full"></div>

      {/* 1. House Wall (Siding texture) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-0 left-0 w-[35%] h-[90%] bg-[#E6E2DD] border-r border-[#D0CCC7] z-20 flex flex-col items-center shadow-[10px_0_20px_rgba(0,0,0,0.05)]"
      >
        {/* Siding Texture */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #000 20px)' }}></div>
        
        {/* House Window */}
        <div className="mt-16 w-20 h-28 bg-white p-2 rounded shadow-md relative z-10">
          <div className="w-full h-full bg-gradient-to-b from-sky-800 to-sky-600 relative overflow-hidden">
            {/* Warm interior light */}
            <div className="absolute inset-0 bg-orange-400/30 shadow-[inset_0_0_20px_rgba(251,146,60,0.6)]"></div>
            {/* Window frames */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white"></div>
            <div className="absolute top-0 left-1/2 w-[2px] h-full bg-white"></div>
          </div>
        </div>
      </motion.div>

      {/* House Roof */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute top-0 left-[-5%] w-[45%] h-[12%] bg-[#3A3F47] z-30 shadow-xl"
        style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}
      />

      {/* 2. Deck / Foundation */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="absolute bottom-[10%] left-[35%] w-[55%] h-[6%] bg-[#A09D9A] border-t-4 border-[#8A8784] shadow-lg origin-left z-10 overflow-hidden"
      >
         {/* Deck planks texture */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 14px, #000 15px)' }}></div>
      </motion.div>

      {/* Interior Elements (Plant & Warm Glow) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-[16%] left-[35%] w-[55%] h-[55%] bg-gradient-to-t from-orange-400/10 to-transparent z-10"
      />

      {/* Interior Wall (Behind the sofa) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-[16%] left-[35%] w-[55%] h-[55%] bg-[#F5F2EE] z-0 border-l border-slate-200"
      >
        {/* Subtle wall pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </motion.div>

      {/* Sofa */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 2.2 }}
        className="absolute bottom-[16%] left-[50%] w-[32%] h-[18%] z-10"
      >
        {/* Sofa Base */}
        <div className="absolute bottom-0 w-full h-[60%] bg-slate-700 rounded-t-sm shadow-md"></div>
        {/* Sofa Backrest */}
        <div className="absolute bottom-[60%] w-full h-[40%] bg-slate-600 rounded-t-md"></div>
        {/* Sofa Cushions */}
        <div className="absolute bottom-[20%] left-[5%] w-[42%] h-[50%] bg-slate-500 rounded-sm"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[42%] h-[50%] bg-slate-500 rounded-sm"></div>
        {/* Sofa Armrests */}
        <div className="absolute bottom-0 left-[-5%] w-[10%] h-[70%] bg-slate-800 rounded-sm"></div>
        <div className="absolute bottom-0 right-[-5%] w-[10%] h-[70%] bg-slate-800 rounded-sm"></div>
      </motion.div>

      {/* Lamp */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 2.6, type: "spring" }}
        className="absolute bottom-[16%] left-[42%] w-10 h-32 z-10 flex flex-col items-center"
      >
        {/* Lamp Shade */}
        <div className="w-10 h-8 bg-amber-100 rounded-t-full shadow-[0_0_20px_rgba(251,191,36,0.4)] relative">
          {/* Lamp Glow */}
          <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-full"></div>
        </div>
        {/* Lamp Pole */}
        <div className="w-1 h-20 bg-slate-800"></div>
        {/* Lamp Base */}
        <div className="w-6 h-2 bg-slate-900 rounded-full"></div>
      </motion.div>

      {/* Plant (Moved slightly) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="absolute bottom-[16%] left-[82%] w-8 h-14 z-10 flex flex-col items-center justify-end"
      >
        {/* Plant leaves */}
        <div className="w-7 h-8 bg-emerald-600/90 rounded-full mb-[-6px] shadow-sm"></div>
        {/* Plant pot */}
        <div className="w-5 h-6 bg-amber-800/90 rounded-b-sm shadow-sm"></div>
      </motion.div>

      {/* 3. Aluminum Frame (Anthracite) */}
      {/* Wall Post */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
        className="absolute bottom-[16%] left-[35%] w-[2%] h-[55%] bg-[#2C3036] origin-bottom z-30 shadow-sm"
      />
      {/* Front Post */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
        className="absolute bottom-[16%] left-[88%] w-[2%] h-[55%] bg-[#2C3036] origin-bottom z-30 shadow-sm"
      />
      {/* Top Rail */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
        className="absolute bottom-[71%] left-[35%] w-[55%] h-[2%] bg-[#2C3036] origin-left z-30 shadow-md"
      />
      {/* Bottom Rail */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
        className="absolute bottom-[16%] left-[35%] w-[55%] h-[1.5%] bg-[#4A4F58] origin-left z-30"
      />

      {/* 4. Veranda Roof (Glass) */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
        className="absolute bottom-[73%] left-[35%] w-[55%] h-[3%] bg-sky-300/40 backdrop-blur-sm border-t border-white/60 origin-left z-20"
      />

      {/* 5. Frameless Glass Panes (Sliding out from the wall) */}
      {[37, 50, 63, 76].map((finalLeft, i) => (
        <motion.div
          key={`pane-${i}`}
          initial={{ opacity: 0, left: '37%' }}
          animate={{ opacity: 1, left: `${finalLeft}%` }}
          transition={{ 
            opacity: { duration: 0.4, delay: 2.8 },
            // Slide from right to left (last pane moves first, like real frameless systems)
            left: { duration: 0.8, delay: 3.0 + (3-i) * 0.3, ease: "easeInOut" }
          }}
          className="absolute bottom-[17.5%] w-[13%] h-[53.5%] bg-sky-200/20 backdrop-blur-[2px] border-x border-white/40 shadow-[inset_0_0_10px_rgba(255,255,255,0.3)] z-20 overflow-hidden"
        >
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
        </motion.div>
      ))}

      {/* 6. UI Overlays */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 4.5 }}
        className="absolute top-[20%] right-[2%] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs font-bold shadow-xl z-40 flex items-center gap-1.5"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        Безрамная система
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 4.7 }}
        className="absolute bottom-[4%] left-[50%] bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs font-medium shadow-xl z-40 flex items-center gap-1.5"
      >
        <Clock className="w-3.5 h-3.5 text-blue-400" />
        Монтаж: 1-3 дня
      </motion.div>
    </div>
  );
}

function WhatWeGlazeSection({ onOpenModal, onScrollToQuiz }: { onOpenModal: (t?: string) => void, onScrollToQuiz: () => void }) {
  const items = [
    { icon: <Home className="w-6 h-6" />, title: "Веранды и террасы", desc: "Максимум света и пространства без лишних рам." },
    { icon: <Tent className="w-6 h-6" />, title: "Беседки и барбекю", desc: "Уютные вечера в любую погоду круглый год." },
    { icon: <Building2 className="w-6 h-6" />, title: "Балконы и лоджии", desc: "Превратите балкон в полноценную видовую зону." },
    { icon: <Maximize className="w-6 h-6" />, title: "Панорамные окна", desc: "Остекление «в пол» для современных интерьеров." },
    { icon: <CloudRain className="w-6 h-6" />, title: "Козырьки и навесы", desc: "Стеклянная защита от осадков с легким дизайном." },
    { icon: <Sun className="w-6 h-6" />, title: "Стеклянные крыши", desc: "Небо над головой в полной безопасности." },
    { icon: <DoorOpen className="w-6 h-6" />, title: "Входные группы", desc: "Стильные двери и порталы для вашего дома." },
    { icon: <Leaf className="w-6 h-6" />, title: "Зимние сады", desc: "Ваш личный оазис за прочным стеклом." },
    { icon: <Waves className="w-6 h-6" />, title: "Бассейны и СПА", desc: "Защита водной зоны без потери панорамы." },
    { icon: <Utensils className="w-6 h-6" />, title: "Кафе и рестораны", desc: "Комфортные летние залы для ваших гостей." },
    { icon: <Briefcase className="w-6 h-6" />, title: "Офисы и перегородки", desc: "Современное зонирование рабочих пространств." },
    { icon: <ArrowUpCircle className="w-6 h-6" />, title: "Пентхаусы", desc: "Остекление на любой высоте с гарантией." },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Мы остекляем любые объекты</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">От небольших козырьков до лоджий в пентхаусах и торговых центров.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={onScrollToQuiz}
              className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-slate-600 group-hover:text-blue-100 transition-colors leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            onClick={() => onOpenModal('Консультация по объекту')} 
            size="lg" 
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-14 rounded-2xl px-10 text-lg"
          >
            Нужна консультация по моему объекту
          </Button>
        </div>
      </div>
    </section>
  );
}

function PainSolutionSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Дождь срывает планы? Ветер не даёт посидеть на террасе?</h2>
          <p className="text-xl text-slate-600">Безрамное остекление решает это раз и навсегда. Превратите открытую веранду в уютное место для отдыха в любую погоду.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="relative rounded-2xl overflow-hidden group">
            <img 
              src="/images/bezram%20do.webp" 
              alt="Открытая веранда до остекления" 
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-8">
              <div className="bg-red-500 text-white text-sm font-bold uppercase tracking-wider py-1 px-3 rounded-full w-fit mb-4">До</div>
              <h3 className="text-2xl font-bold text-white mb-2">Открытая веранда</h3>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-center gap-2"><X className="w-5 h-5 text-red-400" /> Пыль и грязь с улицы</li>
                <li className="flex items-center gap-2"><X className="w-5 h-5 text-red-400" /> Ветер и косой дождь</li>
                <li className="flex items-center gap-2"><X className="w-5 h-5 text-red-400" /> Использование только в теплую погоду</li>
              </ul>
            </div>
          </div>

          {/* After */}
          <div className="relative rounded-2xl overflow-hidden group">
            <img 
              src="/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_78b0c9a0-0b01-4abf-9ef2-ab482ba01e95_0.webp" 
              alt="Застекленная веранда" 
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-8">
              <div className="bg-green-500 text-white text-sm font-bold uppercase tracking-wider py-1 px-3 rounded-full w-fit mb-4">После</div>
              <h3 className="text-2xl font-bold text-white mb-2">Безрамное остекление</h3>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Чистота и защита от осадков</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Панорамный вид без перемычек</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Комфортный отдых круглый год</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdvantagesSection() {
  const advantages = [
    {
      icon: <Factory className="w-8 h-8 text-blue-600" />,
      title: "Цена без наценки",
      desc: "Покупаете напрямую у производителя. Экономия до 30% по сравнению с посредниками."
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Монтаж за 1–3 дня",
      desc: "Бригада выезжает в течение недели от замера, работаем без остановки."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Гарантия 25 лет",
      desc: "Самая длинная гарантия в сегменте. Подтверждена сертификатами."
    },
    {
      icon: <ThermometerSnowflake className="w-8 h-8 text-blue-600" />,
      title: "Работает при -40°C",
      desc: "Летом стёкла складываются, в дождь и ветер — защищают. Пермский климат не помеха."
    },
    {
      icon: <Ruler className="w-8 h-8 text-blue-600" />,
      title: "Замер бесплатно",
      desc: "Выезжаем в день обращения, считаем стоимость за 30 минут прямо на объекте."
    }
  ];

  return (
    <section id="advantages" className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Почему выбирают нас</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Мы знаем особенности пермского климата и делаем остекление, которое служит десятилетиями.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {advantages.map((adv, idx) => (
            <Card key={idx} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  {adv.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{adv.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{adv.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-700">
            <ThermometerSnowflake className="w-4 h-4 text-blue-500" />
            <span>Стекло выдерживает -40°C и ветер до 20 м/с</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Уже работаем в Пермском крае</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Успейте до сезона — пока не выросла очередь</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuizSection() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSelect = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
    handleNext();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      type: answers['type'],
      details: answers,
      source: 'Квиз на сайте'
    };

    // Yandex Metrika Goal
    if (typeof (window as any).ym !== 'undefined') {
      (window as any).ym(108711441, 'reachGoal', 'send_kviz');
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to send lead');

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
    }
  };

  return (
    <section id="quiz" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-50 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-50 blur-[120px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Узнайте стоимость остекления за 2 минуты</h2>
          <p className="text-lg text-slate-600">Ответьте на 4 простых вопроса и получите точный расчёт</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Шаг {step} из 5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>

          <CardContent className="p-8 md:p-12">
            {!isSuccess ? (
              <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); }}>
                
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Тип вашего объекта?</h3>
                    <RadioGroup defaultValue="v" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'v', label: 'Загородный дом / Дача', sub: 'Веранда, терраса, беседка' },
                        { id: 'a', label: 'Квартира / Пентхаус', sub: 'Балкон, лоджия, панорама' },
                        { id: 'c', label: 'Бизнес / Коммерция', sub: 'Кафе, офис, входная группа' },
                        { id: 'o', label: 'Другое', sub: 'Индивидуальный проект' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSelect('type', item.label)}
                          className="flex flex-col border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative group"
                        >
                          <RadioGroupItem value={item.id} id={`type-${i}`} className="absolute right-4 top-4 group-hover:border-blue-400" />
                          <Label htmlFor={`type-${i}`} className="cursor-pointer font-bold text-base mb-1">{item.label}</Label>
                          <span className="text-sm text-slate-500">{item.sub}</span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Примерная площадь или периметр?</h3>
                    <RadioGroup defaultValue="10-20" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['До 10 м²', '10–20 м²', '20–40 м²', 'Более 40 м²'].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSelect('size', item)}
                          className="flex items-center space-x-2 border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative group"
                        >
                          <RadioGroupItem value={item} id={`size-${i}`} className="absolute right-4 group-hover:border-blue-400" />
                          <Label htmlFor={`size-${i}`} className="flex-1 cursor-pointer font-medium text-base">{item}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Текущее состояние объекта?</h3>
                    <RadioGroup defaultValue="ready" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Полностью готов под остекление',
                        'На стадии строительства',
                        'Требуется демонтаж старых конструкций',
                        'Нужен замер и консультация эксперта'
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSelect('state', item)}
                          className="flex items-center space-x-2 border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative group"
                        >
                          <RadioGroupItem value={item} id={`state-${i}`} className="absolute right-4 group-hover:border-blue-400" />
                          <Label htmlFor={`state-${i}`} className="flex-1 cursor-pointer font-medium text-base">{item}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Приоритет в работе?</h3>
                    <RadioGroup defaultValue="all" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Минимальная цена (эконом)',
                        'Максимальное качество и дизайн',
                        'Сжатые сроки монтажа',
                        'Работа «под ключ» с гарантией'
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSelect('priority', item)}
                          className="flex items-center space-x-2 border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative group"
                        >
                          <RadioGroupItem value={item} id={`priority-${i}`} className="absolute right-4 group-hover:border-blue-400" />
                          <Label htmlFor={`priority-${i}`} className="flex-1 cursor-pointer font-medium text-base">{item}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Куда отправить детальный расчёт?</h3>
                    <p className="text-slate-600 mb-6">Оставьте контакты, и наш специалист подготовит смету под ваш проект.</p>
                    
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="name">Ваше имя</Label>
                        <Input name="name" id="name" placeholder="Как к вам обращаться?" required className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Номер телефона</Label>
                        <Input name="phone" id="phone" type="tel" placeholder="+7 (___) ___-__-__" required className="h-12" />
                      </div>
                      <div className="flex items-start space-x-2 py-2">
                        <input type="checkbox" id="quiz-consent" defaultChecked required className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <Label htmlFor="quiz-consent" className="text-[10px] leading-tight text-slate-500 cursor-pointer">
                          Я соглашаюсь на обработку персональных данных
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
                  {step > 1 ? (
                    <Button type="button" variant="ghost" onClick={handlePrev} className="text-slate-500">
                      Назад
                    </Button>
                  ) : <div />}
                  
                  {step === 5 && (
                    <Button type="submit" size="lg" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl">
                      {isSubmitting ? 'Отправка...' : 'Получить смету'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Заявка принята!</h3>
                <p className="text-xl text-slate-600 mb-8">Инженер свяжется с вами в ближайшее время для уточнения деталей.</p>
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 font-medium mb-2">Что произойдет дальше:</p>
                  <ul className="text-sm text-blue-700 text-left space-y-2">
                    <li>1. Мы изучим ваши параметры</li>
                    <li>2. Сделаем предварительный расчет цен</li>
                    <li>3. Предложим варианты конфигурации</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function PortfolioSection() {
  const [filter, setFilter] = useState('all');
  const projects = [
    { id: 1, type: 'veranda', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_1ea6924f-eac9-46a9-878b-005c4714e372_0.webp', title: 'Пермь, посёлок Заречный', desc: '18 м, монтаж 2 дня' },
    { id: 2, type: 'terrace', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_1ea6924f-eac9-46a9-878b-005c4714e372_1.webp', title: 'Краснокамск', desc: '24 м, монтаж 3 дня' },
    { id: 3, type: 'gazebo', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_1ea6924f-eac9-46a9-878b-005c4714e372_2.webp', title: 'Добрянка', desc: '12 м, монтаж 1 день' },
    { id: 4, type: 'veranda', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_1ea6924f-eac9-46a9-878b-005c4714e372_3.webp', title: 'Пермь, Мотовилиха', desc: '20 м, монтаж 2 дня' },
    { id: 5, type: 'terrace', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_39987f94-2761-4e87-a5e7-2aea595b8dc3_0.webp', title: 'Полазна', desc: '30 м, монтаж 3 дня' },
    { id: 6, type: 'gazebo', img: '/images/u9279868684_httpss.mj.rundcyeqX0vEKM_httpss.mj.runEmCR2wll9BM_64c9fb53-ffc7-4e9b-9e2f-5dcc82b8be4f_3.webp', title: 'Пермь, Гайва', desc: '15 м, монтаж 2 дня' }
  ];

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.type === filter);

  return (
    <section id="portfolio" className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Выполненные объекты в Пермском крае</h2>
            <p className="text-slate-400 text-lg">Посмотрите, как преображаются дома с нашим безрамным остеклением.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className={filter === 'all' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>Все</Button>
            <Button variant={filter === 'veranda' ? 'default' : 'outline'} onClick={() => setFilter('veranda')} className={filter === 'veranda' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>Веранды</Button>
            <Button variant={filter === 'terrace' ? 'default' : 'outline'} onClick={() => setFilter('terrace')} className={filter === 'terrace' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>Террасы</Button>
            <Button variant={filter === 'gazebo' ? 'default' : 'outline'} onClick={() => setFilter('gazebo')} className={filter === 'gazebo' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>Беседки</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="group relative rounded-2xl overflow-hidden bg-slate-800 animate-in fade-in duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={project.img} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                <p className="text-blue-400 text-sm font-medium">{project.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeWorkSection() {
  const steps = [
    { num: "01", title: "Заявка", desc: "Оставляете заявку на сайте или звоните нам. Менеджер консультирует и назначает замер." },
    { num: "02", title: "Бесплатный замер", desc: "Инженер приезжает на объект, делает точные замеры и рассчитывает итоговую стоимость." },
    { num: "03", title: "Договор и производство", desc: "Подписываем договор. Изготавливаем конструкции на собственном производстве." },
    { num: "04", title: "Монтаж за 1–3 дня", desc: "Бригада привозит готовые конструкции и быстро устанавливает их. Убираем за собой мусор." }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Как мы работаем</h2>
          <p className="text-lg text-slate-600">Простой и понятный процесс от первого звонка до готовой веранды</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-slate-100 z-0"></div>
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-sm shadow-blue-100">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    {
      name: "Александр",
      location: "Пермь",
      text: "Долго сомневались, выдержит ли безрамное остекление наши зимы. Зиму пережили отлично, нигде не дует. Летом просто сказка - сдвинули все стёкла и сидим на открытом воздухе.",
      img: "https://picsum.photos/seed/r1/100/100"
    },
    {
      name: "Елена",
      location: "Добрянка",
      text: "Ребята молодцы! Приехали на замер в тот же день, всё четко посчитали. Монтаж занял ровно 2 дня, как и обещали. Веранда преобразилась невероятно.",
      img: "https://picsum.photos/seed/r2/100/100"
    },
    {
      name: "Михаил",
      location: "Краснокамск",
      text: "Искал именно производителя, чтобы без переплат. Качество фурнитуры отличное, стёкла ходят плавно. Дали гарантию 25 лет, что очень внушает доверие.",
      img: "https://picsum.photos/seed/r3/100/100"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Отзывы наших клиентов</h2>
            <p className="text-lg text-slate-600">Что говорят те, кто уже остеклил веранду с нами</p>
          </div>
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
            Все отзывы в 2GIS
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <Card key={idx} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-8 italic leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-slate-900">{review.name}</h4>
                    <p className="text-sm text-slate-500">{review.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricesSection({ onOpenModal }: { onOpenModal: (t?: string) => void }) {
  return (
    <section id="prices" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ориентировочные цены</h2>
          <p className="text-lg text-slate-600">Точная стоимость — после замера. Замер бесплатно.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Item 1 */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Стандартная веранда</h3>
              <p className="text-slate-500 mb-6">Периметр до 15 м</p>
              <div className="text-4xl font-extrabold text-blue-600 mb-8">от 120 000 ₽</div>
              <ul className="space-y-3 text-left text-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Закаленное стекло 8-10 мм</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Надежная фурнитура</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Монтаж включен</span>
                </li>
              </ul>
              <Button onClick={() => onOpenModal('Расчёт стандартной веранды')} className="w-full bg-slate-900 hover:bg-slate-800 text-white">Рассчитать точно</Button>
            </CardContent>
          </Card>

          {/* Item 2 */}
          <Card className="border-blue-200 shadow-lg relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 text-center">Популярный выбор</div>
            <CardContent className="p-8 pt-10 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Большая терраса</h3>
              <p className="text-slate-500 mb-6">Периметр 15–25 м</p>
              <div className="text-4xl font-extrabold text-blue-600 mb-8">от 180 000 ₽</div>
              <ul className="space-y-3 text-left text-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Повышенная ветроустойчивость</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Усиленный профиль</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Гарантия на монтаж 5 лет</span>
                </li>
              </ul>
              <Button onClick={() => onOpenModal('Расчёт большой террасы')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Рассчитать точно</Button>
            </CardContent>
          </Card>

          {/* Item 3 */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Эксклюзив</h3>
              <p className="text-slate-500 mb-6">Сложные формы и дизайн</p>
              <div className="text-3xl font-extrabold text-slate-900 mb-8">Индивидуально</div>
              <ul className="space-y-3 text-left text-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Тонированное стекло</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Покраска профиля в RAL</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Нестандартные размеры</span>
                </li>
              </ul>
              <Button onClick={() => onOpenModal('Заявка на эксклюзив')} variant="outline" className="w-full border-slate-300">Вызвать инженера</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      q: "Сколько стоит безрамное остекление в Перми?",
      a: "Стоимость начинается от 120 000 ₽ для небольших веранд. Итоговая цена зависит от периметра, высоты проемов и выбранной фурнитуры. Точную смету мы составляем после бесплатного замера."
    },
    {
      q: "Сколько времени занимает монтаж?",
      a: "Сам монтаж занимает от 1 до 3 дней в зависимости от объема работ. Бригада выезжает на объект в течение недели после проведения замера и заключения договора."
    },
    {
      q: "Работает ли остекление зимой при -30°C?",
      a: "Да, система отлично функционирует в суровом пермском климате. Закаленное стекло выдерживает перепады температур до -40°C, а специальная фурнитура не промерзает и позволяет открывать/закрывать створки даже зимой."
    },
    {
      q: "Нужно ли разрешение на остекление веранды?",
      a: "В большинстве случаев для остекления веранды или террасы в частном доме разрешение не требуется, так как это не является капитальной перестройкой. Однако, если дом находится в исторической зоне, могут быть нюансы."
    },
    {
      q: "Какая гарантия на систему?",
      a: "Мы предоставляем гарантию 25 лет на алюминиевый профиль и стеклянные полотна, а также 5 лет на фурнитуру и монтажные работы. Это самая длинная гарантия в сегменте."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Частые вопросы</h2>
        </div>
        <Accordion type="single" collapsible className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-2">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-100 last:border-0">
              <AccordionTrigger className="text-left font-bold text-lg text-slate-900 hover:text-blue-600 py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCtaSection({ onOpenModal }: { onOpenModal: (t?: string) => void }) {
  return (
    <section className="py-24 bg-blue-600 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Получите бесплатный замер и расчёт сегодня</h2>
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">Оставьте заявку, и наш инженер приедет к вам в удобное время с образцами профиля и стекла.</p>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-2xl mx-auto">
          <CardContent className="p-8">
            <form className="space-y-4" onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const data = {
                  name: formData.get('name'),
                  phone: formData.get('phone'),
                  source: 'Финальный CTA (Вызов инженера)'
                };
                
                try {
                  const response = await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  if (!response.ok) throw new Error('Failed to send lead');
                  onOpenModal('Заявка на замер'); 
                } catch (err) {
                  console.error(err);
                  alert('Ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
                }              }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input name="name" placeholder="Ваше имя" className="h-14 bg-white text-slate-900 text-lg rounded-xl flex-1" required />
                <Input name="phone" placeholder="Телефон" type="tel" className="h-14 bg-white text-slate-900 text-lg rounded-xl flex-1" required />
                <Button type="submit" className="h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 rounded-xl whitespace-nowrap">
                  Вызвать инженера
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <input type="checkbox" id="cta-consent" defaultChecked required className="w-4 h-4 text-blue-600 border-white/20 rounded focus:ring-blue-500 bg-white/20" />
                <Label htmlFor="cta-consent" className="text-[10px] text-blue-100 cursor-pointer">Я соглашаюсь на обработку персональных данных</Label>
              </div>
            </form>
            <p className="hidden">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Footer({ onOpenModal }: { onOpenModal: (t?: string) => void }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-slate-800 pb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">Б</div>
              <span className="font-bold text-2xl tracking-tight text-white">БЕЗРАМ</span>
            </div>
            <p className="max-w-sm mb-6">Производство и монтаж безрамного остекления веранд, террас и беседок в Перми и Пермском крае.</p>
            <div className="flex gap-4">
              <button onClick={() => onOpenModal('Написать в Telegram')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" title="Telegram">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button onClick={() => onOpenModal('Написать Max')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" title="Написать Max">
                <MessageCircle className="w-5 h-5" />
              </button>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" title="Наш офис">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Контакты</h4>
            <ul className="space-y-3">
              <li><a href="tel:+79519387178" className="text-lg font-medium text-white hover:text-blue-400">+7 (951) 938-71-78</a></li>
              <li>г. Пермь, ул. Производственная, 1</li>
              <li>Пн-Пт: 09:00 - 19:00</li>
              <li>Сб-Вс: 10:00 - 16:00</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Ссылки</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onOpenModal('Написать в Telegram')} className="hover:text-white transition-colors">Telegram</button></li>
              <li><button onClick={() => onOpenModal('Написать Max')} className="hover:text-white transition-colors">Написать Max</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Отзывы в 2GIS</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-sm border-t border-slate-900 pt-8">
          <p>© {new Date().getFullYear()} БЕЗРАМ. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
