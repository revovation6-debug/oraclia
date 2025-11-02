import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockData';
import type { Horoscope } from '../types';
import { Header, Footer } from './HomePage';
import { Card } from '../components/UI';

const HoroscopeCard: React.FC<{ horoscope: Horoscope }> = ({ horoscope }) => (
    <Card className="text-center border-2 border-transparent hover:border-brand-primary-light transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
        <div className="text-6xl mb-3">{horoscope.icon}</div>
        <h3 className="text-2xl font-bold text-brand-text-dark dark:text-dark-text-primary font-serif">{horoscope.sign}</h3>
        <p className="text-sm text-brand-text-light dark:text-dark-text-secondary mb-4">{horoscope.dateRange}</p>
        <p className="text-brand-text-dark dark:text-dark-text-primary flex-grow">{horoscope.prediction}</p>
    </Card>
);

const HoroscopePage: React.FC = () => {
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);

  useEffect(() => {
    mockApi.getHoroscopes().then(data => setHoroscopes(data as Horoscope[]));
  }, []);

  return (
    <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-serif text-brand-text-dark dark:text-dark-text-primary">Votre Horoscope du Jour</h1>
        <p className="text-center text-brand-text-light dark:text-dark-text-secondary mb-12 max-w-3xl mx-auto text-lg">
          Les astres vous guident. Découvrez ce que les étoiles vous réservent aujourd'hui et naviguez votre journée avec confiance et clairvoyance.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {horoscopes.map(horo => <HoroscopeCard key={horo.sign} horoscope={horo} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HoroscopePage;