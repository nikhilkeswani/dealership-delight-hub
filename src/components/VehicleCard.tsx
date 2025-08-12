import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export interface VehicleData {
  id: string;
  title: string;
  price: string;
  condition: string;
  description: string;
  features: string[];
  images: string[];
}

const VehicleCard = ({ vehicle }: { vehicle: VehicleData }) => {
  return (
    <article className="group" itemScope itemType="https://schema.org/Product">
      <Card className="overflow-hidden border-muted/50">
        <div className="relative">
          <Carousel className="">
            <CarouselContent>
              {vehicle.images.map((src, idx) => (
                <CarouselItem key={idx}>
                  <img
                    itemProp="image"
                    src={src}
                    alt={`${vehicle.title} photo ${idx + 1}`}
                    className="w-full h-56 md:h-64 object-cover"
                    loading="lazy"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold" itemProp="name">{vehicle.title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium text-foreground" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="USD" />
              <span itemProp="price">{vehicle.price}</span>
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5">{vehicle.condition}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2" itemProp="description">
            {vehicle.description}
          </p>
          <ul className="flex flex-wrap gap-2 mt-2" aria-label="Key features">
            {vehicle.features.slice(0, 4).map((f) => (
              <li key={f} className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </article>
  );
};

export default VehicleCard;
