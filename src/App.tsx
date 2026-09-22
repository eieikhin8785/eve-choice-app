import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BedDouble, Bell, Building2, CalendarDays, Check, ChevronDown, Compass, Heart,
  Home, House, Landmark, MapPin, Menu, MessageCircle, Moon, Plus, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Star, Sun, Trees, UserRound, X, Zap,
} from "lucide-react";

type Listing = {
  id: string; title: string; mode: "SALE" | "RENT"; price: number; location: string; category: string;
  image: string; beds?: number; baths?: number; area: number; description: string; tags: string[]; featured?: boolean;
};

const images = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
];

const demoListings: Listing[] = [
  { id: "1", title: "Sunlit 3BR residence near Inya Lake", mode: "SALE", price: 520000000, location: "Hlaing, Yangon", category: "House", image: images[0], beds: 3, baths: 3, area: 2150, description: "A calm, generous family home with leafy views, generous entertaining space, and a quick drive to the city’s best schools.", tags: ["Car parking", "Garden", "Quiet street"], featured: true },
  { id: "2", title: "Modern serviced apartment in Bahan", mode: "RENT", price: 2800000, location: "Bahan, Yangon", category: "Apartment / Condo", image: images[1], beds: 2, baths: 2, area: 1250, description: "Move-in ready apartment with an airy living room, concierge service, and easy access to cafés and hospitals.", tags: ["Furnished", "Elevator", "Security"] },
  { id: "3", title: "Quiet corner land in Dagon", mode: "SALE", price: 780000000, location: "Dagon, Yangon", category: "Land", image: images[2], area: 4800, description: "A rare residential plot in a peaceful, established neighborhood with a wide road frontage.", tags: ["Main road", "Corner plot", "Freehold"], featured: true },
  { id: "4", title: "Renovated townhouse with garden", mode: "SALE", price: 385000000, location: "Insein, Yangon", category: "House", image: images[3], beds: 4, baths: 3, area: 1800, description: "Thoughtfully refreshed townhouse with a private garden, natural light, and room for a growing family.", tags: ["Garden", "Part furnished", "Water supply"] },
  { id: "5", title: "Golden Valley executive rental", mode: "RENT", price: 4500000, location: "Mayangone, Yangon", category: "Apartment / Condo", image: images[4], beds: 3, baths: 3, area: 1750, description: "An elegant, fully furnished home for long-stay professionals, with parking and dependable power.", tags: ["Furnished", "Generator", "Parking"], featured: true },
  { id: "6", title: "Mandalay central family home", mode: "SALE", price: 295000000, location: "Maha Aung Myay, Mandalay", category: "House", image: images[5], beds: 4, baths: 3, area: 2400, description: "Spacious home close to central Mandalay amenities, with a flexible layout and excellent neighborhood access.", tags: ["Family home", "Wide road", "Quiet street"] },
  { id: "7", title: "Small office near 78th Street", mode: "RENT", price: 1800000, location: "Chanmyathazi, Mandalay", category: "Commercial Property", image: images[2], baths: 1, area: 950, description: "Bright, practical office floor for a small team, close to transport and everyday services.", tags: ["Office", "Main road", "Parking"] },
  { id: "8", title: "Bright studio for a city commute", mode: "RENT", price: 950000, location: "Dagon, Yangon", category: "Room", image: images[1], beds: 1, baths: 1, area: 540, description: "A compact and welcoming studio with a smart layout for simple city living.", tags: ["Furnished", "Water supply", "Near transport"] },
];

const categories = [
  { name: "Houses", icon: House, count: "1,248 homes", color: "sage" },
  { name: "Apartments", icon: Building2, count: "856 listings", color: "peach" },
  { name: "Land", icon: Trees, count: "634 plots", color: "blue" },
  { name: "Commercial", icon: Landmark, count: "219 spaces", color: "yellow" },
];

