import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeekSenseLogo from "@/components/WeekSenseLogo";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/"><WeekSenseLogo /></Link>
        <Link to="/">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </Link>
      </div>
    </nav>

    <main className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: February 24, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-secondary-foreground">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">1. Provider</h2>
          <p className="leading-relaxed text-muted-foreground">
            WeekSense is operated by:
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Wolfgang Preinfalk<br />
            Kalvarienbergstraße 48<br />
            4240 Freistadt, Austria<br />
            Email: <a href="mailto:wolfgang.preinfalk@wiroconsulting.at" className="text-primary hover:underline">wolfgang.preinfalk@wiroconsulting.at</a>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">2. Acceptance of Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            By accessing or using WeekSense, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service. We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">3. Description of Service</h2>
          <p className="leading-relaxed text-muted-foreground">
            WeekSense is a web-based application that enables users to complete guided weekly reflections, track energy levels, set personal goals, and receive AI-powered insights based on their review data. The service is available in a free tier and a paid "Pro" tier with additional features.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">4. User Accounts</h2>
          <p className="leading-relaxed text-muted-foreground">
            To use WeekSense, you must create an account with a valid email address. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">5. Free and Pro Plans</h2>
          <p className="leading-relaxed text-muted-foreground">
            The <strong className="text-foreground">Free plan</strong> includes up to 3 weekly reviews, AI-powered insights, energy score tracking, a basic dashboard, and streak tracking.
          </p>
          <p className="leading-relaxed text-muted-foreground mt-2">
            The <strong className="text-foreground">Pro plan</strong> (€4,99/month) includes unlimited weekly reviews, advanced pattern recognition, goal tracking & progress, export & share features, the review calendar heatmap, and priority support.
          </p>
          <p className="leading-relaxed text-muted-foreground mt-2">
            We reserve the right to modify plan features and pricing with reasonable notice. Existing subscribers will be informed at least 30 days before any pricing changes take effect.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">6. Payment & Cancellation</h2>
          <p className="leading-relaxed text-muted-foreground">
            Pro subscriptions are billed monthly. You may cancel your subscription at any time. Upon cancellation, you will retain access to Pro features until the end of your current billing period. No refunds will be issued for partial months. All prices are inclusive of applicable taxes.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">7. User Content</h2>
          <p className="leading-relaxed text-muted-foreground">
            You retain full ownership of all content you create within WeekSense, including review answers, goals, and notes. By using the service, you grant us a limited license to process your content solely for the purpose of providing the service (e.g., generating AI insights). We do not claim any intellectual property rights over your content.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">8. Acceptable Use</h2>
          <p className="leading-relaxed text-muted-foreground">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Use the service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to gain unauthorized access to other user accounts or our systems.</li>
            <li>Interfere with or disrupt the service or its infrastructure.</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the service.</li>
            <li>Use automated tools (bots, scrapers) to access the service without prior written consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">9. AI-Generated Content</h2>
          <p className="leading-relaxed text-muted-foreground">
            WeekSense uses artificial intelligence to generate insights, summaries, and pattern analyses based on your review data. These outputs are provided for informational and self-reflection purposes only. They do not constitute professional advice (medical, psychological, financial, or otherwise). We make no guarantees about the accuracy or completeness of AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">10. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">
            To the maximum extent permitted by applicable law, WeekSense and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or goodwill, arising out of or related to your use of the service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">11. Availability & Modifications</h2>
          <p className="leading-relaxed text-muted-foreground">
            We strive to keep WeekSense available at all times but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the service at any time. For significant changes, we will provide reasonable advance notice.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">12. Account Termination</h2>
          <p className="leading-relaxed text-muted-foreground">
            We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time through your profile settings. Upon deletion, all your data will be permanently removed within 30 days in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">13. Governing Law & Jurisdiction</h2>
          <p className="leading-relaxed text-muted-foreground">
            These terms are governed by the laws of the Republic of Austria, without regard to conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Linz, Austria. If you are a consumer within the EU, you also retain the right to bring proceedings in the courts of your country of residence.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">14. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            For questions about these terms, please contact us at{" "}
            <a href="mailto:wolfgang.preinfalk@wiroconsulting.at" className="text-primary hover:underline">wolfgang.preinfalk@wiroconsulting.at</a>.
          </p>
        </section>
      </div>
    </main>
  </div>
);

export default Terms;
