import React, { useState } from "react"
import { Search, MapPin, GraduationCap, Wallet } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useLocation } from "wouter"

export function HeroSearch() {
  const [, setLocation] = useLocation();
  const [kota, setKota] = useState("");
  const [univ, setUniversitas] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (kota) params.append("kota", kota);
    if (univ) params.append("universitas", univ);
    if (budget) params.append("budget_max", budget);
    
    // For this simple app, we can just update the URL with search params
    // and let the Home page read them. Or we could pass it to a callback.
    // Let's use URL parameters so it's shareable.
    const searchString = params.toString();
    setLocation(`/?${searchString}`);
    
    // Also scroll down to results smoothly
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-card/95 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-full shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <Input 
            type="text" 
            placeholder="Pilih kota..." 
            className="pl-11 h-14 bg-transparent border-transparent hover:bg-muted/50 focus-visible:bg-transparent text-base rounded-xl md:rounded-full"
            value={kota}
            onChange={(e) => setKota(e.target.value)}
          />
        </div>

        <div className="hidden md:block w-px h-8 bg-border self-center" />

        <div className="flex-1 relative group border-t border-border md:border-0 pt-3 md:pt-0">
          <div className="absolute inset-y-0 top-3 md:top-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <Input 
            type="text" 
            placeholder="Dekat kampus mana?" 
            className="pl-11 h-14 bg-transparent border-transparent hover:bg-muted/50 focus-visible:bg-transparent text-base rounded-xl md:rounded-full"
            value={univ}
            onChange={(e) => setUniversitas(e.target.value)}
          />
        </div>

        <div className="hidden md:block w-px h-8 bg-border self-center" />

        <div className="flex-1 relative group border-t border-border md:border-0 pt-3 md:pt-0">
          <div className="absolute inset-y-0 top-3 md:top-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Wallet className="w-5 h-5" />
          </div>
          <Input 
            type="number" 
            placeholder="Budget maksimal" 
            className="pl-11 h-14 bg-transparent border-transparent hover:bg-muted/50 focus-visible:bg-transparent text-base rounded-xl md:rounded-full"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" className="h-14 rounded-xl md:rounded-full px-8 text-base font-bold w-full md:w-auto mt-2 md:mt-0">
          <Search className="w-5 h-5 mr-2" />
          Cari Kos
        </Button>
      </form>
    </div>
  )
}
