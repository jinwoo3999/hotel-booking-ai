"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestPartnerForm() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    
    // Log form data
    console.log("Form data being sent:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch("/api/partner-application", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Response:", text);
      
      setResult({
        status: response.status,
        redirected: response.redirected,
        url: response.url,
        body: text.substring(0, 500)
      });
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">Test Partner Application Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label>Full Name *</Label>
          <Input name="fullName" defaultValue="Test User" required />
        </div>
        <div>
          <Label>Email *</Label>
          <Input name="email" type="email" defaultValue="test@example.com" required />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input name="phone" defaultValue="0123456789" required />
        </div>
        <div>
          <Label>Hotel Name *</Label>
          <Input name="hotelName" defaultValue="Test Hotel" required />
        </div>
        <div>
          <Label>City *</Label>
          <Input name="city" defaultValue="Hanoi" required />
        </div>
        <div>
          <Label>Address *</Label>
          <Input name="address" defaultValue="123 Test St" required />
        </div>
        
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Test"}
        </Button>
      </form>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
