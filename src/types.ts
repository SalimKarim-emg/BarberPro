/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  label: string;
  price: number;
  duration: number;
  icon: string;
  desc: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  color: string;
}

export interface Appointment {
  id: number;
  name: string;
  phone: string;
  serviceId: string;
  barberId: string | null;
  date: string;
  time: string;
  createdAt: string;
}
