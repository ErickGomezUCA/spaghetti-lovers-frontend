'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Star, Home, CalendarDays, User, MessageSquare, ThumbsUp, Search } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { ratingService } from '@/lib/services/rating.service'
import { reservationService } from '@/lib/services/reservation.service'
import { UserRatingsResponse, ReservationResponse, RatingResponse } from '@/types/api-responses'
import { ApiError } from '@/lib/exceptions/api-exceptions'

export default function RatingsPage() {
  const { user } = useAuth()

  const [ratingsData, setRatingsData] = useState<UserRatingsResponse | null>(null)
  const [completedReservations, setCompletedReservations] = useState<ReservationResponse[]>([])
  const [ratingsGiven, setRatingsGiven] = useState<RatingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'received' | 'given' | 'pending'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [ratingsRes, reservationsRes, givenRes] = await Promise.all([
        ratingService.getByUser(user.id),
        reservationService.getMyReservations(0, 100, undefined, undefined, 'COMPLETED'),
        ratingService.getGivenByUser(user.id),
      ])
      setRatingsData(ratingsRes.data)
      setCompletedReservations(reservationsRes.data ?? [])
      setRatingsGiven(givenRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const pendingReservations = completedReservations.filter(
    (r) => !ratingsGiven.some((rg) => rg.reservationId === r.id)
  )

  const handleSubmitRating = async () => {
    if (!selectedReservation || rating === 0) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await ratingService.create({
        reservationId: selectedReservation.id,
        score: rating,
        comment: comment || undefined,
      })
      setShowRatingDialog(false)
      setRating(0)
      setComment('')
      await fetchData()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'No se pudo enviar la calificación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const averageScore = ratingsData?.averageScore ?? 0
  const totalRatings = ratingsData?.totalRatings ?? 0
  const ratingsReceived = ratingsData?.ratings ?? []

  const filteredReceived = ratingsReceived.filter((r) =>
    r.reservationId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGiven = ratingsGiven.filter((r) =>
    r.reservationId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (score: number, size = 'h-4 w-4') => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= score ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Calificaciones</h1>
        <p className="text-muted-foreground">Califica a los propietarios y ve las calificaciones que has recibido</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <p className="text-3xl font-semibold">{isLoading ? '—' : averageScore.toFixed(1)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Tu calificación promedio</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">{isLoading ? '—' : ratingsReceived.length}</p>
            <p className="text-sm text-muted-foreground">Calificaciones recibidas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{isLoading ? '—' : ratingsGiven.length}</p>
            <p className="text-sm text-muted-foreground">Calificaciones dadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-orange-600">{isLoading ? '—' : pendingReservations.length}</p>
            <p className="text-sm text-muted-foreground">Pendientes por calificar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'received' ? 'default' : 'outline'} onClick={() => setActiveTab('received')}>
          Recibidas ({ratingsReceived.length})
        </Button>
        <Button variant={activeTab === 'given' ? 'default' : 'outline'} onClick={() => setActiveTab('given')}>
          Dadas ({ratingsGiven.length})
        </Button>
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
          className={pendingReservations.length > 0 ? 'relative' : ''}
        >
          Pendientes
          {pendingReservations.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingReservations.length}
            </span>
          )}
        </Button>
      </div>

      {/*Buscador*/}
      {activeTab !== 'pending' && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2
                w-4 h-4 text-muted-foreground"
              />

              <Input
                placeholder="Buscar por reserva..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Recibidas */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando...</CardContent></Card>
          ) : ratingsReceived.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aún no has recibido calificaciones</p>
              </CardContent>
            </Card>
          ) : (
            ratingsReceived.map((ratingItem) => (
              <Card key={ratingItem.id} className="border-t-4 border-t-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reserva: {ratingItem.reservationId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(ratingItem.score)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ratingItem.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  {ratingItem.comment && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm italic">&quot;{ratingItem.comment}&quot;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Dadas */}
      {activeTab === 'given' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando...</CardContent></Card>
          ) : ratingsGiven.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Star className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aún no has dado calificaciones</p>
              </CardContent>
            </Card>
          ) : (
            ratingsGiven.map((ratingItem) => (
              <Card key={ratingItem.id} className="border-t-4 border-t-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reserva: {ratingItem.reservationId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ratingItem.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(ratingItem.score)}
                    </div>
                  </div>
                  {ratingItem.comment && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm italic">&quot;{ratingItem.comment}&quot;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Pendientes */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando...</CardContent></Card>
          ) : pendingReservations.length === 0 ? (
            <Card className="border-t-4 border-t-primary">
              <CardContent className="p-8 text-center">
                <ThumbsUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">¡Estás al día!</h3>
                <p className="text-muted-foreground">No tienes calificaciones pendientes.</p>
              </CardContent>
            </Card>
          ) : (
            pendingReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Reserva #{reservation.id.slice(0, 8)}</h4>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(reservation.checkInDate).toLocaleDateString('es-ES')} -{' '}
                          {new Date(reservation.checkOutDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReservation(reservation)
                        setSubmitError(null)
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
      )}

      {/* Dialog para calificar */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar Propietario</DialogTitle>
            <DialogDescription>
              {selectedReservation && (
                <>Califica tu experiencia en la reserva #{selectedReservation.id.slice(0, 8)}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
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
                  placeholder="Comparte tu experiencia..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>Cancelar</Button>
            <Button disabled={rating === 0 || isSubmitting} onClick={handleSubmitRating}>
              {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}