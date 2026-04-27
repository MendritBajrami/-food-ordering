'use client';

import React from 'react';
import Link from "next/link";
import { ArrowRight, ChefHat, Truck, Clock } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tighter"
            >
              CRAVE IT. <br /> 
              <span className="text-orange-200">GET IT.</span> <br />
              FAST.
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-red-50 font-medium mb-10 max-w-xl leading-relaxed opacity-90"
            >
              The boldest flavors in town, delivered to your doorstep while they're still sizzling.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="group relative inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Start Ordering</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-red-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-red-700/30 backdrop-blur-md text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-red-600 transition-all active:scale-95"
              >
                Join the Club
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 1.1, x: 100 }}
          animate={{ opacity: 0.15, scale: 1, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute right-[-10%] top-[10%] w-[60%] h-[80%] hidden lg:block"
        >
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800')] bg-cover bg-center rounded-3xl rotate-6 shadow-2xl" />
        </motion.div>
      </section>

      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 underline decoration-red-500/10 underline-offset-8">WHY WE COUT</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">It's not just about food. It's about the mission of delivering happiness, one box at a time.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <ChefHat />, title: "Elite Chefs", desc: "Our masters of the grill bring years of expertise to every single flip.", color: "red" },
              { icon: <Clock />, title: "Turbo Speed", desc: "A 30-minute promise isn't just a goal; it's our standard operating procedure.", color: "orange" },
              { icon: <Truck />, title: "Free Deliver", desc: "No hidden fees. No surprises. Just great food exactly where you are.", color: "yellow" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500"
              >
                <div className={`bg-${feature.color}-100 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-6 transition-transform`}>
                  {React.cloneElement(feature.icon as React.ReactElement<any>, { className: `h-10 w-10 text-${feature.color}-500` })}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">TASTE THE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">DIFFERENCE.</span></h2>
            <p className="text-gray-400 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of happy foodies who trust us for their daily fuel.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/50 transition-all active:scale-95"
            >
              Order Now <ArrowRight className="h-6 w-6" />
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none" />
      </section>
    </div>
  );
}