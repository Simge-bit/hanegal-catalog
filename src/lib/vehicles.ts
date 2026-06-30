const VEHICLES = [
  { brand: 'Dacia', model: 'Logan', sizes: [13, 14, 15] },
  { brand: 'Dacia', model: 'Sandero', sizes: [13, 14, 15] },
  { brand: 'Dacia', model: 'Duster', sizes: [15, 16] },
  { brand: 'Fiat', model: 'Punto', sizes: [13, 14] },
  { brand: 'Fiat', model: 'Egea / Tipo', sizes: [14, 15, 16] },
  { brand: 'Ford', model: 'Fiesta', sizes: [13, 14, 15] },
  { brand: 'Ford', model: 'Focus', sizes: [14, 15, 16] },
  { brand: 'Honda', model: 'Civic', sizes: [14, 15, 16] },
  { brand: 'Hyundai', model: 'i10', sizes: [13, 14] },
  { brand: 'Hyundai', model: 'i20', sizes: [13, 14, 15] },
  { brand: 'Hyundai', model: 'i30', sizes: [15, 16] },
  { brand: 'Kia', model: 'Rio', sizes: [13, 14, 15] },
  { brand: 'Kia', model: 'Ceed', sizes: [15, 16] },
  { brand: 'Opel', model: 'Corsa', sizes: [13, 14, 15] },
  { brand: 'Opel', model: 'Astra', sizes: [14, 15, 16] },
  { brand: 'Peugeot', model: '206 / 207', sizes: [13, 14, 15] },
  { brand: 'Peugeot', model: '208', sizes: [14, 15, 16] },
  { brand: 'Peugeot', model: '308', sizes: [15, 16] },
  { brand: 'Renault', model: 'Clio', sizes: [13, 14, 15] },
  { brand: 'Renault', model: 'Megane', sizes: [14, 15, 16] },
  { brand: 'Renault', model: 'Symbol / Thalia', sizes: [13, 14, 15] },
  { brand: 'Seat', model: 'Ibiza', sizes: [13, 14, 15] },
  { brand: 'Seat', model: 'Leon', sizes: [14, 15, 16] },
  { brand: 'Skoda', model: 'Fabia', sizes: [13, 14, 15] },
  { brand: 'Skoda', model: 'Octavia', sizes: [15, 16] },
  { brand: 'Toyota', model: 'Yaris', sizes: [13, 14, 15] },
  { brand: 'Toyota', model: 'Corolla', sizes: [14, 15, 16] },
  { brand: 'Toyota', model: 'Auris', sizes: [15, 16] },
  { brand: 'Volkswagen', model: 'Polo', sizes: [13, 14, 15] },
  { brand: 'Volkswagen', model: 'Golf', sizes: [14, 15, 16] },
  { brand: 'Volkswagen', model: 'Passat', sizes: [15, 16] },
]

export function getCompatibleCars(sizeInch: number): string {
  return VEHICLES
    .filter(v => v.sizes.includes(sizeInch))
    .map(v => `${v.brand} ${v.model}`)
    .join(', ')
}

export function buildWhatsAppMessage(
  modelCode: string,
  sizeInch: number,
  colorLabel: string,
  lang: 'tr' | 'en'
): string {
  if (lang === 'tr') {
    return `Merhaba, ${modelCode} model ${sizeInch} inç ${colorLabel} jant kapağı hakkında bilgi almak istiyorum.`
  }

  return `Hello, I would like to get information about the ${modelCode} ${sizeInch} inch ${colorLabel} wheel cover.`
}