import * as React from "react"
import { cn } from "@/lib/utils"
import { ImagePlus } from "lucide-react"

export interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect?: (file: File | null) => void
  preview?: string | null
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, onFileSelect, preview, maxSize = 5 * 1024 * 1024, acceptedTypes = ['image/*'], ...props }, ref) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleFile = (file: File) => {
      setError(null)

      // ファイルサイズチェック
      if (file.size > maxSize) {
        setError(`ファイルサイズが${Math.round(maxSize / 1024 / 1024)}MBを超えています。`)
        return
      }

      // ファイル形式チェック
      if (acceptedTypes.length > 0) {
        const isValidType = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })

        if (!isValidType) {
          setError('対応していないファイル形式です。')
          return
        }
      }

      onFileSelect?.(file)
    }

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

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    }

    return (
      <div className="space-y-2">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            error && "border-red-300 bg-red-50",
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept={acceptedTypes.join(',')}
            {...props}
          />
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4 flex items-center justify-center">
              <ImagePlus className="w-12 h-12" />
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                クリックしてファイルを選択
              </span>
              またはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.includes('image/*') ? 'JPG、PNG、GIF形式' : '対応ファイル形式'}（最大{Math.round(maxSize / 1024 / 1024)}MB）
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">プレビュー:</p>
            <img
              src={preview}
              alt="アップロードプレビュー"
              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }
