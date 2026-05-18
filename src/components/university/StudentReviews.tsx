import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Sarah J.",
    classYear: "CLASS OF 22",
    rating: 5,
    text: "\"The entrepreneurial spirit here is unmatched. You're not just learning theory; you're building the future alongside professors who have actually shaped the tech world. The weather doesn't hurt either!\"",
    avatar: "S",
    avatarBg: "bg-amber-100 text-amber-700",
  },
  {
    name: "Michael T.",
    classYear: "CLASS OF 23",
    rating: 4,
    text: "\"The CS program is incredibly rigorous but equally rewarding. The connections you make here — both with faculty and fellow students — are invaluable. Silicon Valley is literally in your backyard.\"",
    avatar: "M",
    avatarBg: "bg-blue-100 text-blue-700",
  },
  {
    name: "Priya K.",
    classYear: "CLASS OF 24",
    rating: 5,
    text: "\"Best decision of my life. The interdisciplinary approach lets you combine CS with virtually anything — I combined it with biomedical research and landed my dream internship by sophomore year.\"",
    avatar: "P",
    avatarBg: "bg-green-100 text-green-700",
  },
];

export default function StudentReviews() {
  return (
    <div className="py-10 border-t border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Student Reviews</h2>
      <div className="flex items-center gap-2 mb-8">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <span className="font-bold text-gray-900">4.8</span>
        <span className="text-sm text-blue-600 underline cursor-pointer">(1,240 reviews)</span>
      </div>

      <div className="space-y-6">
        {reviews.map((review, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${review.avatarBg} flex items-center justify-center font-bold text-sm`}>
                {review.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{review.name} <span className="text-xs text-gray-400 font-normal ml-1">{review.classYear}</span></p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
