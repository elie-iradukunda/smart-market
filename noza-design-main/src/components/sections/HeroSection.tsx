import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Button from '../ui/Button'

export default function HeroSection() {
  const animatedElements = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 }
    )

    animatedElements.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => {
      animatedElements.current.forEach((el) => {
        if (el) observer.unobserve(el)
      })
    }
  }, [])
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-600 to-secondary-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/80 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                AI-Powered Business Intelligence
                <span className="text-gray-400" aria-hidden="true">·</span>
                <a href="#" className="font-semibold text-primary-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Learn more <span aria-hidden="true">&rarr;</span>
                </a>
              </span>
            </div>
          </div>
          <h1 
            ref={(el: HTMLHeadingElement | null) => { if (el) animatedElements.current[0] = el }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl transition-all duration-700 ease-out"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            Intelligent Business
            <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto]">
              Management System
            </span>
          </h1>
          <p 
            ref={(el: HTMLParagraphElement | null) => { if (el) animatedElements.current[1] = el }}
            className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto text-balance transition-all duration-700 ease-out"
            style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: '0.1s' }}
          >
            Unify your entire design business—from order intake to delivery and payment. 
            AI-optimized inventory, omnichannel communications, and powerful analytics 
            all in one platform.
          </p>
          <div 
            ref={(el: HTMLDivElement | null) => { if (el) animatedElements.current[2] = el }}
            className="mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6 transition-all duration-700 ease-out"
            style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: '0.2s' }}
          >
            <Link to="/login">
              <Button size="lg" className="group shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="#features">
              <Button variant="outline" size="lg" className="border-2">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-6 sm:mt-24 sm:grid-cols-4 lg:mx-0 lg:max-w-none lg:gap-8">
          {[
            { label: 'Modules', value: '8+', desc: 'Core Systems' },
            { label: 'Integrations', value: '15+', desc: 'Official APIs' },
            { label: 'Uptime', value: '99.9%', desc: 'SLA Guaranteed' },
            { label: 'Support', value: '24/7', desc: 'Always Available' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary-600 to-primary-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}

