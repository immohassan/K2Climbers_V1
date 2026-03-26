"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Edit, Trash2, User, Star, Users, Search, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface UserRow {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  featured: boolean
  createdAt: Date
  summitCount: number
  _count?: { summitRecords: number; bookings: number }
}

const ROLE_STYLE: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-500",
  ADMIN:       "bg-orange-500/10 text-orange-500",
  GUIDE:       "bg-blue-500/10 text-blue-400",
  USER:        "bg-muted text-muted-foreground",
}

export function UsersTable() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      setUsers(await res.json())
    } catch { toast.error("Failed to load users") }
    finally { setLoading(false) }
  }

  const toggleFeatured = async (user: UserRow) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !user.featured }),
      })
      if (res.ok) {
        toast.success(user.featured ? "Removed from featured" : "Added to featured")
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update")
      }
    } catch { toast.error("Failed to update") }
  }

  const deleteUser = async (user: UserRow) => {
    if (!confirm(`Delete ${user.name || user.email}?`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("User deleted"); fetchUsers() }
      else { const e = await res.json(); toast.error(e.error || "Failed to delete") }
    } catch { toast.error("Failed to delete user") }
  }

  if (loading) {
    return (
      <div className="border border-border divide-y divide-border">
        <div className="px-5 py-4 h-12 animate-pulse bg-muted/20" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-32" />
              <div className="h-2.5 bg-muted/60 rounded w-44" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const filtered = search
    ? users.filter((u) => {
        const q = search.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          (u.name ?? "").toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        )
      })
    : users

  return (
    <div className="space-y-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or role…"
        className="w-full pl-9 pr-8 py-2 text-sm border border-border bg-background focus:outline-none focus:border-orange-500/50 transition-colors"
      />
      {search && (
        <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
    <div className="border border-border">
      {/* Column header */}
      <div className="px-5 py-3 border-b border-border grid grid-cols-[2fr_1fr_auto_auto_auto_auto] items-center gap-4 bg-muted/30">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">User</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden sm:block">Role</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-14 text-center">Summits</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-16 text-center">Bookings</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-14 text-center">Featured</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16 text-right">Actions</p>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-16 flex flex-col items-center gap-3">
          <Users className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{search ? "No users match your search." : "No users found."}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((user) => (
            <div key={user.id} className="px-5 py-3.5 grid grid-cols-[2fr_1fr_auto_auto_auto_auto] items-center gap-4 hover:bg-muted/20 transition-colors group">
              {/* User info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-orange-500/10 border border-border shrink-0">
                  {user.image ? (
                    <Image src={user.image} alt={user.name || "User"} fill className="object-cover" sizes="36px" />
                  ) : (
                    <User className="absolute inset-0 m-auto h-4 w-4 text-orange-500/60" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-orange-500 transition-colors">
                    {user.name || "No name"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <span className={`hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 ${ROLE_STYLE[user.role] ?? ROLE_STYLE.USER}`}>
                {user.role.replace("_", " ")}
              </span>

              {/* Summits */}
              <span className="hidden md:block text-sm font-mono text-center w-14">{user.summitCount}</span>

              {/* Bookings */}
              <span className="hidden md:block text-sm font-mono text-center w-16">{user._count?.bookings ?? 0}</span>

              {/* Featured toggle */}
              <button
                onClick={() => toggleFeatured(user)}
                className={`w-14 flex items-center justify-center transition-colors ${
                  user.featured ? "text-orange-500" : "text-muted-foreground hover:text-orange-500/60"
                }`}
                title={user.featured ? "Remove from featured" : "Add to featured"}
              >
                <Star className={`h-4 w-4 ${user.featured ? "fill-orange-500" : ""}`} />
              </button>

              {/* Actions */}
              <div className="flex items-center justify-end gap-0.5 w-16">
                <Link href={`/dashboard/users/${user.id}`} title="Edit">
                  <button className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </Link>
                <button
                  onClick={() => deleteUser(user)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {search ? `${filtered.length} of ${users.length}` : users.length} user{users.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
    </div>
  )
}
