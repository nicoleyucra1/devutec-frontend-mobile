// Celulares de Perú: 9 dígitos que empiezan con 9. Misma regla que el backend (PhoneNumbers.java) y la web,
// para avisar antes de mandar. Acepta "987 654 321", "987-654-321" o "+51 987654321".
export function normalizePhone(raw) {
  let digits = String(raw ?? '').replace(/[\s\-().]/g, '')
  if (digits.startsWith('+51')) digits = digits.slice(3)
  else if (digits.startsWith('0051')) digits = digits.slice(4)
  else if (digits.startsWith('51') && digits.length === 11) digits = digits.slice(2)
  return /^9\d{8}$/.test(digits) ? digits : null
}

// "987654321" → "987 654 321"
export function formatPhone(phone) {
  return phone ? phone.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : ''
}

// Link de WhatsApp con el código de Perú y un mensaje ya escrito
export function whatsappLink(phone, message) {
  return `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`
}
