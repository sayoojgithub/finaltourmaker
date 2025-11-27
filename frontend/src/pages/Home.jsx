import React from "react";

const Home = () => {
  return (
    <main className="bg-gradient-to-r from-white via-purple-200 to-white min-h-screen text-center">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <h1 className="text-5xl font-extrabold text-purple-800 mb-6 animate-fade-in-down">
          Discover Your Dream Destination 🌍
        </h1>
        <p className="text-lg text-purple-700 max-w-xl mx-auto mb-10 animate-fade-in-up">
          Plan your perfect getaway with custom tour packages designed for your
          style and budget. Whether you're chasing sunsets or mountain peaks,
          TourMaker has you covered.
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md transition duration-300">
          Explore Tours
        </button>
      </section>

      {/* Featured Packages Section */}
      <section className="py-16 bg-purple-100/50">
        <h2 className="text-3xl font-bold text-purple-800 mb-10">
          Featured Packages ✈️
        </h2>
        <div className="flex flex-wrap justify-center gap-10 px-6">
          {["Bali", "Swiss Alps", "Dubai"].map((place) => (
            <div
              key={place}
              className="bg-white rounded-2xl shadow-lg p-6 w-72 hover:scale-105 transition transform duration-300"
            >
              <img
                src={`https://source.unsplash.com/400x250/?${place}`}
                alt={place}
                className="rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold text-purple-700">{place}</h3>
              <p className="text-sm text-purple-600 mt-2">Starting from $999</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-purple-800 mb-8">
          Why Choose TourMaker? 💜
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              🌐 Expert Planning
            </h3>
            <p className="text-purple-600">
              Our team of experts ensures every detail of your journey is
              tailored to perfection.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              💼 Flexible Bookings
            </h3>
            <p className="text-purple-600">
              Change of plans? No worries! We offer flexible and easy
              cancellation policies.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              🛡️ Trusted by Thousands
            </h3>
            <p className="text-purple-600">
              Join thousands of happy travelers who trust TourMaker with their
              adventures.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
