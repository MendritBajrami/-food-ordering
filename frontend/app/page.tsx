import Link from "next/link";
import { ArrowRight, ChefHat, Truck, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Delicious Food, <br /> Delivered Fast
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8">
              Order your favorite burgers, fries, and drinks. Fresh, fast, and always tasty.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white text-red-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Order Now <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600')] bg-cover bg-center" />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">
                We use only the freshest ingredients for every meal we prepare.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Service</h3>
              <p className="text-gray-600">
                Quick preparation and delivery so you can enjoy your meal sooner.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Pickup</h3>
              <p className="text-gray-600">
                Choose pickup or delivery at checkout. Your choice!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-gray-600 mb-8">
            Browse our menu and add your favorites to cart.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
          >
            View Menu <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}