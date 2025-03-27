import React from "react";
import electrician from "../../assets/electrician.avif";
import plumber from "../../assets/plumber.jpg";
import painter from "../../assets/painter.jpg";
import gardener from "../../assets/gardener.jpg";
import cleaner from "../../assets/cleaner.jpg";
import carpenter from "../../assets/carpenter.jpg";
import acRepair from "../../assets/acRepair.jpg";

const services = [
  { name: "Electrician", image: electrician, popular: true },
  { name: "Plumbing", image: plumber, popular: true },
  { name: "Carpentry", image: carpenter, popular: false },
  { name: "Painting", image: painter, popular: true },
  { name: "Cleaning", image: cleaner, popular: false },
  { name: "AC Repair", image: acRepair, popular: true },
  { name: "Gardening", image: gardener, popular: false },
];

const Main = () => {
  const handleServiceClick = (serviceName) => {
    // This would navigate to the professionals page for this service
    console.log(`Navigating to ${serviceName} professionals`);
    // In a real app: router.push(`/services/${serviceName.toLowerCase()}`);
  };

  return (
    <main className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Hero Section */}
      <section className="mb-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Trusted Home Service Professionals</h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
          Browse categories to discover skilled professionals ready to help
        </p>
      </section>

      {/* All Services Section */}
      <section className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Service Categories</h1>
          <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center">
            View All <span className="ml-1 text-xl">→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <button
              key={index}
              onClick={() => handleServiceClick(service.name)}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {service.popular && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Popular
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
                <p className="mt-2 text-gray-600 text-sm">Browse professionals →</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="mb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Popular Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.filter(service => service.popular).map((service, index) => (
            <button
              key={index}
              onClick={() => handleServiceClick(service.name)}
              className="relative rounded-2xl overflow-hidden shadow-lg group h-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <h3 className="text-2xl font-bold text-white mb-1">{service.name}</h3>
                <p className="text-white/80">Explore professionals</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Choose a Service", description: "Browse our categories to find the service you need" },
            { title: "View Professionals", description: "See available professionals with profiles and reviews" },
            { title: "Book Your Service", description: "Select a professional and schedule your service" },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your professional?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Join thousands of satisfied customers who found the perfect service provider
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
          Browse Services
        </button>
      </section>
    </main>
  );
};

export default Main;