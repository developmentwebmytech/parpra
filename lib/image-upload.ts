import { writeFile, unlink, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Save image to public folder
export async function saveImageToPublic(file: File, folder = "uploads"): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create folder if it doesn't exist
  const publicDir = path.join(process.cwd(), "public")
  const uploadDir = path.join(publicDir, folder)

  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    console.error("Error creating directory:", error)
  }

  // Generate unique filename
  const fileExtension = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExtension}`
  const filePath = path.join(uploadDir, fileName)

  // Save file
  await writeFile(filePath, buffer)

  // Return relative path for database storage
  return `/${folder}/${fileName}`
}

// Delete image from public folder
export async function deleteImageFromPublic(filePath: string): Promise<boolean> {
  if (!filePath) return false

  try {
    const fullPath = path.join(process.cwd(), "public", filePath.startsWith("/") ? filePath.slice(1) : filePath)
    await unlink(fullPath)
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}
