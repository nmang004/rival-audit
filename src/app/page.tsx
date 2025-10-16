import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  BarChart3,
  Eye,
  Zap,
  CheckCircle2,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.24_0.13_265)] via-[oklch(0.28_0.12_262)] to-[oklch(0.32_0.11_260)] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.24_0.13_265)] to-transparent opacity-50" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[oklch(0.71_0.15_60)] text-white hover:bg-[oklch(0.75_0.14_55)] animate-fadeIn">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Website Audits
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slideUp">
              Close More Deals with
              <span className="block mt-2 bg-gradient-to-r from-[oklch(0.71_0.15_60)] to-[oklch(0.85_0.14_50)] bg-clip-text text-transparent">
                Professional SEO Audits
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto animate-slideUp opacity-90">
              Impress prospects and accelerate your sales cycle with comprehensive, AI-powered website audits.
              Get detailed SEO, accessibility, and design analysis in minutes—not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp">
              <Button asChild size="lg" className="text-lg bg-[oklch(0.71_0.15_60)] hover:bg-[oklch(0.75_0.14_55)] text-white button-scale group">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg border-white/30 text-white hover:bg-white/10 button-scale">
                <Link href="/sign-in">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative gradient blur */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-[oklch(0.71_0.15_60)] blur-[100px] opacity-20" />
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fadeIn">
              <div className="text-4xl md:text-5xl font-bold text-[oklch(0.24_0.13_265)] mb-2">
                10,000+
              </div>
              <div className="text-gray-600">Audits Completed</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-[oklch(0.24_0.13_265)] mb-2">
                95%
              </div>
              <div className="text-gray-600">Time Saved</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-bold text-[oklch(0.24_0.13_265)] mb-2">
                500+
              </div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold text-[oklch(0.24_0.13_265)] mb-2">
                4.9/5
              </div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for sales professionals and agencies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-[oklch(0.24_0.13_265)] to-[oklch(0.28_0.12_262)] rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Comprehensive SEO Analysis</CardTitle>
                <CardDescription className="text-base">
                  Get detailed technical SEO scores including meta tags, page speed, mobile optimization, and structured data analysis
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-[oklch(0.75_0.14_55)] rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <CardDescription className="text-base">
                  Claude AI analyzes screenshots to provide expert UI/UX recommendations and design improvement suggestions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Lightning Fast Audits</CardTitle>
                <CardDescription className="text-base">
                  Complete comprehensive audits in under 3 minutes with automatic screenshot capture and parallel analysis
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Accessibility Compliance</CardTitle>
                <CardDescription className="text-base">
                  Automatically check WCAG compliance, screen reader compatibility, and identify accessibility issues
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Professional Reports</CardTitle>
                <CardDescription className="text-base">
                  Generate beautiful, shareable PDF reports that impress clients and close deals faster
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="card-hover-effect border-2">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Actionable Recommendations</CardTitle>
                <CardDescription className="text-base">
                  Get prioritized, step-by-step recommendations that show exactly what needs to be fixed
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get professional website audits in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[oklch(0.24_0.13_265)] to-[oklch(0.28_0.12_262)] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  1
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[oklch(0.24_0.13_265)] to-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enter Website URL</h3>
              <p className="text-gray-600">
                Simply paste any website URL to start the audit. No setup or configuration required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-[oklch(0.75_0.14_55)] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[oklch(0.71_0.15_60)] to-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes SEO, accessibility, design, and captures screenshots automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Results</h3>
              <p className="text-gray-600">
                Receive a comprehensive report with scores, insights, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Sales Teams Love Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform how you sell with data-driven insights
            </p>
          </div>

          <div className="space-y-24">
            {/* Benefit 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-[oklch(0.24_0.13_265)] text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Save Time
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Cut Research Time by 95%
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Stop spending hours manually checking websites. Get comprehensive audits in under 3 minutes,
                  so you can focus on what matters—building relationships and closing deals.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automated screenshot capture and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Instant SEO and accessibility scoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">AI-generated recommendations in seconds</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-[oklch(0.24_0.13_265)] to-[oklch(0.28_0.12_262)] rounded-2xl shadow-2xl flex items-center justify-center">
                  <Clock className="w-24 h-24 text-white opacity-20" />
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="aspect-video bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-[oklch(0.75_0.14_55)] rounded-2xl shadow-2xl flex items-center justify-center">
                  <Target className="w-24 h-24 text-white opacity-20" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-[oklch(0.71_0.15_60)] text-white">
                  <Target className="w-3 h-3 mr-1" />
                  Close More Deals
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Impress Prospects Instantly
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Show up to sales calls with professional, data-backed insights. Demonstrate value immediately
                  and position yourself as the expert they need.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Professional PDF reports to share</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Shareable links for easy collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">White-label branding options</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-purple-600 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Stand Out
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Become the Trusted Advisor
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Leverage AI-powered insights to provide recommendations your competitors cannot match.
                  Build trust by showing you understand their challenges before the first meeting.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Claude AI provides expert-level analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Prioritized recommendations by impact</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[oklch(0.71_0.15_60)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Technical insights made simple</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center">
                  <Award className="w-24 h-24 text-white opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built For Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re a solo freelancer or managing a team, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <Card className="card-hover-effect border-2 hover:border-[oklch(0.24_0.13_265)] transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[oklch(0.24_0.13_265)] to-[oklch(0.28_0.12_262)] rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Sales Teams</CardTitle>
                <CardDescription className="text-base mt-3">
                  Empower your team with professional audits for every prospect. Close more deals
                  by showing value before the first call.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Team collaboration features
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Unlimited audits per month
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Use Case 2 */}
            <Card className="card-hover-effect border-2 hover:border-[oklch(0.71_0.15_60)] transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-[oklch(0.75_0.14_55)] rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Digital Agencies</CardTitle>
                <CardDescription className="text-base mt-3">
                  Scale your agency with automated audits. Impress clients with comprehensive
                  reports and win more projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    White-label reports
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    API access available
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Bulk audit capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Use Case 3 */}
            <Card className="card-hover-effect border-2 hover:border-purple-500 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Freelancers</CardTitle>
                <CardDescription className="text-base mt-3">
                  Compete with agencies on day one. Deliver professional audits that help you
                  land bigger clients and charge premium rates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Affordable pricing
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Professional templates
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.71_0.15_60)] mr-2 flex-shrink-0" />
                    Easy to use
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Sales Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="card-hover-effect">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[oklch(0.71_0.15_60)] text-[oklch(0.71_0.15_60)]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  &quot;This tool has completely transformed our sales process. We close deals 30% faster
                  by showing prospects exactly what needs improvement on their website.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.24_0.13_265)] to-[oklch(0.28_0.12_262)] flex items-center justify-center text-white font-bold">
                    SJ
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Sarah Johnson</div>
                    <div className="text-sm text-gray-600">Sales Director, TechCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="card-hover-effect">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[oklch(0.71_0.15_60)] text-[oklch(0.71_0.15_60)]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  &quot;The AI-powered insights are incredible. I can now compete with big agencies
                  as a freelancer. My clients are blown away by the professional reports.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.71_0.15_60)] to-[oklch(0.75_0.14_55)] flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Michael Chen</div>
                    <div className="text-sm text-gray-600">Freelance SEO Consultant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="card-hover-effect">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[oklch(0.71_0.15_60)] text-[oklch(0.71_0.15_60)]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  &quot;We&apos;ve audited over 500 websites with this tool. It saves us countless hours
                  and our clients love the detailed, actionable recommendations.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    EP
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Emily Parker</div>
                    <div className="text-sm text-gray-600">Founder, Digital Growth Agency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.24_0.13_265)] via-[oklch(0.26_0.12_263)] to-[oklch(0.28_0.12_260)] text-white py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="container relative mx-auto px-4 max-w-5xl text-center">
          <Badge className="mb-6 bg-[oklch(0.71_0.15_60)] text-white hover:bg-[oklch(0.75_0.14_55)]">
            <Sparkles className="w-3 h-3 mr-1" />
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Close More Deals?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
            Join hundreds of sales professionals using AI-powered audits to accelerate their sales cycle.
            Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg bg-[oklch(0.71_0.15_60)] hover:bg-[oklch(0.75_0.14_55)] text-white button-scale shadow-2xl group">
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg border-white/30 text-white hover:bg-white/10 button-scale">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            No credit card required • Cancel anytime • 14-day free trial
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.71_0.15_60)] to-transparent opacity-50" />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Sales SEO Audit</h3>
              <p className="text-sm text-gray-400">
                AI-powered website audits for sales professionals.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">API</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">About</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Blog</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Careers</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Privacy</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Terms</Link></li>
                <li><Link href="/dashboard" className="hover:text-[oklch(0.71_0.15_60)] transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Rival Digital. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Powered by</span>
              <span className="text-[oklch(0.71_0.15_60)] font-semibold">Rival Digital</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
