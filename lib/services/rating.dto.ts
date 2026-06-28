export type CreateRatingRequest = {
  reservationId: string;
  score: number;
  comment?: string;
};