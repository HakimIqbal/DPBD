/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return "?"
  
  const parts = name.trim().split(/\s+/)
  
  if (parts.length === 1) {
    // Single name: take first two characters
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  // Multiple names: take first letter of first and last name
  const firstChar = parts[0].charAt(0)
  const lastChar = parts[parts.length - 1].charAt(0)
  
  return (firstChar + lastChar).toUpperCase()
}

/**
 * Generate a consistent color based on name
 * @param name - Name to generate color from
 * @returns Color class for tailwind
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-green-100 text-green-600",
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-indigo-100 text-indigo-600",
    "bg-cyan-100 text-cyan-600",
  ]
  
  // Generate a deterministic index based on name
  const hash = name.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  return colors[hash % colors.length]
}
