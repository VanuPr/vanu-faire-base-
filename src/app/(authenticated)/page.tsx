import Link from "next/link"
import { ArrowRight, Users, BarChart3, Database } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "Account Control",
    description: "Manage user accounts, roles, and permissions.",
    icon: <Users className="w-8 h-8 text-accent" />,
    href: "/users",
    cta: "Manage Users",
  },
  {
    title: "Firestore",
    description: "Browse and manage your Firestore database structure.",
    icon: <Database className="w-8 h-8 text-accent" />,
    href: "/firestore",
    cta: "Manage Database",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
        <p className="text-muted-foreground">An overview of your Firebase project and management tools.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                {feature.icon}
              </div>
            </CardHeader>
             <CardContent>
                <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter className="mt-auto bg-muted/50 p-4 rounded-b-lg">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href={feature.href}>
                  {feature.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
