import React from 'react';
import { Header, Footer } from '../HomePage';

interface PlaceholderPageProps {
    title: string;
    children: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, children }) => {
    return (
        <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="bg-brand-bg-white dark:bg-dark-bg-secondary p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold font-serif text-brand-primary mb-6">{title}</h1>
                    <div className="text-brand-text-dark dark:text-dark-text-primary space-y-4 text-lg">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PlaceholderPage;