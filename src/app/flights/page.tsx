import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bookFlight } from "@/lib/actions";
import { Plane, ArrowRight } from "lucide-react";

export default async function FlightsPage() {
  const session = await auth();
  const flights = await prisma.flight.findMany({ orderBy: { departureTime: 'asc' } });

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSiteHeader session={session as any} className="bg-white border-b" />
      <main className="container mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plane/> Vé máy bay giá rẻ</h1>
        <div className="grid gap-4">
            {flights.map((f) => (
                <Card key={f.id} className="hover:shadow-md transition">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg text-indigo-700">{f.airline}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{f.flightNumber}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span>{f.fromCity}</span>
                                <span className="text-gray-400">---&gt;</span>
                                <span>{f.toCity}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Giờ đi: {f.departureTime.toLocaleTimeString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-red-600">{f.price.toLocaleString()}đ</p>
                            <form action={bookFlight}>
                                <input type="hidden" name="flightId" value={f.id} />
                                <Button size="sm" className="mt-2 font-bold bg-indigo-600">Đặt ngay <ArrowRight className="w-4 h-4 ml-1"/></Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}