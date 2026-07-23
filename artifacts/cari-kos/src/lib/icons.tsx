import React from 'react';
import { 
  Wifi, 
  Wind, 
  Car, 
  Tv, 
  Coffee, 
  BedDouble, 
  Bath, 
  ShieldCheck,
  WashingMachine,
  Check
} from 'lucide-react';

export function getIcon(iconName: string) {
  const icons: Record<string, React.ElementType> = {
    wifi: Wifi,
    ac: Wind,
    parkir: Car,
    tv: Tv,
    dapur: Coffee,
    kasur: BedDouble,
    kamar_mandi: Bath,
    keamanan: ShieldCheck,
    laundry: WashingMachine
  };
  
  const Icon = icons[iconName.toLowerCase()] || Check;
  return <Icon className="w-3.5 h-3.5" />;
}
