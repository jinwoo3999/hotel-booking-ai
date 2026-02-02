"use client";

interface QuickActionCardProps {
  action: string;
  index: number;
}

export default function QuickActionCard({ action, index }: QuickActionCardProps) {
  const handleClick = () => {
    // Trigger chat widget với câu hỏi này
    const event = new CustomEvent('openChatWithMessage', { detail: action });
    window.dispatchEvent(event);
  };

  return (
    <div
      className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
          {index + 1}
        </div>
        <p className="text-sm text-gray-700 group-hover:text-indigo-700 transition-colors">
          {action}
        </p>
      </div>
    </div>
  );
}