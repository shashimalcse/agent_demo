'use client'

import Image from "next/image"
import BookingWidget from "@/components/booking-widget"
import ChatButton from "@/components/chat-button"
import { NavigationMenu } from "@/components/navigation-menu"
import { useSession } from "next-auth/react"
import { Star, Utensils, Map, Phone, Mail, Instagram, Twitter, Facebook, Globe, Shield, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <NavigationMenu />
      </header>

      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full flex items-center justify-center">
        <Image
          src="/image.jpg"
          alt="Luxury hotel by the ocean"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 tracking-tight">
            Discover Gardeo Hotels & Resorts
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Luxury accommodations across the most beautiful destinations in Sri Lanka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-5 rounded-md text-lg">
              Find Your Stay
            </Button>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 px-6 py-5 rounded-md text-lg">
              Explore Our Hotels
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-0 right-0 px-4 md:px-6 lg:px-8">
          <div className="max-w-8xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
              <BookingWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-sm md:text-base uppercase tracking-wider text-orange-500 font-medium mb-3">Welcome to</h2>
              <h3 className="text-3xl md:text-4xl font-serif mb-4">Gardeo Hotels & Resorts</h3>
              <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
            </div>
            <h4 className="text-xl md:text-2xl text-gray-700 font-light">Luxury Hospitality Across Sri Lanka</h4>
            <div className="space-y-6 text-gray-600">
              <p className="leading-relaxed">
                Experience the finest hospitality Sri Lanka has to offer with our collection of luxury hotels and resorts. From the pristine beaches of the Southern Coast to the misty mountains of the Central Highlands, Gardeo properties showcase the diverse beauty of our island nation.
              </p>
              <p className="leading-relaxed">
                Each of our hotels and resorts offers a unique experience while maintaining our signature blend of traditional Sri Lankan warmth and contemporary luxury. Whether you seek a beachfront escape, a mountain retreat, or a cultural immersion, Gardeo provides unforgettable stays with exceptional service.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="font-medium text-base md:text-lg">Sanjay Mendis</p>
              <p className="text-sm text-gray-500">Chief Executive Officer - Gardeo Hotels & Resorts</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-md">
              Our Story
            </Button>
          </div>
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="/image.jpg" 
                alt="Gardeo Hotels Collection"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-4xl font-serif text-orange-500">7</p>
                <p className="text-sm text-gray-600 mt-1">Destinations</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-4xl font-serif text-orange-500">12</p>
                <p className="text-sm text-gray-600 mt-1">Properties</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-4xl font-serif text-orange-500">5★</p>
                <p className="text-sm text-gray-600 mt-1">Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Destinations */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-sm md:text-base uppercase tracking-wider text-orange-500 font-medium mb-3">Our Destinations</h2>
          <h3 className="text-3xl md:text-4xl font-serif mb-4">Experience Sri Lanka With Gardeo</h3>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group overflow-hidden rounded-lg relative">
            <div className="aspect-[3/4] relative overflow-hidden">
              <Image 
                src="/image.jpg" 
                alt="Gardeo Galle" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="text-white">
                <h4 className="text-2xl font-serif mb-2">Galle</h4>
                <p className="mb-4 text-white/80">Beachfront luxury along the historic southern coast</p>
                <p className="font-medium text-sm text-white/90">3 Properties</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Explore Hotels</Button>
            </div>
          </div>
          
          <div className="group overflow-hidden rounded-lg relative">
            <div className="aspect-[3/4] relative overflow-hidden">
              <Image 
                src="/image.jpg" 
                alt="Gardeo Kandy" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="text-white">
                <h4 className="text-2xl font-serif mb-2">Kandy</h4>
                <p className="mb-4 text-white/80">Mountain retreats in the cultural heartland</p>
                <p className="font-medium text-sm text-white/90">2 Properties</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Explore Hotels</Button>
            </div>
          </div>
          
          <div className="group overflow-hidden rounded-lg relative">
            <div className="aspect-[3/4] relative overflow-hidden">
              <Image 
                src="/image.jpg" 
                alt="Gardeo Colombo" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="text-white">
                <h4 className="text-2xl font-serif mb-2">Colombo</h4>
                <p className="mb-4 text-white/80">Urban luxury in Sri Lanka&rsquo;s vibrant capital</p>
                <p className="font-medium text-sm text-white/90">2 Properties</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Explore Hotels</Button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6">
            View All Destinations
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-sm md:text-base uppercase tracking-wider text-orange-500 font-medium mb-3">The Gardeo Experience</h2>
          <h3 className="text-3xl md:text-4xl font-serif mb-4">What Sets Us Apart</h3>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Award className="text-orange-500 h-6 w-6" />
            </div>
            <h4 className="text-xl font-medium mb-3">Award-Winning Service</h4>
            <p className="text-gray-600">Consistent excellence across all our properties with 24/7 personalized attention.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Utensils className="text-orange-500 h-6 w-6" />
            </div>
            <h4 className="text-xl font-medium mb-3">Culinary Excellence</h4>
            <p className="text-gray-600">Distinctive dining experiences featuring both local and international cuisine at every location.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Globe className="text-orange-500 h-6 w-6" />
            </div>
            <h4 className="text-xl font-medium mb-3">Unique Locations</h4>
            <p className="text-gray-600">Prime settings in Sri Lanka&rsquo;s most stunning and sought-after destinations.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="text-orange-500 h-6 w-6" />
            </div>
            <h4 className="text-xl font-medium mb-3">Loyalty Program</h4>
            <p className="text-gray-600">Earn and redeem points across all Gardeo properties with exclusive member benefits.</p>
          </div>
        </div>
      </section>
      
      {/* Special Offers */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-orange-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-orange-500/10 transform -skew-x-12"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-sm md:text-base uppercase tracking-wider text-orange-500 font-medium mb-3">Special Offers</h2>
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Exclusive Deals Across Our Properties</h3>
            <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-48">
                <Image
                  src="/image.jpg"
                  alt="Chain-wide Discount"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">15% OFF</div>
                <div className="absolute bottom-3 left-3 text-white z-20">
                  <p className="font-medium">All Gardeo Properties</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-medium mb-2">Gardeo Member Rate</h4>
                <p className="text-gray-600 mb-4">Sign up for our loyalty program and receive 15% off at any Gardeo hotel or resort.</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Join Now
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-48">
                <Image
                  src="/image.jpg"
                  alt="Island Hopping Package"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">PACKAGE</div>
                <div className="absolute bottom-3 left-3 text-white z-20">
                  <p className="font-medium">Starting from $899</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-medium mb-2">Island Hopping Experience</h4>
                <p className="text-gray-600 mb-4">Stay at three different Gardeo properties with transportation included between destinations.</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  View Details
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-48">
                <Image
                  src="/image.jpg"
                  alt="Seasonal Offer"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">SEASONAL</div>
                <div className="absolute bottom-3 left-3 text-white z-20">
                  <p className="font-medium">Valid April - June</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-medium mb-2">Green Season Special</h4>
                <p className="text-gray-600 mb-4">Enjoy reduced rates and complimentary upgrades at select properties during the green season.</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm md:text-base uppercase tracking-wider text-orange-500 font-medium mb-3">Testimonials</h2>
            <h3 className="text-3xl md:text-4xl font-serif mb-4">What Our Guests Say</h3>
            <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex text-orange-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 italic mb-6">&ldquo;We&rsquo;ve stayed at three different Gardeo properties and have been consistently impressed by the quality and service at each location.&rdquo;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Gardeo Galle and Colombo</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex text-orange-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 italic mb-6">&ldquo;The loyalty program is excellent, allowing us to enjoy benefits across all properties. Their island hopping package was the highlight of our trip.&rdquo;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <p className="font-medium">David Chen</p>
                  <p className="text-sm text-gray-500">Gardeo Member Since 2019</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex text-orange-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 italic mb-6">&ldquo;Each Gardeo property has its own unique character while maintaining the same high standards. The staff recognized us from our previous stay at their sister property!&rdquo;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <p className="font-medium">Maria &amp; Carlos</p>
                  <p className="text-sm text-gray-500">Gardeo Kandy and Arugambay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-12 md:grid-cols-4">
          <div>
            <h4 className="text-white text-lg font-medium mb-6">Gardeo Hotels & Resorts</h4>
            <p className="mb-6">Discover the finest collection of luxury hotels and resorts across Sri Lanka, offering exceptional experiences tailored to each unique destination.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-medium mb-6">Our Hotels</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Gardeo Galle</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Gardeo Unawatuna</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Gardeo Kandy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Gardeo Nuwara Eliya</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Gardeo Colombo</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">View All Properties</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-medium mb-6">Corporate Office</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Map className="w-5 h-5 mr-3 mt-0.5 text-orange-500" />
                <span>42 Marine Drive<br />Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-orange-500" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-orange-500" />
                <span>info@gardeohotels.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-medium mb-6">Reservations</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium">Central Reservations</p>
                  <p>+94 11 234 5679</p>
                </div>
              </li>
              <li className="mt-4">
                <p className="font-medium mb-1">Reservation Hours</p>
                <p>Monday - Sunday</p>
                <p>8:00 AM - 10:00 PM (GMT+5:30)</p>
              </li>
              <li className="mt-4">
                <p className="font-medium mb-1">Member Services</p>
                <p>+94 11 234 5680</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Gardeo Hotels & Resorts. All rights reserved.</p>
        </div>
      </footer>

      {/* Chat Button */}
      {session && <ChatButton />}
    </div>
  )
}

