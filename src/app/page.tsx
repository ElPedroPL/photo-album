import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { connectDB } from "@/app/lib/db";
import ImageModel from "@/app/models/image";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Witaj w Photo Album
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Przechowuj i organizuj swoje wspomnienia w jednym miejscu
          </p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Zaloguj się, aby rozpocząć
            </Link>
            <div className="text-sm text-gray-500">
              Nie masz konta? Skontaktuj się z administratorem
            </div>
          </div>
        </div>
      </div>
    );
  }

  await connectDB();

  const photos = await ImageModel.find({ userId: session.user.email }).sort({ year: -1, createdAt: -1 });

interface Photo {
  _id: string;
  imageUrl: string;
  dateTaken?: Date;
  year?: number;
  location?: {
    name?: string;
    lat?: number;
    lon?: number;
  };
}

  // Grupuj zdjęcia według roku
  const photosByYear = photos.reduce((acc: Record<number, Photo[]>, photo: Photo) => {
    const year = photo.year || new Date(photo.dateTaken || new Date()).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(photo);
    return acc;
  }, {} as Record<number, Photo[]>);

  // Grupuj zdjęcia według lokalizacji w ramach roku
  const organizePhotosByLocation = (photos: Photo[]) => {
    return photos.reduce((acc: Record<string, Photo[]>, photo: Photo) => {
      const location = photo.location?.name || "Nieznana lokalizacja";
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Twoja galeria zdjęć
        </h1>
        <p className="text-gray-600">
          Witaj, {session.user.name || session.user.email}!
        </p>
      </div>

      {!photos.length ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Twoja galeria jest pusta
          </h2>
          <p className="text-gray-600 mb-8">
            Dodaj swoje pierwsze zdjęcie, aby rozpocząć tworzenie albumu
          </p>
          <Link
            href="/upload"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Dodaj pierwsze zdjęcie
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.keys(photosByYear).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => {
            const yearPhotos = photosByYear[year];
            const photosByLocation = organizePhotosByLocation(yearPhotos);
            
            return (
              <div key={year} className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3">📅</span>
                    {year}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {yearPhotos.length} zdjęć w {Object.keys(photosByLocation).length} lokalizacjach
                  </p>
                </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Object.keys(photosByLocation).map((location) => {
                     const locationPhotos = photosByLocation[location];
                     const firstPhoto = locationPhotos[0];
                     
                     return (
                       <Link
                         key={location}
                         href={`/location/${year}/${encodeURIComponent(location)}`}
                         className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                       >
                         <div className="relative w-full h-48">
                           <Image
                             src={firstPhoto.imageUrl}
                             alt={location}
                             fill
                             className="object-cover group-hover:scale-105 transition-transform duration-300"
                           />
                           <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end group-hover:bg-opacity-50 transition-all">
                             <div className="p-4 text-white">
                               <h3 className="font-semibold text-lg">{location}</h3>
                               <p className="text-sm opacity-90">{locationPhotos.length} zdjęć</p>
                             </div>
                           </div>
                         </div>
                         <div className="p-4">
                           <div className="flex items-center justify-between">
                             <span className="text-sm text-gray-600">
                               📍 {location}
                             </span>
                             <span className="text-sm text-gray-500">
                               {locationPhotos.length} zdjęć
                             </span>
                           </div>
                         </div>
                       </Link>
                     );
                   })}
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 