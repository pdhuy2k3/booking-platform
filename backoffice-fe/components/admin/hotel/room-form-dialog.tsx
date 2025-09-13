"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaSelector } from "@/components/ui/media-selector";
import { RoomTypeService } from "@/services/room-type-service";
import type {
  Room,
  RoomType,
  RoomTypeInheritance,
  Amenity,
  MediaResponse,
} from "@/types/api";

interface RoomFormData {
  roomNumber: string;
  description: string;
  price: number;
  maxOccupancy: number;
  bedType: string;
  roomSize: number;
  isAvailable: boolean;
  roomTypeId: number | null;
  amenityIds: number[];
  media?: MediaResponse[];
  inheritPriceFromRoomType?: boolean;
  inheritMediaFromRoomType?: boolean;
}

interface RoomFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  room: RoomFormData;
  onRoomChange: (room: RoomFormData) => void;
  roomTypes: RoomType[];
  amenities: Amenity[];
  media?: MediaResponse[];
  onMediaChange?: (media: MediaResponse[]) => void;
  onSubmit: () => void;
  submitLabel: string;
  formatPrice: (price: number) => string;
}

export function RoomFormDialog({
  isOpen,
  onClose,
  title,
  description,
  room,
  onRoomChange,
  roomTypes,
  amenities,
  media = [],
  onMediaChange,
  onSubmit,
  submitLabel,
  formatPrice,
}: RoomFormDialogProps) {
  const [roomTypeInheritance, setRoomTypeInheritance] =
    useState<RoomTypeInheritance | null>(null);
  const [loadingInheritance, setLoadingInheritance] = useState(false);
  const originalMediaRef = useRef<MediaResponse[]>([]);

  const isFormValid =
    room.roomNumber.trim() && room.roomTypeId && room.price && room.price > 0;

  // Store original media when dialog opens
  useEffect(() => {
    if (isOpen) {
      originalMediaRef.current = [...media];
    }
  }, [isOpen, media]);

  // Fetch room type inheritance info when room type changes
  useEffect(() => {
    const fetchRoomTypeInheritance = async () => {
      if (room.roomTypeId) {
        setLoadingInheritance(true);
        try {
          const inheritanceData = await RoomTypeService.getRoomTypeInheritance(
            room.roomTypeId
          );
          setRoomTypeInheritance(inheritanceData);
        } catch (error) {
          console.error("Error fetching room type inheritance:", error);
          setRoomTypeInheritance(null);
        } finally {
          setLoadingInheritance(false);
        }
      } else {
        setRoomTypeInheritance(null);
      }
    };

    fetchRoomTypeInheritance();
  }, [room.roomTypeId]);

  // Handle room type change
  const handleRoomTypeChange = (value: string) => {
    const roomTypeId = value ? Number(value) : null;
    onRoomChange({
      ...room,
      roomTypeId,
      // Reset inheritance flags when room type changes
      inheritPriceFromRoomType: false,
      inheritMediaFromRoomType: false,
    });
  };

  // Handle price inheritance toggle
  const handlePriceInheritanceToggle = (checked: boolean) => {
    onRoomChange({
      ...room,
      inheritPriceFromRoomType: checked === true,
      // If inheriting price, set the price to room type's base price
      price:
        checked && roomTypeInheritance?.basePrice
          ? roomTypeInheritance.basePrice
          : room.price,
    });
  };

  // Handle media inheritance toggle
  const handleMediaInheritanceToggle = (checked: boolean) => {
    if (checked && roomTypeInheritance?.media) {
      // When enabling inheritance, use room type media
      onRoomChange({
        ...room,
        inheritMediaFromRoomType: checked,
        media: [...roomTypeInheritance.media],
      });

      // Also update the media in the parent component
      if (onMediaChange) {
        onMediaChange([...roomTypeInheritance.media]);
      }
    } else {
      // When disabling inheritance, restore original media
      onRoomChange({
        ...room,
        inheritMediaFromRoomType: checked,
        media: [...originalMediaRef.current],
      });

      // Also update the media in the parent component
      if (onMediaChange) {
        onMediaChange([...originalMediaRef.current]);
      }
    }
  };

  // Handle media changes from MediaSelector
  const handleMediaChange = (newMedia: MediaResponse[]) => {
    // Update media in form data
    onRoomChange({
      ...room,
      media: newMedia,
      inheritMediaFromRoomType: false, // Turn off inheritance when manually changing media
    });

    // Also update the media in the parent component
    if (onMediaChange) {
      onMediaChange(newMedia);
    }

    // Update original media reference
    originalMediaRef.current = [...newMedia];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4 overflow-y-auto">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="roomNumber">Số phòng *</Label>
            <Input
              id="roomNumber"
              placeholder="101"
              value={room.roomNumber}
              onChange={(e) =>
                onRoomChange({ ...room, roomNumber: e.target.value })
              }
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="roomType">Loại phòng *</Label>
            <Select
              value={room.roomTypeId?.toString() || ""}
              onValueChange={handleRoomTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id.toString()}>
                    {roomType.name}{" "}
                    {roomType.basePrice
                      ? `(${formatPrice(roomType.basePrice)})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price inheritance option */}
          {roomTypeInheritance?.basePrice && (
            <div className="col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inheritPrice"
                  checked={room.inheritPriceFromRoomType === true}
                  onCheckedChange={handlePriceInheritanceToggle}
                />
                <Label htmlFor="inheritPrice" className="text-sm font-normal">
                  Sử dụng giá từ loại phòng (
                  {formatPrice(roomTypeInheritance.basePrice)})
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="price">Giá (VND) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="1500000"
              value={room.price}
              onChange={(e) => {
                if (!room.inheritPriceFromRoomType) {
                  onRoomChange({
                    ...room,
                    price: Number(e.target.value),
                  });
                }
              }}
              disabled={room.inheritPriceFromRoomType === true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxOccupancy">Số người tối đa</Label>
            <Input
              id="maxOccupancy"
              type="number"
              placeholder="2"
              value={room.maxOccupancy}
              onChange={(e) =>
                onRoomChange({ ...room, maxOccupancy: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedType">Loại giường</Label>
            <Input
              id="bedType"
              placeholder="Giường đôi"
              value={room.bedType}
              onChange={(e) =>
                onRoomChange({ ...room, bedType: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomSize">Diện tích (m²)</Label>
            <Input
              id="roomSize"
              type="number"
              placeholder="25"
              value={room.roomSize}
              onChange={(e) =>
                onRoomChange({ ...room, roomSize: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isAvailable">Trạng thái</Label>
            <Select
              value={room.isAvailable ? "available" : "unavailable"}
              onValueChange={(value) =>
                onRoomChange({ ...room, isAvailable: value === "available" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="unavailable">Không sẵn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Mô tả phòng..."
              value={room.description}
              onChange={(e) =>
                onRoomChange({ ...room, description: e.target.value })
              }
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Tiện nghi phòng</Label>
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {Array.isArray(amenities) &&
                  amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        checked={room.amenityIds.includes(amenity.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onRoomChange({
                              ...room,
                              amenityIds: [...room.amenityIds, amenity.id],
                            });
                          } else {
                            onRoomChange({
                              ...room,
                              amenityIds: room.amenityIds.filter(
                                (id) => id !== amenity.id
                              ),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`amenity-${amenity.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Media inheritance option */}
          {roomTypeInheritance?.media &&
            roomTypeInheritance.media.length > 0 && (
              <div className="col-span-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inheritMedia"
                    checked={!!room.inheritMediaFromRoomType}
                    onCheckedChange={handleMediaInheritanceToggle}
                  />
                  <Label htmlFor="inheritMedia" className="text-sm font-normal">
                    Sử dụng hình ảnh từ loại phòng (
                    {roomTypeInheritance.media.length} hình ảnh)
                  </Label>
                </div>

                {room.inheritMediaFromRoomType && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Hình ảnh sẽ được kế thừa từ loại phòng "
                      {roomTypeInheritance.name}"
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

          <div className="col-span-2 space-y-2">
            <Label>Hình ảnh phòng</Label>
            {!room.inheritMediaFromRoomType && (
              <MediaSelector
                value={media}
                onMediaChange={handleMediaChange}
                folder="hotels"
                maxSelection={5}
                allowUpload={true}
              />
            )}
            {room.inheritMediaFromRoomType && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
                Hình ảnh được kế thừa từ loại phòng
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={onSubmit} disabled={!isFormValid}>
              {submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
