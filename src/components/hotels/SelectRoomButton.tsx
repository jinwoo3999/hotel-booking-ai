"use client";

import { Button } from "@/components/ui/button";

interface SelectRoomButtonProps {
  hotelId: string;
  roomId: string;
}

export function SelectRoomButton({ hotelId, roomId }: SelectRoomButtonProps) {
  const handleClick = () => {
    // Scroll to booking form
    const form = document.getElementById('booking-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight effect
      form.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all', 'duration-300');
      setTimeout(() => {
        form.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4');
      }, 2000);
    }
    
    // Update URL without reload
    window.history.pushState({}, '', `/hotels/${hotelId}?roomId=${roomId}`);
    
    // Trigger custom event to update form (optional)
    window.dispatchEvent(new CustomEvent('room-selected', { detail: { roomId } }));
  };

  return (
    <Button 
      variant="outline" 
      className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold"
      onClick={handleClick}
    >
      Chọn phòng này
    </Button>
  );
}
