import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Review, User } from "@shared/schema";

interface TeacherReviewsProps {
  teacherId: string;
  currentUserId?: string;
}

export function TeacherReviews({ teacherId, currentUserId }: TeacherReviewsProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: [`/api/teachers/${teacherId}/reviews`],
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/teachers/${teacherId}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teachers/${teacherId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }); // To refresh teacher profile stats
      setRating(0);
      setComment("");
      toast({
        title: "Avis envoyé !",
        description: "Merci pour votre retour.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ rating, comment });
  };

  return (
    <div className="space-y-8">
      {/* Review Form (only if logged in and not the teacher) */}
      {currentUserId && (
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Laissez un avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hover || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground opacity-30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {rating > 0 ? `${rating} sur 5` : "Cliquez pour noter"}
                </span>
              </div>

              <Textarea
                placeholder="Partagez votre expérience avec ce professeur..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] bg-muted/30 focus:bg-background transition-colors"
              />

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={mutation.isPending || rating === 0}
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publier mon avis
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Avis des élèves ({reviews?.length || 0})
        </h3>
        
        {isLoading ? (
          <div className="flex py-12 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-card/50 backdrop-blur">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground opacity-30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      {format(new Date(review.createdAt!), "d MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-10" />
            <p className="text-muted-foreground italic">Aucun avis pour le moment. Soyez le premier !</p>
          </div>
        )}
      </div>
    </div>
  );
}
