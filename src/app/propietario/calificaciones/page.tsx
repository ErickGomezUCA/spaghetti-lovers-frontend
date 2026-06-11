"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
} from "lucide-react"

// Mock data - ratings received by the landlord
const ratingsReceived = [
  {
    id: "RAT-001",
    reservationId: "RES-003",
    property: "Loft Moderno Zona Rosa",
    reviewerName: "Ana Martínez",
    reviewerRole: "tenant",
    score: 5,
    comment: "Excelente comunicación y la propiedad estaba impecable. Muy recomendado como propietario.",
    createdAt: "2024-06-01",
  },
  {
    id: "RAT-002",
    reservationId: "RES-004",
    property: "Cabaña en la Montaña",
    reviewerName: "Pedro Sánchez",
    reviewerRole: "tenant",
    score: 4,
    comment: "Buen trato y rápida respuesta a mis preguntas. La cabaña necesitaba algo de mantenimiento.",
    createdAt: "2024-05-15",
  },
  {
    id: "RAT-003",
    reservationId: "RES-005",
    property: "Apartamento Centro Histórico",
    reviewerName: "Laura Hernández",
    reviewerRole: "tenant",
    score: 5,
    comment: "El mejor propietario con el que he tratado. Muy profesional y atento.",
    createdAt: "2024-04-20",
  },
]

// Mock data - ratings given by the landlord to tenants
const ratingsGiven = [
  {
    id: "RAT-004",
    reservationId: "RES-003",
    property: "Loft Moderno Zona Rosa",
    reviewedName: "Ana Martínez",
    reviewedRole: "tenant",
    score: 5,
    comment: "Inquilina ejemplar. Dejó la propiedad en perfectas condiciones. 100% recomendada.",
    createdAt: "2024-06-02",
  },
  {
    id: "RAT-005",
    reservationId: "RES-004",
    property: "Cabaña en la Montaña",
    reviewedName: "Pedro Sánchez",
    reviewedRole: "tenant",
    score: 3,
    comment: "Checkout tardío y dejó algunos objetos olvidados. Comunicación podría mejorar.",
    createdAt: "2024-05-16",
  },
]

// Pending ratings
const pendingRatings = [
  {
    reservationId: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    checkOut: "2024-06-20",
  },
]

export default function RatingsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "given" | "pending">("received")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewRatingOpen, setIsNewRatingOpen] = useState(false)
  const [newRating, setNewRating] = useState(0)

  const averageReceived = ratingsReceived.reduce((sum, r) => sum + r.score, 0) / ratingsReceived.length
  const averageGiven = ratingsGiven.reduce((sum, r) => sum + r.score, 0) / ratingsGiven.length

  const filteredReceived = ratingsReceived.filter(
    (r) =>
      r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGiven = ratingsGiven.filter(
    (r) =>
      r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reviewedName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (score: number, interactive = false, size = "w-5 h-5") => {
    return (
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
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calificaciones</h1>
          <p className="text-muted-foreground">Gestiona las calificaciones de tus inquilinos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <p className="text-3xl font-semibold">{averageReceived.toFixed(1)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Tu calificación promedio</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">{ratingsReceived.length}</p>
            <p className="text-sm text-muted-foreground">Calificaciones recibidas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{ratingsGiven.length}</p>
            <p className="text-sm text-muted-foreground">Calificaciones dadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-orange-600">{pendingRatings.length}</p>
            <p className="text-sm text-muted-foreground">Pendientes por calificar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "received" ? "default" : "outline"}
          onClick={() => setActiveTab("received")}
        >
          Recibidas ({ratingsReceived.length})
        </Button>
        <Button
          variant={activeTab === "given" ? "default" : "outline"}
          onClick={() => setActiveTab("given")}
        >
          Dadas ({ratingsGiven.length})
        </Button>
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          onClick={() => setActiveTab("pending")}
          className={pendingRatings.length > 0 ? "relative" : ""}
        >
          Pendientes
          {pendingRatings.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingRatings.length}
            </span>
          )}
        </Button>
      </div>

      {/* Search */}
      {activeTab !== "pending" && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por propiedad o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Received Ratings */}
      {activeTab === "received" && (
        <div className="space-y-4">
          {filteredReceived.map((rating) => (
            <Card key={rating.id} className="border-t-4 border-t-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{rating.reviewerName}</p>
                      <p className="text-sm text-muted-foreground">{rating.property}</p>
                      <p className="text-xs text-muted-foreground">Reserva: {rating.reservationId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(rating.score)}
                    <p className="text-xs text-muted-foreground mt-1">{rating.createdAt}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm italic">&quot;{rating.comment}&quot;</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Given Ratings */}
      {activeTab === "given" && (
        <div className="space-y-4">
          {filteredGiven.map((rating) => (
            <Card key={rating.id} className="border-t-4 border-t-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{rating.reviewedName}</p>
                      <p className="text-sm text-muted-foreground">{rating.property}</p>
                      <p className="text-xs text-muted-foreground">Reserva: {rating.reservationId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(rating.score)}
                    <p className="text-xs text-muted-foreground mt-1">{rating.createdAt}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm italic">&quot;{rating.comment}&quot;</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Ratings */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingRatings.length === 0 ? (
            <Card className="border-t-4 border-t-primary">
              <CardContent className="p-8 text-center">
                <ThumbsUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">¡Estás al día!</h3>
                <p className="text-muted-foreground">No tienes calificaciones pendientes.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRatings.map((pending) => (
              <Card key={pending.reservationId} className="border-t-4 border-t-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{pending.tenant}</p>
                        <p className="text-sm text-muted-foreground">{pending.property}</p>
                        <p className="text-xs text-muted-foreground">
                          Checkout: {pending.checkOut}
                        </p>
                      </div>
                    </div>
                    <Dialog open={isNewRatingOpen} onOpenChange={setIsNewRatingOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary">
                          <Star className="w-4 h-4 mr-2" />
                          Calificar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Calificar a {pending.tenant}</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4">
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-3">¿Cómo calificarías a este inquilino?</p>
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
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setIsNewRatingOpen(false)
                                setNewRating(0)
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-primary"
                              disabled={newRating === 0}
                            >
                              Enviar Calificación
                            </Button>
                          </div>
                        </form>
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
