import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockData';
import type { Review } from '../types';
import { Header, Footer, ReviewCard } from './HomePage';

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    mockApi.getAllReviews().then(data => setReviews(data as Review[]));
  }, []);

  return (
    <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-serif text-brand-text-dark dark:text-dark-text-primary">L'Expérience Oraclia</h1>
        <p className="text-center text-brand-text-light dark:text-dark-text-secondary mb-12 max-w-3xl mx-auto text-lg">
          Découvrez ce que nos clients pensent de leurs consultations. Chaque avis est une histoire, un chemin éclairé, une décision prise avec plus de sérénité.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewsPage;