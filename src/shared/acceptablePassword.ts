export function isAcceptablePassword(password: string): boolean {
  if (password.length < 8) return false //require 8 characters
  if (!/[A-Z]/.test(password)) return false //require 1 capital
  if (!/[a-z]/.test(password)) return false //require 1 lowercase
  if (!/[0-9]/.test(password)) return false //require 1 number
  return true
}