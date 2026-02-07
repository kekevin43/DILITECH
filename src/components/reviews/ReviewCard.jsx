import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ReviewCard({ review }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{review.user_name || 'Anonymous'}</p>
              {review.verified_purchase && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(review.created_date), 'MMMM dd, yyyy')}
            </p>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Review Title */}
        {review.title && (
          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        )}
      </CardContent>
    </Card>
  );
}