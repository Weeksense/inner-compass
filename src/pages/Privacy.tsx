import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeekSenseLogo from "@/components/WeekSenseLogo";

const Privacy = () => (
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
      <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: February 24, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-secondary-foreground">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">1. Controller</h2>
          <p className="leading-relaxed text-muted-foreground">
            The controller responsible for data processing on this website is:
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Wolfgang Preinfalk<br />
            Kalvarienbergstraße 48<br />
            4240 Freistadt, Austria<br />
            Email: <a href="mailto:wolfgang.preinfalk@wiroconsulting.at" className="text-primary hover:underline">wolfgang.preinfalk@wiroconsulting.at</a>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">2. Data We Collect</h2>
          <p className="leading-relaxed text-muted-foreground">We collect the following categories of personal data:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Account data:</strong> Email address and password (hashed) when you create an account.</li>
            <li><strong className="text-foreground">Profile data:</strong> Display name and any information you voluntarily provide during onboarding.</li>
            <li><strong className="text-foreground">Review data:</strong> Your weekly review answers, energy scores, goals, and AI-generated insights.</li>
            <li><strong className="text-foreground">Usage data:</strong> Pages visited, features used, timestamps, and device/browser information collected automatically.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">3. Purpose of Processing</h2>
          <p className="leading-relaxed text-muted-foreground">We process your data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Providing and maintaining the WeekSense service, including AI-powered insights.</li>
            <li>Authenticating your identity and securing your account.</li>
            <li>Sending you service-related notifications (e.g., weekly reminders, if enabled).</li>
            <li>Improving our product through aggregated, anonymized usage analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">4. Legal Basis (GDPR Art. 6)</h2>
          <p className="leading-relaxed text-muted-foreground">
            We process your personal data based on: (a) your <strong className="text-foreground">consent</strong> (Art. 6(1)(a) GDPR) when you create an account;
            (b) <strong className="text-foreground">contract performance</strong> (Art. 6(1)(b) GDPR) to provide the service you signed up for;
            and (c) <strong className="text-foreground">legitimate interests</strong> (Art. 6(1)(f) GDPR) for security, fraud prevention, and service improvement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">5. Data Sharing</h2>
          <p className="leading-relaxed text-muted-foreground">
            We do <strong className="text-foreground">not</strong> sell, rent, or trade your personal data. We may share data with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Infrastructure providers:</strong> Cloud hosting and database services necessary to operate WeekSense.</li>
            <li><strong className="text-foreground">AI processing:</strong> Your review text is sent to AI providers to generate insights. This data is not stored by third parties beyond the processing request.</li>
            <li><strong className="text-foreground">Legal obligations:</strong> If required by law, court order, or governmental authority.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">6. Data Retention</h2>
          <p className="leading-relaxed text-muted-foreground">
            We retain your data for as long as your account is active. If you delete your account, all personal data — including reviews, goals, and insights — will be permanently deleted within 30 days. Anonymized, aggregated data may be retained for analytics purposes.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">7. Your Rights</h2>
          <p className="leading-relaxed text-muted-foreground">Under the GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Access</strong> your personal data (Art. 15 GDPR).</li>
            <li><strong className="text-foreground">Rectify</strong> inaccurate data (Art. 16 GDPR).</li>
            <li><strong className="text-foreground">Erase</strong> your data ("right to be forgotten", Art. 17 GDPR).</li>
            <li><strong className="text-foreground">Restrict</strong> processing (Art. 18 GDPR).</li>
            <li><strong className="text-foreground">Data portability</strong> — receive your data in a structured, machine-readable format (Art. 20 GDPR).</li>
            <li><strong className="text-foreground">Object</strong> to processing based on legitimate interests (Art. 21 GDPR).</li>
            <li><strong className="text-foreground">Withdraw consent</strong> at any time without affecting prior processing (Art. 7(3) GDPR).</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground mt-3">
            To exercise any of these rights, contact us at <a href="mailto:wolfgang.preinfalk@wiroconsulting.at" className="text-primary hover:underline">wolfgang.preinfalk@wiroconsulting.at</a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">8. Cookies</h2>
          <p className="leading-relaxed text-muted-foreground">
            WeekSense uses only essential cookies required for authentication and session management. We do not use tracking cookies or third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">9. Security</h2>
          <p className="leading-relaxed text-muted-foreground">
            We implement industry-standard security measures including encrypted connections (TLS/SSL), hashed passwords, and row-level security policies to ensure your data is protected. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-3">10. Contact & Complaints</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have questions about this privacy policy or wish to file a complaint, please contact us at{" "}
            <a href="mailto:wolfgang.preinfalk@wiroconsulting.at" className="text-primary hover:underline">wolfgang.preinfalk@wiroconsulting.at</a>.
            You also have the right to lodge a complaint with the Austrian Data Protection Authority (Datenschutzbehörde), Barichgasse 40–42, 1030 Vienna, Austria.
          </p>
        </section>
      </div>
    </main>
  </div>
);

export default Privacy;
