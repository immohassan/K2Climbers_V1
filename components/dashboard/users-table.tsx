"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  createdAt: Date
  _count: {
    summitRecords: number
    bookings: number
  }
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive"
      case "ADMIN":
        return "default"
      case "GUIDE":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">User</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Email</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Role</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Summits</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Bookings</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Joined</th>
                <th className="text-right p-3 md:p-4 font-semibold text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-card">
                    <td className="p-3 md:p-4">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        {user.image ? (
                          <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-xs md:text-sm truncate">{user.name || "No name"}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{user.email}</div>
                    </td>
                    <td className="p-3 md:p-4">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{user._count.summitRecords}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{user._count.bookings}</td>
                    <td className="p-3 md:p-4 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">{formatDate(user.createdAt)}</span>
                      <span className="sm:hidden">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Link href={`/dashboard/users/${user.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 md:h-10 md:w-10"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
                              try {
                                const res = await fetch(`/api/users/${user.id}`, {
                                  method: "DELETE",
                                })
                                if (res.ok) {
                                  toast.success("User deleted successfully")
                                  fetchUsers()
                                } else {
                                  const error = await res.json()
                                  toast.error(error.error || "Failed to delete user")
                                }
                              } catch (error) {
                                console.error("Error deleting user:", error)
                                toast.error("Failed to delete user")
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
