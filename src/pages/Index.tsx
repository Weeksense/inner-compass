import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  ArrowRight, Sparkles, BarChart3, Brain, Target, Zap,
  Shield, Download, Calendar, TrendingUp, CheckCircle2,
  Smartphone, Bell, X, Check, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WeekSenseLogo from "@/components/WeekSenseLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const Landing = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative pt-32 pb-32 px-6 min-h-[100vh] flex items-center">
        {/* Ambient glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[160px] animate-pulse-glow" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] animate-pulse-glow" style={{ animationDelay: "4s" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>10 minutes. Real clarity. Every week.</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.05] mb-6"
            >
              Make sense of
              <br />
              <span className="text-gradient-primary">your own weeks.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A guided weekly reflection that turns scattered thoughts into clear insights.
              Discover your patterns. Track your energy. Become more intentional.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-lg px-8 py-6 rounded-xl glow-primary">
                  Start your first review — free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="ghost" size="lg" className="text-lg px-8 py-6 rounded-xl">
                  See how it works
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* App preview mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-20 max-w-3xl mx-auto"
          >
            <div className="screenshot-frame bg-card/80 p-1">
              <div className="rounded-xl bg-background p-6 md:p-10">
                {/* Fake app top bar */}
                <div className="flex items-center justify-between mb-8">
                  <WeekSenseLogo iconSize={22} />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted/50" />
                  </div>
                </div>
                {/* Fake question card */}
                <div className="glass-card p-6 md:p-8 mb-4">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                    <span className="text-sm text-muted-foreground">Question 1 of 7</span>
                  </div>
                  <p className="font-serif text-xl md:text-2xl text-foreground mb-5">
                    What was your biggest win this week?
                  </p>
                  <div className="h-20 rounded-xl border border-border/50 bg-muted/20 flex items-start p-4">
                    <span className="text-muted-foreground/40">Start typing...</span>
                  </div>
                </div>
                {/* Fake progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full w-[14%] rounded-full bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">1/7</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
      <section className="py-16 px-6 border-y border-border/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 text-center"
          >
            {[
              { value: "10 min", label: "per week" },
              { value: "7", label: "guided questions" },
              { value: "AI", label: "powered insights" },
              { value: "100%", label: "private & secure" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i}>
                <div className="font-serif text-3xl md:text-4xl text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm text-primary font-medium uppercase tracking-widest mb-4 block">How It Works</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Three steps to clarity
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No complex setup. No learning curve. Just honest reflection that takes 10 minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-7 h-7" />,
                step: "01",
                title: "Reflect",
                desc: "Answer 7 thoughtful questions about your wins, blockers, energy levels, and goals. No fluff — just the questions that matter.",
              },
              {
                icon: <Brain className="w-7 h-7" />,
                step: "02",
                title: "Get Insights",
                desc: "AI analyzes your answers and surfaces your biggest win, main blocker, and a clear focus for the week ahead.",
              },
              {
                icon: <BarChart3 className="w-7 h-7" />,
                step: "03",
                title: "See Patterns",
                desc: "Over time, discover what drains you and what energizes you. Track your energy trend and watch your growth unfold.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i}
                className="feature-card text-center group"
              >
                <div className="text-xs font-medium text-primary/60 tracking-widest mb-4">{step.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES DEEP DIVE ═══════════════ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[140px]" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm text-primary font-medium uppercase tracking-widest mb-4 block">Features</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Everything you need to grow
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools designed for intentional self-improvement. Simple on the surface, smart underneath.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Energy Tracking",
                desc: "Rate your weekly energy and watch the trend over time. Spot burnout before it happens and celebrate high-energy weeks.",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Goal Tracking",
                desc: "Set personal goals and link them to your weekly reviews. See exactly how your reflections contribute to your bigger picture.",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Pattern Recognition",
                desc: "AI-powered analysis reveals recurring themes across your reviews — what drains you, what lifts you, and actionable advice.",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Streak & Heatmap",
                desc: "Build a reflection habit with streak tracking and a visual heatmap showing your consistency over 52 weeks.",
              },
              {
                icon: <Download className="w-6 h-6" />,
                title: "Export & Share",
                desc: "Download your reviews as beautiful share cards or export your data. Your reflections, your data, always.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Private & Secure",
                desc: "Your reflections are yours alone. End-to-end privacy with row-level security. Nobody sees your data but you.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i * 0.5}
                className="feature-card flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ APP SCREENSHOTS ═══════════════ */}
      <section className="py-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm text-primary font-medium uppercase tracking-widest mb-4 block">Inside the App</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Designed for focus
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A calm, distraction-free interface that guides your thinking. No clutter — just you and your thoughts.
            </p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={scaleIn}
            className="screenshot-frame bg-card/80 p-1 mb-8"
          >
            <div className="rounded-xl bg-background p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <WeekSenseLogo iconSize={20} />
                <div className="ml-auto flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted/40" />
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4">
                  <div className="text-xs text-muted-foreground mb-1">Streak</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="font-serif text-2xl text-primary">12 weeks</span>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-muted-foreground mb-1">Avg Energy</div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-serif text-2xl text-foreground">7.4/10</span>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-muted-foreground mb-1">Reviews</div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span className="font-serif text-2xl text-foreground">24</span>
                  </div>
                </div>
              </div>
              {/* Fake heatmap */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground font-medium">Review Calendar</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 52 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-sm ${
                        Math.random() > 0.4 ? "bg-primary" : "bg-muted/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two smaller mockups side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={0}
              className="screenshot-frame bg-card/80 p-1"
            >
              <div className="rounded-xl bg-background p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI Insights</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-xs text-primary mb-1">🏆 Biggest Win</div>
                    <div className="text-sm text-foreground">Shipped the new onboarding flow ahead of schedule</div>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="text-xs text-destructive mb-1">🚧 Main Blocker</div>
                    <div className="text-sm text-foreground">Too many meetings breaking deep work time</div>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <div className="text-xs text-accent mb-1">🎯 Next Week Focus</div>
                    <div className="text-sm text-foreground">Block 2-hour focus sessions every morning</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={1}
              className="screenshot-frame bg-card/80 p-1"
            >
              <div className="rounded-xl bg-background p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Goals & Progress</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: "Launch side project", reviews: 6, days: "12 days left" },
                    { title: "Read 2 books this month", reviews: 3, days: "18 days left" },
                    { title: "Improve sleep routine", reviews: 8, days: "Ongoing" },
                  ].map((g) => (
                    <div key={g.title} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">{g.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{g.days}</span>
                          <span className="flex items-center gap-1 text-primary">
                            <TrendingUp className="w-3 h-3" />
                            {g.reviews} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS / QUOTES ═══════════════ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[160px]" />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm text-primary font-medium uppercase tracking-widest mb-4 block">What People Say</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              Built for real people
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "WeekSense turned my chaotic weeks into something I can actually learn from. The patterns feature was a game-changer for me.",
                name: "Sarah K.",
                role: "Product Manager",
              },
              {
                quote: "I've tried journaling apps, habit trackers, even spreadsheets. This is the first thing that stuck because it's fast and genuinely useful.",
                name: "Marcus L.",
                role: "Software Engineer",
              },
              {
                quote: "The AI insights are surprisingly spot-on. It noticed I was burning out from context-switching before I did. Eye-opening.",
                name: "Elena R.",
                role: "Freelance Designer",
              },
              {
                quote: "I do it every Sunday evening. 10 minutes, and I start Monday with a clear head. It's become my favorite weekly ritual.",
                name: "David T.",
                role: "Founder & CEO",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i * 0.5}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-secondary-foreground leading-relaxed mb-4 text-sm">"{t.quote}"</p>
                <div>
                  <div className="text-foreground text-sm font-medium">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MOBILE APP TEASER ═══════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/5 blur-[180px]" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Phone mockup */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={scaleIn}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[260px] h-[520px] rounded-[40px] border-2 border-border/40 bg-card/60 backdrop-blur-xl p-3 relative overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-background rounded-b-2xl z-10" />
                  {/* Screen content */}
                  <div className="w-full h-full rounded-[32px] bg-background p-4 pt-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                      <WeekSenseLogo iconSize={16} showWordmark={false} />
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-0.5">Good evening</div>
                      <div className="font-serif text-lg text-foreground">Ready to reflect?</div>
                    </div>
                    <div className="glass-card p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-primary text-sm font-medium">8 week streak</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${i < 8 ? 'bg-primary' : 'bg-muted/30'}`} />
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium mb-3">
                      Start Review
                    </button>
                    <div className="glass-card p-3">
                      <div className="text-xs text-muted-foreground mb-2">This week's energy</div>
                      <div className="flex items-end gap-1 h-12">
                        {[5, 7, 6, 8, 7, 9, 8].map((v, i) => (
                          <div key={i} className="flex-1 rounded-t bg-primary/60" style={{ height: `${v * 10}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-12 top-16 glass-card px-3 py-2 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground whitespace-nowrap">iOS & Android</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-10 bottom-24 glass-card px-3 py-2 flex items-center gap-2"
                >
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground whitespace-nowrap">Smart reminders</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium mb-6">
                <Smartphone className="w-3.5 h-3.5" />
                Coming Soon
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-5 leading-tight">
                Reflect anywhere.
                <br />
                <span className="text-gradient-accent">On the go.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The WeekSense mobile app is coming soon to iOS and Android. Get push reminders, 
                reflect on your commute, and never miss a weekly review again.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Push notifications at your preferred time",
                  "Offline-first — reflect without WiFi",
                  "Quick-entry mode for busy weeks",
                  "All your data synced across devices",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-secondary-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button variant="outline" size="lg" className="border-accent/30 text-accent hover:bg-accent/10">
                  Join the waitlist
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="py-28 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/3 blur-[160px]" />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm text-primary font-medium uppercase tracking-widest mb-4 block">Pricing</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Start free. Grow when ready.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              No credit card required. No trial limits. Upgrade only when WeekSense becomes essential to your week.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={0}
              className="glass-card p-8"
            >
              <h3 className="font-serif text-2xl text-foreground mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect for trying it out</p>
              <div className="mb-8">
                <span className="font-serif text-5xl text-foreground">€0</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                {[
                  { text: "3 weekly reviews", included: true },
                  { text: "AI-powered insights", included: true },
                  { text: "Energy score tracking", included: true },
                  { text: "Basic dashboard", included: true },
                  { text: "Streak tracking", included: true },
                  { text: "Pattern recognition", included: false },
                  { text: "Goal tracking & progress", included: false },
                  { text: "Export & share reviews", included: false },
                  { text: "Review calendar heatmap", included: false },
                  { text: "Priority support", included: false },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-secondary-foreground" : "text-muted-foreground/50"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button variant="outline" className="w-full" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={1}
              className="pricing-card-featured p-8"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wide">
                Most Popular
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-1">Pro</h3>
              <p className="text-muted-foreground text-sm mb-6">For the intentional ones</p>
              <div className="mb-2">
                <span className="font-serif text-5xl text-foreground">€4,99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-xs text-primary mb-8">Less than a coffee per week ☕</p>
              <ul className="space-y-3.5 mb-8">
                {[
                  { text: "Unlimited weekly reviews", included: true },
                  { text: "AI-powered insights", included: true },
                  { text: "Energy score tracking", included: true },
                  { text: "Full dashboard & analytics", included: true },
                  { text: "Streak tracking", included: true },
                  { text: "Pattern recognition (AI)", included: true },
                  { text: "Goal tracking & progress", included: true },
                  { text: "Export & share reviews", included: true },
                  { text: "Review calendar heatmap", included: true },
                  { text: "Priority support", included: true },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-secondary-foreground">{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button className="w-full glow-primary" size="lg">
                  Start Pro
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-primary/5 blur-[180px]" />
        </div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center"
          >
            <h2 className="font-serif text-4xl md:text-6xl text-foreground mb-6 leading-tight">
              Your best weeks
              <br />
              <span className="text-gradient-primary">start with reflection.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of intentional people who start their week with clarity. 
              It takes 10 minutes. The insights last all week.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-10 py-7 rounded-xl glow-primary">
                Start your first review — free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-border/50 py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <WeekSenseLogo className="mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                WeekSense helps you make sense of your weeks through guided reflection, 
                AI-powered insights, and long-term pattern tracking.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><span className="text-muted-foreground/50">Mobile App (soon)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-4">Account</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/auth?mode=login" className="hover:text-foreground transition-colors">Log in</Link></li>
                <li><Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 WeekSense. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
