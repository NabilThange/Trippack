import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Instagram, Facebook, Linkedin, Twitter, ArrowUpRight, Luggage } from "lucide-react"

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans text-white">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-6 md:px-12 md:py-8">

        {/* Header */}
        <header className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold tracking-tight">TripPack!</span>
          </div>
          <Link href="/auth/sign-up">
            <Button
              className="bg-white text-black hover:bg-white/90 rounded-full px-6 py-2 font-semibold text-sm md:text-base border-0 shadow-none"
            >
              Sign Up
            </Button>
          </Link>
        </header>

        <div className="flex-1 flex flex-col md:flex-row mt-8 md:mt-0">
          {/* Social Sidebar */}
          <div className="hidden md:flex flex-col justify-center gap-6 text-white/80">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full flex flex-col gap-4 border border-white/20">
              <a href="#" className="p-2 hover:text-white hover:bg-white/20 rounded-full transition-colors"><Instagram size={20} /></a>
              <a href="#" className="p-2 hover:text-white hover:bg-white/20 rounded-full transition-colors"><Facebook size={20} /></a>
              <a href="#" className="p-2 hover:text-white hover:bg-white/20 rounded-full transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="p-2 hover:text-white hover:bg-white/20 rounded-full transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center md:items-start md:text-left md:pl-20 lg:pl-32">

            {/* Main Typography */}
            <div className="space-y-2 md:space-y-4 mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight">
                <span className="block">Crafting</span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4">
                  <span className="bg-white text-black px-4 py-1 md:px-6 md:py-2 rounded-full transform -rotate-2 inline-block border-2 border-transparent shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                    Journeys
                  </span>
                  <span>Not</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4">
                  <span>Just</span>
                  <span className="bg-white text-black px-4 py-1 md:px-6 md:py-2 rounded-full transform rotate-1 inline-block border-2 border-transparent shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                    Trips
                  </span>
                </div>
              </h1>
            </div>

            {/* Description */}
            <p className="max-w-md text-sm md:text-base text-white/90 leading-relaxed mb-8 md:mb-12 drop-shadow-md">
              This activity involves the movement of people from one location to another, domestically or internationally. Visit more
            </p>

            {/* CTA Button */}
            <Link href="/auth/sign-up">
              <Button
                className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-6 md:px-8 text-base font-semibold border-0 flex items-center gap-2 group transition-all duration-300 hover:scale-105"
              >
                Start Planning
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </Link>

          </div>
        </div>
      </div>

      {/* New Section: About the App */}
      <section className="relative z-10 bg-background text-foreground py-20 px-6 md:px-12 rounded-t-[3rem] -mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Why TripPack?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience a new way of traveling with our collaborative tools designed for modern explorers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="material-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Luggage size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Packing</h3>
              <p className="text-muted-foreground">
                Never forget an item again. Our smart lists adapt to your destination and duration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="material-card p-8 flex flex-col items-center text-center bg-black text-white transform md:-translate-y-4">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Instagram size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Social Sharing</h3>
              <p className="text-white/80">
                Share your itinerary with friends and family instantly. Collaborate in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="material-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <ArrowUpRight size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Seamless Plans</h3>
              <p className="text-muted-foreground">
                From flights to hotels, keep everything organized in one beautiful dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
