import { Users, Target, Award, TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description:
      'We are committed to delivering exceptional design quality in every project. From banners to garments, we ensure premium materials and craftsmanship.',
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description:
      'Your vision is our mission. We work closely with our clients to understand their needs and deliver designs that exceed expectations.',
  },
  {
    icon: Award,
    title: 'Creative Excellence',
    description:
      'Our team of skilled designers brings creativity and innovation to every project, ensuring your brand stands out with unique and impactful designs.',
  },
  {
    icon: TrendingUp,
    title: 'Reliable Service',
    description:
      'We pride ourselves on timely delivery, competitive pricing, and exceptional customer service. Your satisfaction is our top priority.',
  },
]

const stats = [
  { label: 'Projects Completed', value: '5,000+' },
  { label: 'Happy Clients', value: '2,500+' },
  { label: 'Years of Experience', value: '10+' },
  { label: 'Service Categories', value: '8+' },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              About TOP Design Ltd
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Rwanda's premier design company specializing in banners, printing, garment branding, signage, and graphic design services.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg prose-gray mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                TOP Design Ltd was founded with a passion for bringing creative visions to life. We started as a small
                design studio in Rwanda, dedicated to providing high-quality design and printing services to local businesses.
                Over the years, we've grown into a trusted partner for companies across Rwanda, helping them establish
                their brand identity through exceptional design work.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Today, TOP Design Ltd offers a comprehensive range of design services including banner printing,
                garment branding, vinyl printing, digital printing, graphic design, custom signage, business cards,
                and embroidery. We combine traditional craftsmanship with modern technology to deliver outstanding results
                that help our clients stand out in the marketplace.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our commitment to quality, creativity, and customer satisfaction has made us one of Rwanda's leading
                design companies. We take pride in every project we complete and every relationship we build with our clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container-professional">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} hover>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We offer a wide range of design and printing services to meet all your business needs.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-professional border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Printing Services</h3>
                <p className="text-gray-600 leading-relaxed">
                  High-quality banner printing, digital printing, business cards, and large format printing
                  using premium materials and state-of-the-art equipment.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-professional border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Garment Branding</h3>
                <p className="text-gray-600 leading-relaxed">
                  Custom t-shirts, hoodies, and apparel printing with vinyl, heat transfer, screen printing,
                  and professional embroidery services.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-professional border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Graphic Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Professional logo design, brand identity, marketing materials, and creative design solutions
                  tailored to your business needs.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-professional border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Signage & Vinyl</h3>
                <p className="text-gray-600 leading-relaxed">
                  Custom signage solutions, vinyl graphics for vehicles and windows, indoor and outdoor displays,
                  and professional installation services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

