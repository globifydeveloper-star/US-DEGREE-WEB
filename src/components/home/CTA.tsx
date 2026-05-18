import React from 'react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-12 flex justify-center">
      <div className="w-full max-w-[2380px] bg-[#edf2ff] rounded-[2rem] flex flex-col md:flex-row overflow-hidden min-h-[400px]">
        {/* Left Content */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Ready to Find the Right<br />Program?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md text-sm md:text-base">
            Join thousands of students who have already found their future with US degree Academy. Start your comparison today.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Get Started Now
            </Link>
            <Link 
              href="/compare" 
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-full font-semibold transition-colors shadow-sm"
            >
              Compare Programs
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 relative min-h-[300px] md:min-h-full">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Students collaborating on campus" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
