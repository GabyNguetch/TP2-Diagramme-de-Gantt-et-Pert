import React from 'react';
import { ArrowRight, Calendar, BarChart3, Network, CheckCircle, Users, Clock, Zap, Target, TrendingUp } from "lucide-react";
import Link from 'next/link';

export default function TaskPlanningHomepage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 font-bold text-slate-800">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <span className="text-xl">TaskFlow Pro</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <Link href='/gantt'>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Diagramme de Gantt
            </button>
            </Link>
            <Link href='/pert'>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Diagramme de PERT
            </button>
            </Link>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Aide
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden py-16 md:py-24 lg:py-32">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-10 h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
            <div className="absolute top-40 right-16 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-32 left-20 h-20 w-20 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Gantt chart visualization */}
            <div className="absolute right-0 top-1/4 opacity-10 transform rotate-12">
              <svg width="300" height="200" viewBox="0 0 300 200" className="text-slate-400">
                <rect x="20" y="20" width="80" height="12" fill="currentColor" rx="6"/>
                <rect x="20" y="40" width="120" height="12" fill="currentColor" rx="6"/>
                <rect x="20" y="60" width="60" height="12" fill="currentColor" rx="6"/>
                <rect x="20" y="80" width="100" height="12" fill="currentColor" rx="6"/>
                <rect x="20" y="100" width="90" height="12" fill="currentColor" rx="6"/>
                <rect x="20" y="120" width="140" height="12" fill="currentColor" rx="6"/>
              </svg>
            </div>

            {/* Network diagram */}
            <div className="absolute left-0 bottom-1/4 opacity-10 transform -rotate-12">
              <svg width="250" height="150" viewBox="0 0 250 150" className="text-slate-400">
                <circle cx="50" cy="50" r="15" fill="currentColor"/>
                <circle cx="150" cy="30" r="15" fill="currentColor"/>
                <circle cx="150" cy="70" r="15" fill="currentColor"/>
                <circle cx="200" cy="50" r="15" fill="currentColor"/>
                <line x1="50" y1="50" x2="150" y2="30" stroke="currentColor" strokeWidth="2"/>
                <line x1="50" y1="50" x2="150" y2="70" stroke="currentColor" strokeWidth="2"/>
                <line x1="150" y1="30" x2="200" y2="50" stroke="currentColor" strokeWidth="2"/>
                <line x1="150" y1="70" x2="200" y2="50" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200/50">
                <Zap className="h-4 w-4" />
                Nouvelle génération de planification
              </div>
              
              <div className="relative">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                  Planifiez vos projets avec
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 animate-pulse">
                    Gantt & PERT
                  </span>
                </h1>
              </div>
              
              <p className="max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
                Transformez vos idées en réalité avec nos diagrammes interactifs. 
                Visualisez, planifiez et gérez vos projets comme jamais auparavant.
              </p>
              
              <div className="flex flex-col gap-4 min-[400px]:flex-row items-center">
                <Link href='/gantt' >
                 <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-200">
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                </Link>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                  <Calendar className="h-5 w-5" />
                  Voir la démo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Essai gratuit 14 jours
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Pas de carte requise
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Installation en 2 minutes
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-200/50 mb-4">
                <Target className="h-4 w-4" />
                Fonctionnalités puissantes
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Des outils professionnels conçus pour les équipes modernes qui veulent aller plus loin.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Diagrammes de Gantt</h3>
                <p className="text-slate-600 leading-relaxed">
                  Visualisez vos projets sur une timeline interactive avec des dépendances automatiques et un suivi en temps réel.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 border border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <Network className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Diagrammes PERT</h3>
                <p className="text-slate-600 leading-relaxed">
                  Analysez le chemin critique et optimisez la durée de vos projets avec nos algorithmes avancés.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Collaboration équipe</h3>
                <p className="text-slate-600 leading-relaxed">
                  Travaillez ensemble en temps réel avec des commentaires, notifications et permissions granulaires.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-8 border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Suivi temps réel</h3>
                <p className="text-slate-600 leading-relaxed">
                  Surveillez l'avancement de vos projets avec des indicateurs visuels et des alertes intelligentes.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-8 border border-cyan-100 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Analyses avancées</h3>
                <p className="text-slate-600 leading-relaxed">
                  Obtenez des insights précieux avec des rapports automatisés et des métriques de performance.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-8 border border-violet-100 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Intégrations</h3>
                <p className="text-slate-600 leading-relaxed">
                  Connectez vos outils favoris avec plus de 50 intégrations natives et une API complète.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-12 md:p-16 text-center">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                      <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Prêt à révolutionner votre gestion de projet ?
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Rejoignez plus de 10,000 équipes qui font confiance à TaskFlow Pro pour leurs projets critiques.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href='/pert'>
                    <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl hover:bg-slate-50 transition-all duration-200 transform hover:-translate-y-1">
                    Démarrer maintenant
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  </Link>
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all duration-200">
                    Planifier une démo
                  </button>
                </div>
                <p className="text-sm text-blue-100 mt-6">
                  ✨ Essai gratuit de 14 jours • Aucune carte de crédit requise • Support 24/7
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-slate-200 py-12 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">TaskFlow Pro</span>
            </div>
            <p className="text-center text-sm text-slate-600">
              © {new Date().getFullYear()} TaskFlow Pro. Tous droits réservés.
            </p>
            <div className="flex gap-8">
              <button className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Conditions d'utilisation
              </button>
              <button className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Politique de confidentialité
              </button>
              <button className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}