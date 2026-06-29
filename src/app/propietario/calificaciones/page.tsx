"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Star, ThumbsUp, User } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ratingService } from "@/lib/services/rating.service"
import { reservationService } from "@/lib/services/reservation.service"
import { UserRatingsResponse, ReservationResponse, RatingResponse } from "@/types/api-responses"
import { ApiError } from "@/lib/exceptions/api-exceptions"

export default function RatingsPage() {
  const { user } = useAuth()

  const [ratingsData, setRatingsData] = useState<UserRatingsResponse | null>(null)
  const [completedReservations, setCompletedReservations] = useState<ReservationResponse[]>([])
  const [ratingsGiven, setRatingsGiven] = useState<RatingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<"received" | "given" | "pending">("received")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewRatingOpen, setIsNewRatingOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)
  const [newRating, setNewRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [ratingsRes, reservationsRes, givenRes] = await Promise.all([
        ratingService.getByUser(user.id),
        reservationService.getLandlordReservations(0, 100, 'COMPLETED'),
        ratingService.getGivenByUser(user.id),
      ])
      setRatingsData(ratingsRes.data)
      setCompletedReservations(reservationsRes.data ?? [])
      setRatingsGiven(givenRes.data)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const ratingsReceived = ratingsData?.ratings ?? []
  const averageReceived = ratingsData?.averageScore ?? 0

  // Filtra reservas que ya fueron calificadas
  const pendingReservations = completedReservations.filter(
    (r) => !ratingsGiven.some((rg) => rg.reservationId === r.id)
  )

  const filteredGiven = ratingsGiven.filter((r) =>
    r.reservationId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmitRating = async () => {
    if (!selectedReservation || newRating === 0) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await ratingService.create({
        reservationId: selectedReservation.id,
        score: newRating,
        comment: comment || undefined,
      })
      setIsNewRatingOpen(false)
      setNewRating(0)
      setComment("")
      await fetchData()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "No se pudo enviar la calificación")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (score: number, interactive = false, size = "w-5 h-5") => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => setNewRating(star) : undefined}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <Star
            className={`${size} ${
              star <= (interactive ? newRating : score)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calificaciones</h1>
          <p className="text-muted-foreground">Gestiona las calificaciones de tus inquilinos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <p className="text-3xl font-semibold">{isLoading ? "—" : averageReceived.toFixed(1)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Tu calificación promedio</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {isLoading ? "—" : ratingsReceived.length}
            </p>
            <p className="text-sm text-muted-foreground">Calificaciones recibidas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {isLoading ? "—" : ratingsGiven.length}
            </p>
            <p className="text-sm text-muted-foreground">Calificaciones dadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-orange-600">
              {isLoading ? "—" : pendingReservations.length}
            </p>
            <p className="text-sm text-muted-foreground">Pendientes por calificar</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "received" ? "default" : "outline"} onClick={() => setActiveTab("received")}>
          Recibidas ({ratingsReceived.length})
        </Button>
        <Button variant={activeTab === "given" ? "default" : "outline"} onClick={() => setActiveTab("given")}>
          Dadas ({ratingsGiven.length})
        </Button>
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          onClick={() => setActiveTab("pending")}
          className={pendingReservations.length > 0 ? "relative" : ""}
        >
          Pendientes
          {pendingReservations.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingReservations.length}
            </span>
          )}
        </Button>
      </div>

      {activeTab !== "pending" && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

      {activeTab === "received" && (
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando...</CardContent></Card>
          ) : ratingsReceived.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aún no has recibido calificaciones.</CardContent></Card>
          ) : (
            ratingsReceived
              .filter((r) => r.reservationId.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((rating) => (
                <Card key={rating.id} className="border-t-4 border-t-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reserva: {rating.reservationId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(rating.score)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rating.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    {rating.comment && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm italic">&quot;{rating.comment}&quot;</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {activeTab === "given" && (
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando...</CardContent></Card>
          ) : filteredGiven.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aún no has dado calificaciones.</CardContent></Card>
          ) : (
            filteredGiven.map((rating) => (
              <Card key={rating.id} className="border-t-4 border-t-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reserva: {rating.reservationId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rating.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(rating.score)}
                    </div>
                  </div>
                  {rating.comment && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm italic">&quot;{rating.comment}&quot;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "pending" && (
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
              <Card key={reservation.id} className="border-t-4 border-t-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Reserva #{reservation.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          Checkout: {new Date(reservation.checkOutDate).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <Dialog
                      open={isNewRatingOpen && selectedReservation?.id === reservation.id}
                      onOpenChange={(open) => {
                        setIsNewRatingOpen(open)
                        if (!open) {
                          setNewRating(0)
                          setComment("")
                          setSubmitError(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="bg-primary"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setIsNewRatingOpen(true)
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Calificar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Calificar Inquilino</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-3">
                              ¿Cómo calificarías a este inquilino?
                            </p>
                            {renderStars(0, true, "w-8 h-8")}
                            <p className="text-lg font-semibold mt-2">
                              {newRating > 0 ? `${newRating} de 5 estrellas` : "Selecciona una calificación"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground font-medium">
                              Comentario (opcional)
                            </Label>
                            <Textarea
                              placeholder="Describe tu experiencia con este inquilino..."
                              rows={4}
                              className="bg-input"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                          </div>
                          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                          <div className="flex gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setIsNewRatingOpen(false)
                                setNewRating(0)
                                setComment("")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              className="flex-1 bg-primary"
                              disabled={newRating === 0 || isSubmitting}
                              onClick={handleSubmitRating}
                            >
                              {isSubmitting ? "Enviando..." : "Enviar Calificación"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}