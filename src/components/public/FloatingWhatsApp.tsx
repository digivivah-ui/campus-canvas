import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const { getSetting } = useSiteSettings();
  const number = getSetting('whatsapp_number');
  const message = getSetting('whatsapp_message', 'Hello! I would like to know more about the college.');

  if (!number) return null;

  const cleanNumber = number.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg animate-bounce-subtle"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
