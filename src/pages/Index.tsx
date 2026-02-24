import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeekSenseLogo from "@/components/WeekSenseLogo";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <WeekSenseLogo />
          <div className="flex items-center gap-4">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>10 minutes. Real clarity.</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] mb-6">
              Make sense of
              <br />
              <span className="text-gradient-primary">your own weeks.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A 10-minute guided reflection. Real insights. No empty templates.
              <br className="hidden md:block" />
              Discover your patterns. Become more intentional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-lg px-8 py-6 rounded-xl glow-primary">
                  Start your first review — free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-2xl mx-auto"
          >
            <div className="glass-card p-8 md:p-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-sm text-muted-foreground">Question 1 of 7</span>
              </div>
              <p className="font-serif text-2xl md:text-3xl text-foreground mb-6">
                What was your biggest win this week?
              </p>
              <div className="h-24 rounded-xl border border-border/50 bg-muted/30 flex items-start p-4">
                <span className="text-muted-foreground/50">Start typing...</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl text-center text-foreground mb-16"
          >
            Three steps to clarity
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Sparkles className="w-8 h-8" />, title: "Answer", desc: "7 thoughtful questions about your week. No fluff, no busywork — just the ones that matter." },
              { icon: <Brain className="w-8 h-8" />, title: "Get Insights", desc: "AI analyzes your answers and surfaces your biggest win, main blocker, and focus for next week." },
              { icon: <BarChart3 className="w-8 h-8" />, title: "See Patterns", desc: "Over time, discover recurring themes. What drains you? What energizes you? Finally know." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center group hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl text-center text-foreground mb-4"
          >
            Simple pricing
          </motion.h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">Start free. Upgrade when you're hooked.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Free", price: "$0", desc: "Try it out", features: ["3 weekly reviews", "AI-powered insights", "Basic dashboard"], cta: "Get Started", featured: false },
              { name: "Pro", price: "$8/mo", desc: "For the intentional", features: ["Unlimited reviews", "Pattern recognition", "Export reviews", "Priority support"], cta: "Start Pro", featured: true },
              { name: "Team", price: "$20/mo", desc: "Reflect together", features: ["Everything in Pro", "Team dashboards", "Shared insights", "Admin controls"], cta: "Contact Us", featured: false },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={plan.featured ? "glass-card-accent p-8 relative" : "glass-card p-8"}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="font-serif text-2xl text-foreground mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-serif text-foreground">{plan.price}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button variant={plan.featured ? "default" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <WeekSenseLogo />
          <p className="text-sm text-muted-foreground">© 2026 WeekSense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
