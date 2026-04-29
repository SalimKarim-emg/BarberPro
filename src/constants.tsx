/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scissors, Zap, User, Star, Crown, Baby } from 'lucide-react';
import { Service, Barber } from './types';

export const SERVICES: Service[] = [
  { id: "classic", label: "Classic Cut", price: 25, duration: 45, icon: "Scissors", desc: "Timeless style for all hair types" },
  { id: "fade", label: "Skin Fade", price: 30, duration: 50, icon: "Zap", desc: "Ultra clean, modern fade" },
  { id: "beard", label: "Beard Trim", price: 20, duration: 30, icon: "User", desc: "Shape up your facial hair" },
  { id: "buzz", label: "Buzz Cut", price: 18, duration: 25, icon: "Zap", desc: "Low maintenance, high style" },
  { id: "combo", label: "Cut + Beard", price: 45, duration: 75, icon: "Crown", desc: "Full grooming package" },
  { id: "kids", label: "Kids Cut", price: 15, duration: 30, icon: "Baby", desc: "Gentle cuts for children" },
];

export const BARBERS: Barber[] = [
  { id: "marcus", name: "Marcus", specialty: "Fades & Modern", avatar: "M", color: "#c0392b" },
  { id: "tony", name: "Tony", specialty: "Classic Cuts", avatar: "T", color: "#2c3e50" },
  { id: "jay", name: "Jay", specialty: "Beards & Lineups", avatar: "J", color: "#8e44ad" },
];

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export const getServiceIcon = (iconName: string) => {
  switch (iconName) {
    case 'Scissors': return <Scissors className="w-6 h-6" />;
    case 'Zap': return <Zap className="w-6 h-6" />;
    case 'User': return <User className="w-6 h-6" />;
    case 'Crown': return <Crown className="w-6 h-6" />;
    case 'Baby': return <Baby className="w-6 h-6" />;
    default: return <Star className="w-6 h-6" />;
  }
};
