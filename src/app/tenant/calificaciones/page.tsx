'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Star, Home, CalendarDays, User, MessageSquare } from 'lucide-react'
import { mockReservations, currentUser } from '@/lib/mock-data'

export default function RatingsPage() {
  const [selectedReservation, setSelectedReservation] = useState<typeof mockReservations[0] | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showRatingDialog, setShowRatingDialog] = useState(false)

  // Get completed reservations that can be rated
  const completedReservations = mockReservations.filter(r => r.reservationStatus === 'completed')

  // Mock ratings received
  const ratingsReceived = [
    {
      id: '1',
      score: 5,
      comment: 'Excelente inquilino, muy cuidadoso con la propiedad y respetuoso con los vecinos. Lo recomiendo.',
      reviewerName: 'María González',
      propertyTitle: 'Apartamento Moderno en Zona Rosa',
      createdAt: '2026-05-10'
    },
    {
      id: '2',
      score: 4,
      comment: 'Buen inquilino en general. Dejó todo en orden.',
      reviewerName: 'Carlos Mejía',
      propertyTitle: 'Casa de Playa en Costa del Sol',
      createdAt: '2026-04-20'
    }
  ]

  const handleSubmitRating = () => {
    // Here would go the API call
    console.log('Rating submitted:', { 
      reservationId: selectedReservation?.id, 
      score: rating, 
      comment 
    })
    setShowRatingDialog(false)
    setRating(0)
    setComment('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Calificaciones</h1>
        <p className="text-muted-foreground">Califica a los propietarios y ve las calificaciones que has recibido</p>
      </div>

      {/* My Rating Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-8 w-8 fill-primary text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{currentUser.averageRating}</p>
                <p className="text-sm text-muted-foreground">
                  Basado en {currentUser.totalRatings} calificaciones
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(currentUser.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Ratings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pendientes de Calificar</h2>
          {completedReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Star className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tienes calificaciones pendientes</p>
              </CardContent>
            </Card>
          ) : (
            completedReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{reservation.property.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Propietario: {reservation.property.landlordName}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(reservation.checkInDate).toLocaleDateString('es-ES')} - {new Date(reservation.checkOutDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedReservation(reservation)
                        setShowRatingDialog(true)
                      }}
                    >
                      <Star className="mr-1 h-4 w-4" /> Calificar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ratings Received */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Calificaciones Recibidas</h2>
          {ratingsReceived.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aún no has recibido calificaciones</p>
              </CardContent>
            </Card>
          ) : (
            ratingsReceived.map((ratingItem) => (
              <Card key={ratingItem.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{ratingItem.reviewerName}</h4>
                          <p className="text-xs text-muted-foreground">{ratingItem.propertyTitle}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= ratingItem.score
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {ratingItem.comment}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(ratingItem.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar Propietario</DialogTitle>
            <DialogDescription>
              {selectedReservation && (
                <>Califica tu experiencia en {selectedReservation.property.title}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedReservation.property.landlordName}</p>
                    <p className="text-sm text-muted-foreground">Propietario</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tu Calificación
                </Label>
                <div className="mt-2 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {rating === 1 && 'Muy malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </p>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Comentario (opcional)
                </Label>
                <Textarea
                  className="mt-1"
                  placeholder="Comparte tu experiencia con otros inquilinos..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancelar
            </Button>
            <Button disabled={rating === 0} onClick={handleSubmitRating}>
              Enviar Calificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
