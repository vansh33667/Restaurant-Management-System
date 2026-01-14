"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockUntil, setLockUntil] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const user = JSON.parse(currentUser)
      if (user.role === "cashier") {
        router.push("/cashier-dashboard")
      } else {
        router.push("/dashboard")
      }
    }

    // Check for persisted lock
    const lockData = localStorage.getItem("loginLock")
    if (lockData) {
      const { username, lock_until } = JSON.parse(lockData)
      const lockTime = new Date(lock_until)
      if (new Date() < lockTime) {
        setUsername(username)
        setIsLocked(true)
        setLockUntil(lockTime)
      } else {
        localStorage.removeItem("loginLock")
      }
    }
  }, [router])

  useEffect(() => {
    if (isLocked && lockUntil) {
      const interval = setInterval(() => {
        const now = new Date()
        const remaining = Math.max(0, Math.floor((lockUntil.getTime() - now.getTime()) / 1000))
        if (remaining <= 0) {
          setIsLocked(false)
          setError("")
          setLockUntil(null)
          localStorage.removeItem("loginLock")
          clearInterval(interval)
        } else {
          const minutes = Math.floor(remaining / 60)
          const seconds = remaining % 60
          setError(`Account locked. Try again in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isLocked, lockUntil])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        setIsLocked(false)
        setLockUntil(null)
        localStorage.removeItem("loginLock")
        if (data.user.role === "cashier") {
          router.push("/cashier-dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        if (data.locked) {
          setIsLocked(true)
          setLockUntil(new Date(data.lock_until))
          setError(`Account locked. Try again in ${data.remainingMinutes}:00`)
          // Persist lock across refreshes
          localStorage.setItem("loginLock", JSON.stringify({
            username: username,
            lock_until: data.lock_until
          }))
        } else {
          setError(data.error || "Login failed")
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/padharo-dhal-28hotel-29-logo.jpg"
              alt="Padharo Thal & Banquet Logo"
              width={150}
              height={150}
              className="rounded-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Padharo Thal & Banquet</CardTitle>
          <CardDescription>Hotel Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading || isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isLocked}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
              {isLoading ? "Checking..." : "Login"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Admin: admin / 2026 | Cashier: casher123 / 2026
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