const money = (value: number, mode: string) => `${new Intl.NumberFormat("en-US").format(value)} MMK${mode === "RENT" ? " / month" : ""}`;

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const savedTheme = window.localStorage.getItem("eve-choice-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mode, setMode] = useState<"BUY" | "RENT">("BUY");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All locations");
  const [category, setCategory] = useState("All property types");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [saved, setSaved] = useState<string[]>(["5"]);
  const [view, setView] = useState<"explore" | "manage">("explore");
  const [showLogin, setShowLogin] = useState(false);
  const [notice, setNotice] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("eve-choice-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("http://localhost:4000/api/v1/health").then((response) => setApiOnline(response.ok)).catch(() => setApiOnline(false));
  }, []);

  const filtered = useMemo(() => demoListings.filter((listing) => {
    const matchesMode = mode === "BUY" ? listing.mode === "SALE" : listing.mode === "RENT";
    const matchesQuery = !query || `${listing.title} ${listing.location} ${listing.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCity = city === "All locations" || listing.location.includes(city);
    const matchesCategory = category === "All property types" || listing.category === category;
    return matchesMode && matchesQuery && matchesCity && matchesCategory;
  }), [mode, query, city, category]);

  const toggleSave = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => { setView("explore"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Eve Choice home">
            <span className="brand-mark"><Compass size={20} strokeWidth={2.5} /></span><span>eve<span className="brand-dot"> choice</span></span>
          </button>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <button className={view === "explore" ? "nav-link active" : "nav-link"} onClick={() => setView("explore")}>Explore</button>
            <button className="nav-link" onClick={() => flash("Neighborhood guides are coming soon.")}>Neighborhoods</button>
            <button className="nav-link" onClick={() => flash("Our trusted partner network is growing.")}>For agents</button>
          </nav>
          <div className="header-actions">
            <button className="icon-button notification" onClick={() => flash("You have 1 new property match.")} aria-label="Notifications"><Bell size={19} /><span /></button>
            <button className="theme-toggle" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="outline-button sell-button" onClick={() => setView("manage")}><Plus size={17} /> List a property</button>
            <button className="avatar-button" onClick={() => setShowLogin(true)} aria-label="Open account"><span>ML</span><ChevronDown size={14} /></button>
            <button className="mobile-menu" aria-label="Open menu" onClick={() => flash("Menu navigation is available on desktop.")}><Menu size={22} /></button>
          </div>
        </div>
      </header>

      {view === "explore" ? <>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> FIND YOUR NEXT CHAPTER</div>
            <h1>Space to live.<br /><em>Room to grow.</em></h1>
            <p>Thoughtfully curated properties across Yangon and Mandalay, for the way life moves now.</p>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-card"><span className="hero-card-label">Live beautifully</span><span className="hero-card-line" /></div></div>
        </section>

        <main>
          <section className="search-panel" aria-label="Property search">
            <div className="mode-tabs"><button className={mode === "BUY" ? "mode-tab active" : "mode-tab"} onClick={() => setMode("BUY")}>Buy</button><button className={mode === "RENT" ? "mode-tab active" : "mode-tab"} onClick={() => setMode("RENT")}>Rent</button></div>
            <div className="search-fields">
              <label className="search-field search-main"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by area, landmark or property name" /></label>
              <label className="search-field"><MapPin size={17} /><select value={city} onChange={(event) => setCity(event.target.value)}><option>All locations</option><option>Yangon</option><option>Mandalay</option></select><ChevronDown size={15} /></label>
              <label className="search-field"><Home size={17} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All property types</option><option>House</option><option>Apartment / Condo</option><option>Land</option><option>Room</option><option>Commercial Property</option></select><ChevronDown size={15} /></label>
              <button className="primary-button search-button" onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}><Search size={17} /> Search</button>
            </div>
            <div className="search-foot"><button className="filter-trigger" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={15} /> More filters {showFilters ? <X size={14} /> : <span className="filter-count">3</span>}</button><span className="search-hint">Try “Bahan apartment” or “land near 78th street”</span></div>
            {showFilters && <div className="advanced-filters"><span>Budget</span><button onClick={() => flash("Budget filter ready for your next search.")}>Any price <ChevronDown size={14} /></button><span>Bedrooms</span><button onClick={() => flash("Bedroom filter ready for your next search.")}>Any number <ChevronDown size={14} /></button><span>Availability</span><button onClick={() => flash("Showing currently available properties.")}>Available now <ChevronDown size={14} /></button></div>}
          </section>

          <section className="section-block category-section"><div className="section-heading"><div><p className="section-kicker">BROWSE BY LIFESTYLE</p><h2>Start with what feels right</h2></div><button className="text-link" onClick={() => setCategory("All property types")}>View all <ArrowRight size={16} /></button></div><div className="category-grid">{categories.map(({ name, icon: Icon, count, color }) => <button className={`category-card ${color}`} key={name} onClick={() => setCategory(name === "Houses" ? "House" : name === "Apartments" ? "Apartment / Condo" : name === "Commercial" ? "Commercial Property" : name)}><span className="category-icon"><Icon size={23} /></span><span className="category-name">{name}</span><span className="category-count">{count}</span><ArrowRight size={16} className="category-arrow" /></button>)}</div></section>

          <section className="section-block listings-section" id="results"><div className="section-heading"><div><p className="section-kicker">CURATED FOR YOU</p><h2>{mode === "BUY" ? "Places worth coming home to" : "A better way to rent"}</h2><p className="section-subtitle">{filtered.length} thoughtfully selected {mode === "BUY" ? "properties for sale" : "rental homes"}</p></div><button className="text-link" onClick={() => { setQuery(""); setCity("All locations"); setCategory("All property types"); }}>Clear filters <X size={15} /></button></div><div className="listing-grid">{filtered.length ? filtered.map((listing) => <ListingCard key={listing.id} listing={listing} saved={saved.includes(listing.id)} onSave={() => toggleSave(listing.id)} onOpen={() => setSelected(listing)} />) : <div className="empty-state"><Search size={28} /><h3>No places found yet</h3><p>Try a different neighborhood or property type.</p><button className="outline-button" onClick={() => { setQuery(""); setCity("All locations"); setCategory("All property types"); }}>Reset search</button></div>}</div><div className="load-more"><button className="outline-button" onClick={() => flash("You are all caught up with the current collection.")}>Browse all listings <ArrowRight size={16} /></button></div></section>

          <section className="trust-section"><div className="trust-copy"><p className="section-kicker">A LITTLE MORE CERTAINTY</p><h2>Property search,<br /><em>with good people in it.</em></h2><p>Every listing is reviewed by our team before it goes live. Every conversation starts with a real person. It’s a quieter, more considered way to find your place.</p><button className="dark-button" onClick={() => flash("Our review process is designed around clarity and care.")}>How Eve Choice works <ArrowRight size={16} /></button></div><div className="trust-visual"><div className="trust-stamp"><ShieldCheck size={22} /><span>REVIEWED<br /><small>WITH CARE</small></span></div><div className="trust-stat"><strong>98%</strong><span>of listings verified<br />by our team</span></div></div></section>
        </main>
      </> : <ManageView onBack={() => setView("explore")} onLogin={() => setShowLogin(true)} />}

      <footer className="footer"><div className="footer-brand"><span className="brand-mark"><Compass size={17} /></span><span>eve choice</span></div><span>Property search, with room to breathe.</span><div className="footer-right"><span className={apiOnline ? "api-status online" : "api-status"}><span /> {apiOnline ? "Live API connected" : "Demo mode"}</span><span>Yangon · Mandalay · Myanmar</span></div></footer>
      {notice && <div className="toast"><Check size={17} /> {notice}</div>}
      {selected && <ListingModal listing={selected} saved={saved.includes(selected.id)} onSave={() => toggleSave(selected.id)} onClose={() => setSelected(null)} onAction={() => { setSelected(null); setShowLogin(true); }} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); flash("Welcome back to Eve Choice."); }} />}
    </div>
  );
}

function ListingCard({ listing, saved, onSave, onOpen }: { listing: Listing; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="listing-card"><button className="card-image-wrap" onClick={onOpen}><img src={listing.image} alt={listing.title} /><span className="listing-mode">{listing.mode === "SALE" ? "For sale" : "For rent"}</span>{listing.featured && <span className="featured-label"><Sparkles size={12} /> Featured</span>}<span className="image-shade" /></button><button className={saved ? "save-button saved" : "save-button"} onClick={onSave} aria-label={saved ? "Remove from saved" : "Save listing"}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><div className="card-body"><button className="card-title" onClick={onOpen}>{listing.title}</button><div className="card-location"><MapPin size={14} /> {listing.location}</div><div className="card-details"><span>{money(listing.price, listing.mode)}</span><span className="detail-separator">·</span><span>{listing.area.toLocaleString()} sqft</span>{listing.beds ? <><span className="detail-separator">·</span><span>{listing.beds} bed</span></> : null}</div><div className="card-tags">{listing.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>;
}

function ListingModal({ listing, saved, onSave, onClose, onAction }: { listing: Listing; saved: boolean; onSave: () => void; onClose: () => void; onAction: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="detail-modal"><button className="modal-close" onClick={onClose}><X size={19} /></button><img className="detail-image" src={listing.image} alt={listing.title} /><div className="detail-content"><div className="detail-topline"><span className="listing-mode static">{listing.mode === "SALE" ? "For sale" : "For rent"}</span><button className={saved ? "save-button saved" : "save-button"} onClick={onSave}><Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button></div><h2>{listing.title}</h2><div className="card-location"><MapPin size={15} /> {listing.location}</div><strong className="detail-price">{money(listing.price, listing.mode)}</strong><div className="detail-specs"><span><BedDouble size={18} /> {listing.beds ?? "—"} beds</span><span><House size={18} /> {listing.baths ?? "—"} baths</span><span><Building2 size={18} /> {listing.area.toLocaleString()} sqft</span></div><p>{listing.description}</p><div className="card-tags">{listing.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="primary-button full-button" onClick={onAction}><MessageCircle size={17} /> Ask about this property</button><button className="outline-button full-button" onClick={onAction}><CalendarDays size={17} /> Request a viewing</button></div></div></div>;
}

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="login-modal"><button className="modal-close" onClick={onClose}><X size={19} /></button><span className="login-icon"><Compass size={21} /></span><p className="section-kicker">WELCOME BACK</p><h2>Make yourself at home.</h2><p className="login-copy">Save places, ask questions, and keep your search moving.</p><label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" /></label><label>Password<input placeholder="••••••••" type="password" /></label><button className="primary-button full-button" onClick={onSuccess}>Continue <ArrowRight size={16} /></button><p className="login-foot">New to Eve Choice? <button onClick={onSuccess}>Create an account</button></p></div></div>;
}

function ManageView({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  return <main className="manage-page"><button className="back-link" onClick={onBack}>← Back to explore</button><div className="manage-head"><div><p className="section-kicker">OWNER & AGENT SPACE</p><h1>Bring a good place<br /><em>to good people.</em></h1><p>Share a property with a thoughtful audience of buyers and renters across Myanmar.</p></div><span className="manage-badge"><ShieldCheck size={18} /> Staff reviewed</span></div><div className="manage-grid"><div className="manage-card primary-manage"><span className="manage-card-icon"><Plus size={21} /></span><h3>List a property</h3><p>Start with the essentials. Add photos, details, and a location when you’re ready.</p><button className="dark-button" onClick={onLogin}>Sign in to begin <ArrowRight size={16} /></button></div><div className="manage-card"><span className="manage-card-icon"><MessageCircle size={21} /></span><h3>Manage your leads</h3><p>Keep conversations and viewing requests in one calm, clear place.</p><button className="text-link" onClick={onLogin}>Open owner dashboard <ArrowRight size={16} /></button></div><div className="manage-card"><span className="manage-card-icon"><Star size={21} /></span><h3>Why Eve Choice?</h3><p>Listings are reviewed before publishing, so your property meets people who are genuinely looking.</p><button className="text-link" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Learn about our approach <ArrowRight size={16} /></button></div></div></main>;
}

export default App;

