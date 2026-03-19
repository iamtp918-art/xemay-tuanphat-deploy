import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export function MapView({
  className,
  initialCenter = { lat: 10.7167, lng: 106.8333 },
  initialZoom = 15,
}: MapViewProps) {
  const src = `https://maps.google.com/maps?q=${initialCenter.lat},${initialCenter.lng}&z=${initialZoom}&output=embed`;

  return (
    <div className={cn("w-full h-[400px] relative", className)}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ban do Xe May Tuan Phat"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
