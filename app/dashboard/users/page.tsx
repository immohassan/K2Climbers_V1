import { UsersTable } from "@/components/dashboard/users-table"

export default function UsersPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage climbers, guides, and administrators
        </p>
      </div>

      <UsersTable />
    </div>
  )
}
