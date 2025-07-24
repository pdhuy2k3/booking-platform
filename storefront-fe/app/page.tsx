"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  CarTaxiFrontIcon as Taxi,
  Star,
  ArrowRight,
  Clock,
  Shield,
  Zap,
} from "lucide-react"
import SearchBox from "./components/SearchBox"
import TransportCard from "./components/TransportCard"

const heroImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop", // Airplane
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop", // Train
  "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&h=1080&fit=crop", // Bus
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop", // Taxi
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop", // Ferry
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop", // Car
]

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const transportModes = [
    {
      title: "Flights",
      description: "Book domestic and international flights with top airlines",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop",
      icon: Plane,
      href: "/search?mode=flight",
    },
    {
      title: "Trains",
      description: "Comfortable train journeys across the country",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
      icon: Train,
      href: "/search?mode=train",
    },
    {
      title: "Buses",
      description: "Affordable bus travel with premium comfort",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop",
      icon: Bus,
      href: "/search?mode=bus",
    },
    {
      title: "Taxis",
      description: "Quick and convenient city rides",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      icon: Taxi,
      href: "/search?mode=taxi",
    },
    {
      title: "Ferries",
      description: "Scenic water transport and island hopping",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      icon: Ship,
      href: "/search?mode=ferry",
    },
    {
      title: "Car Rentals",
      description: "Self-drive cars for your road trips",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
      icon: Car,
      href: "/search?mode=car",
    },
  ]

  const popularRoutes = [
    {
      from: "Mumbai",
      to: "Delhi",
      price: "₹4,500",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=200&fit=crop",
    },
    {
      from: "Bangalore",
      to: "Chennai",
      price: "₹2,800",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&h=200&fit=crop",
    },
    {
      from: "Kolkata",
      to: "Goa",
      price: "₹6,200",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&h=200&fit=crop",
    },
    {
      from: "Hyderabad",
      to: "Pune",
      price: "₹3,400",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=200&fit=crop",
    },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Business Traveler",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      text: "TravelHub made my multi-city business trip so easy to plan. One platform for everything!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Family Vacation Planner",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "Booked flights, trains, and taxis for our family vacation. Seamless experience!",
      rating: 5,
    },
    {
      name: "Anita Patel",
      role: "Solo Traveler",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "The wallet feature is amazing. No need to pay separately for each booking.",
      rating: 5,
    },
  ]

  const features = [
    {
      icon: Zap,
      title: "Fast Booking",
      description: "Book any transport in under 2 minutes",
    },
    {
      icon: Clock,
      title: "Real-Time Availability",
      description: "Live updates on schedules and availability",
    },
    {
      icon: Shield,
      title: "Smart Wallet",
      description: "Secure payments with instant refunds",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slideshow */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Transport ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Book Every Journey,{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">One Place.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Flights, Trains, Buses, Taxis, Ferries & Cars - All in one platform
          </motion.p>
        </div>
      </section>

      {/* Search Box */}
      <section className="relative -mt-20 z-20 max-w-6xl mx-auto px-4">
        <SearchBox />
      </section>

      {/* Popular Routes */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Routes</h2>
          <p className="text-xl text-gray-600">Most booked destinations this month</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularRoutes.map((route, index) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="transport-card"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={route.image || "/placeholder.svg"}
                  alt={`${route.from} to ${route.to}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold">
                    {route.from} → {route.to}
                  </h3>
                  <p className="text-sky-300 font-semibold">From {route.price}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transport Modes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Explore by Transport Mode</h2>
            <p className="text-xl text-gray-600">Choose your preferred way to travel</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transportModes.map((mode, index) => (
              <TransportCard
                key={mode.title}
                title={mode.title}
                description={mode.description}
                image={mode.image}
                icon={mode.icon}
                href={mode.href}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Real People Traveling */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Travel with Confidence</h2>
          <p className="text-xl text-gray-600">Join millions of happy travelers</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl mb-6">
              <Image
                src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop"
                alt="Business travelers at airport"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Business Travel</h3>
            <p className="text-gray-600">Professional booking solutions for corporate travelers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl mb-6">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
                alt="Family traveling together"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Family Vacations</h3>
            <p className="text-gray-600">Create memorable family trips with easy group bookings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl mb-6">
              <Image
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop"
                alt="Solo traveler with backpack"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Solo Adventures</h3>
            <p className="text-gray-600">Discover new destinations with flexible solo travel options</p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose TravelHub?</h2>
            <p className="text-xl text-gray-600">Experience the difference with our platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Travelers Say</h2>
          <p className="text-xl text-gray-600">Real experiences from real people</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="card text-center"
            >
              <Image
                src={testimonial.image || "/placeholder.svg"}
                alt={testimonial.name}
                width={100}
                height={100}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
              <p className="text-gray-500 text-sm">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready for Your Next Journey?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join millions of travelers who trust TravelHub for all their transportation needs
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
              Start Booking Now
              <ArrowRight className="inline-block w-5 h-5 ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
