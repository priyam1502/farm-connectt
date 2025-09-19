import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ProductRatingProps {
  produceId: string;
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  canRate: boolean;
  onRatingSubmitted: () => void;
}

const ProductRating = ({ 
  produceId, 
  ratings, 
  averageRating, 
  totalRatings, 
  canRate,
  onRatingSubmitted 
}: ProductRatingProps) => {
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (!user || newRating === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          produce_id: produceId,
          rating: newRating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Rating submitted!",
        description: "Thank you for your feedback."
      });

      setNewRating(0);
      setComment("");
      onRatingSubmitted();
    } catch (error) {
      toast({
        title: "Error submitting rating",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            Rating & Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Rating (for authenticated buyers) */}
      {canRate && user && (
        <Card>
          <CardHeader>
            <CardTitle>Rate this product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Click to rate this product
              </p>
            </div>

            <div>
              <Textarea
                placeholder="Write your review (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitRating}
              disabled={newRating === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{rating.profiles.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-muted-foreground">{rating.comment}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductRating;