'use client'

import { useState, useRef } from 'react'
import { customerService } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from 'sonner'
import { 
  Camera, 
  Upload, 
  X, 
  Trash2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string
  onPhotoUpdated: (photoUrl: string) => void
}

export function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const result = await customerService.uploadProfilePhoto(selectedFile)
      onPhotoUpdated(result.photoUrl)
      setIsDialogOpen(false)
      setPreviewUrl(null)
      setSelectedFile(null)
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (error) {
      console.error('Failed to upload photo:', error)
      toast.error('Không thể tải lên ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      setUploading(true)
      await customerService.deleteProfilePhoto()
      onPhotoUpdated('')
      setIsDialogOpen(false)
      toast.success('Xóa ảnh đại diện thành công!')
    } catch (error) {
      console.error('Failed to remove photo:', error)
      toast.error('Không thể xóa ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
          <DialogDescription>
            Tải lên ảnh mới hoặc xóa ảnh hiện tại
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Photo */}
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={currentPhotoUrl} alt="Current photo" />
              <AvatarFallback>
                <ImageIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500">Ảnh hiện tại</p>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={resetSelection}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Kéo thả ảnh vào đây hoặc{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      chọn file
                    </button>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG hoặc GIF. Tối đa 5MB.
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div>
              {currentPhotoUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Xóa ảnh
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetSelection()
                }}
                disabled={uploading}
              >
                Hủy
              </Button>
              
              {selectedFile && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Tải lên
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Mẹo cho ảnh đẹp:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sử dụng ảnh có độ phân giải cao</li>
              <li>• Đảm bảo khuôn mặt rõ nét và được chiếu sáng tốt</li>
              <li>• Tránh sử dụng ảnh có nhiều người</li>
              <li>• Ảnh vuông sẽ hiển thị đẹp nhất</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
