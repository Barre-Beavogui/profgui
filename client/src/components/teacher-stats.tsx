import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const viewData = [
  { name: "Lun", views: 12 },
  { name: "Mar", views: 18 },
  { name: "Mer", views: 15 },
  { name: "Jeu", views: 25 },
  { name: "Ven", views: 32 },
  { name: "Sam", views: 28 },
  { name: "Dim", views: 40 },
];

const requestData = [
  { name: "Sem 1", requests: 2 },
  { name: "Sem 2", requests: 5 },
  { name: "Sem 3", requests: 3 },
  { name: "Sem 4", requests: 8 },
];

export function TeacherStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Vues du profil (7 derniers jours)
          </CardTitle>
          <CardDescription>Évolution de votre visibilité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Demandes de cours
          </CardTitle>
          <CardDescription>Volume mensuel de sollicitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}
                />
                <Bar 
                  dataKey="requests" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
